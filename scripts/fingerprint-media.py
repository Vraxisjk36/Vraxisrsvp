#!/usr/bin/env python3
"""Fingerprint generated static files by their *served bytes*, then refresh references.
Run after extract-template-media.py and any image-quality changes. Immutable URLs
must change when encoded bytes change, even when the original photo is unchanged.
"""
from pathlib import Path
import hashlib,json,re
root=Path(__file__).resolve().parents[1];mapping={}
for p in (root/'assets/media').glob('*'):
 if p.suffix not in ['.webp','.svg']:continue
 suffix='-'+p.stem.rsplit('-',1)[1] if p.suffix=='.webp' else ''
 name=hashlib.sha256(p.read_bytes()).hexdigest()[:24]+suffix+p.suffix
 if p.name!=name:mapping[p.name]=name;p.rename(p.with_name(name))
manifest=root/'assets/media/manifest.json';s=manifest.read_text()
for old,new in mapping.items():s=s.replace(old,new)
manifest.write_text(s)
code_map={}
for p in (root/'assets/template-code').iterdir():
 s=p.read_text()
 for old,new in mapping.items():s=s.replace(old,new)
 name=hashlib.sha256(s.encode()).hexdigest()[:24]+p.suffix
 if p.name!=name:code_map[p.name]=name;p.with_name(name).write_text(s);p.unlink()
combined={**mapping,**code_map}
for p in [*root.glob('*.html'),*(root/'templates').glob('*.html')]:
 s=p.read_text()
 for old,new in combined.items():s=s.replace(old,new)
 p.write_text(s)
p=root/'assets/templates.js';s=p.read_text();a=s.index('Object.freeze(')+len('Object.freeze(');data,n=json.JSONDecoder().raw_decode(s[a:])
for t in data:
 version=hashlib.sha256((root/f'templates/{t["id"]}.html').read_bytes()).hexdigest()[:12];t['source']=f'templates/{t["id"]}.html?v={version}'
 shell=root/f'preview-{t["id"]}.html';text=shell.read_text();text=re.sub(r'fetch\("templates/'+t['id']+r'\.html\?v=[^"]+"\)',lambda m:'fetch('+json.dumps(t['source'])+')',text);shell.write_text(text)
p.write_text(s[:a]+json.dumps(data,indent=2)+s[a+n:]);print(json.dumps({'mediaRenamed':len(mapping),'codeRenamed':len(code_map)}))
