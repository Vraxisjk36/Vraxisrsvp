#!/usr/bin/env python3
"""Compare approved body structure/text, ignoring media URLs and delivery tags."""
from pathlib import Path
from html.parser import HTMLParser
import subprocess,json
class Structure(HTMLParser):
 def __init__(self):super().__init__();self.body=False;self.skip=0;self.events=[]
 def handle_starttag(self,tag,attrs):
  if tag=='body':self.body=True
  if tag in ['script','style']:self.skip+=1;return
  if not self.body:return
  if self.skip or tag=='link':return
  attrs=[(k,v) for k,v in attrs if k not in ['src','srcset','sizes','loading','decoding','data-fallback','alt','fetchpriority']]
  self.events.append(('start',tag,attrs))
 def handle_endtag(self,tag):
  if tag in ['img','input','br','hr','meta','link','source','wbr']:return
  if tag in ['script','style']:self.skip-=1;return
  if self.body and not self.skip and tag!='link':self.events.append(('end',tag))
  if tag=='body':self.body=False
 def handle_data(self,data):
  if self.body and not self.skip and data.strip():self.events.append(('text',' '.join(data.split())))
for n in range(1,26):
 id=f'{n:03}';shell=subprocess.check_output(['git','show','c4f8b13:preview-'+id+'.html'],text=True);old=json.JSONDecoder().raw_decode(shell.split('const TEMPLATE=',1)[1])[0];before=Structure();before.feed(old);after=Structure();after.feed(Path('templates/'+id+'.html').read_text());assert before.events==after.events,id
print('All 25 invitation body structures, text, IDs and interactive controls match approved source')
