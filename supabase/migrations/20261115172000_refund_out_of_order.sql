-- Accept verified full refund notifications arriving before order_created; never grant publication after refund.
create or replace function public.apply_verified_lemon_event(
 p_event text,p_order_id text,p_attempt_id uuid,p_invitation_id uuid,p_owner_id uuid,
 p_variant text,p_tier text,p_amount integer,p_currency text,p_full_refund boolean default false
) returns text language plpgsql security definer set search_path='' as $$
declare v public.orders%rowtype; v_inv public.invitations%rowtype;
begin
 if current_setting('request.jwt.claim.role',true) is distinct from 'service_role' then raise exception 'service_role only'; end if;
 if p_event not in ('order_created','order_refunded') or p_order_id !~ '^[0-9]+$' then raise exception 'invalid event'; end if;
 select * into v from public.orders where id=p_attempt_id for update;
 if not found or v.invitation_id<>p_invitation_id or v.owner_id<>p_owner_id or v.provider_variant_id<>p_variant
    or v.tier<>p_tier or v.amount_minor<>p_amount or v.currency<>p_currency
 then raise exception 'checkout attempt mismatch'; end if;
 select * into v_inv from public.invitations where id=p_invitation_id and owner_id=p_owner_id for update;
 if not found then raise exception 'invitation mismatch'; end if;
 if p_event='order_created' then
   if v.provider_order_id is not null and v.provider_order_id<>p_order_id then raise exception 'order id conflict'; end if;
   if v.status='refunded' then return 'already_refunded'; end if;
   if v.status='paid' then return 'already_paid'; end if;
   if v.status<>'pending' then raise exception 'invalid order state'; end if;
   update public.orders set status='paid',provider_order_id=p_order_id,paid_at=now(),updated_at=now() where id=v.id;
   if v_inv.status='draft' then update public.invitations set status='paid' where id=v_inv.id; end if;
 else
   if v.provider_order_id is not null and v.provider_order_id<>p_order_id then raise exception 'refund order mismatch'; end if;
   if not p_full_refund then
     insert into public.payment_webhook_events(id,event_name,provider_order_id) values('partial_refund_review:'||p_order_id,'partial_refund_review',p_order_id) on conflict(id) do nothing;
     return 'partial_refund_review';
   end if;
   if v.status='refunded' then return 'already_refunded'; end if;
   if v.status not in ('pending','paid') then raise exception 'refund requires pending or paid order'; end if;
   update public.orders set status='refunded',provider_order_id=p_order_id,updated_at=now() where id=v.id;
   if v.status='paid' and not exists(select 1 from public.orders where invitation_id=v.invitation_id and status='paid') then
     update public.invitations set status='archived' where id=v.invitation_id and status in ('paid','published');
   end if;
 end if;
 insert into public.payment_webhook_events(id,event_name,provider_order_id)
 values(p_event||':'||p_order_id,p_event,p_order_id) on conflict(id) do nothing;
 return 'processed';
end $$;
revoke all on function public.apply_verified_lemon_event(text,text,uuid,uuid,uuid,text,text,integer,text,boolean) from public,anon,authenticated;
grant execute on function public.apply_verified_lemon_event(text,text,uuid,uuid,uuid,text,text,integer,text,boolean) to service_role;
