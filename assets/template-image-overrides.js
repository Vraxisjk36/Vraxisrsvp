/* VraxisRSVP public template image replacements, including nested srcdoc previews. */
(()=>{'use strict';
if(window.__vraxisTemplateImagesLoaded)return;
window.__vraxisTemplateImagesLoaded=true;
const id=(location.pathname.match(/preview-(\d{3})\.html$/)||[])[1];
if(!id)return;
const endpoint='https://ogmlfnmdhmrbbmxnxwqw.supabase.co/rest/v1/template_image_overrides?template_id=eq.'+encodeURIComponent(id)+'&select=slot,image_url';
const headers={'apikey':'sb_publishable_K8hadrdvJiqCRB3eXs9tHg_0kUXl9Ry'};
fetch(endpoint,{headers,cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Image settings unavailable ('+r.status+')');return r.json()}).then(rows=>{
if(!rows.length)return;
const map=new Map(rows.map(row=>[row.slot,row.image_url]));
const watched=new WeakSet();
function apply(doc){
 if(!doc?.body)return;
 const imgs=[...doc.querySelectorAll('img')];
 imgs.forEach((img,i)=>{
  const slot=img.dataset.photo||img.dataset.img||'image-'+(i+1);
  const url=map.get(slot);
  if(!url||img.dataset.vraxisOverride===url)return;
  const current=img.getAttribute('src')||'';
  // Never overwrite customer-selected data URLs or locally edited blob images.
  if(/^(data:|blob:)/i.test(current))return;
  // Customer-specific photos use signed private storage URLs.
  if(current.includes('/storage/v1/object/sign/'))return;
  img.src=url;img.dataset.vraxisOverride=url;
 });
}
function watch(doc){
 if(!doc?.body||watched.has(doc))return;
 watched.add(doc);apply(doc);
 doc.querySelectorAll('iframe').forEach(attach);
 const observer=new MutationObserver(()=>{apply(doc);doc.querySelectorAll('iframe').forEach(attach)});
 observer.observe(doc.documentElement,{childList:true,subtree:true});
}
function attach(frame){
 if(frame.dataset.vraxisPhotoAttached)return;
 frame.dataset.vraxisPhotoAttached='1';
 const scan=()=>{try{watch(frame.contentDocument)}catch(e){console.warn('Template frame unavailable:',e.message)}};
 frame.addEventListener('load',scan);scan();
}
watch(document);
}).catch(e=>console.warn('Template image replacements:',e.message));
})();