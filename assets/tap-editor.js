/* VraxisRSVP — visual tap-to-edit for the Final Look.
   Editing is opt-in; all changes are browser-local drafts. */
(()=>{
'use strict';
const id=new URLSearchParams(location.search).get('template');
const outer=document.getElementById('studioFrame')||document.getElementById('frame');if(!outer||!id)return;
const key='vraxis_draft_'+vraxisDraft.id+'_tap';
let enabled=false,doc=null,selected=null,selectedPath='',selectedKind='';
let state={text:{},images:{}};
try{state=Object.assign(state,JSON.parse(localStorage.getItem(key)||'{}')||{})}catch{}
const store=()=>{try{localStorage.setItem(key,JSON.stringify(state));return true}catch{alert('Not enough storage for another image. Try a smaller photo.');return false}};
function cssPath(el){
 if(el.id&&/^[A-Za-z][A-Za-z0-9_-]*$/.test(el.id))return '#'+el.id;
 const bits=[];
 while(el&&el.nodeType===1&&el.tagName!=='HTML'){
  let part=el.tagName.toLowerCase(),sib=el;
  let index=1;while((sib=sib.previousElementSibling))if(sib.tagName===el.tagName)index++;
  part+=':nth-of-type('+index+')';bits.unshift(part);
  el=el.parentElement;
 }
 return bits.join(' > ');
}
function apply(d){
 if(!d?.body)return;
 for(const [path,value] of Object.entries(state.text)){try{let el=d.querySelector(path);if(el&&typeof value==='string')el.textContent=value}catch{}}
 for(const [path,src] of Object.entries(state.images)){try{let el=d.querySelector(path);if(el?.tagName==='IMG'&&(src.startsWith('data:image/')||src.startsWith('https://'))){el.src=src;el.style.objectFit='cover'}}catch{}}
}
function setCursor(el){if(!enabled)return;const s=doc.createElement('style');s.id='vraxis-tap-css';s.textContent='body.vraxis-editing h1,body.vraxis-editing h2,body.vraxis-editing h3,body.vraxis-editing h4,body.vraxis-editing p,body.vraxis-editing li,body.vraxis-editing label,body.vraxis-editing blockquote{cursor:text!important;outline:1px dashed #b38a68!important;outline-offset:3px}body.vraxis-editing img{cursor:pointer!important;outline:1px dashed #b38a68!important;outline-offset:3px}';doc.head.append(s)}
function activate(d){
 doc=d;if(!d?.body)return;
 apply(d);
 d.body.classList.toggle('vraxis-editing',enabled);
 if(enabled&&!d.getElementById('vraxis-tap-css'))setCursor(null);
 if(d.__vraxisTapBound)return;d.__vraxisTapBound=true;
 d.addEventListener('click',async e=>{
  if(!enabled)return;
  const raw=e.target;
  if(!(raw instanceof d.defaultView.Element))return;
  const blocked=raw.closest('button,input,textarea,select,[role="button"],[contenteditable="true"],.overlay,.modal,[class*="modal"]');
  if(blocked)return;
  let img=raw.closest('img');
  if(!img&&raw.closest('a'))return;
  let text=raw.closest('[data-text],h1,h2,h3,h4,p,blockquote,li,label,[data-editable-text]');
  const leaf=raw.closest('span,em,strong,b');
  // Keep a styled heading or paragraph together rather than selecting one highlighted word.
  if(text&&text.closest('form,[role="dialog"],nav,header,[class*="editor"],[class*="Editor"]'))text=null;
  if(text&&text.querySelector('input,textarea,select,button,a'))text=null;
  if(text&&text.childElementCount>0&&!text.hasAttribute('data-text')&&!text.hasAttribute('data-editable-text')&&!['P','BLOCKQUOTE','LI','LABEL','H1','H2','H3','H4'].includes(text.tagName))text=null;
  if(!img&&!text)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  if(img){selected=img;selectedPath=cssPath(img);selectedKind='image';picker.click();return}
  if(!text)return;
  // Ignore long multi-element containers: edit a single paragraph or heading.
  if(text.textContent.trim().length>3000)return;
  selected=text;selectedPath=cssPath(text);selectedKind='text';
  const initial=state.text[selectedPath]??text.textContent.trim();
  showEditor(initial);
 },true);
}
function findInner(){
 let parent;try{parent=outer.contentDocument}catch{return}
 if(!parent)return;
 const nested=parent.getElementById('invitation')||parent.querySelector('iframe');
 if(nested){
  // The actual invitation fills the Final Look viewport: no duplicate preview toolbar.
  const styleId='vraxis-outer-clean';
  if(!parent.getElementById(styleId)){let css=parent.createElement('style');css.id=styleId;css.textContent='html,body{height:100%;overflow:hidden!important;margin:0!important}body>header,body>footer,body>div:not(#invitation),body>section,body>main,body>nav{display:none!important}#invitation{position:fixed!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;border:0!important;display:block!important}';parent.head.append(css)}
  if(!nested.__vraxisTapOnload){nested.__vraxisTapOnload=true;nested.addEventListener('load',()=>{try{activate(nested.contentDocument)}catch{}})}
  try{activate(nested.contentDocument)}catch{}
 }else activate(parent);
}
outer.addEventListener('load',()=>{findInner();setTimeout(findInner,150)});
if(outer.contentDocument?.readyState==='complete')findInner();
window.addEventListener('vraxis-edit-mode',e=>{
 enabled=!!e.detail.enabled;
 try{if(doc){const old=doc.getElementById('vraxis-tap-css');old?.remove();doc.body.classList.toggle('vraxis-editing',enabled);if(enabled)setCursor(null)}}catch{}
 if(!enabled){dialog.hidden=true;dialog.style.display='none';}
});
const dialog=document.createElement('div');dialog.hidden=true;dialog.setAttribute('role','dialog');dialog.setAttribute('aria-label','Edit invitation text');
dialog.style.cssText='position:fixed;z-index:999999;inset:0;background:#19251c9e;display:grid;place-items:center;padding:18px';
const panel=document.createElement('div');panel.style.cssText='max-width:500px;width:100%;background:#fffaf4;padding:25px;color:#263a30;box-shadow:0 20px 80px #0005';
const label=document.createElement('label');label.textContent='Edit text on your invitation';label.style.cssText='display:block;font:600 14px Arial,sans-serif;margin-bottom:10px';
const edit=document.createElement('textarea');edit.rows=4;edit.style.cssText='width:100%;resize:vertical;padding:13px;font:16px Arial,sans-serif;border:1px solid #b8b6ad';
const actions=document.createElement('div');actions.style.cssText='display:flex;gap:10px;justify-content:flex-end;margin-top:17px';
const cancel=document.createElement('button');cancel.textContent='Cancel';const save=document.createElement('button');save.textContent='Apply text';
for(const b of [cancel,save])b.style.cssText='padding:12px 16px;border:1px solid #263a30;background:#263a30;color:white;font:600 13px Arial,sans-serif';
cancel.style.background='transparent';cancel.style.color='#263a30';
actions.append(cancel,save);panel.append(label,edit,actions);dialog.append(panel);document.body.append(dialog);
dialog.hidden=true;dialog.style.display='none';
const picker=document.createElement('input');picker.type='file';picker.accept='image/*';picker.hidden=true;document.body.append(picker);
function showEditor(value){edit.value=value;dialog.hidden=false;dialog.style.display='grid';edit.focus();edit.select()}
cancel.onclick=()=>{dialog.hidden=true;dialog.style.display='none'};dialog.style.display='none';
dialog.addEventListener('click',e=>{if(e.target===dialog){dialog.hidden=true;dialog.style.display='none'}});
save.onclick=()=>{
 if(!selected||selectedKind!=='text')return;
 const value=edit.value.trim();if(!value){alert('Enter the wording you want to display.');return;}
 state.text[selectedPath]=value;if(!store())return;
 selected.textContent=value;dialog.hidden=true;dialog.style.display='none';dialog.style.display='none';
 const status=document.getElementById('renderStatus');if(status)status.textContent='✓ Text changed and saved · switch off edit mode to experience your invitation.';
};
picker.onchange=async()=>{
 const file=picker.files?.[0];if(!file||!selected||selectedKind!=='image')return;
 let url=URL.createObjectURL(file);
 try{
  let bmp=new Image();await new Promise((resolve,reject)=>{bmp.onload=resolve;bmp.onerror=reject;bmp.src=url});
  const canvas=document.createElement('canvas'),scale=Math.min(1,1100/Math.max(bmp.width,bmp.height));
  canvas.width=Math.max(1,Math.round(bmp.width*scale));canvas.height=Math.max(1,Math.round(bmp.height*scale));
  canvas.getContext('2d').drawImage(bmp,0,0,canvas.width,canvas.height);
  const src=canvas.toDataURL('image/jpeg',.72);state.images[selectedPath]=src;
  if(store()){selected.src=src;selected.style.objectFit='cover';const status=document.getElementById('renderStatus');if(status)status.textContent='✓ Photo replaced and saved.'}
 }catch{alert('Could not read this image. Please choose a JPG or PNG.')}finally{URL.revokeObjectURL(url);picker.value=''}
};
})();
