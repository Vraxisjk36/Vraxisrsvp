
/* Signature animation is intentionally independent of the existing reveal system. */
(function(){
  const signature = `<div class="mv-signature" aria-hidden="true"><svg viewBox="0 0 340 96" xmlns="http://www.w3.org/2000/svg" role="presentation"><path d="M5 23 C44 23 55 67 112 62 S195 29 246 49 S292 68 334 49"/><path class="mv-second" d="M5 75 C52 75 67 33 115 39 S198 70 246 49 S294 37 334 49"/></svg><div class="mv-signature-label">TWO STORIES. ONE FOREVER.</div></div>`;
  ['story','reply'].forEach(id=>{
    const heading=document.querySelector('#'+id+' h2.section-title');
    if(!heading)return;
    heading.insertAdjacentHTML('afterend',signature);
  });
  const motifs=[...document.querySelectorAll('.mv-signature')];
  if(!('IntersectionObserver' in window)) { motifs.forEach(el=>el.classList.add('is-drawn')); return; }
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){ entry.target.classList.remove('is-drawn'); requestAnimationFrame(()=>requestAnimationFrame(()=>entry.target.classList.add('is-drawn'))); }
    });
  },{threshold:.45});
  motifs.forEach(el=>observer.observe(el));
})();
