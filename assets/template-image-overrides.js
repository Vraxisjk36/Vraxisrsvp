/* Public default-template photography overrides. Customer-specific photos are applied later. */
(()=>{'use strict';const id=(location.pathname.match(/preview-(\d{3})\.html$/)||[])[1];if(!id)return;
const endpoint='https://ogmlfnmdhmrbbmxnxwqw.supabase.co/rest/v1/template_image_overrides?template_id=eq.'+encodeURIComponent(id)+'&select=slot,image_url';
const headers={'apikey':'sb_publishable_K8hadrdvJiqCRB3eXs9tHg_0kUXl9Ry'};
fetch(endpoint,{headers}).then(r=>{if(!r.ok)throw Error('Photo overrides unavailable');return r.json()}).then(rows=>{
 if(!rows.length)return;const map=new Map(rows.map(x=>[x.slot,x.image_url]));
 function apply(doc){if(!doc?.body)return;const images=[...doc.querySelectorAll('img')];images.forEach((img,i)=>{const slot=img.dataset.photo||img.dataset.img||'image-'+(i+1);const url=map.get(slot);if(url&&img.dataset.vraxisOverride!==url){const current=img.getAttribute('src')||'';if(/^data:|^blob:/.test(current)||current.includes('/storage/v1/object/')||(!current.includes('images.unsplash.com')&&!current.includes('unsplash.com')&&!img.dataset.vraxisOverride))return;img.src=url;img.dataset.vraxisOverride=url}})}
 function attach(frame){if(frame.dataset.vraxisPhotoAttached)return;frame.dataset.vraxisPhotoAttached='1';frame.addEventListener('load',()=>{try{apply(frame.contentDocument);frame.contentDocument?.querySelectorAll('iframe').forEach(attach)}catch{}});try{apply(frame.contentDocument);frame.contentDocument?.querySelectorAll('iframe').forEach(attach)}catch{}}
 apply(document);document.querySelectorAll('iframe').forEach(attach);
 }).catch(e=>console.warn('Template photo overrides:',e.message));
})();