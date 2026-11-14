/* Owner-selected collection media overrides. Local artwork remains the reliable default. */
(() => {
  const endpoint = 'https://ogmlfnmdhmrbbmxnxwqw.supabase.co/rest/v1/template_collection_media?select=*';
  const headers = {apikey:'sb_publishable_K8hadrdvJiqCRB3eXs9tHg_0kUXl9Ry'};
  fetch(endpoint, {headers}).then(r => { if (!r.ok) throw Error('Media unavailable'); return r.json(); }).then(rows => {
    const media = new Map(rows.map(row => [String(row.template_id).padStart(3,'0'), row]));
    document.querySelectorAll('#catalogue > [data-category]').forEach(card => {
      const id = card.querySelector('a[href^="preview-"]')?.getAttribute('href')?.match(/preview-(\d{3})/)?.[1];
      const cfg = media.get(id), art = card.querySelector('.tile-art'), img = art?.querySelector('img');
      if (!cfg || !img) return;
      if (cfg.cover_url && /^https:\/\//.test(cfg.cover_url)) {
        const original = img.src;
        img.onerror = () => { img.onerror = null; img.src = original; };
        img.src = cfg.cover_url;
      }
      img.style.objectFit = cfg.fit_mode === 'contain' ? 'contain' : 'cover';
      img.style.objectPosition = (cfg.pos_x ?? 50) + '% ' + (cfg.pos_y ?? 50) + '%';
      if (cfg.fit_mode === 'manual' && Number(cfg.zoom) > 1) img.style.transform = 'scale(' + Math.min(4,Number(cfg.zoom)) + ')';
      if (cfg.video_url && /^https:\/\//.test(cfg.video_url) && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const video = document.createElement('video');
        video.src = cfg.video_url; video.muted = true; video.loop = true; video.autoplay = true; video.playsInline = true; video.preload = 'metadata'; video.poster = img.src;
        video.setAttribute('aria-hidden', 'true');
        video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none';
        const fallback = () => { video.remove(); img.style.visibility = ''; };
        video.addEventListener('error', fallback, {once:true});
        video.addEventListener('playing', () => { img.style.visibility = 'hidden'; }, {once:true});
        art.append(video); video.play().catch(fallback);
      }
    });
  }).catch(() => {});
})();
