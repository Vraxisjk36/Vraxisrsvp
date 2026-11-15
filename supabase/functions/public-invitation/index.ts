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
 const design=data.design_data||{},edits=design.tap_edits||{};
 const ownedPath=(path:unknown):path is string=>typeof path==='string'&&path.length<1000&&path.includes('/'+data.id+'/');
 const paths=Array.isArray(design.photo_paths)?design.photo_paths.slice(0,12).filter(ownedPath):[];
 const backgrounds=edits.backgrounds&&typeof edits.backgrounds==='object'?edits.backgrounds:{};
 const imagePaths=design.tap_image_paths&&typeof design.tap_image_paths==='object'?design.tap_image_paths:{};
 const validImagePaths=Object.entries(imagePaths).filter(([selector,path])=>selector.length<=300&&ownedPath(path));
 const uniquePaths=[...new Set([...paths,...validImagePaths.map(([,path])=>path as string)])];
 const signedURLs=new Map<string,string>();
 if(uniquePaths.length){
  const {data:signed,error:signingError}=await db.storage.from('invitation-photos').createSignedUrls(uniquePaths,3600);
  if(signingError)return out({error:'Invitation photographs are temporarily unavailable. Please try again.'},503);
  for(const entry of signed||[])if(entry.path&&entry.signedUrl&&!entry.error)signedURLs.set(entry.path,entry.signedUrl);
 }
 const photos=paths.map((path:string)=>signedURLs.get(path)).filter((value:unknown):value is string=>typeof value==='string');
 const safeText:Record<string,string>={};
 if(edits.text&&typeof edits.text==='object')for(const [selector,value] of Object.entries(edits.text)){if(selector.length<300&&typeof value==='string')safeText[selector]=value.slice(0,3000);}
 const safeImages:Record<string,string>={},safeBackgrounds:Record<string,string>={};
 if(edits.images&&typeof edits.images==='object')for(const [selector,value] of Object.entries(edits.images)){if(selector.length<300&&typeof value==='string'&&value.startsWith('https://'))safeImages[selector]=value;}
 for(const [selector,value] of Object.entries(backgrounds)){if(selector.length<300&&typeof value==='string'&&value.startsWith('https://'))safeBackgrounds[selector]=value;}
 for(const [selector,path] of validImagePaths){const signed=signedURLs.get(path as string);if(signed){if(Object.hasOwn(backgrounds,selector))safeBackgrounds[selector]=signed;else safeImages[selector]=signed;}else{delete safeImages[selector];delete safeBackgrounds[selector];}}
 const e=data.event_data||{};
 const fields=["names","title","date","time","venue","address","message","dress","dressCode","deadline","rsvpHeading","rsvpQuestion","rsvpOptions","guestQuestions","openingTitle","openingSubtitle","introParagraph","story","program","giftNote","description","age","child"];
 const event:Record<string,unknown>={};for(const key of fields)if(typeof e[key]==="string")event[key]=e[key].slice(0,3000);
 return out({title:data.title,template_id:data.template_id,event,photos,design_data:{tap_edits:{text:safeText,images:safeImages,backgrounds:safeBackgrounds}}});
});
