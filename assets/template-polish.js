/* Reliable photography and small-screen finishing without replacing the original designs. */
(() => {
  const id=location.pathname.match(/preview-(\d{3})\.html/)?.[1];
  const template=window.VRAXIS_TEMPLATES?.find(x=>x.id===id),frame=document.getElementById('invitation')||document.querySelector('iframe');
  if(!template||!frame)return;
  const context=new URLSearchParams(location.search);if(/^[0-9a-f-]{36}$/i.test(context.get('draft')||''))document.querySelectorAll('a[href^="start.html"],a[href^="personalise.html"]').forEach(link=>{const url=new URL(link.href);url.searchParams.set('draft',context.get('draft'));if(/^[0-9a-f-]{36}$/i.test(context.get('project')||''))url.searchParams.set('project',context.get('project'));link.href=url.href;});
  if(!document.querySelector('script[src*="site-nav.js"]')){const nav=document.createElement('script');nav.src=new URL('assets/site-nav.js',location.href).href;document.body.append(nav);}
  const outerStyle=document.createElement('style');outerStyle.textContent='.preview-nav{gap:10px}.preview-nav .cta{white-space:nowrap}.preview-info b{min-width:0;overflow-wrap:anywhere}';document.head.append(outerStyle);
  const fallback=new URL(template.cover,location.href).href;
  function polish(){
    const doc=frame.contentDocument;if(!doc?.body||doc.__vraxisPolished)return;doc.__vraxisPolished=true;
    const style=doc.createElement('style');style.id='vraxis-design-finishing';style.textContent='img,video{max-width:100%}a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid #b79a6b;outline-offset:4px}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto!important}}';
    if(id==='020')style.textContent+='@media(max-width:420px){.cover-copy,.hero-art,.mission-card,.mission-card .copy,.rsvp-wrap>*{min-width:0;max-width:100%}.cover-inner,.story-grid,.rsvp-wrap,.mission-grid{grid-template-columns:minmax(0,1fr)}.mission-card{grid-template-columns:80px minmax(0,1fr)}.schedule-row{grid-template-columns:80px minmax(0,1fr)}.cover-copy h2{font-size:clamp(40px,16vw,64px);overflow-wrap:anywhere}.hero-art,.skyline{overflow:hidden}}';
    doc.head.append(style);
    if(doc.defaultView.innerHeight<750)for(const el of doc.body.children){const css=doc.defaultView.getComputedStyle(el);if(css.position==='fixed'&&css.top==='0px'&&css.bottom==='0px'){el.style.overflowY='auto';el.style.overscrollBehaviorY='contain';}}
    function image(img){
      const original=img.getAttribute('src');if(!original||img.__vraxisFallback)return;img.__vraxisFallback=true;
      const restore=()=>{if(img.getAttribute('src')!==original||img.src===fallback)return;img.src=fallback;img.alt=template.name+' invitation artwork';img.style.objectFit='cover';img.style.opacity='1';};
      img.addEventListener('error',restore,{once:true});if(img.complete&&!img.naturalWidth)restore();
      if(!img.alt&&!img.closest('[aria-hidden=true]'))img.alt=template.name+' photograph';
    }
    [...doc.images].forEach(image);
    new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes){if(node.nodeType!==1)continue;if(node.tagName==='IMG')image(node);node.querySelectorAll?.('img').forEach(image);}}).observe(doc.body,{childList:true,subtree:true});
  }
  frame.addEventListener('load',polish);if(frame.contentDocument?.readyState==='complete')polish();
})();
