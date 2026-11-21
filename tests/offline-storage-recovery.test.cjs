'use strict';
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
let browser,server,origin;
before(async()=>{
 server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Offline storage recovery</title>');});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
});
after(async()=>{if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));});
async function fixture(run){
 const context=await browser.newContext();try{const page=await context.newPage();await page.goto(origin);
 await page.evaluate(()=>{
  window.connections=[];window.opens=0;const open=indexedDB.open.bind(indexedDB);
  indexedDB.open=function(...args){window.opens++;const request=open(...args);request.addEventListener('success',()=>connections.push(request.result));return request;};
  window.HemicycleOfflineRules={forTicket:()=>({start:()=>({state:{status:'active',deadline:90000,visualSequence:0},rng:()=>0}),project:s=>s})};
  window.requests=[];window.receipts=[];window.account='A';window.cabinet={orators:['one'],actions:['action'],leader:'one'};
  window.ticket={id:'one-ticket',rules:'offline11',expires:Date.now()+86400000,profile:{album:['one'],actionAlbum:['action']}};
  window.api={account:()=>({userId:account}),battle:(s,controls)=>{window.controls=controls;},economy:{request:async(url,item)=>{requests.push({url,item});return url==='/offline/tickets'?[ticket]:{fs:25};},reconcile:async()=>{}},onReceipt:(id,result)=>receipts.push({id,result})};
 });
 await page.addScriptTag({path:path.resolve('js/offline-combat.js')});
 await page.evaluate(()=>{window.client=HemicycleOfflineCombat.create(api);});return await run(page);
 }finally{await context.close();}
}
test('an explicitly closed IndexedDB connection reopens for concurrent reads and a playable match',async()=>{
 const result=await fixture(page=>page.evaluate(async()=>{await client.download();connections[0].close();const status=await Promise.all([client.status(),client.status()]);await client.start(cabinet,'normal');client.detach();const resumed=await client.resume();client.detach();return {status,opens,resumed};}));
 assert.equal(result.opens,2);assert.ok(result.status.every(s=>s.tickets===1));assert.equal(result.resumed,true);
});
test('version changes and unexpected close events invalidate the cached connection without erasing records',async()=>{
 const result=await fixture(page=>page.evaluate(async()=>{await client.download();const old=connections[0];old.dispatchEvent(new Event('versionchange'));const a=await client.status();old.dispatchEvent(new Event('close'));const b=await client.status();const current=connections.at(-1);current.close();current.dispatchEvent(new Event('close'));const c=await client.status();return {a,b,c,opens};}));
 assert.equal(result.opens,3);for(const key of ['a','b','c'])assert.equal(result[key].tickets,1);
});
test('a connection closing just before a write retries only transaction creation and preserves the active match',async()=>{
 const result=await fixture(page=>page.evaluate(async()=>{await client.download();const d=connections[0],transaction=d.transaction.bind(d);let attempts=0;d.transaction=function(store,mode){if(mode==='readwrite'){attempts++;d.close();}return transaction(store,mode);};await client.start(cabinet,'normal');client.detach();return {status:await client.status(),attempts,opens,requests:requests.length};}));
 assert.equal(result.attempts,1);assert.equal(result.opens,2);assert.equal(result.status.active,true);assert.equal(result.requests,1);
});
test('a failed database open is retryable on the next attempt',async()=>{
 const result=await fixture(page=>page.evaluate(async()=>{const open=indexedDB.open.bind(indexedDB);let fail=true;indexedDB.open=function(...args){if(fail){fail=false;throw new DOMException('temporarily unavailable','UnknownError');}return open(...args);};let rejected=false;try{await client.status();}catch(e){rejected=true;}await client.download();return {rejected,status:await client.status()};}));
 assert.equal(result.rejected,true);assert.equal(result.status.tickets,1);
});
test('a failed engine load leaves the prepared ticket free to retry',async()=>{
 const result=await fixture(page=>page.evaluate(async()=>{
  await client.download();
  let attempts=0;
  window.HemicycleOfflineEngineLoader={ensure:async version=>{
   if(version!=='offline11')throw Error('Wrong engine');
   if(++attempts===1)throw Error('Interrupted engine load');
  }};
  let message;
  try{await client.start(cabinet,'normal');}catch(e){message=e.message;}
  const failed=await client.status();
  await client.start(cabinet,'normal');client.detach();
  const resumed=await client.resume();client.detach();
  return {message,attempts,failed,resumed,requests:requests.length};
 }));
 assert.equal(result.message,'Interrupted engine load');
 assert.equal(result.failed.active,false);
 assert.equal(result.failed.tickets,1);
 assert.equal(result.attempts,3);
 assert.equal(result.requests,1);
 assert.equal(result.resumed,true);
});
test('an aborted read cannot resolve with a value delivered before the transaction completes',async()=>{
 const result=await fixture(page=>page.evaluate(async()=>{await client.download();const d=connections[0],transaction=d.transaction.bind(d);let armed=true;d.transaction=function(...args){const tx=transaction(...args);if(armed){armed=false;const objectStore=tx.objectStore.bind(tx);tx.objectStore=function(...names){const store=objectStore(...names),get=store.get.bind(store);store.get=function(...keys){const q=get(...keys);q.addEventListener('success',()=>tx.abort());return q;};return store;};}return tx;};let rejected=false;try{await client.status();}catch(e){rejected=true;}return {rejected,status:await client.status(),opens};}));
 assert.equal(result.rejected,true);assert.equal(result.status.tickets,1);assert.equal(result.opens,1);
});
test('an aborted write is never silently retried and preserves the previous record',async()=>{
 const result=await fixture(page=>page.evaluate(async()=>{await client.download();const d=connections[0],transaction=d.transaction.bind(d);let writes=0;d.transaction=function(store,mode){const tx=transaction(store,mode);if(mode==='readwrite'){writes++;const objectStore=tx.objectStore.bind(tx);tx.objectStore=function(...names){const s=objectStore(...names),put=s.put.bind(s);s.put=function(...args){const q=put(...args);q.addEventListener('success',()=>tx.abort());return q;};return s;};}return tx;};let rejected=false;try{await client.start(cabinet,'normal');}catch(e){rejected=true;}return {rejected,writes,status:await client.status(),opens};}));
 assert.equal(result.rejected,true);assert.equal(result.writes,1);assert.equal(result.status.active,false);assert.equal(result.status.tickets,1);assert.equal(result.opens,1);
});
test('reconnecting preserves pending receipts and account isolation, settling each result once',async()=>{
 const result=await fixture(page=>page.evaluate(async()=>{await client.download();const d=connections[0];await new Promise((resolve,reject)=>{const tx=d.transaction('accounts','readwrite');tx.objectStore('accounts').put({tickets:[ticket],pending:[{ticketId:ticket.id,operationId:ticket.id,record:{mode:'normal',commands:[]}}],active:null},'A');tx.oncomplete=resolve;tx.onabort=reject;});d.close();const pending=(await client.status()).pending;account='B';const other=await client.status();account='A';await Promise.all([client.flush(),client.flush()]);await client.flush();return {pending,other,status:await client.status(),settled:requests.filter(r=>r.url==='/offline/settle').length,receipts:receipts.length};}));
 assert.equal(result.pending,1);assert.equal(result.other.pending,0);assert.equal(result.other.tickets,0);assert.equal(result.status.pending,0);assert.equal(result.settled,1);assert.equal(result.receipts,1);
});
