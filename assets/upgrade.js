/* No navigation interception: native Back, modified clicks, forms and downloads stay native. */
(() => {
  if(!document.querySelector('script[src*="site-nav.js"]')){const s=document.createElement('script');s.src='assets/site-nav.js';document.body.append(s);}
  document.querySelectorAll('a[href]').forEach(a=>{try{if(new URL(a.href).pathname===location.pathname&&!a.hash)a.setAttribute('aria-current','page');}catch{}});
  const policy=document.querySelector('.policy');
  if(policy&&/^article-/.test(location.pathname.split('/').pop())){
    const bodyText=policy.textContent.trim(),words=bodyText.split(/\s+/).length,meta=document.createElement('span');meta.className='reading-meta';meta.textContent=Math.max(2,Math.ceil(words/200))+' MIN READ · THE VRAXIS JOURNAL';policy.querySelector('h1')?.after(meta);
    const heads=[...policy.querySelectorAll('h2')];if(heads.length>1){const nav=document.createElement('nav');nav.className='article-index';nav.setAttribute('aria-label','In this story');const strong=document.createElement('strong');strong.textContent='In this story';nav.append(strong);heads.forEach((h,i)=>{h.id=h.id||'chapter-'+i;const a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent;nav.append(a);});meta.after(nav);}
    const progress=document.createElement('div');progress.className='reading-progress';document.body.append(progress);const update=()=>progress.style.width=(100*scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight))+'%';addEventListener('scroll',update,{passive:true});update();
    const end=document.createElement('div');end.className='reading-end';end.innerHTML='<a href="journal.html">← Back to the journal</a><a href="catalogue.html">Find your invitation ↗</a>';policy.append(end);
  }
})();
// Replace directional glyphs in storefront controls with reliable vector icons.
for(const el of document.querySelectorAll('a,button'))for(const node of [...el.childNodes])if(node.nodeType===3&&node.textContent.includes('↗')){const parts=node.textContent.split('↗'),fragment=document.createDocumentFragment();parts.forEach((part,i)=>{fragment.append(document.createTextNode(part));if(i<parts.length-1){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.style.cssText='width:14px;height:14px;display:inline-block;vertical-align:middle;fill:none;stroke:currentColor;stroke-width:1.4;flex-shrink:0';svg.innerHTML='<path d="M5 19 19 5M5 5h14v14"/>';fragment.append(svg);}});node.replaceWith(fragment);}


/* VraxisRSVP storefront analytics. GTM owns the GA4 configuration and consent rules.
   No names, emails, guest responses, uploaded media or form values are collected. */
(() => {
  if(window.__vraxisAnalyticsInstalled)return;
  window.__vraxisAnalyticsInstalled=true;
  const containerId='GTM-NQHXLXTC';
  window.dataLayer=window.dataLayer||[];
  window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});
  if(!document.querySelector('script[src*="googletagmanager.com/gtm.js"]')){
    const tag=document.createElement('script');
    tag.async=true;
    tag.src='https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(containerId);
    document.head.appendChild(tag);
  }
  const track=(event,details={})=>window.dataLayer.push({event,...details});
  const idFromPath=(value)=>{
    const path=String(value||'');
    const match=path.match(new RegExp('(?:preview-|templates/)([0-9]{3})(?:[.]html|/|$|[?#])','i'));
    return match?match[1]:undefined;
  };
  const pathname=location.pathname;
  const previewId=idFromPath(pathname);
  if(previewId)track('template_preview',{template_id:previewId});
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('a[href]');
    if(!link)return;
    let url;try{url=new URL(link.href,location.href);}catch{return;}
    if(url.origin!==location.origin)return;
    const target=url.pathname;
    const id=idFromPath(target)||url.searchParams.get('template')||previewId;
    if(target.includes('preview-')||target.includes('/templates/')){
      track('template_explore',{template_id:id||undefined,source_page:pathname});
    }else if(['personalise.html','start.html','create.html','builder.html'].some(name=>target.endsWith(name))){
      track('template_use',{template_id:id||undefined,source_page:pathname});
    }else if(['checkout.html','payment.html'].some(name=>target.endsWith(name))){
      track('checkout_navigation',{template_id:id||undefined});
    }
  },{capture:true,passive:true});
  // Public helper for confirmed business events; only call after backend verification.
  window.vraxisTrack=(event,details={})=>{
    if(!/^(personalisation_start|personalisation_complete|sign_up|begin_checkout|purchase)$/.test(event))return;
    const safe={};
    for(const key of ['template_id','template_category','tier','currency','value','transaction_id']){
      if(Object.prototype.hasOwnProperty.call(details,key))safe[key]=details[key];
    }
    track(event,safe);
  };
})();
