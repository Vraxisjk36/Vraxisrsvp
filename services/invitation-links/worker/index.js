const API = 'https://ogmlfnmdhmrbbmxnxwqw.supabase.co/functions/v1/public-invitation';
const SITE = 'https://vraxisjk36.github.io/Vraxisrsvp/';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slugName = value => String(value || 'your invitation').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,64).replace(/-$/,'') || 'your-invitation';
const headers = {'Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow','Cache-Control':'public, max-age=60'};
function unavailable(status=404) {
  const home=status===200;
  const title=home?'A lovely thing is waiting.':status===404?'An invitation is waiting.':'Let’s try that again.';
  const text=home?'Open the complete invitation link shared by your host to step into the celebration.':status===404?'Please open the complete link shared by your host. This invitation may not be published yet.':'We couldn’t open the invitation just now. Please try again shortly.';
  const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Our Moment · Invitation links</title><meta name="robots" content="noindex,nofollow"><style>*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;background:#203d33;color:#f4ecda;font:15px/1.9 Arial,sans-serif}main{width:min(520px,100%);padding:38px}.eyebrow{font-size:9px;letter-spacing:.25em;color:#c8b18b}h1{font:normal clamp(45px,8vw,68px)/1.05 Georgia,serif;letter-spacing:-.055em;margin:25px 0}p{color:#c4d0bc;font-size:14px}a{display:inline-block;color:#f4ecda;text-decoration:none;border-bottom:1px solid #a8b69b;padding:10px 0;font-size:12px;margin-top:25px}</style></head><body><main><div class="eyebrow">OUR MOMENT · AN INVITATION FOR YOU</div><h1>'+title+'</h1><p>'+text+'</p>'+(home?'<a href="'+SITE+'catalogue.html">Make a celebration of your own →</a>':'')+'</main></body></html>';
  return new Response(html,{status,headers});
}
async function getInvitation(slug) {
  const response = await fetch(API+'?slug='+encodeURIComponent(slug), {headers:{Accept:'application/json'}, signal:AbortSignal.timeout(10000)});
  if(!response.ok) return {status:response.status===404||response.status===400?404:503};
  return {data:await response.json()};
}
function imageSource(data) {
  for(const value of [...(data.photos || []),...Object.values(data.design_data?.tap_edits?.backgrounds||{}),...Object.values(data.design_data?.tap_edits?.images||{})]) {
    try { const url = new URL(value); if(url.origin==='https://ogmlfnmdhmrbbmxnxwqw.supabase.co' && url.pathname.startsWith('/storage/v1/object/sign/invitation-photos/')) return url.href; } catch {}
  }
  return SITE+'assets/share-default.jpg';
}
export default {
  async fetch(request) {
    if(!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
    const url = new URL(request.url);
    const match = url.pathname.match(/(?:^|\/)(inv-[a-f0-9]{20})(?:\.[a-z]+)?\/?$/);
    if(!match) return unavailable(url.pathname==='/'?200:404);
    const slug = match[1];
    let result;
    try { result = await getInvitation(slug); } catch { return unavailable(503); }
    if(!result.data) return unavailable(result.status);
    const data = result.data;
    if(url.pathname.startsWith('/media/')) {
      try {
        const image = await fetch(imageSource(data),{signal:AbortSignal.timeout(10000)});
        const type = image.headers.get('Content-Type')?.split(';')[0];
        if(!image.ok || !['image/jpeg','image/png','image/webp'].includes(type)) return new Response('Image unavailable',{status:503});
        if(Number(image.headers.get('Content-Length'))>8388608) return new Response('Image too large',{status:413});
        let received=0;
        const bounded=new TransformStream({transform(chunk,controller){received+=chunk.byteLength;if(received>8388608)throw Error('Image too large');controller.enqueue(chunk);}});
        const body=request.method==='HEAD'?null:image.body.pipeThrough(bounded);
        if(request.method==='HEAD')await image.body?.cancel();
        return new Response(body,{headers:{'Content-Type':type,'Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex'}});
      } catch { return new Response('Image unavailable',{status:503}); }
    }
    const event = data.event || {};
    const title = String(event.names || data.title || 'You are invited').slice(0,150);
    const date = /^\d{4}-\d{2}-\d{2}$/.test(event.date||'') ? new Date(event.date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}) : '';
    const description = ['An invitation to celebrate together',date,event.venue].filter(Boolean).join(' · ').slice(0,300);
    const canonical = new URL('/'+slugName(title)+'/'+slug,url.origin).href;
    const image = new URL('/media/'+slug+'.jpg',url.origin).href;
    const destination = SITE+'invite.html?slug='+encodeURIComponent(slug);
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#203d33"><title>${esc(title)} · You're invited</title><meta name="description" content="${esc(description)}"><meta name="robots" content="noindex,nofollow"><link rel="canonical" href="${esc(canonical)}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:site_name" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${esc(image)}"><meta property="og:image:alt" content="An invitation to celebrate ${esc(title)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${esc(image)}"><style>*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;background:#f7f3eb;color:#203d33}iframe{border:0;width:100%;height:100svh;display:block}#opening{position:fixed;inset:0;background:#f7f3eb;display:grid;place-items:center;text-align:center;padding:32px;transition:opacity .25s;pointer-events:none}#opening p{font:12px Arial,sans-serif;letter-spacing:.15em;text-transform:uppercase}#opening h1{font:normal clamp(42px,8vw,78px)/1.05 Georgia,serif;max-width:760px;margin:20px auto;overflow-wrap:anywhere}#opening img{width:130px;height:160px;object-fit:cover;margin-bottom:15px}.open-fallback{position:fixed;bottom:12px;right:12px;background:#f7f3ebed;border:1px solid #b7bdae;padding:9px 12px;color:#203d33;text-decoration:none;font:11px Arial,sans-serif;opacity:0;pointer-events:none}.open-fallback.visible{opacity:1;pointer-events:auto}@media(prefers-reduced-motion:reduce){*{transition:none!important}}</style></head><body><div id="opening"><div><img src="${esc(image)}" alt=""><p>An invitation for you</p><h1>${esc(title)}</h1><p>Opening your celebration…</p></div></div><iframe id="invitation" src="${esc(destination)}" title="${esc(title)} — your invitation" allow="fullscreen"></iframe><a class="open-fallback" id="fallback" href="${esc(destination)}">Open invitation directly ↗</a><script>let opened=false;document.getElementById('invitation').addEventListener('load',()=>{opened=true;document.getElementById('opening').remove()});setTimeout(()=>{if(!opened)document.getElementById('fallback').classList.add('visible')},12000);<\/script></body></html>`;
    return new Response(request.method==='HEAD'?null:html,{headers});
  }
};
export {slugName, imageSource};
