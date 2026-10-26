'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs');
const {PGlite}=require('@electric-sql/pglite'),E=require('../../_dev/online/economy.cjs'),{createServer}=require('../../_dev/online/server.cjs');
const uuid=()=>crypto.randomUUID();
test('bounded write queue rejects overflow and expired waits, then recovers',async()=>{
 const {create}=require('../../_dev/online/write-queue.cjs');let release,rejected=0;const q=create({limit:1,waitMs:20,onReject:()=>rejected++});
 const first=q.run(()=>new Promise(r=>release=r));await Promise.resolve();
 const waiting=q.run(()=>a.fail('expired queued work must not execute'));const expired=a.rejects(waiting,e=>e.status===503&&e.code==='ECONOMY_BUSY');
 await a.rejects(q.run(()=>{}),e=>e.status===503);await expired;release('done');await first;await new Promise(r=>setImmediate(r));a.equal(await q.run(()=>42),42);a.equal(rejected,2);
});
test('HTTP load on real economy SQL preserves stock, balances, receipts and offline rewards across two service instances',async t=>{
 const db=new PGlite(),servers=[],logs=[];let serial=Promise.resolve(),drop=false,failed=false;
 const sql=fn=>{const p=serial.then(fn);serial=p.catch(()=>{});return p;};
 const rpc=(name,args)=>sql(async()=>{await db.exec('reset role;set role service_role');return(await db.query('select public.'+name+'('+Object.keys(args).map((k,i)=>k+'=> $'+(i+1)).join(',')+') as v',Object.values(args).map(v=>v!==null&&typeof v==='object'?JSON.stringify(v):v))).rows[0].v;});
 try{
 await db.exec("create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;");
 for(const f of ['_dev/supabase/20261021_account_profiles.sql','_dev/supabase/20261021_cloud_saves.sql','_dev/online/rooms.sql','_dev/online/20261024_test_players.sql','_dev/online/20261024_private_combat.sql','_dev/online/20261024_matchmaking.sql','_dev/online/20261024_ranked_ai.sql','_dev/supabase/20261024_action_inventory.sql','_dev/online/20261025_ranked_rewards.sql','_dev/online/20261025_online_progress.sql','_dev/online/20261025_economy_authority.sql','_dev/online/20261026_reliability_balance.sql'])await db.exec(fs.readFileSync(f,'utf8'));
 const ids=Array.from({length:25},uuid),card=E.catalog.find(c=>!c.action&&c.r==='comun').id;
 for(const id of ids){await db.exec('reset role');await db.query('insert into auth.users values($1)',[id]);const p=E.starter('HC-'+uuid(),Date.now());p.profile.fs=50000;p.profile.album=[...E.catalog.filter(c=>!c.action).slice(0,5).map(c=>c.id),...Array(10).fill(card)];p.profile.actionAlbum=['replica','replica','receso','receso'];await rpc('hemicycle_economy_bootstrap',{p_actor:id,p_payload:p});}
 async function transport(url,o){if(url.endsWith('/auth/v1/user'))return {ok:true,json:async()=>({id:o.headers.Authorization.slice(7)})};const name=url.split('/').at(-1),args=JSON.parse(o.body);await new Promise(r=>setTimeout(r,2));
  if(failed){failed=false;throw Error('private-database-detail');}
  try{const data=await rpc(name,args);if(drop&&name==='hemicycle_economy_commit'&&args.p_request.type==='pack'){drop=false;return {ok:false,status:503,json:async()=>({})};}return {ok:true,status:200,json:async()=>data};}catch(e){return {ok:false,status:409,json:async()=>({code:e.code,message:e.message})};}
 }
 for(let i=0;i<2;i++){const s=createServer({url:'https://example.supabase.co',key:'public-test',secret:'private-server-secret',origins:'https://hemicycle.online',fetch:transport,logger:line=>logs.push(JSON.parse(line))});await new Promise(r=>s.listen(0,'127.0.0.1',r));servers.push(s);}
 let requests=0;const durations=[];
 async function call(actor,command,operationId=uuid(),instance=0){const at=performance.now();const r=await fetch('http://127.0.0.1:'+servers[instance].address().port+'/economy',{method:'POST',headers:{Authorization:'Bearer '+actor,'Content-Type':'application/json'},body:JSON.stringify({command,operationId})});requests++;durations.push(performance.now()-at);return {status:r.status,data:await r.json(),reference:r.headers.get('x-request-id')};}
 const context=id=>rpc('hemicycle_economy_context',{p_actor:id});const profile=async id=>(await context(id)).accounts[id].payload.profile;
 const initial=await Promise.all(ids.map(profile));const total=(ps,k)=>ps.reduce((s,p)=>s+(k==='fs'?p.fs:p.album.filter(x=>x===card).length),0);
 const results=await Promise.all(ids.slice(1).flatMap((id,i)=>{const key=uuid(),cmd={type:'machine',id:card,quantity:1};return [call(id,cmd,key,i%2),call(id,cmd,key,1-i%2)];}));a.ok(results.every(r=>r.status===200),JSON.stringify(results.filter(r=>r.status!==200)));for(let i=0;i<results.length;i+=2)a.deepEqual(results[i].data,results[i+1].data);
 const after=await Promise.all(ids.map(profile));a.equal(total(initial,'cards')-total(after,'cards'),24);a.equal(total(after,'fs')-total(initial,'fs'),24*15);
 const listing=await call(ids[0],{type:'listing',id:card,quantity:1});a.equal(listing.status,200);
 const quotes=await Promise.all(ids.slice(1).map((id,i)=>call(id,{type:'quote',listing:listing.data.id,quantity:1},uuid(),i%2)));a.ok(quotes.every(q=>q.status===200));
 const beforeBuy=await Promise.all(ids.map(profile));const purchases=await Promise.all(ids.slice(1).map((id,i)=>call(id,{type:'purchase',quote:quotes[i].data.id},quotes[i].data.id,i%2)));a.equal(purchases.filter(r=>r.status===200).length,1);a.ok(purchases.every(r=>[200,409].includes(r.status)));
 const afterBuy=await Promise.all(ids.map(profile));a.equal(total(beforeBuy,'fs'),total(afterBuy,'fs'));a.equal(total(afterBuy,'cards'),total(beforeBuy,'cards')+1);
 // Concurrent retries on different instances must return the persisted random pack,
 // not a fresh calculation that lost the race to commit.
 const visibility=await Promise.all(ids.slice(1,17).map((id,i)=>call(id,{type:'visibility',visible:true},uuid(),i%2)));a.ok(visibility.every(r=>r.status===200));
 const trades=await Promise.all(Array.from({length:8},(_,i)=>call(ids[1+i*2],{type:'trade',recipient:ids[2+i*2],give:[{id:'replica',quantity:1}],receive:[{id:'receso',quantity:1}]},uuid(),i%2)));a.ok(trades.every(r=>r.status===200));
 const tradeBefore=await Promise.all(ids.map(profile));
 const races=await Promise.all(trades.map(async(r,i)=>Promise.all([call(ids[2+i*2],{type:'accept-trade',id:r.data.id},uuid(),0),call(ids[1+i*2],{type:'cancel-trade',id:r.data.id},uuid(),1)])));
 a.ok(races.flat().every(r=>[200,409].includes(r.status)));const tradeAfter=await Promise.all(ids.map(profile));a.equal(total(tradeBefore,'fs'),total(tradeAfter,'fs'));
 const finalMarket=(await context(ids[0])).market;for(let i=0;i<8;i++){const tr=finalMarket.trades.find(t=>t.id===trades[i].data.id);a.ok(['completed','cancelled'].includes(tr.status));for(const id of [ids[1+i*2],ids[2+i*2]]){const p=tradeAfter[ids.indexOf(id)];a.equal(p.actionAlbum.length,4);a.ok(p.actionAlbum.includes('replica')&&p.actionAlbum.includes('receso'));}}
 const key=uuid(),cmd={type:'pack',kind:'comun',quantity:1,free:false},beforePack=await profile(ids[0]);const packs=await Promise.all([call(ids[0],cmd,key,0),call(ids[0],cmd,key,1)]);a.ok(packs.every(p=>p.status===200));a.deepEqual(packs[0].data,packs[1].data);a.equal((await profile(ids[0])).fs,beforePack.fs-400);
 drop=true;const lostKey=uuid();a.equal((await call(ids[0],cmd,lostKey)).status,503);const afterLost=await profile(ids[0]);a.equal((await call(ids[0],cmd,lostKey,1)).status,200);a.equal((await profile(ids[0])).fs,afterLost.fs);
 const Offline=require('../../_dev/online/offline-rules.cjs'),AI=require('../../_dev/online/ai.cjs');const tickets=await rpc('hemicycle_offline_download',{p_actor:ids[0],p_rules:'offline2'}),ticket=tickets[0],orators=[...new Set(ticket.profile.album)].slice(0,5);
 // Ensure fixture has five distinct speakers for a legal cabinet.
 a.equal(orators.length,5);{const cabinet={orators,leader:orators[0],actions:[]};let {state,rng}=Offline.start(ticket,cabinet,'normal'),commands=[];for(let i=0;state.status==='active'&&i<2000;i++){const command=AI.choose(state,0,0);commands.push({at:0,command});state=Offline.move(state,command,0,rng);}a.equal(state.status,'finished');const command={type:'offline-settle',ticketId:ticket.id,record:{mode:'normal',cabinet,commands}},before=await profile(ids[0]);const settled=await Promise.all([call(ids[0],command,ticket.id,0),call(ids[0],command,ticket.id,1)]);a.ok(settled.every(r=>r.status===200));a.deepEqual(settled[0].data,settled[1].data);a.equal((await profile(ids[0])).fs,before.fs+settled[0].data.fs);}
 failed=true;const failure=await call(ids[0],{type:'visibility',visible:true});a.equal(failure.status,503);a.equal(failure.data.requestId,failure.reference);a.equal((await call(ids[0],{type:'visibility',visible:true})).status,200);
 for(const s of servers)s.observability.summary();const serialized=JSON.stringify(logs);for(const secret of [...ids,'private-server-secret','private-database-detail','Bearer'])a.equal(serialized.includes(secret),false,secret);
 a.ok(logs.some(l=>l.kind==='request'&&l.requestId===failure.reference&&l.status===503));a.ok(logs.some(l=>l.kind==='summary'&&l.rpcErrors>0));a.ok(logs.some(l=>l.kind==='summary'&&l.conflicts>0));a.ok(durations.length>100);
 durations.sort((a,b)=>a-b);console.log(JSON.stringify({scenario:'two-instance real SQL load',requests,accounts:ids.length,p50Ms:Math.round(durations[Math.floor(durations.length*.5)]),p95Ms:Math.round(durations[Math.floor(durations.length*.95)]),maxMs:Math.round(durations.at(-1)),totals:servers.map(s=>s.observability.snapshot()),limits:'PGlite executes SQL calls serially; not a production capacity benchmark'}));
 }finally{for(const s of servers)await new Promise(r=>s.close(r));await db.close();}
});
test('operational records normalize arbitrary routes and count slow or abandoned requests without private data',async()=>{
 const {EventEmitter}=require('node:events'),lines=[];let time=0;const m=require('../../_dev/online/observability.cjs').create({logger:x=>lines.push(JSON.parse(x)),now:()=>time});
 for(const abandoned of [false,true]){const res=new EventEmitter();res.setHeader=()=>{};res.statusCode=503;res.writableFinished=!abandoned;m.track({},res,'/private-player-name?access_token=secret',()=>{m.code('ECONOMY_BUSY');m.conflict();});time+=2000;res.emit(abandoned?'close':'finish');res.emit('close');}
 a.equal(m.snapshot().requests,2);a.equal(m.snapshot().aborted,1);a.equal(m.snapshot().slow,2);a.equal(m.snapshot().inFlight,0);a.deepEqual(Object.keys(m.snapshot().routes),['/other']);a.equal(JSON.stringify(lines).includes('secret'),false);a.equal(JSON.stringify(lines).includes('private-player-name'),false);
});
test('HTTP saturation returns retryable 503 while health stays responsive and the queue releases after failure',async t=>{
 let release,entered;const ready=new Promise(r=>entered=r),logs=[];
 const server=createServer({url:'https://example.supabase.co',key:'public',secret:'server',origins:'https://hemicycle.online',queueOptions:{limit:0},logger:x=>logs.push(JSON.parse(x)),fetch:async url=>{if(url.endsWith('/auth/v1/user'))return {ok:true,json:async()=>({id:'actor'})};entered();await new Promise(r=>release=r);return {ok:false,status:503,json:async()=>({})};}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));const base='http://127.0.0.1:'+server.address().port;
 const call=()=>fetch(base+'/economy',{method:'POST',headers:{Authorization:'Bearer test','Content-Type':'application/json'},body:JSON.stringify({operationId:uuid(),command:{type:'visibility',visible:true}})});
 const first=call();await ready;const saturated=await call();a.equal(saturated.status,503);a.equal(saturated.headers.get('retry-after'),'1');a.equal((await saturated.json()).code,'ECONOMY_BUSY');a.equal((await fetch(base+'/health')).status,200);release();a.equal((await first).status,503);a.equal(server.observability.snapshot().rejected,1);
});
test('log summary uses only the last cumulative sample of each instance and ignores private or malformed fields',()=>{
 const {summarize}=require('../../_dev/operations/summarize.cjs'),instanceId=uuid(),entry=(requests)=>JSON.stringify({event:'hemicycle.operations',kind:'summary',instanceId,requests,errors:1,body:'private'});
 const report=summarize(entry(10)+'\nRender prefix '+entry(20)+'\n{broken');a.equal(report.instances,1);a.equal(report.summaries[0].requests,20);a.equal(JSON.stringify(report).includes('private'),false);a.equal(summarize('unrelated log').instances,0);
});
