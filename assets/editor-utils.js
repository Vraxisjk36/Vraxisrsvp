/* Shared rendering keeps the editor and published invitation visually consistent. */
(() => {
  const imageURL = value => typeof value === 'string' && (/^https:\/\//.test(value) || /^data:image\/(jpeg|png|webp);base64,/.test(value));
  function setText(el,value) {
    const doc=el.ownerDocument,walker=doc.createTreeWalker(el,4),nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    if(!nodes.length){el.textContent=value;return;}
    if(nodes.length===1){nodes[0].nodeValue=value;return;}
    const significant=nodes.filter(node=>node.nodeValue.trim());
    if(!significant.length){nodes[0].nodeValue=value;return;}
    const words=value.trim().split(/\s+/),weights=significant.map(node=>node.nodeValue.trim().split(/\s+/).length);
    let cursor=0,weight=weights.reduce((a,b)=>a+b,0);
    significant.forEach((node,i)=>{
      const original=node.nodeValue,remaining=words.length-cursor;
      const count=i===significant.length-1?remaining:Math.min(remaining,Math.max(0,Math.round(remaining*weights[i]/weight)));
      const segment=words.slice(cursor,cursor+count).join(' ');node.nodeValue=(cursor>0&&segment?' ':'')+segment;
      cursor+=count;weight-=weights[i];
    });
    nodes.filter(node=>!significant.includes(node)).forEach(node=>{node.nodeValue='';});
  }
  function backgroundTarget(doc,path) {
    const match=path.match(/^(.*?)(::before|::after)$/);
    return {element:doc.querySelector(match?match[1]:path),pseudo:match?match[2]:null};
  }
  function backgroundURL(doc,path) {
    try {const {element,pseudo}=backgroundTarget(doc,path);if(!element)return '';const css=doc.defaultView.getComputedStyle(element,pseudo).backgroundImage;const m=css.match(/url\(["']?(.*?)["']?\)/);return m?m[1]:'';}catch{return '';}
  }
  function remap(doc,before,after){
    const map=doc.__vraxisPhotoMap;if(!map||!before)return;
    for(const [key,value] of map)if(value===before)map.set(key,after);
    map.set(before,after);
  }
  function setImage(el,value){
    if(el?.tagName!=='IMG'||!imageURL(value))return;
    const doc=el.ownerDocument;remap(doc,el.src,value);const original=doc.__vraxisOriginalPhotoURLs?.get(el);if(original)remap(doc,original,value);
    el.src=value;el.alt='Personal invitation photograph';el.style.objectFit='cover';
  }
  function setBackground(doc,path,src) {
    if(!imageURL(src)||/[{}]/.test(path))return;
    try{
      const {element,pseudo}=backgroundTarget(doc,path);if(!element)return;
      const current=doc.defaultView.getComputedStyle(element,pseudo).backgroundImage;remap(doc,backgroundURL(doc,path),src);
      const photo='url('+JSON.stringify(src)+')';
      const next=current.includes('url(')?current.replace(/url\((?:"[^"]*"|'[^']*'|[^)]*)\)/g,()=>photo):photo;
      if(!pseudo)element.style.backgroundImage=next;
      else{
        const values=doc.__vraxisBackgroundEdits||(doc.__vraxisBackgroundEdits={});values[path]=next;
        let style=doc.getElementById('vraxis-background-edits');if(!style){style=doc.createElement('style');style.id='vraxis-background-edits';doc.head.append(style);}
        style.textContent=Object.entries(values).map(([selector,background])=>selector+'{background-image:'+background+'!important}').join('\n');
      }
    }catch{}
  }
  function apply(doc,state) {
    for(const [path,value] of Object.entries(state.text||{})){try{const el=doc.querySelector(path);if(el&&typeof value==='string')setText(el,value);}catch{}}
    for(const [path,value] of Object.entries(state.images||{})){try{const el=doc.querySelector(path);if(el?.tagName==='IMG'&&imageURL(value)){setImage(el,value);}}catch{}}
    for(const [path,value] of Object.entries(state.backgrounds||{}))setBackground(doc,path,value);
  }
  window.VraxisEditor={setText,setImage,imageURL,backgroundTarget,backgroundURL,setBackground,apply};
})();
