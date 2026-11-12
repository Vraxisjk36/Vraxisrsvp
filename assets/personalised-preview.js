/* VraxisRSVP personalised preview adapter — browser-only prototype. */
(function(){
 const id=(new URLSearchParams(location.search)).get('template')||'001';
 const frame=document.getElementById('frame');if(!frame)return;
 const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return {}}};
 const details=read('vraxis_personal_'+id),studio=read('vraxis_v6_'+id),photos=read('vraxis_photos_'+id);
 const valid=v=>typeof v==='string'&&v.trim();
 function apply(){
  let doc;try{doc=frame.contentDocument}catch{return}if(!doc||!doc.body)return;
  const text=Object.assign({},studio.text||{});
  const names=(details.names||'').split(/\s+(?:and|&)\s+|\s*,\s*/i).filter(Boolean);
  if(names[0])text.first=names[0];if(names[1])text.second=names[1];
  const mapping={title:details.title,names:details.names,date:details.date,time:details.time,venue:details.venue,ceremonyVenue:details.venue,location:details.address||details.venue,address:details.address,deadline:details.deadline,rsvpDeadline:details.deadline,dress:details.dress,dressCode:details.dress,message:details.message,contact:details.contact};
  for(const [k,v] of Object.entries(mapping))if(valid(v))text[k]=v;
  doc.querySelectorAll('[data-text]').forEach(el=>{const value=text[el.dataset.text];if(valid(value))el.textContent=value});
  const slots=[...doc.querySelectorAll('[data-photo]')];
  slots.forEach((el,i)=>{if(el.tagName!=='IMG')return;const saved=studio.photos?.[el.dataset.photo];const src=saved?.src||(Array.isArray(photos)?photos[i%photos.length]:null);if(src){el.src=src;el.style.objectFit='cover';el.style.objectPosition=(saved?.x??50)+'% '+(saved?.y??50)+'%'}});
  doc.querySelectorAll('input,textarea,select').forEach((el,i)=>{const k=el.id||el.name||'field_'+i;const v=studio.fields?.[k];if(v!==undefined&&el.type!=='file'&&el.type!=='password'){if(el.type==='checkbox')el.checked=!!v;else el.value=v}});
  const note=document.getElementById('renderStatus');if(note)note.textContent=slots.length?'Personalised details and supported photo slots loaded.':'Personalised details loaded where supported by this template.';
 }
 frame.addEventListener('load',()=>{apply();setTimeout(apply,350)});if(frame.contentDocument?.readyState==='complete')apply();
})();