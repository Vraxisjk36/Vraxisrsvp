import {createClient} from "npm:@supabase/supabase-js@2.57.0";
const sites:Record<string,string>={"https://vraxisrsvp.online":"https://vraxisrsvp.online","https://vraxisjk36.github.io":"https://vraxisjk36.github.io/Vraxisrsvp"};
Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 const siteBase=Object.hasOwn(sites,origin)?sites[origin]:null;
 const headers={"Content-Type":"application/json","Access-Control-Allow-Headers":"content-type,apikey","Access-Control-Allow-Methods":"POST,OPTIONS","Vary":"Origin",...(siteBase?{"Access-Control-Allow-Origin":origin}:{})};
 const out=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(!siteBase)return out({error:"Origin not allowed"},403);
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return out({error:"Method not allowed"},405);
 if(Number(req.headers.get("content-length")||0)>12000)return out({error:"Request too large"},413);
 let v;try{v=await req.json()}catch{return out({error:"Invalid request"},400)}
 if(v?.website)return out({ok:true});
 const slug=String(v?.slug||"");
 const guest_name=String(v?.guest_name||"").trim().slice(0,100);
 const guest_email=String(v?.guest_email||"").trim().toLowerCase();
 const response=String(v?.response||"");
 const party_size=Number(v?.party_size||1),note=String(v?.note||"").trim().slice(0,1000);
 if(!/^inv-[a-f0-9]{20}$/.test(slug)||guest_name.length<2||guest_name.length>100||!/^\S+@\S+\.\S+$/.test(guest_email)||guest_email.length>254||!["yes","no","maybe"].includes(response)||!Number.isInteger(party_size)||party_size<1||party_size>20)return out({error:"Please check your response and email address"},400);
 const url=Deno.env.get("SUPABASE_URL"),service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!service)return out({error:"Unavailable"},503);
 const db=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:inv,error}=await db.from("invitations").select("id,event_data").eq("slug",slug).eq("status","published").maybeSingle();
 if(error||!inv)return out({error:"Invitation not found"},404);
 const deadline=inv.event_data?.deadline;
 if(typeof deadline==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(deadline)&&Date.now()>new Date(deadline+"T23:59:59+02:00").getTime())return out({error:"RSVP submissions have closed"},403);
 const {data:existing}=await db.from("rsvps").select("id").eq("invitation_id",inv.id).ilike("guest_email",guest_email).limit(1);
 if(existing?.length)return out({error:"This email has already responded. Contact the event host to change your RSVP."},409);
 const {error:save}=await db.from("rsvps").insert({invitation_id:inv.id,guest_name,guest_email,response,party_size:response==="no"?1:party_size,note});
 if(save){if(save.code==="23505")return out({error:"This guest has already responded"},409);return out({error:"Could not save RSVP"},500)}
 return out({ok:true,message:"Your RSVP has been received"});
});
