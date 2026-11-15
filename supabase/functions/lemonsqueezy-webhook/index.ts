import { createClient } from "npm:@supabase/supabase-js@2.57.0";
const respond=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json"}});
const variants:Record<string,{tier:string,amount:number}>={"2369916":{tier:"signature",amount:1599},"2369915":{tier:"prestige",amount:2400}};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
Deno.serve(async req=>{
 if(req.method!=="POST")return respond({error:"Method not allowed"},405);
 const secret=Deno.env.get("LEMON_SQUEEZY_WEBHOOK_SECRET");
 if(!secret)return respond({error:"Webhook not configured"},503);
 if(Deno.env.get("LEMON_SQUEEZY_TEST_MODE")!=="false")return respond({error:"Live webhook not configured"},503);
 const signature=req.headers.get("X-Signature")||"";
 if(!/^[a-f0-9]{64}$/i.test(signature))return respond({error:"Invalid signature"},401);
 const raw=await req.text();
 if(raw.length>200000)return respond({error:"Payload too large"},413);
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const digest=new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(raw)));
 const received=new Uint8Array(signature.match(/../g)!.map(x=>parseInt(x,16)));
 let diff=0;for(let i=0;i<32;i++)diff|=digest[i]^received[i];
 if(diff!==0)return respond({error:"Invalid signature"},401);
 let payload:any;try{payload=JSON.parse(raw)}catch{return respond({error:"Invalid JSON"},400)}
 const event=req.headers.get("X-Event-Name")||payload?.meta?.event_name;
 if(event!=="order_created"&&event!=="order_refunded")return respond({ok:true,ignored:event||"unknown"});
 if(payload?.meta?.event_name&&payload.meta.event_name!==event)return respond({error:"Event mismatch"},422);
 const orderId=String(payload?.data?.id||"");
 const a=payload?.data?.attributes||{},custom=payload?.meta?.custom_data||{};
 const storeId=Deno.env.get("LEMON_SQUEEZY_STORE_ID");
 const variantId=String(a.first_order_item?.variant_id||"");
 const item=variants[variantId];
 const amount=Number(a.subtotal),currency=String(a.currency||"").toUpperCase();
 if(payload?.data?.type!=="orders"||!/^[0-9]+$/.test(orderId)||!item||!storeId||String(a.store_id)!==storeId
    ||currency!=="USD"||amount!==item.amount||a.test_mode!==false||a.first_order_item?.test_mode===true)
    return respond({error:"Order verification failed"},422);
 if(event==="order_created"&&a.status!=="paid")return respond({error:"Order is not paid"},422);
 const attempt=custom.attempt_id,invitation=custom.invitation_id,owner=custom.user_id;
 if(![attempt,invitation,owner].every(x=>typeof x==="string"&&uuid.test(x))||custom.tier!==item.tier)
   return respond({error:"Invalid checkout metadata"},422);
 const url=Deno.env.get("SUPABASE_URL"),service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!service)return respond({error:"Server configuration missing"},503);
 const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
 // Fail closed: full refund requires explicit refunded status. Partial refunds are logged for manual review.
 const refundTotal=Number(a.total),refundedAmount=Number(a.refunded_amount);
 if(event==="order_refunded"&&(!Number.isSafeInteger(refundTotal)||refundTotal<=0||!Number.isSafeInteger(refundedAmount)||refundedAmount<=0||refundedAmount>refundTotal))return respond({error:"Invalid refund amounts"},422);
 const fullRefund=event==="order_refunded"&&a.status==="refunded"&&a.refunded===true&&refundedAmount===refundTotal;
 const partialRefund=event==="order_refunded"&&refundedAmount<refundTotal&&(a.status==="paid"||a.status==="partial_refund")&&a.refunded!==true;
 if(event==="order_refunded"&&!fullRefund&&!partialRefund)return respond({error:"Inconsistent refund status or amount"},422);
 const {data,error}=await admin.rpc("apply_verified_lemon_event",{
   p_event:event,p_order_id:orderId,p_attempt_id:attempt,p_invitation_id:invitation,
   p_owner_id:owner,p_variant:variantId,p_tier:item.tier,p_amount:item.amount,p_currency:"USD",
   p_full_refund:fullRefund
 });
 if(error)return respond({error:"Could not reconcile verified payment"},409);
 return respond({ok:true,result:data});
});
