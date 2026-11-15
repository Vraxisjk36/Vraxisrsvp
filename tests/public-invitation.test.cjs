const{test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),{stripTypeScriptTypes}=require('node:module'),path=require('node:path');
function load(inv) {
 let handler;
 const filters=[],signingCalls=[];
 const ctx={
  Request,Response,URL,
  Deno:{serve:h=>{handler=h;},env:{get:()=> 'qa-local'}},
  createClient:()=>({
   from:()=>({select(){return this;},eq(key,value){filters.push([key,value]);return this;},maybeSingle:async()=>({data:inv})}),
   storage:{from:()=>({createSignedUrls:async paths=>{signingCalls.push(paths);return {data:paths.map(p=>({path:p,signedUrl:'https://storage.example.invalid/'+p+'?fresh=1'}))};}})}
  })
 };
 const source=fs.readFileSync(path.join(__dirname,'../supabase/functions/public-invitation/index.ts'),'utf8');
 vm.runInNewContext(stripTypeScriptTypes(source).replace(/^import .*;\n/,''),ctx);
 return {handler,filters,signingCalls};
}
test('published photo and background paths receive fresh signed URLs',async()=>{
 const inv={id:'qa-event',title:'A celebration',template_id:'006',event_data:{names:'Ava & Sam',age:'40',child:'Our little star',private_field:'never public'},design_data:{photo_paths:['owner/qa-event/cover.jpg'],tap_edits:{text:{'#heading':'Our evening'},images:{'#portrait':'https://old.example/expired'},backgrounds:{'#hero::before':''}},tap_image_paths:{'#hero::before':'owner/qa-event/hero.jpg','#portrait':'owner/qa-event/portrait.jpg'}}};
 const{handler,filters,signingCalls}=load(inv);const r=await handler(new Request('https://api.example/public?slug=inv-0123456789abcdef0123'));assert.equal(r.status,200);const data=await r.json();assert.equal(data.event.age,'40');assert.equal(data.event.child,'Our little star');assert.equal(data.event.private_field,undefined);assert.match(data.photos[0],/fresh=1$/);assert.match(data.design_data.tap_edits.backgrounds['#hero::before'],/hero.jpg\?fresh=1$/);assert.match(data.design_data.tap_edits.images['#portrait'],/portrait.jpg\?fresh=1$/);assert.ok(filters.some(([k,v])=>k==='status'&&v==='published'));assert.equal(signingCalls.length,1);assert.equal(signingCalls[0].length,3);assert.equal(r.headers.get('cache-control'),'no-store');
});
test('invalid and unavailable guest links reveal no invitation data',async()=>{const{handler}=load(null);assert.equal((await handler(new Request('https://api.example/public?slug=bad'))).status,400);assert.equal((await handler(new Request('https://api.example/public?slug=inv-0123456789abcdef0123'))).status,404);});
