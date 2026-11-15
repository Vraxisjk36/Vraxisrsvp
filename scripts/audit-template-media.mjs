// Run: node scripts/audit-template-media.mjs
// Static source audit only: does not replace browser/mobile or licensing review.
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const pages=fs.readdirSync(root).filter(f=>/^preview-\d{3}\.html$/.test(f));
const issues=[];
for(const page of pages){
 const html=fs.readFileSync(path.join(root,page),'utf8');
 const embedded=html.match(/const TEMPLATE=("(?:\\\\.|[^"\\\\])*");/);
 let source=html;
 if(embedded){try{source+='\\n'+JSON.parse(embedded[1]);}catch{issues.push({page,kind:'unreadable-embedded-template'});}}
 const refs=[...source.matchAll(/<(?:img|video|source)\b[^>]*?\b(?:src|poster)\s*=\s*["']([^"']+)["']/gi)].map(m=>m[1]);
 const counts=new Map();
 for(const ref of refs){
  if(/^(?:data:|blob:|#|javascript:)/i.test(ref))continue;
  const clean=ref.split(/[?#]/)[0];
  if(/^https?:\/\//i.test(ref)){if(!/^https:\/\//i.test(ref))issues.push({page,kind:'insecure-media',ref});continue;}
  if(clean.startsWith('/'))continue;
  const absolute=path.resolve(root,path.dirname(page),decodeURIComponent(clean));
  if(!absolute.startsWith(root+path.sep)||!fs.existsSync(absolute))issues.push({page,kind:'missing-local-media',ref});
  counts.set(ref,(counts.get(ref)||0)+1);
 }
 for(const [ref,count] of counts)if(count>1)issues.push({page,kind:'reused-media-review',ref,count});
 for(const match of source.matchAll(/<img\b[^>]*>/gi))if(!/\balt\s*=/.test(match[0]))issues.push({page,kind:'missing-alt',ref:match[0].slice(0,130)});
}
console.log(JSON.stringify({pages:pages.length,issues},null,2));
if(!pages.length||issues.some(i=>i.kind==='missing-local-media'||i.kind==='insecure-media'))process.exitCode=1;
