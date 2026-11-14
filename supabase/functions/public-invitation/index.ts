import {createClient} from "npm:@supabase/supabase-js@2.57.0";
const headers={"Content-Type":"application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,OPTIONS","Cache-Control":"no-store"};
const out=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="GET")return out({error:"Method not allowed"},405);
 const slug=new URL(req.url).searchParams.get("slug");
 if(!slug||!/^inv-[a-f0-9]{20}$/.test(slug))return out({error:"Invalid invitation link"},400);
 const url=Deno.env.get("SUPABASE_URL"),key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
 if(!url||!key)return out({error:"Unavailable"},503);
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data,error}=await db.from("invitations").select("id,title,template_id,event_data,design_data,status").eq("slug",slug).eq("status","published").maybeSingle();
 if(error||!data)return out({error:"Invitation not found"},404);
 const paths=Array.isArray(data.design_data?.photo_paths)?data.design_data.photo_paths.slice(0,12):[];
 const photos:string[]=[];
 for(const path of paths){if(typeof path!=="string"||!path.includes("/"+data.id+"/"))continue;const {data:signed}=await db.storage.from("invitation-photos").createSignedUrl(path,3600);if(signed?.signedUrl)photos.push(signed.signedUrl)}
 const edits=data.design_data?.tap_edits||{};
 const safeText:Record<string,string>={};
 if(edits.text&&typeof edits.text==="object")for(const [path,value] of Object.entries(edits.text)){if(typeof path==="string"&&path.length<300&&typeof value==="string")safeText[path]=value.slice(0,3000)}
 const safeImages:Record<string,string>={};
 if(edits.images&&typeof edits.images==="object")for(const [path,value] of Object.entries(edits.images)){if(typeof path!=="string"||path.length>=300||typeof value!=="string")continue;if(value.startsWith("https://"))safeImages[path]=value}
 const safeBackgrounds:Record<string,string>={};
 const backgrounds=edits.backgrounds&&typeof edits.backgrounds==="object"?edits.backgrounds:{};
 for(const [selector,value] of Object.entries(backgrounds)){if(selector.length<300&&typeof value==="string"&&value.startsWith("https://"))safeBackgrounds[selector]=value}
 const imagePaths=data.design_data?.tap_image_paths||{};
 for(const [selector,path] of Object.entries(imagePaths)){
  if(typeof selector!=="string"||selector.length>300||typeof path!=="string"||!path.includes("/"+data.id+"/"))continue;
  const {data:signed}=await db.storage.from("invitation-photos").createSignedUrl(path,3600);
  if(signed?.signedUrl){if(Object.hasOwn(backgrounds,selector))safeBackgrounds[selector]=signed.signedUrl;else safeImages[selector]=signed.signedUrl;}
 }
 const e=data.event_data||{};
 const fields=["names","title","date","time","venue","address","message","dress","dressCode","deadline","rsvpHeading","rsvpQuestion","rsvpOptions","guestQuestions","openingTitle","openingSubtitle","introParagraph","story","program","giftNote","description","age","child"];
 const event:Record<string,unknown>={};for(const key of fields)if(typeof e[key]==="string")event[key]=e[key].slice(0,3000);
 return out({title:data.title,template_id:data.template_id,event,photos,design_data:{tap_edits:{text:safeText,images:safeImages,backgrounds:safeBackgrounds}}});
});
