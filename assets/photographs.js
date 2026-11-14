/* One photo mapping for the guided draft, visual editor and public invitation. */
(() => {
  function prepare(doc){
    if(doc.__vraxisPhotoMap)return;
    doc.__vraxisPhotoMap=new Map();doc.__vraxisOriginalPhotoURLs=new WeakMap();
    const remember=img=>{if(img.getAttribute('src'))doc.__vraxisOriginalPhotoURLs.set(img,img.src);};
    [...doc.images].forEach(remember);
    const mapped=img=>{if(!doc.__vraxisOriginalPhotoURLs.has(img))remember(img);const replacement=doc.__vraxisPhotoMap.get(img.src);if(replacement&&replacement!==img.src){img.src=replacement;img.alt='Personal invitation photograph';}};
    new MutationObserver(records=>{for(const record of records){if(record.type==='attributes'){if(record.target.tagName==='IMG')mapped(record.target);}else for(const node of record.addedNodes){if(node.nodeType!==1)continue;if(node.tagName==='IMG')mapped(node);node.querySelectorAll?.('img').forEach(mapped);}}}).observe(doc.body,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
  }
  const backgrounds={
    '002':[['.hero',0],['.story-image',1]],
    '003':[['.mv-intro-photo',0],['.mv-reveal-photo',0]],
    '004':[['.hero-photo',0],['.mc-birthday-portrait',0],['#mcGate .mc-bg',0],['.intro-photo',1]],
    '005':[['.se-res-photo',0]],
    '006':[['.hero::before',0],['.honour-hero-image',0],['.photo-statement .photo',1]],
    '017':[['.chapter .art',0],['.frame:nth-child(1)',1],['.frame:nth-child(2)',2],['.frame:nth-child(3)',3]]
  };
  const primary={'003':['#heroImage'],'005':['#heroPhoto','.se-photo'],'006':['#reel-image'],'007':['#storyImage'],'009':['#heroImg','#siFamilyPhoto'],'010':['#heroPhoto'],'013':['[data-photo="hero"]']};
  function apply(doc,id,photos){
    prepare(doc);photos=Array.isArray(photos)?photos.filter(VraxisEditor.imageURL).slice(0,6):[];if(!photos.length)return;
    if(id==='008'){
      const input=doc.getElementById('editPhoto');if(input&&input.value!==photos[0]){input.value=photos[0];input.dispatchEvent(new doc.defaultView.Event('input',{bubbles:true}));}
      return;
    }
    const used=new Set();
    for(const selector of primary[id]||[])for(const img of doc.querySelectorAll(selector))if(img.tagName==='IMG'){VraxisEditor.setImage(img,photos[0]);used.add(img);}
    let slots=[...doc.querySelectorAll('img[data-photo],[data-photo] img,img[data-img]')];
    if(!slots.length)slots=[...doc.images].filter(img=>img.getAttribute('src')&&!img.src.startsWith('data:image/svg')&&!img.classList.contains('intro-image')&&!img.closest('.lightbox,[role="dialog"],#lightbox,#portraitLightbox')&&(img.naturalWidth>=80||img.getBoundingClientRect().width>=80));
    let cursor=used.size?1:0;
    for(const img of slots){if(used.has(img))continue;if(!photos[cursor])break;VraxisEditor.setImage(img,photos[cursor++]);}
    for(const [selector,index] of backgrounds[id]||[]){const photo=photos[index]||(index===1&&photos.length===1?photos[0]:null);if(photo)VraxisEditor.setBackground(doc,selector,photo);}
    if(id==='020'){
      let gallery=doc.getElementById('vraxis-personal-gallery');if(!gallery){gallery=doc.createElement('section');gallery.id='vraxis-personal-gallery';gallery.setAttribute('aria-label','Personal celebration photographs');const style=doc.createElement('style');style.textContent='#vraxis-personal-gallery{padding:55px 24px;background:var(--cream,#fff5d9);color:var(--ink,#142b38);text-align:center}#vraxis-personal-gallery h2{font:normal clamp(30px,5vw,48px) Georgia,serif;margin:0 0 28px}#vraxis-personal-gallery .personal-photos{max-width:1000px;margin:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:18px}#vraxis-personal-gallery img{display:block;aspect-ratio:4/5;width:100%;object-fit:cover;border:5px solid var(--ink,#142b38);box-shadow:6px 6px 0 var(--yellow,#f7cf44)}';doc.head.append(style);const heading=doc.createElement('h2');heading.textContent='A few favourite moments.';const grid=doc.createElement('div');grid.className='personal-photos';gallery.append(heading,grid);const anchor=doc.querySelector('#rsvp,.rsvp,.rsvp-section,footer');if(anchor)anchor.before(gallery);else doc.body.append(gallery);}
      const grid=gallery.querySelector('.personal-photos');if(!grid.children.length)photos.forEach((src,i)=>{const img=doc.createElement('img');img.src=src;img.alt='Celebration photograph '+(i+1);grid.append(img);});
    }
  }
  window.VraxisPhotographs={prepare,apply};
})();
