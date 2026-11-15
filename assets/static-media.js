/* Responsive defaults for native galleries created after the initial document parse. */
(() => {
 function bind(img){
  const source=img.getAttribute('src')||'',match=source.match(/(?:^|\/)assets\/media\/([a-f0-9]{24})-(\d+)\.webp(?:\?.*)?$/);
  if(!match){if(img.dataset.vraxisResponsive){img.removeAttribute('srcset');img.removeAttribute('sizes');delete img.dataset.vraxisResponsive;}return;}
  // Static HTML has the exact available sizes. Dynamic native photo URLs have a
  // 960px or smaller default; use the source until dimensions are known rather
  // than requesting variants that might not exist for a small original.
  img.decoding='async';
  if(!img.hasAttribute('loading')&&!/hero|cover|opening|intro|reel/i.test(img.id+' '+img.className+' '+(img.dataset.photo||'')))img.loading='lazy';
  if(img.hasAttribute('srcset'))img.dataset.vraxisResponsive='1';
 }
 const scan=node=>{if(node.nodeType!==1)return;if(node.tagName==='IMG')bind(node);node.querySelectorAll?.('img').forEach(bind);};
 new MutationObserver(records=>{for(const record of records){if(record.type==='attributes')bind(record.target);else record.addedNodes.forEach(scan);}}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
 document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('img').forEach(bind),{once:true});
})();
