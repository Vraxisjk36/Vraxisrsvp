(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const entrance=document.getElementById('entrance');
  document.querySelector('[data-open]')?.addEventListener('click',()=>{entrance.classList.add('opened');entrance.inert=true;setTimeout(()=>{entrance.hidden=true;document.querySelector('main h1')?.setAttribute('tabindex','-1');document.querySelector('main h1')?.focus({preventScroll:true});},reduced?0:750);});
  if(!reduced){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('seen');observer.unobserve(e.target);}}),{threshold:.07});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));document.body.classList.add('motion-ready');}
  const progress=document.querySelector('.reading-line');addEventListener('scroll',()=>progress.style.width=100*scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)+'%',{passive:true});
  document.querySelectorAll('[data-surprise]').forEach(b=>b.onclick=()=>{const text=b.nextElementSibling;text.hidden=!text.hidden;b.setAttribute('aria-expanded',String(!text.hidden));});
  document.querySelectorAll('[data-wish]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-wish]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelector('.wish-output').textContent=b.dataset.wish;});
  const modal=document.getElementById('photo-dialog');let photoTrigger;
  document.querySelectorAll('[data-lightbox]').forEach(button=>button.onclick=()=>{photoTrigger=button;modal.querySelector('img').src=button.querySelector('img').src;modal.showModal();});
  modal.querySelector('button').onclick=()=>modal.close();modal.addEventListener('click',e=>{if(e.target===modal)modal.close();});modal.addEventListener('close',()=>photoTrigger?.focus());
  function eventValue(key){return document.querySelector('[data-field="'+key+'"]')?.textContent.trim()||'';}
  function update(){
    const date=eventValue('date'),time=eventValue('time');const stamp=/^\d{4}-\d{2}-\d{2}$/.test(date)?new Date(date+'T'+(/^\d{2}:\d{2}$/.test(time)?time:'12:00')+':00'):null;
    document.querySelectorAll('[data-countdown]').forEach(el=>{const days=stamp?Math.ceil((stamp-Date.now())/864e5):NaN;el.textContent=!Number.isFinite(days)?'':days>0?days+' DAYS UNTIL WE CELEBRATE':days===0?'TODAY IS THE DAY':'A DATE TO REMEMBER';});
    const map=document.querySelector('[data-map]');if(map)map.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent([eventValue('venue'),eventValue('address')].filter(Boolean).join(', '));
  }
  update();const watched=document.querySelector('.event-details');new MutationObserver(update).observe(watched,{childList:true,subtree:true,characterData:true});
  const escapeICS=v=>String(v).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
  document.querySelector('[data-calendar]')?.addEventListener('click',()=>{
    const date=eventValue('date').replace(/-/g,''),time=eventValue('time').replace(':','');if(!/^\d{8}$/.test(date))return;
    // Floating local event time: the host has not selected a time zone in the builder.
    const start=date+'T'+(/^\d{4}$/.test(time)?time:'1200')+'00';const body=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//VraxisRSVP//Celebration//EN','BEGIN:VEVENT','UID:'+crypto.randomUUID()+'@vraxisrsvp','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''),'DTSTART:'+start,'SUMMARY:'+escapeICS(eventValue('names')+' — '+eventValue('title')),'LOCATION:'+escapeICS(eventValue('venue')+', '+eventValue('address')),'DESCRIPTION:'+escapeICS(eventValue('message')),'END:VEVENT','END:VCALENDAR'].join('\r\n');
    const url=URL.createObjectURL(new Blob([body],{type:'text/calendar;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='celebration.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  const form=document.getElementById('rsvpForm');form.addEventListener('submit',event=>{event.preventDefault();const note=form.querySelector('.preview-reply');if(note)note.textContent='This is a design preview. Guest replies become available after the invitation is published.';});
})();
// Inline vectors keep small directional icons crisp even on limited system fonts.
for(const el of document.querySelectorAll('a,button'))for(const node of [...el.childNodes])if(node.nodeType===3&&node.textContent.includes('↗')){const parts=node.textContent.split('↗'),fragment=document.createDocumentFragment();parts.forEach((part,i)=>{fragment.append(document.createTextNode(part));if(i<parts.length-1){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('class','edition-arrow');svg.setAttribute('aria-hidden','true');svg.innerHTML='<path d="M5 19 19 5M5 5h14v14"/>';fragment.append(svg);}});node.replaceWith(fragment);}
