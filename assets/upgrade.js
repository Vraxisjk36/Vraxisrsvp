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
