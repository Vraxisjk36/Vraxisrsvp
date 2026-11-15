#!/usr/bin/env python3
"""Prepare the same static site for Pages; no credentials or private data required."""
from pathlib import Path
import shutil,json,re
root=Path(__file__).resolve().parents[1];out=root/'dist'
local_index=sorted(str(p.relative_to(root)) for p in (root/'assets/templates').rglob('*') if p.is_file() and p.suffix.lower() in ['.jpg','.png','.webp','.jpeg'])
loader=root/'assets/local-template-media.js';text=loader.read_text();text=re.sub(r'/\* LOCAL_MEDIA_INDEX \*/ \[.*?\]',lambda _: '/* LOCAL_MEDIA_INDEX */ '+json.dumps(local_index),text);loader.write_text(text)
if out.exists():shutil.rmtree(out)
out.mkdir()
for f in root.glob('*.html'):shutil.copy2(f,out/f.name)
for name in ['robots.txt','sitemap.xml','_headers','_redirects']:
 if (root/name).exists():shutil.copy2(root/name,out/name)
for name in ['assets','templates']:shutil.copytree(root/name,out/name,ignore=shutil.ignore_patterns('README.md'))
# Developer image-slot marker documents aren't deployed.
for f in list((out/'assets').rglob('*')):
 if f.is_file() and (f.name.startswith('.') or f.suffix=='.md'):f.unlink()
files=[p for p in out.rglob('*') if p.is_file()];oversize=[str(p.relative_to(out)) for p in files if p.stat().st_size>=25*1024*1024]
assert not oversize,oversize
assert len(files)<20000,len(files)
print(json.dumps({'files':len(files),'bytes':sum(p.stat().st_size for p in files),'largestFile':max(p.stat().st_size for p in files),'output':'dist'}))
