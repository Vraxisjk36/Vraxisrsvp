import {createClient} from "npm:@supabase/supabase-js@2.57.0";
const escape=(v:unknown)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
Deno.serve(async req=>{
 if(req.method!=="GET")return new Response("Method not allowed",{status:405});
 const slug=new URL(req.url).searchParams.get("slug")||"";
 if(!/^inv-[a-f0-9]{20}$/.test(slug))return new Response("Invitation not found",{status:404});
 const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!key)return new Response("Unavailable",{status:503});
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:inv}=await db.from("invitations").select("id,title,event_data,design_data,status").eq("slug",slug).eq("status","published").maybeSingle();
 if(!inv)return new Response("Invitation not found",{status:404});
 const e=inv.event_data||{};
 const title=String(e.names||e.title||inv.title||"A special invitation").slice(0,100).trim();
 const date=String(e.date||"").slice(0,50);
 const description=date?"You're invited · "+date:"A special invitation awaits you";
 const siteBase=(Deno.env.get("PUBLIC_SITE_URL")||"https://vraxisjk36.github.io/Vraxisrsvp").replace(/\/$/,"");
 const destination=siteBase+"/invite.html?slug="+encodeURIComponent(slug);
 const paths=Array.isArray(inv.design_data?.photo_paths)?inv.design_data.photo_paths:[];
 let image="";
 for(const p of paths.slice(0,5)){
  if(typeof p!=="string"||!p.includes("/"+inv.id+"/"))continue;
  const {data}=await db.storage.from("invitation-photos").createSignedUrl(p,86400);
  if(data?.signedUrl){image=data.signedUrl;break}
 }
 const metaImage=image?'<meta property="og:image" content="'+escape(image)+'"><meta name="twitter:card" content="summary_large_image">':"";
 const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(title)+'</title><meta name="description" content="'+escape(description)+'"><meta property="og:type" content="website"><meta property="og:title" content="'+escape(title)+'"><meta property="og:description" content="'+escape(description)+'"><meta property="og:url" content="'+escape(req.url)+'">'+metaImage+'<meta http-equiv="refresh" content="0;url='+escape(destination)+'"></head><body><p>Opening your invitation… <a href="'+escape(destination)+'">Tap here</a></p><script>location.replace('+JSON.stringify(destination)+')</script></body></html>';
 return new Response(html,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"public, max-age=300"}});
});
