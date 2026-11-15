#!/usr/bin/env python3
"""One-time, reproducible migration from a pinned approved source commit.
Requires Pillow (WebP support). Existing visual structure/scripts are preserved.
Run from repository root. Network stock-photo imports are opt-in with --remote.
"""
import argparse,base64,hashlib,io,json,re,subprocess,urllib.request,html,concurrent.futures
from pathlib import Path
from PIL import Image,ImageOps
parser=argparse.ArgumentParser();parser.add_argument('--source-ref',default='c4f8b13d28778e847d2ed83e8b947e85d8f2437f');parser.add_argument('--remote',action='store_true');args=parser.parse_args()
root=Path('.');media=root/'assets/media';code=root/'assets/template-code';media.mkdir(parents=True,exist_ok=True);code.mkdir(parents=True,exist_ok=True);(root/'templates').mkdir(exist_ok=True)
pattern=re.compile(r'data:(image/[\w.+-]+);base64,([A-Za-z0-9+/=\r\n]+)');manifest={};reports=[];bodies={};shells={};originals={}
for i in range(1,26):
 id=f'{i:03}';shell=subprocess.check_output(['git','show',args.source_ref+':preview-'+id+'.html'],text=True);a=shell.index('const TEMPLATE=')+len('const TEMPLATE=');body,n=json.JSONDecoder().raw_decode(shell[a:]);bodies[id]=body;originals[id]=body;shells[id]=(shell,a,n)
def store(data,mime):
 digest=hashlib.sha256(data).hexdigest()[:24]
 if digest in manifest:return manifest[digest]
 if mime=='image/svg+xml':
  file=media/(digest+'.svg');file.write_bytes(data);entry={'path':str(file),'bytes':len(data),'originalBytes':len(data),'variants':[]};manifest[digest]=entry;return entry
 image=ImageOps.exif_transpose(Image.open(io.BytesIO(data)));image.load();original=image.size
 if image.mode not in ('RGB','RGBA'):image=image.convert('RGBA' if 'transparency' in image.info else 'RGB')
 variants=[]
 for width in [320,640,960,1440,1920]:
  if width>image.width and variants:continue
  size=min(width,image.width);target=image.copy();target.thumbnail((size,round(size*image.height/image.width)),Image.Resampling.LANCZOS)
  f=media/f'{digest}-{size}.webp';target.save(f,'WEBP',quality=84,method=6);variants.append({'width':target.width,'height':target.height,'path':str(f),'bytes':f.stat().st_size})
 if not variants:raise ValueError('No image variants')
 default=min(variants,key=lambda x:abs(x['width']-960));entry={'path':default['path'],'bytes':default['bytes'],'originalBytes':len(data),'originalWidth':original[0],'originalHeight':original[1],'variants':variants};manifest[digest]=entry;return entry
for id,body in bodies.items():
 def extract(m):return store(base64.b64decode(m[2]),m[1])['path']
 bodies[id]=pattern.sub(extract,body)
# Import only public stock imagery. Customer media and arbitrary URLs are never fetched.
remote_map={};failed=[]
if args.remote:
 urls=set()
 for body in bodies.values():
  urls.update(m[0].rstrip(');,') for m in re.finditer(r'https://images\.(?:unsplash|pexels)\.com/[^\s\x22\x27<>\\]+',body))
 def download(url):
  try:
   req=urllib.request.Request(html.unescape(url),headers={'User-Agent':'Mozilla/5.0'})
   with urllib.request.urlopen(req,timeout=30) as response:
    if not response.headers.get('Content-Type','').startswith('image/'):raise ValueError('Not an image')
    data=response.read(20*1024*1024+1)
    if len(data)>20*1024*1024:raise ValueError('Image too large')
    return url,data,response.headers['Content-Type'].split(';')[0]
  except Exception as e:return url,None,type(e).__name__
 with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:downloads=list(pool.map(download,sorted(urls)))
 for url,data,mime in downloads:
  if data:
   try:remote_map[url]=store(data,mime)['path']
   except Exception as e:failed.append({'url':url,'reason':type(e).__name__})
  else:failed.append({'url':url,'reason':mime})
 for id,body in bodies.items():
  for url,path in sorted(remote_map.items(),key=lambda x:len(x[0]),reverse=True):body=body.replace(url,path)
  bodies[id]=body
# Repair the existing broken floral reference using the same Modern Vow art.
floral=re.search(r'assets/media/[a-f0-9-]+\.webp',bodies['003'])[0]
bodies['001']=bodies['001'].replace('../assets/images/003/embedded-01.webp',floral)
lookup={entry['path']:entry for entry in manifest.values()}
def responsive_img(m):
 tag=m[0];src=re.search(r'\bsrc=([\x22\x27])([^\x22\x27]+)\1',tag)
 if not src or src[2] not in lookup:return tag
 entry=lookup[src[2]];variants=entry['variants']
 if not variants:return tag
 if 'srcset=' not in tag:
  values=', '.join(f'{v["path"]} {v["width"]}w' for v in variants);tag=tag[:-1]+f' srcset="{values}" sizes="(max-width: 767px) 100vw, 70vw" decoding="async">'
 # Images in entrance/hero stay eager; other photo slots can be deferred.
 if not re.search(r'(?:hero|intro|cover|entrance|reel|opening)',tag,re.I) and 'loading=' not in tag:tag=tag[:-1]+' loading="lazy">'
 return tag
for id,body in bodies.items():
 baseline=originals[id];expected=baseline
 for m in pattern.finditer(baseline):expected=expected.replace(m[0],store(base64.b64decode(m[2]),m[1])['path'])
 for url,path in sorted(remote_map.items(),key=lambda x:len(x[0]),reverse=True):expected=expected.replace(url,path)
 if id=='001':expected=expected.replace('../assets/images/003/embedded-01.webp',floral)
 assert expected==body,'Unexpected template change '+id
 body=re.sub(r'<img\b[^>]*>',responsive_img,body,flags=re.I)
 def external_style(m):
  css=m[2];props={}
  for path,entry in lookup.items():
   if path not in css or not entry['variants']:continue
   digest=Path(path).name.split('-')[0];key='--vraxis-media-'+digest;variants=entry['variants'];choose=lambda size:min(variants,key=lambda v:abs(v['width']-size))['path'].replace('assets/','../',1)
   # Replace only literal image URLs, retaining gradient layers and all selectors.
   css=re.sub(r'url\(\s*[\x22\x27]?'+re.escape(path)+r'[\x22\x27]?\s*\)',f'var({key})',css)
   props[key]=[choose(640),choose(960),choose(1440)]
  prefix=''
  for idx,query in [(0,None),(1,'(min-width:768px)'),(2,'(min-width:1280px)')]:
   declarations=''.join(f'{key}:url("{values[idx]}");' for key,values in props.items())
   if declarations:prefix+=(':root{'+declarations+'}') if query is None else ('@media'+query+'{:root{'+declarations+'}}')
  css=(prefix+css).replace('assets/media/','../media/');digest=hashlib.sha256(css.encode()).hexdigest()[:24];p=code/(digest+'.css');p.write_text(css)
  return '<link rel="stylesheet" href="'+str(p)+'">'
 body=re.sub(r'<style([^>]*)>([\s\S]*?)</style>',external_style,body,flags=re.I)
 def external_script(m):
  attrs=m[1];js=m[2]
  if 'src=' in attrs or 'application/ld+json' in attrs or not js.strip():return m[0]
  digest=hashlib.sha256(js.encode()).hexdigest()[:24];p=code/(digest+'.js');p.write_text(js);return '<script'+attrs+' src="'+str(p)+'"></script>'
 body=re.sub(r'<script([^>]*)>([\s\S]*?)</script>',external_script,body,flags=re.I)
 body=body.replace('</head>','<script src="assets/static-media.js?v=1"></script></head>')
 (root/f'templates/{id}.html').write_text(body)
 shell,a,n=shells[id];tail=shell[a+n:];end=tail.index('</script>');old=tail[:end]
 # Preserve `frame` global for legacy storefront scripts. The preview frame still
 # receives srcdoc so saved selector paths and nested editor behavior remain stable.
 replacement='"";const frame=document.getElementById("invitation");fetch("templates/'+id+'.html?v=media1").then(r=>{if(!r.ok)throw Error("Design unavailable");return r.text();}).then(html=>{frame.srcdoc=html;}).catch(()=>{frame.srcdoc="<!doctype html><p>This design could not load. Please refresh to try again.</p>";});'
 shell=shell[:a]+replacement+tail[end:];(root/f'preview-{id}.html').write_text(shell)
 reports.append({'id':id,'beforeHTML':len(baseline.encode()),'afterHTML':len(body.encode()),'previewBytes':len(shell.encode()),'embeddedImages':len(pattern.findall(baseline))})
# Legacy editor wrappers use the same optimised interiors instead of retaining duplicate media.
for p in root.glob('studio-*.html'):
 s=p.read_text();m=re.search(r'const TEMPLATE\s*=',s)
 if not m:continue
 try:
  start=m.end();while_space=len(s[start:])-len(s[start:].lstrip());start+=while_space;_,n=json.JSONDecoder().raw_decode(s[start:]);id=p.stem.split('-')[-1];body=(root/f'templates/{id}.html').read_text();s=s[:start]+json.dumps(body,ensure_ascii=True).replace('<','\\u003c')+s[start+n:];p.write_text(s)
 except (ValueError,FileNotFoundError):pass
(root/'assets/media/manifest.json').write_text(json.dumps(manifest,indent=2))
(root/'docs/media-extraction-report.json').write_text(json.dumps({'sourceCommit':args.source_ref,'templates':reports,'uniqueAssets':len(manifest),'originalUniqueBytes':sum(v['originalBytes'] for v in manifest.values()),'defaultUniqueBytes':sum(v['bytes'] for v in manifest.values()),'remoteImported':len(remote_map),'remoteSources':remote_map,'encoder':{'format':'WebP','quality':84,'method':6},'remoteFailures':failed},indent=2))
print(json.dumps({'templates':len(reports),'largestHTML':max(x['afterHTML'] for x in reports),'largestPreview':max(x['previewBytes'] for x in reports),'uniqueAssets':len(manifest),'importedStockPhotos':len(remote_map),'failedStockPhotos':len(failed),'defaultImageBytes':sum(v['bytes'] for v in manifest.values())}))
