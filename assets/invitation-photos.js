/* Keep guided uploads and tap edits on the same invitation surfaces in both renderers. */
window.VraxisInvitationPhotos = (() => {
 const slots = {
  '001':['.hero img[data-photo="couple"]','[data-photo="memory"]','[data-photo="memory2"]','[data-photo="ceremony"]','[data-photo="reception"]'],
  '002':['.portrait:nth-child(1) img','.portrait:nth-child(2) img','.portrait:nth-child(3) img','.portrait:nth-child(4) img','.portrait:nth-child(5) img'],
  '003':['#heroImage'],
  '004':['#heroPhoto','.mc-birthday-portrait'],
  '005':['#heroPhoto','.table-scene img'],
  '006':['.honour-hero-image','.photo-statement .photo','#reel-image'],
  '007':['#storyImage'],
  '008':['#editPhoto'],
  '009':['#heroImg, #siFamilyPhoto, .si-card-photo, .si-photo','#storyImg','#gallery1','#gallery2','#gallery3'],
  '010':['#heroPhoto','#parentsPhoto'],
  '011':['[data-img="hero"]','[data-img="memory1"]','[data-img="memory2"]','[data-img="memory3"]','[data-img="parents"]'],
  '012':['[data-img="cover"], #briCoverPhoto, #briInsidePhoto','[data-img="portrait"]','[data-img="memory1"]','[data-img="memory2"]','[data-img="memory3"]','[data-img="memory4"]'],
  '013':['img[data-photo="hero"]','img[data-photo="friends"]'],
  '014':['img[data-photo="hero"]','img[data-photo="bride"]','img[data-photo="friends"]','img[data-photo="look1"]','img[data-photo="look2"]','img[data-photo="look3"]'],
  '015':['img[data-photo="hero"]','img[data-photo="memory1"]','img[data-photo="memory2"]','img[data-photo="memory3"]']
 };
 const valid = (src, local) => typeof src === 'string' &&
  (/^https:\/\//i.test(src) || (local && /^(?:data:image\/|blob:)/i.test(src)));
 function replace(el, src, local = false, position) {
  if (!el || !valid(src, local)) return false;
  el.dataset.vraxisCustomerPhoto = 'true';
  if (el.tagName === 'INPUT') {
   el.value = src;
   el.dispatchEvent(new el.ownerDocument.defaultView.Event('input', {bubbles:true}));
  } else if (el.tagName === 'IMG') {
   el.src = src;
   el.style.objectFit = 'cover';
   if (position) el.style.objectPosition = position;
  } else {
   const original = el.ownerDocument.defaultView.getComputedStyle(el).backgroundImage;
   const image = 'url('+JSON.stringify(src)+')';
   el.style.backgroundImage = /url\("[^"]*"\)/.test(original) ? original.replace(/url\("[^"]*"\)/, () => image) : image;
  }
  return true;
 }
 function apply(doc, id, photos, studioPhotos = {}, local = false) {
  let count = 0;
  for (const [index, selector] of (slots[id] || []).entries()) {
   for (const el of doc.querySelectorAll(selector)) {
    const saved = studioPhotos[el.dataset.photo || el.dataset.img];
    const position = saved ? (saved.x ?? 50)+'% '+(saved.y ?? 50)+'%' : undefined;
    if (replace(el, saved?.src || photos?.[index], local, position)) count++;
   }
  }
  return count;
 }
 return {apply, replace};
})();
