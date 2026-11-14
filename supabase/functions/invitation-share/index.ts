import {createClient} from "npm:@supabase/supabase-js@2.57.0";
const namePath=(value:string)=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64).replace(/-$/,'')||'your-invitation';
Deno.serve(async req=>{
 if(req.method!=="GET")return new Response("Method not allowed",{status:405});
 const slug=new URL(req.url).searchParams.get("slug")||"";
 if(!/^inv-[a-f0-9]{20}$/.test(slug))return new Response("Invitation not found",{status:404});
 const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!key)return new Response("Unavailable",{status:503});
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:inv}=await db.from("invitations").select("title,event_data,status").eq("slug",slug).eq("status","published").maybeSingle();
 if(!inv)return new Response("Invitation not found",{status:404});
 const title=String(inv.event_data?.names||inv.title||"Your invitation").slice(0,150);
 const destination="https://our-moment-invitations.fernyplatypus32.chatgpt.site/"+namePath(title)+"/"+slug;
 return new Response(null,{status:302,headers:{Location:destination,"Cache-Control":"public, max-age=60"}});
});
