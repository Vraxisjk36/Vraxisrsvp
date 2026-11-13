/* VraxisRSVP local image slots for VS Code edits.
   Drop a JPG into assets/templates/001/image-1.jpg, image-2.jpg, etc.
   Named data-photo slots can use assets/templates/001/hero.jpg, gallery-1.jpg, etc.
   For CSS artwork use assets/templates/002/palace-entrance.jpg.
   Missing files keep the existing template image. Customer uploads remain protected.
*/
(()=>{'use strict';
const id=(location.pathname.match(/preview-(\d{3})\.html$/)||[])[1];
if(!id||window.__vraxisLocalMedia)return;
window.__vraxisLocalMedia=true;
const root='assets/templates/'+id+'/';
const valid=/^[a-z0-9_-]+$/i;
const tested=new Map(),watched=new WeakSet();
function check(path,done){
 if(tested.has(path)){tested.get(path).then(done);return}
 const promise=new Promise(resolve=>{
  const image=new Image();image.onload=()=>resolve(path);
  image.onerror=()=>resolve(null);image.src=path;
 });tested.set(path,promise);promise.then(done);
}
function apply(doc){
 if(!doc?.body)return;
 [...doc.querySelectorAll('img')].forEach((img,index)=>{
  const slot=img.dataset.photo||img.dataset.img||'image-'+(index+1);
  const filename=(valid.test(slot)?slot:'image-'+(index+1))+'.jpg';
  const path=root+filename;
  if(img.dataset.vraxisLocalChecked===path)return;
  img.dataset.vraxisLocalChecked=path;
  check(path,found=>{
   if(!found||!img.isConnected)return;
   const current=img.getAttribute('src')||'';
   if(/^blob:|^data:image\//i.test(current)&&img.dataset.vraxisCustomerPhoto==='1')return;
   if(current.includes('/storage/v1/object/sign/'))return;
   if(img.dataset.vraxisOverride)return; // Cloud owner overrides take precedence.
   const previous=img.src;
   img.onerror=()=>{img.onerror=null;img.src=previous};
   img.src=found;
   img.dataset.vraxisLocalApplied=found;
  });
 });
 if(id==='002'){
  check(root+'palace-entrance.jpg',found=>{
   if(!found||!doc.documentElement.isConnected||doc.getElementById('vraxis-palace-image-override'))return;
   let style=doc.getElementById('vraxis-local-palace');
   if(!style){style=doc.createElement('style');style.id='vraxis-local-palace';(doc.head||doc.documentElement).append(style)}
   style.textContent='.gateway-door{background-image:url("'+found+'")!important}.palace:before{background-image:url("'+found+'")!important}';
  });
 }
}
function attach(frame){
 if(frame.dataset.vraxisLocalAttached)return;
 frame.dataset.vraxisLocalAttached='1';
 const scan=()=>{try{watch(frame.contentDocument)}catch{}};
 frame.addEventListener('load',scan);scan();
}
function watch(doc){
 if(!doc?.body||watched.has(doc))return;
 watched.add(doc);apply(doc);doc.querySelectorAll('iframe').forEach(attach);
 new MutationObserver(()=>{apply(doc);doc.querySelectorAll('iframe').forEach(attach)})
  .observe(doc.documentElement,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>watch(document),{once:true});
else watch(document);
})();