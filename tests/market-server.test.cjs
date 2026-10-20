const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createMarketServer}=require('../_dev/market/server.cjs'),{cards}=require('../_dev/market/catalog.cjs');
const card=(r,n=0)=>cards.filter(c=>c.r===r)[n].id;
const common=card('comun'),rare=card('raro'),special=card('especial'),legend=card('legendario');
async function fixture(t,options={}){
 let time=1000000;
 const app=createMarketServer({now:()=>time,...options});
 await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
 t.after(()=>app.close());const base='http://127.0.0.1:'+app.server.address().port;
 async function client(name){
  let cookie='';
  async function call(route,body,expected=200){
   const response=await fetch(base+'/api/market'+route,{method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...(cookie?{Cookie:cookie}:{})},body:body===undefined?undefined:JSON.stringify(body)});
   if(response.headers.get('set-cookie'))cookie=response.headers.get('set-cookie').split(';')[0];
   const data=await response.json();assert.equal(response.status,expected,JSON.stringify({route,error:data.error}));return data;
  }
  const me=await call('/session',{name});return {id:me.id,call,me:()=>call('/me'),cookie:()=>cookie};
 }
 return {app,base,client,advance:ms=>{time+=ms;}};
}
const quantity=(me,id)=>me.inventory.find(c=>c.id===id)?.quantity||0;
const operation=(id,quantity)=>({id,quantity,key:crypto.randomUUID()});
async function proposal(a,b,give=[{id:common,quantity:1}],receive=[{id:rare,quantity:1}]){
 return a.call('/trades',{recipient:b.id,give,receive,key:crypto.randomUUID()});
}

test('server creates separate identities, validates authentication, and never serves development files',async t=>{
 const f=await fixture(t),a=await f.client('Ana'),b=await f.client('Bruno');
 assert.notEqual(a.id,b.id);assert.equal((await a.me()).fs,6000);assert.equal((await a.me()).demo,true);
 assert.deepEqual(await a.call('/players'),[{id:b.id,name:'Bruno'}]);
 const noAuth=await fetch(f.base+'/api/market/me');assert.equal(noAuth.status,401);
 for(const file of ['/_dev/market/server.cjs','/.git/config','/tests/market.test.cjs','/docs/v30.2.2.md'])assert.equal((await fetch(f.base+file)).status,404,file);
 const csrf=await fetch(f.base+'/api/market/session',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://outside.example'},body:'{}'});assert.equal(csrf.status,403);
 assert.equal((await fetch(f.base+'/health')).status,200);
 assert.equal((await fetch(f.base+'/api/market/status')).headers.get('cache-control'),'no-store');
});

test('machine sale is repeat-safe and cannot sell the protected last copy or forged quantities',async t=>{
 const f=await fixture(t),a=await f.client('Ana'),op=operation(common,2);
 const receipt=await a.call('/sales/machine',op);assert.equal(receipt.total,30);
 assert.equal((await a.me()).fs,6030);assert.equal(quantity(await a.me(),common),1);
 assert.deepEqual(await a.call('/sales/machine',op),receipt);assert.equal((await a.me()).fs,6030);
 await a.call('/sales/machine',operation(common,1),409);
 await a.call('/sales/machine',{...operation(rare,1),quantity:-1},400);
 await a.call('/sales/machine',{...op,quantity:1},409);
 assert.equal(quantity(await a.me(),rare),3);
});

test('listing reserves stock; only the seller can cancel and cancellation restores it once',async t=>{
 const f=await fixture(t),a=await f.client('Ana'),b=await f.client('Bruno'),op=operation(common,2);
 const listing=await a.call('/listings',op);assert.equal(listing.unit,18);assert.equal(quantity(await a.me(),common),1);
 assert.deepEqual(await a.call('/listings',op),listing);
 await a.call('/sales/machine',operation(common,1),409);
 await b.call('/listings/'+listing.id+'/cancel',{},403);
 await a.call('/quotes/purchase',{listing:listing.id,quantity:1},400);
 await a.call('/listings/'+listing.id+'/cancel',{});await a.call('/listings/'+listing.id+'/cancel',{});
 assert.equal(quantity(await a.me(),common),3);assert.equal((await a.me()).fs,6000);
 assert.equal((await b.call('/listings')).length,0);
});

test('player purchase needs a verified quote and transfers stock and FS atomically only once',async t=>{
 const f=await fixture(t),a=await f.client('Ana'),b=await f.client('Bruno');
 const listing=await a.call('/listings',operation(common,2));
 await b.call('/purchases',{quote:'not-verified'},409);
 const quote=await b.call('/quotes/purchase',{listing:listing.id,quantity:2});assert.equal(quote.total,36);
 assert.equal(quantity(await b.me(),common),3);assert.equal((await b.me()).fs,6000);
 const receipt=await b.call('/purchases',{quote:quote.id});
 assert.equal(quantity(await b.me(),common),5);assert.equal(quantity(await a.me(),common),1);
 assert.equal((await a.me()).fs,6036);assert.equal((await b.me()).fs,5964);
 assert.deepEqual(await b.call('/purchases',{quote:quote.id}),receipt);assert.equal((await b.me()).fs,5964);
 assert.equal((await a.me()).fs+(await b.me()).fs,12000);
 assert.equal((await a.call('/activity')).receipts.filter(r=>r.kind==='player-sale').length,1);
});

test('stale and expired purchase quotes never transfer changed stock or debit funds',async t=>{
 const f=await fixture(t),a=await f.client('Ana'),b=await f.client('Bruno'),c=await f.client('Clara');
 const listing=await a.call('/listings',operation(common,2));
 const old=await b.call('/quotes/purchase',{listing:listing.id,quantity:1});
 const other=await c.call('/quotes/purchase',{listing:listing.id,quantity:1});await c.call('/purchases',{quote:other.id});
 await b.call('/purchases',{quote:old.id},409);assert.equal((await b.me()).fs,6000);
 const fresh=await b.call('/quotes/purchase',{listing:listing.id,quantity:1});f.advance(120001);
 await b.call('/purchases',{quote:fresh.id},410);assert.equal(quantity(await b.me(),common),3);
});

test('a one-for-one adjacent trade reserves the +20% surcharge and needs both verification and both confirmations',async t=>{
 const f=await fixture(t),a=await f.client('Ana'),b=await f.client('Bruno'),c=await f.client('Clara');
 const trade=await proposal(a,b);assert.equal(trade.terms.giveFS,18);assert.equal((await a.me()).fs,6000);
 await c.call('/trades/'+trade.id+'/verify',{},403);
 await a.call('/trades/'+trade.id+'/confirm',{},409);
 await a.call('/trades/'+trade.id+'/verify',{});await a.call('/trades/'+trade.id+'/verify',{});
 assert.equal((await a.me()).fs,5982);assert.equal(quantity(await a.me(),common),2);assert.equal((await b.me()).fs,6000);
 await a.call('/trades/'+trade.id+'/confirm',{},409);
 await b.call('/trades/'+trade.id+'/verify',{});await a.call('/trades/'+trade.id+'/confirm',{});
 assert.equal(quantity(await a.me(),rare),3);assert.equal(quantity(await b.me(),common),3);
 const result=await b.call('/trades/'+trade.id+'/confirm',{});assert.equal(result.status,'completed');
 assert.equal(quantity(await a.me(),rare),4);assert.equal(quantity(await b.me(),common),4);
 assert.equal((await a.me()).fs,5982);assert.equal((await b.me()).fs,6018);
 await a.call('/trades/'+trade.id+'/confirm',{});await b.call('/trades/'+trade.id+'/verify',{});
 assert.equal((await b.me()).fs,6018);assert.equal(quantity(await a.me(),rare),4);
 await a.call('/trades/'+trade.id+'/cancel',{},409);
 assert.equal((await c.call('/activity')).trades.length,0);
});

test('two lower cards may be distinct, carry no FS surcharge and work in both proposing directions',async t=>{
 for(const reverse of [false,true]){
  const f=await fixture(t),a=await f.client('Ana'),b=await f.client('Bruno');
  const low=[{id:common,quantity:1},{id:card('comun',1),quantity:1}],high=[{id:rare,quantity:1}];
  const trade=await proposal(a,b,reverse?high:low,reverse?low:high);
  assert.equal(trade.terms.fee,0);
  for(const person of [a,b])await person.call('/trades/'+trade.id+'/verify',{});
  for(const person of [a,b])await person.call('/trades/'+trade.id+'/confirm',{});
  assert.equal((await a.me()).fs,6000);assert.equal((await b.me()).fs,6000);
  assert.equal(quantity(await a.me(),rare),reverse?2:4);assert.equal(quantity(await b.me(),common),reverse?2:4);
 }
});

test('cancelling at either verification stage returns every reserved card and FS once',async t=>{
 for(const both of [false,true]){
  const f=await fixture(t),a=await f.client('Ana'),b=await f.client('Bruno'),trade=await proposal(a,b);
  await a.call('/trades/'+trade.id+'/verify',{});if(both)await b.call('/trades/'+trade.id+'/verify',{});
  await b.call('/trades/'+trade.id+'/cancel',{});await a.call('/trades/'+trade.id+'/cancel',{});
  assert.equal((await a.me()).fs,6000);assert.equal((await b.me()).fs,6000);
  assert.equal(quantity(await a.me(),common),3);assert.equal(quantity(await b.me(),rare),3);
  await a.call('/trades/'+trade.id+'/confirm',{},409);
 }
});

test('expiry releases reserved resources and prevents a late confirmation',async t=>{
 const f=await fixture(t),a=await f.client('Ana'),b=await f.client('Bruno'),trade=await proposal(a,b);
 await a.call('/trades/'+trade.id+'/verify',{});await b.call('/trades/'+trade.id+'/verify',{});
 f.advance(900001);
 await a.call('/trades/'+trade.id+'/confirm',{},410);
 assert.equal((await a.me()).fs,6000);assert.equal(quantity(await a.me(),common),3);assert.equal(quantity(await b.me(),rare),3);
 assert.equal((await a.call('/activity')).trades[0].status,'expired');
});

test('proposer verifies and reserves in the initial proposal, without a redundant acceptance step',async t=>{
 const f=await fixture(t),a=await f.client('Ana'),b=await f.client('Bruno');
 const data={recipient:b.id,give:[{id:common,quantity:1}],receive:[{id:rare,quantity:1}],verify:true,key:crypto.randomUUID()};
 const trade=await a.call('/trades',data);assert.equal(trade.verified_a,1);assert.equal(trade.verified_b,0);
 assert.equal((await a.me()).fs,5982);assert.equal(quantity(await a.me(),common),2);
 await a.call('/trades',data);assert.equal((await a.me()).fs,5982);
 await b.call('/trades/'+trade.id+'/verify',{});
 await Promise.all([a.call('/trades/'+trade.id+'/confirm',{}),b.call('/trades/'+trade.id+'/confirm',{})]);
 assert.equal((await b.me()).fs,6018);assert.equal(quantity(await a.me(),rare),4);
});

test('insufficient FS or loss of stock before verification never creates a partial reservation',async t=>{
 const f=await fixture(t),a=await f.client('Ana'),b=await f.client('Bruno');
 f.app.db.prepare('UPDATE players SET fs=10 WHERE id=?').run(a.id);
 await a.call('/trades',{recipient:b.id,give:[{id:common,quantity:1}],receive:[{id:rare,quantity:1}],verify:true,key:crypto.randomUUID()},409);
 assert.equal(quantity(await a.me(),common),3);assert.equal((await a.me()).fs,10);assert.equal((await a.call('/activity')).trades.length,0);
 f.app.db.prepare('UPDATE players SET fs=6000 WHERE id=?').run(a.id);
 const trade=await proposal(a,b);
 await a.call('/sales/machine',operation(common,2));
 await a.call('/trades/'+trade.id+'/verify',{},409);
 assert.equal((await a.me()).fs,6030);assert.equal(quantity(await a.me(),common),1);
});

test('two buyers racing for the same stock produce one purchase and conserve all FS and cards',async t=>{
 const f=await fixture(t),a=await f.client('Ana'),b=await f.client('Bruno'),c=await f.client('Clara');
 const listing=await a.call('/listings',operation(common,2));
 const qb=await b.call('/quotes/purchase',{listing:listing.id,quantity:2}),qc=await c.call('/quotes/purchase',{listing:listing.id,quantity:2});
 const outcomes=await Promise.allSettled([b.call('/purchases',{quote:qb.id}),c.call('/purchases',{quote:qc.id})]);
 assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,1);
 const people=await Promise.all([a.me(),b.me(),c.me()]);
 assert.equal(people.reduce((sum,p)=>sum+p.fs,0),18000);assert.equal(people.reduce((sum,p)=>sum+quantity(p,common),0),9);
 assert.equal(people[0].fs,6036);assert.equal(quantity(people[0],common),1);
});

test('conflicting reservations and illegal rarity gaps fail without consuming other resources',async t=>{
 const f=await fixture(t),a=await f.client('Ana'),b=await f.client('Bruno');
 await a.call('/trades',{recipient:b.id,give:[{id:common,quantity:1}],receive:[{id:special,quantity:1}],key:crypto.randomUUID()},400);
 await a.call('/trades',{recipient:b.id,give:[{id:common,quantity:1}],receive:[{id:legend,quantity:1}],key:crypto.randomUUID()},400);
 const trade=await proposal(a,b,[{id:common,quantity:2}],[{id:rare,quantity:1}]);
 await a.call('/listings',operation(common,1));
 await a.call('/trades/'+trade.id+'/verify',{},409);
 assert.equal(quantity(await a.me(),common),2);assert.equal((await a.me()).fs,6000);
 const history=await a.call('/activity');assert.equal(history.trades[0].verified_a,0);
});

test('identities, inventories, balances and pending reservations survive a server restart',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hemicycle-market-test-')),dbPath=path.join(dir,'market.sqlite');
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 let app=createMarketServer({dbPath});await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
 let base='http://127.0.0.1:'+app.server.address().port;
 const response=await fetch(base+'/api/market/session',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"name":"Ana"}'});
 const initial=await response.json(),cookie=response.headers.get('set-cookie').split(';')[0];
 await fetch(base+'/api/market/listings',{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify(operation(common,2))});
 await app.close();app=createMarketServer({dbPath});await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));t.after(()=>app.close());
 base='http://127.0.0.1:'+app.server.address().port;
 const me=await (await fetch(base+'/api/market/me',{headers:{Cookie:cookie}})).json();
 assert.equal(me.id,initial.id);assert.equal(me.fs,6000);assert.equal(quantity(me,common),1);
 const activity=await (await fetch(base+'/api/market/activity',{headers:{Cookie:cookie}})).json();assert.equal(activity.listings[0].remaining,2);
});

test('one reviewed acceptance per player reserves first, then completes atomically and only once',async t=>{
 const f=await fixture(t),a=await f.client('Ana'),b=await f.client('Bruno'),outside=await f.client('Clara');
 const data={recipient:b.id,give:[{id:common,quantity:1}],receive:[{id:rare,quantity:1}],accept:true,key:crypto.randomUUID()};
 const trade=await a.call('/trades',data);
 assert.equal(trade.verified_a,1);assert.equal(trade.confirmed_a,1);assert.equal(trade.confirmed_b,0);
 assert.equal((await a.me()).fs,5982);assert.equal(quantity(await a.me(),rare),3);
 await a.call('/trades',data);await a.call('/trades/'+trade.id+'/accept',{});
 assert.equal((await a.me()).fs,5982);assert.equal(quantity(await a.me(),common),2);
 await outside.call('/trades/'+trade.id+'/accept',{},403);
 const replies=await Promise.all([b.call('/trades/'+trade.id+'/accept',{}),b.call('/trades/'+trade.id+'/accept',{})]);
 assert.ok(replies.every(r=>r.status==='completed'));
 assert.equal(quantity(await a.me(),rare),4);assert.equal(quantity(await b.me(),common),4);
 assert.equal((await a.me()).fs+(await b.me()).fs,12000);
 assert.equal((await b.me()).fs,6018);
 assert.equal((await a.call('/activity')).receipts.filter(r=>r.kind==='trade').length,1);
 assert.equal((await b.call('/activity')).receipts.filter(r=>r.kind==='trade').length,1);
});

test('cancellation or expiry returns a pending single-window acceptance and its FS once',async t=>{
 for(const expired of [false,true]){
  const f=await fixture(t),a=await f.client('Ana'),b=await f.client('Bruno');
  const trade=await a.call('/trades',{recipient:b.id,give:[{id:common,quantity:1}],receive:[{id:rare,quantity:1}],accept:true,key:crypto.randomUUID()});
  if(expired){f.advance(900001);await b.call('/trades/'+trade.id+'/accept',{},410);}
  else{await b.call('/trades/'+trade.id+'/cancel',{});await a.call('/trades/'+trade.id+'/cancel',{});await b.call('/trades/'+trade.id+'/accept',{},409);}
  assert.equal((await a.me()).fs,6000);assert.equal(quantity(await a.me(),common),3);
  assert.equal((await b.me()).fs,6000);assert.equal(quantity(await b.me(),rare),3);
  assert.equal((await a.call('/activity')).receipts.filter(r=>r.kind==='trade').length,0);
 }
});

test('single-window acceptance rechecks stock and FS and rolls back a failed reservation',async t=>{
 for(const loseStock of [true,false]){
  const f=await fixture(t),a=await f.client('Ana'),b=await f.client('Bruno');
  const give=loseStock?common:rare,receive=loseStock?rare:common;
  const trade=await a.call('/trades',{recipient:b.id,give:[{id:give,quantity:1}],receive:[{id:receive,quantity:1}],accept:true,key:crypto.randomUUID()});
  if(loseStock)await b.call('/listings',operation(receive,2));
  else f.app.db.prepare('UPDATE players SET fs=10 WHERE id=?').run(b.id);
  const before=await b.me();await b.call('/trades/'+trade.id+'/accept',{},409);
  assert.deepEqual(await b.me(),before);
  const pending=(await a.call('/activity')).trades[0];assert.equal(pending.verified_b,0);assert.equal(pending.confirmed_b,0);
  await a.call('/trades/'+trade.id+'/cancel',{});
  assert.equal(quantity(await a.me(),give),3);assert.equal((await a.me()).fs,6000);
 }
});
