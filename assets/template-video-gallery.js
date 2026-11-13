/* VraxisRSVP template motion previews.
   Populate previewVideoSources with hosted MP4/WebM files as each video is approved.
   No video is requested until an explicit URL has been assigned.
   Existing still images remain the accessible fallback. */
(()=>{
const previewVideoSources=Object.freeze({
 // '001':'assets/template-videos/heirloom.mp4',
 // '002':'assets/template-videos/grand-affair.mp4'
});
const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
if(reduced)return;
document.querySelectorAll('.tile').forEach(card=>{
 const link=card.querySelector('a[href^="preview-"]'),art=card.querySelector('.tile-art'),img=art?.querySelector('img');
 if(!link||!art||!img)return;
 const id=/preview-(\d{3})\.html/.exec(link.getAttribute('href')||'')?.[1];
 const source=previewVideoSources[id];if(!source)return;
 const video=document.createElement('video');
 video.muted=true;video.loop=true;video.autoplay=true;video.playsInline=true;video.preload='none';video.poster=img.src;
 video.setAttribute('aria-hidden','true');
 video.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .3s';
 video.addEventListener('canplay',()=>{video.style.opacity='1'},{once:true});
 video.addEventListener('error',()=>{video.remove();img.style.visibility='visible'},{once:true});
 art.append(video);
 const observer=new IntersectionObserver(entries=>{if(entries[0]?.isIntersecting){if(!video.src)video.src=source;video.play().catch(()=>{})}else video.pause()},{rootMargin:'80px'});
 observer.observe(card);
});
})();