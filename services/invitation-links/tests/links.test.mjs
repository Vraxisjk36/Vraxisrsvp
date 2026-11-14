import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker,{slugName,imageSource} from '../worker/index.js';
const originalFetch=globalThis.fetch;
const fixture={template_id:'003',title:'Our wedding',event:{names:'Joël & Mary',date:'2027-12-12',venue:'The Glasshouse'},photos:[]};
test('names form readable paths without removing the private invitation token',()=>{
 assert.equal(slugName('Joël & Mary'),'joel-and-mary');assert.equal(slugName(' ♥ '),'your-invitation');
});
test('neutral fallback art is used; arbitrary external images are not proxied',()=>{
 assert.match(imageSource(fixture),/share-default.jpg$/);
 assert.match(imageSource({...fixture,photos:['https://internal.example/private']}),/share-default.jpg$/);
});
test('server-rendered sharing HTML has names, photo metadata and the real guest renderer',async()=>{
 globalThis.fetch=async()=>Response.json(fixture);
 try{
  const r=await worker.fetch(new Request('https://example.test/joel-and-mary/inv-0123456789abcdef0123'));
  assert.equal(r.status,200);assert.match(r.headers.get('Content-Type'),/text\/html/);
  const html=await r.text();assert.match(html,/property="og:title" content="Joël &amp; Mary"/);assert.match(html,/property="og:image"/);assert.match(html,/\/joel-and-mary\/inv-0123456789abcdef0123/);assert.match(html,/Vraxisrsvp\/invite.html\?slug=/);assert.match(html,/<\/script>/);assert.doesNotMatch(html,/<\\\/script>/);
 }finally{globalThis.fetch=originalFetch}
});
test('unknown or unpublished invitations are unavailable',async()=>{
 assert.equal((await worker.fetch(new Request('https://example.test/'))).status,200);
 globalThis.fetch=async()=>Response.json({error:'Invitation not found'},{status:404});
 try{assert.equal((await worker.fetch(new Request('https://example.test/names/inv-0123456789abcdef0123'))).status,404)}finally{globalThis.fetch=originalFetch}
});
test('names and venue cannot inject markup into preview metadata',async()=>{
 globalThis.fetch=async()=>Response.json({...fixture,event:{names:'<script>alert(1)</script>',venue:'" onload="alert(2)'}});
 try{const html=await (await worker.fetch(new Request('https://example.test/names/inv-0123456789abcdef0123'))).text();assert.doesNotMatch(html,/<script>alert\(1\)/);assert.match(html,/&lt;script&gt;/)}finally{globalThis.fetch=originalFetch}
});
