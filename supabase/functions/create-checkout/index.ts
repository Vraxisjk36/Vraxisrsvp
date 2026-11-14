import { createClient } from "npm:@supabase/supabase-js@2.57.0";
const origin="https://vraxisrsvp.online";
const headers={"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"authorization,apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Content-Type":"application/json"};
const tiers:Record<string,"signature"|"prestige">={"001":"signature","002":"prestige","003":"signature","004":"signature","005":"prestige","006":"signature","007":"signature","008":"signature","009":"signature","010":"prestige","011":"signature","012":"prestige","013":"signature","014":"prestige","015":"signature","016":"signature","017":"prestige","018":"signature","019":"signature","020":"signature"};
const products={signature:{variant:"2369889",amount:1599},prestige:{variant:"2369903",amount:2400}};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return json({error:"Method not allowed"},405);
 if(req.headers.get("origin")!==origin)return json({error:"Origin not allowed"},403);
 const key=Deno.env.get("LEMON_SQUEEZY_API_KEY"),storeId=Deno.env.get("LEMON_SQUEEZY_STORE_ID"),secret=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),url=Deno.env.get("SUPABASE_URL"),pub=Deno.env.get("SUPABASE_ANON_KEY");
 if(!key||!storeId||!secret||!url||!pub)return json({error:"Checkout configuration is not complete"},503);
 const bearer=req.headers.get("authorization")||"";
 if(!bearer.startsWith("Bearer "))return json({error:"Sign in required"},401);
 const auth=createClient(url,pub,{global:{headers:{Authorization:bearer}}});
 const {data:{user},error:userError}=await auth.auth.getUser(bearer.slice(7));
 if(userError||!user)return json({error:"Session expired"},401);
 let input;try{input=await req.json()}catch{return json({error:"Invalid request"},400)}
 const invitationId=input?.invitation_id;
 if(typeof invitationId!=="string"||!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(invitationId))return json({error:"Invalid invitation"},400);
 const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:inv,error:invError}=await admin.from("invitations").select("id,owner_id,template_id,status").eq("id",invitationId).eq("owner_id",user.id).single();
 if(invError||!inv)return json({error:"Invitation not found"},404);
 if(inv.status!=="draft")return json({error:"Only draft invitations can be checked out"},409);
 const tier=tiers[inv.template_id];
 if(!tier)return json({error:"Unsupported template"},400);
 const p=products[tier];
 const {data:paid}=await admin.from("orders").select("id").eq("invitation_id",inv.id).eq("status","paid").limit(1);
 if(paid?.length)return json({error:"This invitation is already paid"},409);
 const requestBody={data:{type:"checkouts",attributes:{custom_price:p.amount,test_mode:Deno.env.get("LEMON_SQUEEZY_TEST_MODE")!=="false",product_options:{enabled_variants:[Number(p.variant)],redirect_url:origin+"/dashboard.html?payment=return"},checkout_options:{embed:false},checkout_data:{email:user.email,custom:{invitation_id:inv.id,user_id:user.id,tier}}},relationships:{store:{data:{type:"stores",id:storeId}},variant:{data:{type:"variants",id:p.variant}}}}};
 try{
  const response=await fetch("https://api.lemonsqueezy.com/v1/checkouts",{method:"POST",headers:{Accept:"application/vnd.api+json","Content-Type":"application/vnd.api+json",Authorization:"Bearer "+key},body:JSON.stringify(requestBody)});
  const result=await response.json();
  if(!response.ok)return json({error:"Checkout provider rejected the request",detail:result?.errors?.[0]?.detail||"Check store and variant configuration"},502);
  const checkoutId=result?.data?.id,checkoutUrl=result?.data?.attributes?.url;
  if(!checkoutId||typeof checkoutUrl!=="string"||!checkoutUrl.startsWith("https://"))return json({error:"Invalid checkout response"},502);
  const {error:saveError}=await admin.from("orders").insert({owner_id:user.id,invitation_id:inv.id,provider:"lemonsqueezy",provider_checkout_id:checkoutId,provider_variant_id:p.variant,tier,currency:"USD",amount_minor:p.amount,status:"pending",checkout_url:checkoutUrl});
  if(saveError)return json({error:"Could not record checkout"},500);
  return json({url:checkoutUrl,checkout_id:checkoutId,tier,test_mode:requestBody.data.attributes.test_mode});
 }catch{return json({error:"Checkout service temporarily unavailable"},502)}
});

