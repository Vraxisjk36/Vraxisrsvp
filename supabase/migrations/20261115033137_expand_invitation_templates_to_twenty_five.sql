-- Remote migration version returned by Supabase. Preserve all original IDs.
ALTER TABLE public.invitations DROP CONSTRAINT invitations_template_id_check;
ALTER TABLE public.invitations ADD CONSTRAINT invitations_template_id_check
  CHECK (template_id ~ '^0(0[1-9]|1[0-9]|2[0-5])$');
