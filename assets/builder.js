(() => {
  const query = new URLSearchParams(location.search), id = query.get('template');
  const template = window.VRAXIS_TEMPLATES.find(item => item.id === id);
  if (!template) { location.replace('catalogue.html'); return; }
  const draft = window.vraxisDraft;
  const model = draft.read('details', {});
  const fields = document.getElementById('fields'), next = document.getElementById('next'), form = document.getElementById('builderForm');
  const error = document.getElementById('builderError'), saveStatus = document.getElementById('saveStatus');
  const names = ['Celebration','Details','Your words','Guest replies','Photographs','Review'];
  let step = Math.min(6,Math.max(1,Number(query.get('step')) || 1)), uploading = false;
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const birthday = template.category === 'Birthday', baby = ['Baby Shower','Welcome Baby','Gender Reveal'].includes(template.category);
  function field(key,label,type='text',hint='',required=false) {
    const value = esc(model[key]);
    const size = ['message','introParagraph','story','program','giftNote','guestQuestions'].includes(key) ? 3000 : 180;
    const control = type === 'textarea' ? `<textarea id="field-${key}" name="${key}" rows="4" maxlength="${size}" placeholder="${esc(hint)}">${value}</textarea>` : `<input id="field-${key}" name="${key}" type="${type}" value="${value}" placeholder="${esc(hint)}" ${required?'required':''} ${type==='number'?'min="1" max="120"':type==='text'?`maxlength="${size}"`:''} ${['names','title','venue'].includes(key)?'autocomplete="off"':''}>`;
    return `<label class="field ${type==='textarea'?'field-full':''}" for="field-${key}"><span>${label}${required?' <i aria-hidden="true">*</i>':''}</span>${control}</label>`;
  }
  const grid = body => '<div class="field-grid">'+body+'</div>';
  const screens = [
    {title:'Who are we celebrating?',intro:'Start with the names at the heart of the occasion.',body:()=>grid(field('names',baby?'Parents / family names':birthday?'Name of the person being celebrated':'Names of the couple or people being celebrated','text',birthday?'Amara':'Alex & Mira',true)+field('title','Invitation heading','text',birthday?'A night to remember':'You are invited',true)+(birthday?field('age','Age (optional)','number','30'):'')+(baby?field('child',"Baby’s name or nickname (optional)",'text','Our little star'):''))},
    {title:'Set the scene.',intro:'The date, the time and the place your guests will meet.',body:()=>grid(field('date','Event date','date','',true)+field('time','Event time','time','',true)+field('venue','Venue name','text','The Glasshouse',true)+field('address','Full address','text','Street, city, country'))},
    {title:'Give it your voice.',intro:'Keep it simple, or add a story. These details are optional.',optional:true,body:()=>grid(field('message','A message for your guests','textarea','We would love you to celebrate with us.')+field('dress','Dress code','text','Garden formal')+field('openingTitle','Opening headline (optional)','text','A celebration of us')+field('openingSubtitle','Opening subtitle (optional)','text','Together with our families')+field('introParagraph','Introductory paragraph','textarea')+field('story',baby?'A little family story':'Your story or tribute','textarea')+field('program','Schedule (one item per line)','textarea','14:00 · Welcome\n15:00 · The celebration begins')+field('giftNote','Gifts or special requests','textarea'))},
    {title:'Make room for their replies.',intro:'Let your guests know when to reply and what you’d like to ask.',optional:true,body:()=>grid(field('deadline','RSVP closing date','date')+field('contact','Contact number (optional)','tel')+field('rsvpHeading','RSVP heading','text','Will you join us?')+field('rsvpQuestion','Response question','text','Can you make it?')+field('rsvpOptions','Response labels (up to 3, one per line)','textarea','Joyfully accepts\nRegretfully declines\nNot sure yet')+field('guestQuestions','Extra guest questions (up to 4)','textarea','Meal preference\nAny dietary needs?'))},
    {title:'Bring your people into the picture.',intro:'Add up to six photographs. Your first photo will be used for the shared invitation preview.',optional:true,body:()=>'<label class="photo-upload" for="file"><span class="upload-plus" aria-hidden="true">+</span><strong>Add your photographs</strong><span>JPG, PNG, WebP or GIF · up to 6 photos</span><input id="file" type="file" accept="image/*" multiple></label><div class="photo-grid" id="thumbs"></div><p class="photo-note">Prefer the original artwork? You can continue without adding photos.</p>'},
    {title:'It’s coming together.',intro:'Give the details one last look. You can still change words and images in the editor.',body:()=>review()}
  ];
  function persist() {
    try { draft.write('details',model); saveStatus.textContent='✓ Draft saved on this device'; return true; }
    catch { saveStatus.textContent='Your device storage is full'; error.textContent='We couldn’t save those changes. Remove a photograph to free up some space, then try again.'; return false; }
  }
  function review() {
    const photos=draft.read('photos',[]);
    const groups=[['The celebration',model.names,model.title,1],['The details',[model.date,model.time].filter(Boolean).join(' · '),[model.venue,model.address].filter(Boolean).join(' · '),2],['Your words',model.message||'The design’s original wording',model.dress?'Dress code: '+model.dress:'',3],['Guest replies',model.deadline?'Reply by '+model.deadline:'No closing date set',model.guestQuestions||'The standard RSVP form',4],['Photographs',photos.length?photos.length+' photograph'+(photos.length===1?'':'s'):'Original template artwork',photos.length?'Your first photo is the share cover':'',5]];
    return `<div class="review-cover"><img src="${esc(photos[0]||template.cover)}" alt="Your chosen invitation cover"><div><small>${esc(template.name)}</small><h3>${esc(model.names||'Your celebration')}</h3><p>${template.tier} · $${template.price.toFixed(2)}</p></div></div><div class="review-details">${groups.map(([label,value,note,to])=>`<section><div><h3>${label}</h3><p>${esc(value)}</p>${note?'<small>'+esc(note)+'</small>':''}</div><button type="button" data-edit-step="${to}" aria-label="Edit ${label.toLowerCase()}">Edit ↗</button></section>`).join('')}</div>`;
  }
  function renderSteps() {
    document.getElementById('builderSteps').innerHTML=names.map((name,i)=>`<button type="button" data-step="${i+1}" class="${step===i+1?'current':step>i+1?'complete':''}" ${step===i+1?'aria-current="step"':''}><span>${step>i+1?'✓':String(i+1).padStart(2,'0')}</span>${name}</button>`).join('');
    document.querySelectorAll('[data-step]').forEach(button=>button.onclick=()=>go(Number(button.dataset.step)));
  }
  function show(focus=false) {
    error.textContent=''; const screen=screens[step-1];
    document.getElementById('heading').textContent=screen.title;document.getElementById('subtitle').textContent=screen.intro;
    document.getElementById('count').textContent='Step '+step+' of 6';document.getElementById('stepOptional').textContent=screen.optional?'Make it yours, or continue':'';
    document.getElementById('progress').style.width=(step/6*100)+'%';document.querySelector('[role=progressbar]').setAttribute('aria-valuenow',step);
    fields.innerHTML=screen.body();next.textContent=step===6?'Open my invitation editor →':'Continue →';next.disabled=uploading;
    document.getElementById('back').textContent=step===1?'← Design preview':'← Back';renderSteps();
    if(step===5){renderPhotos();document.getElementById('file').addEventListener('change',upload);}
    document.querySelectorAll('[data-edit-step]').forEach(button=>button.onclick=()=>go(Number(button.dataset.editStep)));
    if(focus)document.getElementById('heading').focus({preventScroll:true});
  }
  function validateCurrent() {
    const invalid=[...form.querySelectorAll('input,textarea')].find(input=>!input.checkValidity());
    if(invalid){error.textContent=invalid.validationMessage;invalid.focus();invalid.reportValidity();return false;}
    if(step===4){for(const [key,max] of [['rsvpOptions',3],['guestQuestions',4]])if((model[key]||'').split(/\r?\n/).filter(x=>x.trim()).length>max){error.textContent='Please keep '+(key==='rsvpOptions'?'response labels':'extra questions')+' to '+max+' lines.';document.getElementById('field-'+key).focus();return false;}}
    return true;
  }
  function missingRequired() {
    if(!String(model.names||'').trim()||!String(model.title||'').trim())return 1;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(model.date||'')||!/^\d{2}:\d{2}$/.test(model.time||'')||!String(model.venue||'').trim())return 2;
    return null;
  }
  function go(target) {
    if(uploading)return;
    if(target>step&&!validateCurrent())return;
    if(!persist())return;
    if(target===6){const missing=missingRequired();if(missing){target=missing;}}
    step=target;const url=new URL(location.href);url.searchParams.set('step',step);history.pushState({builderStep:step},'',url);show(true);
    document.querySelector('.builder-panel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  }
  form.addEventListener('input',event=>{if(event.target.name){model[event.target.name]=event.target.value;persist();}});
  form.addEventListener('change',event=>{if(event.target.name){model[event.target.name]=event.target.value;persist();}});
  form.addEventListener('submit',event=>{
    event.preventDefault();if(uploading||!validateCurrent()||!persist())return;
    if(step===6){const missing=missingRequired();if(missing){go(missing);return;}localStorage.setItem('vraxis_selected_template',id);location.href=draft.url('ready.html');return;}
    go(step+1);
  });
  document.getElementById('back').onclick=()=>{if(step===1){if(persist())location.href=draft.url('preview-'+id+'.html');}else go(step-1);};
  window.addEventListener('popstate',()=>{step=Math.min(6,Math.max(1,Number(new URLSearchParams(location.search).get('step'))||1));show();});
  function savePhotos(photos) {try{draft.write('photos',photos);saveStatus.textContent='✓ Photographs saved on this device';return true;}catch{error.textContent='There isn’t enough storage for that photograph. Try a smaller one or remove another photo first.';return false;}}
  function renderPhotos() {
    const photos=draft.read('photos',[]), thumbs=document.getElementById('thumbs');thumbs.replaceChildren();
    photos.forEach((src,i)=>{
      const card=document.createElement('div');card.className='photo-card';const img=document.createElement('img');img.src=src;img.alt='Your photograph '+(i+1);
      const label=document.createElement('span');label.className='photo-label';label.textContent=i===0?'Share cover':'Photo '+(i+1);
      const controls=document.createElement('div');const remove=document.createElement('button');remove.type='button';remove.textContent='Remove';remove.setAttribute('aria-label','Remove photograph '+(i+1));remove.onclick=()=>{const next=photos.filter((_,n)=>n!==i);if(savePhotos(next))renderPhotos();};
      if(i>0){const cover=document.createElement('button');cover.type='button';cover.textContent='Use as cover';cover.onclick=()=>{const next=[src,...photos.filter((_,n)=>n!==i)];if(savePhotos(next))renderPhotos();};controls.append(cover);}
      controls.append(remove);card.append(img,label,controls);thumbs.append(card);
    });
    document.getElementById('file').disabled=photos.length>=6||uploading;
  }
  async function upload(event) {
    const current=draft.read('photos',[]),files=[...event.target.files].slice(0,6-current.length);if(!files.length)return;
    uploading=true;next.disabled=true;error.textContent='';saveStatus.textContent='Preparing your photographs…';const output=[];
    try{
      for(const file of files){if(!file.type.startsWith('image/'))throw Error('Please choose a JPG, PNG or WebP photograph.');const objectURL=URL.createObjectURL(file);
        try{const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('We couldn’t read '+file.name+'. Please try another photo.'));img.src=objectURL;});const canvas=document.createElement('canvas'),scale=Math.min(1,1400/Math.max(img.width,img.height));canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);output.push(canvas.toDataURL('image/jpeg',.78));}finally{URL.revokeObjectURL(objectURL);}
      }
      savePhotos([...current,...output]);
    }catch(e){error.textContent=e.message;saveStatus.textContent='Your existing photographs are safe.';}
    finally{uploading=false;next.disabled=false;renderPhotos();}
  }
  document.getElementById('templateName').textContent=template.name;
  document.getElementById('templateTier').textContent=template.tier+' · $'+template.price.toFixed(2);
  document.getElementById('designCover').src=template.cover;document.getElementById('designCover').alt=template.name+' invitation artwork';
  document.getElementById('originalPreview').href='preview-'+id+'.html';
  document.getElementById('showDesign').onclick=event=>{const frame=document.getElementById('sample'),open=frame.hidden;frame.hidden=!open;document.getElementById('designCover').hidden=open;event.currentTarget.setAttribute('aria-expanded',String(open));event.currentTarget.textContent=open?'Back to the cover ↙':'Experience the original design ↗';if(open&&!frame.src)frame.src='preview-'+id+'.html';};
  document.title='Make '+template.name+' yours | VraxisRSVP';show();
})();
