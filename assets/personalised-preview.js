/* VraxisRSVP — Personalised invitation renderer v2 (GitHub Pages demo).
   Applies saved customer details to the actual nested template document and its native editor.
   Does not transmit data or claim to provide public hosting / RSVP persistence. */
(()=>{
"use strict";
const params=new URLSearchParams(location.search);
const id=/^0(0[1-9]|1[0-3])$/.test(params.get('template')||'')?params.get('template'):'001';
const hosts=[document.getElementById('frame'),document.getElementById('studioFrame')].filter(Boolean); if(!hosts.length)return;
const get=(k,fallback={})=>{try{return JSON.parse(localStorage.getItem(k)||'null')??fallback}catch{return fallback}};
const details=vraxisDraft.read('details',{}),studio=vraxisDraft.read('studio',{}),photos=vraxisDraft.read('photos',[]);
const names=(details.names||'').split(/\s+(?:and|&)\s+|\s*,\s*/i).map(x=>x.trim()).filter(Boolean);
const name1=names[0]||details.names||'',name2=names[1]||'';
const profile={
 names:details.openingTitle||details.names,first:name1,second:name2,person:details.names,parents:details.names,
 date:details.date,time:details.time,venue:details.venue,address:details.address,city:details.address,
 dress:details.dress,message:details.introParagraph||details.message,letter:details.story||details.message,title:details.openingTitle||details.title,
 deadline:details.deadline,contact:details.contact,age:details.age,child:details.child
};
const map={
 '001':{text:{first:'first',second:'second',date:'date',ceremonyTime:'time',ceremonyVenue:'venue',ceremonyLocation:'address',receptionTime:'time',receptionVenue:'venue',dress:'dress',letter:'message'}},
 '003':{input:{editName1:'first',editName2:'second',editDate:'date',editCeremony:'venue',editReception:'venue',editCeremonyTime:'time',editReceptionTime:'time'}},
 '004':{input:{edName:'names',edAge:'age',edDate:'date',edTime:'time',edVenue:'venue',edAddress:'address'}},
 '005':{input:{edName:'names',edAge:'age',edDate:'date',edTime:'time',edVenue:'venue',edCity:'address',edDress:'dress',edIntro:'message'}},
 '006':{input:{editName:'names',editAge:'age',editDate:'date',editTime:'time',editVenue:'venue',editAddress:'address',editTribute:'message'}},
 '007':{input:{'edit-parents':'names','edit-date':'date','edit-time':'time','edit-venue':'venue','edit-address':'address','edit-dress':'dress','edit-deadline':'deadline','edit-message':'message'}},
 '008':{input:{editParents:'names',editBaby:'child',editDate:'date',editTime:'time',editVenue:'venue',editCity:'address',editDress:'dress',editMessage:'message'}},
 '009':{input:{'edit-parents':'names','edit-date':'date','edit-dateShort':'date','edit-time':'time','edit-venue':'venue','edit-location':'address','edit-dress':'dress','edit-story':'message'}},
 '010':{input:{editParents:'names',editDate:'date',editTime:'time',editVenue:'venue',editAddress:'address',editDress:'dress',editParentStory:'message'}},
 '011':{text:{parents:'names',dateDisplay:'date',time:'time',venue:'venue',address:'address',dress:'dress',letter1:'message'}},
 '012':{text:{bride:'names',tribute:'message',invite:'message'}},
 '013':{input:{editBride:'names',editLetter:'message',editDate:'date',editTime:'time',editVenue:'venue',editAddress:'address',editDress:'dress'},text:{bride:'names'} }
};
let last=null,applied=false,bindings=new WeakSet(),activeDoc=null;
function filled(v){return typeof v==='string'&&v.trim().length>0}
function setText(el,value){if(!filled(value))return;el.textContent=value}
function setValue(el,value){
 if(!el||!filled(value)||el.type==='file'||el.type==='password')return false;
 if(el.value===value)return true;
 el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));return true;
}
function image(src){return typeof src==='string'&&(src.startsWith('data:image/')||src.startsWith('blob:')||/^https:\/\//.test(src))}
function status(msg){const el=document.getElementById('renderStatus');if(el)el.textContent=msg}
function applyDoc(doc){
 if(!doc||!doc.body)return;
 if(activeDoc!==doc){activeDoc=doc;applied=false}
 const conf=map[id]||{};
 const text=Object.assign({},studio.text||{});
 for(const [field,key] of Object.entries(conf.text||{})){if(filled(profile[key]))text[field]=(field==='dateDisplay'&&/^\d{4}-\d{2}-\d{2}$/.test(profile[key]))?new Date(profile[key]+'T12:00:00').toLocaleDateString('en-ZA',{day:'numeric',month:'long',year:'numeric'}):profile[key]}
 // Apply native editable controls first: their existing input/change handlers redraw the template.
 let nativeCount=0;
 for(const [field,key] of Object.entries(conf.input||{})){let v=profile[key];if(id==='009'&&field==='edit-date'&&filled(v))v=new Date(v+'T12:00:00').toLocaleDateString('en-ZA',{weekday:'long',day:'numeric',month:'long',year:'numeric'});if(id==='009'&&field==='edit-dateShort'&&filled(v))v=new Date(v+'T12:00:00').toLocaleDateString('en-ZA',{day:'numeric',month:'long',year:'numeric'}).toUpperCase();if(setValue(doc.getElementById(field),v))nativeCount++}
 for(const [k,v] of Object.entries(studio.fields||{})){
  const el=doc.getElementById(k)||doc.querySelector('[name="'+CSS.escape(k)+'"]');
  if(!el||el.type==='file'||el.type==='password'||el.type==='radio')continue;
  if(el.type==='checkbox'){el.checked=!!v;el.dispatchEvent(new Event('change',{bubbles:true}))}
  else if(typeof v==='string'&&v&&!(conf.input&&Object.hasOwn(conf.input,k)))setValue(el,v)
 }
 let textCount=0;
 doc.querySelectorAll('[data-text]').forEach(el=>{const value=text[el.dataset.text];if(filled(value)){setText(el,value);textCount++}});
 // 012 creates native editor fields without IDs. Match their label order to the template's own data model.
 if(id==='012'){
  const keys=['names','message','message','date','time','venue','address','dress',null,'deadline'];
  const controls=[...doc.querySelectorAll('#editFields label > input,#editFields label > textarea')];
  controls.slice(0,10).forEach((el,i)=>{const k=keys[i];if(k&&setValue(el,profile[k]))nativeCount++});
 }
 // Remove the templates' second full editor from Final Look, without removing guest experiences.
 if(!doc.getElementById('vraxis-hide-native-editor')){
  const style=doc.createElement('style');style.id='vraxis-hide-native-editor';
  style.textContent='#editOpen,#editToggle,#editFab,#editTop,#editorToggle,#openEdit,#editBtn,#editPanel,#editor,#backdrop,#scrim,#panel,#editDrawer,#closeEditor{display:none!important}';
  doc.head.append(style);
 }
 // 009 and other direct-text designs expose semantic IDs rather than data-text keys.
 const direct={parentNamesHero:'names',heroDate:'date'};
 if(id==='009')for(const [selector,key] of Object.entries(direct)){const el=doc.getElementById(selector);if(el&&filled(profile[key])){setText(el,profile[key]);textCount++}}
 // Preserve the user's chosen Studio photo on matching native slots.
 let photoCount=0;const slots=[...doc.querySelectorAll('[data-photo]')].filter(el=>el.tagName==='IMG'||el.querySelector('img'));
 slots.forEach((slot,i)=>{
  const target=slot.tagName==='IMG'?slot:slot.querySelector('img');
  const saved=studio.photos?.[slot.dataset.photo];
  const uploaded=Array.isArray(photos)?photos[i]:null;
  const src=saved?.src||uploaded;
  if(target&&image(src)){target.src=src;target.style.objectFit='cover';target.style.objectPosition=(saved?.x??50)+'% '+(saved?.y??50)+'%';photoCount++}
 });
 // Native template editors frequently bind photo URLs rather than data-photo attributes.
 const photoInputs={
  '003':['editHeroPhoto'],'004':['edHero','mcPortraitUrl'],'005':['edHero'],
  '006':['editHero','editPortrait'],'008':['editPhoto']
 };
 (photoInputs[id]||[]).forEach((field,i)=>{const src=Array.isArray(photos)?photos[i]:null;if(image(src)&&setValue(doc.getElementById(field),src))photoCount++});
 // Remaining templates: images with clearly identifiable photographic sources, not icons/illustrations.
 if(Array.isArray(photos)&&photos.length&&!photoCount){
  const candidates=[...doc.images].filter(img=>/images\.unsplash\.com|images\.pexels\.com/.test(img.currentSrc||img.src||'')&&!img.closest('button'));
  candidates.slice(0,photos.length).forEach((img,i)=>{if(image(photos[i])){img.src=photos[i];img.style.objectFit='cover';photoCount++}});
 }
 if(id==='011'&&Array.isArray(photos)){[...doc.querySelectorAll('[data-img]')].forEach((img,i)=>{if(image(photos[i])){img.src=photos[i];photoCount++}})}
 if(id==='009'&&image(photos?.[0])){const img=doc.getElementById('heroImg');if(img){img.src=photos[0];photoCount++}}
 // Make the invitation's people/event the main title, never the catalogue template's name.
 const templateNames=['The Heirloom','The Grand Affair','The Modern Vow','Midnight Club','The Social Edit','After Hours','The Little Garden','Moonlit Lullaby','The Big Little Secret','Little Wonderland','Sunday, With Love','The Bridal Edit','Something Sweet'];
 const original=templateNames[Number(id)-1];
 const preferred=details.openingTitle||details.names||details.title;
 if(filled(preferred)){
  const normalise=value=>String(value||'').replace(/\s+/g,' ').trim().toLowerCase();
  const variants=new Set([normalise(original),normalise(original.replace(/^the /i,''))]);
  doc.querySelectorAll('h1,h2,h3,h4,.hero-title,.cover-title,.main-title,.intro-title,.title,[data-cover-title]').forEach(el=>{
   if(el.closest('nav,header,form,#editPanel,#editor,#editDrawer'))return;
   if(el.children.length>1)return;
   const existing=normalise(el.textContent);
   if(variants.has(existing))el.textContent=preferred;
  });
  // Many template entrances use a separate title node rather than a semantic heading.
  doc.querySelectorAll('[class*="opening"],[class*="cover"],[class*="intro"]').forEach(section=>{
   if(section.closest('form,#editPanel,#editor,#editDrawer'))return;
   const candidates=[...section.querySelectorAll('strong,span,div')].filter(el=>el.children.length===0);
   candidates.forEach(el=>{if(variants.has(normalise(el.textContent)))el.textContent=preferred});
  });
 }
 // Preserve optional RSVP closing information across every original template.
 if(filled(details.deadline)&&!doc.getElementById('vraxis-rsvp-deadline')){
  const anchor=doc.querySelector('#rsvp,.rsvp,.rsvp-section,[id*=rsvp],form');
  const chip=doc.createElement('p');chip.id='vraxis-rsvp-deadline';
  chip.textContent='Please RSVP by '+details.deadline;
  chip.style.cssText='margin:25px auto;padding:10px 18px;max-width:420px;text-align:center;font:600 13px Arial,sans-serif;letter-spacing:.04em;background:#f7f3ecd9;color:#283e32;border:1px solid #d3c9bd';
  if(anchor?.parentElement)anchor.parentElement.insertBefore(chip,anchor);else doc.body.append(chip);
 }
 status('Preview loaded · '+(nativeCount+textCount)+' personalised fields'+(photoCount?' · '+photoCount+' photos':'')+'. Changes are saved on this device.');
 applied=true;
}
function bindInner(host){
 let outer;try{outer=host.contentDocument}catch{status('Unable to access template preview.');return}
 const inner=outer?.getElementById('invitation')||outer?.querySelector('iframe');
 if(!inner){if(outer?.body)applyDoc(outer);return}
 if(!bindings.has(inner)){bindings.add(inner);inner.addEventListener('load',()=>{try{applyDoc(inner.contentDocument)}catch(e){status('Could not load the original template.')}})}
 try{const doc=inner.contentDocument;if(doc?.readyState==='complete')applyDoc(doc)}catch{status('Template content is not accessible from this preview.')}
}
for(const host of hosts){host.addEventListener('load',()=>bindInner(host));if(host.contentDocument?.readyState==='complete')bindInner(host)}
})();
