'use strict';
const a=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),{chromium}=require('playwright');
const C=require('../../js/orator-catalog.js'),V2=require('../online/offline-v4.cjs'),AI=require('../online/ai.cjs');
const orators=['donald-trump','mariano-rajoy','javier-milei','ana-pastor','celia-villalobos'],cabinet={orators,leader:'celia-villalobos',actions:[]};
const ticket=(id,rules)=>({id,rules,seed:71,expires:Date.now()+86400000,profile:{album:C.cards.map(c=>c.id),actionAlbum:[],elo:0}});
const active=ticket('old-active','offline4'),pending=ticket('old-pending','offline4'),unused=ticket('old-unused','offline4'),current=ticket('new','offline5');
let {state,rng}=V2.start(pending,cabinet,'normal');const commands=[];
for(let i=0;state.status==='active'&&i<1500;i++){const command=AI.choose(state,0,0);commands.push({at:0,command});state=V2.move(state,command,0,rng);}a.equal(state.status,'finished');
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Offline compatibility fixture</title>');});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});try{
 const context=await browser.newContext(),page=await context.newPage();await page.goto('http://127.0.0.1:'+server.address().port);
 for(const [file,tag]of [['js/offline-rules-v1.js','offline1'],['js/offline-rules.js','offline2'],['js/offline-rules-v3.js','offline4'],['js/offline-rules-v4.js','offline4'],['js/offline-rules-v5.js','offline5']]){await page.addScriptTag({path:path.resolve(file)});await page.evaluate(tag=>{window[tag]=HemicycleOfflineRules;},tag);}
 await page.addScriptTag({path:path.resolve('js/offline-rule-dispatch.js')});await page.evaluate(()=>{window.HemicycleOfflineRules=HemicycleOfflineRuleDispatch.create(window);});await page.addScriptTag({path:path.resolve('js/offline-combat.js')});
 const report=await page.evaluate(async({active,pending,unused,current,cabinet,commands})=>{
  const assert=(v,m)=>{if(!v)throw Error(m);};const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('hemicycle-offline-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('accounts');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  async function read(id){return new Promise(resolve=>{const tx=db.transaction('accounts'),r=tx.objectStore('accounts').get(id);r.onsuccess=()=>resolve(r.result);});}
  async function write(id,value){return new Promise((resolve,reject)=>{const tx=db.transaction('accounts','readwrite');tx.objectStore('accounts').put(value,id);tx.oncomplete=resolve;tx.onerror=reject;});}
  const baseRecord={mode:'normal',cabinet,startedAt:Date.now(),commands:[]};await write('A',{tickets:[active,pending,unused],active:{...baseRecord,ticketId:active.id},pending:[{ticketId:pending.id,operationId:pending.id,record:{...baseRecord,ticketId:pending.id,commands}}]});
  let owner='A',snapshot,controls,finished,received=[],requested=[];
  const client=HemicycleOfflineCombat.create({account:()=>({userId:owner}),battle:(s,c)=>{snapshot=s;controls=c;},finished:(s)=>{finished=s;},error:message=>{throw Error(message);},economy:{reconcile:async()=>{},request:async(url,body)=>{
   if(url==='/offline/tickets'){requested.push(body.rules);return [current];}
   if(url==='/offline/settle'){const store=await read(owner),ticket=store.tickets.find(t=>t.id===body.ticketId);assert(ticket,'Lost ticket');const result=HemicycleOfflineRules.forTicket(ticket).replay(ticket,body.record);assert(result.status==='finished','Unfinished receipt');received.push({id:ticket.id,rules:ticket.rules});return {fs:0};}throw Error(url);
  }}});
  assert(await client.resume(),'Legacy match did not resume');assert(snapshot.effectsVersion==='basic1','Legacy state was relabelled');assert((await client.status()).tickets===0,'Unused legacy tickets advertised as current');
  controls.send({type:'resign'});for(let i=0;i<100&&!finished;i++)await new Promise(r=>setTimeout(r,10));assert(finished,'Resignation was not persisted');
  assert((await read('A')).pending.length===2,'Pending legacy result lost');await client.download();const store=await read('A');assert(store.tickets.some(t=>t.id===active.id)&&store.tickets.some(t=>t.id===pending.id),'Download lost pending legacy tickets');assert(!store.tickets.some(t=>t.id===unused.id),'Unused legacy pool retained');assert((await client.status()).tickets===1,'Current download not available');
  await client.flush();assert(received.length===2&&received.every(x=>x.rules==='offline4'),'Legacy receipts used wrong rules');assert((await client.status()).pending===0,'Acknowledged receipts retained');
  await client.start(cabinet,'normal');assert(snapshot.effectsVersion==='basic2','New match used an old catalog');const next=await read('A');assert(next.active.ticketId===current.id,'Current ticket not selected');
  owner='B';assert(controls.send({type:'end'})===false,'Another account can play the active match');assert((await client.status()).tickets===0,'Account B sees account A tickets');client.detach();owner='A';assert(await client.resume(),'Current active match did not resume');assert(snapshot.effectsVersion==='basic2','Current replay used wrong rules');client.detach();
  return {legacyResumed:true,pendingLegacyPreserved:true,legacyReceipts:received,newRules:requested,newEffects:snapshot.effectsVersion,accountIsolation:true,currentResumed:true};
 },{active,pending,unused,current,cabinet,commands});
 fs.mkdirSync('_dev/reports/basic-effects-wave2',{recursive:true});fs.writeFileSync('_dev/reports/basic-effects-wave2/offline-client.json',JSON.stringify(report,null,2)+'\n');console.log('PASS: real IndexedDB, legacy resume, retained receipts, v5 download and account isolation.');await context.close();
 }finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
