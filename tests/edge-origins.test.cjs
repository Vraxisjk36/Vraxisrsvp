// Node 24+. Local stubs only: no real customer data or payments.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {join} = require('node:path');
const {stripTypeScriptTypes} = require('node:module');
const vm = require('node:vm');
const sites = ['https://vraxisrsvp.online', 'https://vraxisjk36.github.io'];
const baseFor = origin => origin + (origin.endsWith('github.io') ? '/Vraxisrsvp' : '');
function load(slug, options = {}) {
  let handler;
  const sent = [];
  const query = table => ({
    select() { return this; }, eq() { return this; }, ilike() { return this; },
    single: async () => ({data:{id:'qa-invitation',owner_id:'qa-owner',template_id:options.template || '001',status:'draft'}}),
    maybeSingle: async () => ({data:{id:'qa-invitation',status:'published',slug:'inv-0123456789abcdef0123',event_data:{},design_data:{}}}),
    limit: async () => ({data:[]}),
    insert: async data => { sent.push({table,data}); return {error:null}; }
  });
  const context = {
    Response, Request, TextEncoder, URL, crypto,
    Deno:{serve:h=>{handler=h;},env:{get:k=>k==='PUBLIC_SITE_URL'?undefined:k==='LEMON_SQUEEZY_TEST_MODE'?'true':'qa-local-setting'}},
    createClient:()=>({auth:{getUser:async()=>({data:{user:{id:'qa-owner',email:'qa@example.invalid'}},error:null})},from:query}),
    fetch:async (url, init)=>{sent.push({url,body:JSON.parse(init.body)});return Response.json({data:{id:'qa-checkout',attributes:{url:'https://checkout.example.invalid/test'}}});}
  };
  const source=readFileSync(join(__dirname,'..','supabase','functions',slug,'index.ts'),'utf8');
  vm.runInNewContext(stripTypeScriptTypes(source).replace(/^import .*;\n/,''),context);
  return {handler,sent};
}
function request(method,origin,body={},auth=false) {
  const headers={'content-type':'application/json'};
  if(origin!==null)headers.Origin=origin;
  if(auth)headers.Authorization='Bearer qa-local-token';
  return new Request('https://functions.example.invalid/test',{method,headers,...(method==='POST'?{body:JSON.stringify(body)}:{})});
}
for(const slug of ['create-checkout','publish-invitation','submit-rsvp']) {
  test(slug+' accepts both configured origins and rejects unrelated origins',async()=>{
    const {handler}=load(slug);
    for(const origin of sites){
      const preflight=await handler(request('OPTIONS',origin));
      assert.equal(preflight.status,204);
      assert.equal(preflight.headers.get('access-control-allow-origin'),origin);
      assert.equal(preflight.headers.get('vary'),'Origin');
      const actual=await handler(request('POST',origin));
      assert.equal(actual.status,slug==='submit-rsvp'?400:401);
      assert.equal(actual.headers.get('access-control-allow-origin'),origin);
    }
    for(const origin of [null,'https://evil.example','https://vraxisjk36.github.io.evil.example','__proto__']){
      const response=await handler(request('OPTIONS',origin));
      assert.equal(response.status,403);
      assert.equal(response.headers.get('access-control-allow-origin'),null);
    }
  });
}
test('checkout preserves all twenty tier prices and returns to the requesting site',async()=>{
  const prestige=new Set(['002','005','010','012','014','017']);
  for(const origin of sites)for(let n=1;n<=20;n++){
    const template=String(n).padStart(3,'0');const {handler,sent}=load('create-checkout',{template});
    const response=await handler(request('POST',origin,{invitation_id:'12345678-1234-1234-1234-123456789abc'},true));
    assert.equal(response.status,200);
    const attributes=sent.find(x=>x.url)?.body.data.attributes;
    assert.equal(attributes.custom_price,prestige.has(template)?2400:1599);
    assert.equal(attributes.product_options.redirect_url,baseFor(origin)+'/dashboard.html?payment=return');
  }
});
test('published URLs preserve the GitHub repository path and the custom domain',async()=>{
  for(const origin of sites){
    const {handler}=load('publish-invitation');
    const response=await handler(request('POST',origin,{invitation_id:'12345678-1234-1234-1234-123456789abc'},true));
    assert.equal(response.status,200);
    assert.equal((await response.json()).url,baseFor(origin)+'/invite.html?slug=inv-0123456789abcdef0123');
  }
});
test('RSVP requests from both sites reach validation and storage logic',async()=>{
  for(const origin of sites){
    const {handler,sent}=load('submit-rsvp');
    const response=await handler(request('POST',origin,{slug:'inv-0123456789abcdef0123',guest_name:'QA Guest',guest_email:'qa@example.invalid',response:'yes',party_size:2}));
    assert.equal(response.status,200);
    assert.equal(sent[0].table,'rsvps');
    assert.equal(sent[0].data.party_size,2);
  }
});
test('share pages default to the working GitHub Pages address',async()=>{
  const {handler}=load('invitation-share');
  const response=await handler(new Request('https://functions.example.invalid/share?slug=inv-0123456789abcdef0123'));
  assert.equal(response.status,200);
  assert.match(await response.text(),/https:\/\/vraxisjk36\.github\.io\/Vraxisrsvp\/invite\.html\?slug=/);
});
