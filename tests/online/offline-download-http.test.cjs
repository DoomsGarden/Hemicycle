'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const path=require('node:path'),{PGlite}=require('@electric-sql/pglite');
const workspace=path.resolve(__dirname,'../..');
const override=process.env.HEMICYCLE_RELEASE_STAGE;
const root=override?path.resolve(override):workspace;
const online=name=>require(path.join(root,'_dev/online',name+'.cjs'));
const {createServer}=online('server'),Offline=online('offline-engines'),E=online('economy');
const staged=Offline.supports('offline12');
const oldIds=new Set(require('../../_dev/online/frozen-v11/orator-catalog.js').cards.map(c=>c.id));
const migrations=[
 '_dev/supabase/20261021_account_profiles.sql','_dev/supabase/20261021_cloud_saves.sql',
 '_dev/online/rooms.sql','_dev/online/20261024_test_players.sql','_dev/online/20261024_private_combat.sql',
 '_dev/online/20261024_matchmaking.sql','_dev/online/20261024_ranked_ai.sql','_dev/supabase/20261024_action_inventory.sql',
 '_dev/online/20261025_ranked_rewards.sql','_dev/online/20261025_online_progress.sql','_dev/online/20261025_economy_authority.sql',
 '_dev/online/20261026_reliability_balance.sql','_dev/online/20261029_balance_v3.sql','_dev/online/20261029_basic_effects.sql',
 '_dev/online/20261029_basic_effects_wave2.sql','_dev/online/20261029_basic_state_priority.sql',
 '_dev/online/20261030_debug_balance_v9.sql','_dev/online/20261030_clarity_balance_v10.sql',
 '_dev/online/20261031_profile_xp_cosmetics.sql','_dev/online/20261031_automatic_legacy_import.sql',
 '_dev/legal/20261029_legal_release.sql','_dev/releases/v32/deploy.sql',
 '_dev/online/20261107_review_v321.sql','_dev/online/20261108_confusion_actions2.sql'
];
test('authenticated HTTP download, match and settlement use the same engine registry and real SQL',async t=>{
 const db=new PGlite(),actor=crypto.randomUUID(),other=crypto.randomUUID();let server;
 const rpc=async(name,args)=>(await db.query('select public.'+name+'('+Object.keys(args).map((k,i)=>k+'=> $'+(i+1)).join(',')+') as v',Object.values(args).map(v=>v!==null&&typeof v==='object'?JSON.stringify(v):v))).rows[0].v;
 try{
  await db.exec("create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;");
  for(const file of migrations)await db.exec(fs.readFileSync(file,'utf8'));
  if(staged){
   const migration=fs.readFileSync('_dev/expansions/gb-de/release/deploy.sql','utf8');
   await db.exec(migration);await db.exec(migration);
   const privileges=await db.query("select has_function_privilege('anon','public.hemicycle_offline_download(uuid,text)','EXECUTE') as anon,has_function_privilege('authenticated','public.hemicycle_offline_download(uuid,text)','EXECUTE') as auth");
   a.deepEqual(privileges.rows,[{anon:false,auth:false}]);
  }
  await db.query('insert into auth.users values($1),($2)',[actor,other]);
  const payload=E.starter('HC-'+crypto.randomUUID(),Date.now());
  payload.profile.album=E.catalog.filter(c=>oldIds.has(c.id)).map(c=>c.id);
  payload.profile.actionAlbum=E.catalog.filter(c=>c.action).map(c=>c.id);
  payload.profile.w=415;payload.profile.l=56;payload.profile.fs=3929;payload.profile.elo=3738;
  await db.exec('set role service_role');await rpc('hemicycle_economy_bootstrap',{p_actor:actor,p_payload:payload});
  const saved=async()=>(await rpc('hemicycle_economy_context',{p_actor:actor})).accounts[actor].payload;
  const before=await saved();
  server=createServer({url:'https://example.supabase.co',key:'public',secret:'server',origins:'https://hemicycle.online',logger:()=>{},fetch:async(url,options)=>{
   if(url.endsWith('/auth/v1/user')){const id=options.headers.Authorization==='Bearer test-session'?actor:options.headers.Authorization==='Bearer other-session'?other:null;return id?{ok:true,json:async()=>({id})}:{ok:false,status:401};}
   try{const data=await rpc(url.split('/').at(-1),JSON.parse(options.body));return {ok:true,json:async()=>data};}
   catch(error){return {ok:false,status:400,json:async()=>({code:error.code,message:error.message})};}
  }});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+server.address().port;
  async function call(path,body,token='test-session',includeEdition=true){
   const headers={Authorization:'Bearer '+token,'Content-Type':'application/json',Origin:'https://hemicycle.online'};
   if(staged&&includeEdition)headers['X-Hemicycle-Catalog']='gb-de-2010-2026';
   const response=await fetch(base+path,{method:'POST',headers,body:JSON.stringify(body)});
   return {status:response.status,data:await response.json()};
  }
  a.equal((await call('/offline/tickets',{rules:'offline11'},'invalid')).status,401);
  let newest;
  for(const rules of Offline.versions){const r=await call('/offline/tickets',{rules});a.equal(r.status,200,JSON.stringify(r));a.equal(r.data.length,10);a.ok(r.data.every(ticket=>ticket.rules===rules));a.ok(Offline.forTicket(r.data[0]));if(rules==='offline11')newest=r.data;}
  a.ok(newest,'latest published client rules are downloadable');
  a.deepEqual((await call('/offline/tickets',{rules:'offline11'})).data,newest,'retries reuse unused preparations');
  a.ok((await call('/offline/tickets',{})).data.every(ticket=>ticket.rules==='offline1'));
  const invalidRules=staged?['offline13']:['offline12'];
  for(const rules of invalidRules.concat(['__proto__','toString',{},['offline11'],11]))a.equal((await call('/offline/tickets',{rules})).status,400);
  a.deepEqual(await saved(),before,'downloading/rejecting rules never changes resources');
  const ticket=newest[0],engine=Offline.forTicket(ticket),AI=require('../../_dev/online/ai.cjs');
  const cabinet={orators:ticket.profile.album.slice(0,8),leader:ticket.profile.album[0],actions:ticket.profile.actionAlbum.slice(0,4)};
  let {state,rng}=engine.start(ticket,cabinet,'normal');const commands=[];
  for(let i=0;state.status==='active'&&i<1500;i++){const command=AI.choose(state,0,0);commands.push({at:0,command});state=engine.move(state,command,0,rng);}
  a.equal(state.status,'finished');
  const record={ticketId:ticket.id,startedAt:Date.now(),cabinet,mode:'normal',commands},settle={ticketId:ticket.id,operationId:ticket.id,record};
  const first=await call('/offline/settle',settle);a.equal(first.status,200,JSON.stringify(first));
  const after=await saved();a.equal(after.profile.w+after.profile.l,472);
  a.deepEqual(await call('/offline/settle',settle),first,'same receipt after retry');a.deepEqual(await saved(),after,'no duplicate rewards');
  // An already consumed ticket returns its one canonical receipt. Changed
  // clocks or gameplay cannot replace that outcome or trigger another payout.
  for(const changed of [{...record,startedAt:record.startedAt+1},{...record,mode:'rapida',commands:[]}]){
   a.deepEqual(await call('/offline/settle',{...settle,record:changed}),first);a.deepEqual(await saved(),after);
  }
  const foreign=await call('/offline/settle',settle,'other-session');a.equal(foreign.status,409);a.equal(foreign.data.code,'OFFLINE_TICKET_UNAVAILABLE');a.equal(foreign.data.fs,undefined);
  if(staged){
   a.equal(Offline.versions.at(-1),'offline12');
   const health=await (await fetch(base+'/health')).json();
   a.equal(health.catalogEdition,'gb-de-2010-2026');a.equal(health.catalogOrators,1767);
   const catalog=require(path.join(root,'js/orator-catalog.js'));
   const newOrators=catalog.cards.filter(c=>!oldIds.has(c.id));
   a.equal(newOrators.length,868);
   const art=require(path.join(root,'js/orator-art.js'));
   const oldPortrait=[...oldIds].find(id=>art[id]?.columns===1&&!fs.existsSync(path.join(root,'cards',id+'.webp')));
   a.ok(oldPortrait);
   for(const id of [oldPortrait,newOrators[0].id]){
    const photo=await fetch(base+'/rooms-test/portraits/'+id+'.webp');
    a.equal(photo.status,200,id);a.equal(photo.headers.get('Content-Type'),'image/webp');
    a.ok((await photo.arrayBuffer()).byteLength>0);
   }
   a.equal((await fetch(base+'/rooms-test/portraits/inexistent-card.webp')).status,404);
   const roster=['GB','DE'].flatMap(country=>newOrators.filter(c=>c.country===country).slice(0,4)).map(c=>c.id);
   const fixture=E.starter('HC-'+crypto.randomUUID(),Date.parse('2026-11-21T12:00:00Z'));
   fixture.profile.album=roster;fixture.profile.actionAlbum=payload.profile.actionAlbum.slice(0,4);
   await rpc('hemicycle_economy_bootstrap',{p_actor:other,p_payload:fixture});
   async function otherState(){return (await rpc('hemicycle_economy_context',{p_actor:other})).accounts[other].payload;}
   const response=await call('/offline/tickets',{rules:'offline12'},'other-session');
   a.equal(response.status,200,JSON.stringify(response));
   const future=response.data[0],cabinet={orators:roster,leader:roster[0],actions:fixture.profile.actionAlbum};
   a.deepEqual(new Set(future.profile.album),new Set(roster));
   const replay={cabinet,mode:'normal',startedAt:Date.now(),commands:[{at:1000,command:{type:'resign'}}]};
   const args={operationId:future.id,ticketId:future.id,record:replay},result=await call('/offline/settle',args,'other-session');
   a.equal(result.status,200,JSON.stringify(result));a.equal(result.data.win,false);
   const afterMatch=await otherState();a.equal(afterMatch.profile.l,1);
   a.deepEqual(await call('/offline/settle',args,'other-session'),result);
   a.deepEqual(await otherState(),afterMatch);
   const claim={operationId:crypto.randomUUID(),command:{type:'expansion-claim',event:'expansion-gb-de-2026-11',grant:'fs'}};
   const stale=await call('/economy',claim,'other-session',false);
   a.equal(stale.status,503);a.equal(stale.data.code,'CATALOG_UPDATE_REQUIRED');
   a.deepEqual(await otherState(),afterMatch);
   a.deepEqual(await call('/offline/settle',settle,'test-session',false),first,'older clients can still confirm old match results');
   const event=await call('/economy',claim,'other-session');
   a.equal(event.status,200,JSON.stringify(event));a.equal(event.data.fs,10000);
   a.deepEqual(await call('/economy',claim,'other-session'),event);
   a.equal((await otherState()).profile.fs,afterMatch.profile.fs+10000);
  }
  // Recovery is never used for a different operation type, an uncommitted
  // ticket or a colliding unrelated operation ID.
  const strict=await call('/economy',{operationId:ticket.id,command:{type:'pack',kind:'comun',quantity:1}});
  a.equal(strict.status,503);a.equal(strict.data.code,'ECONOMY_OPERATION_CONFLICT');a.deepEqual(await saved(),after);
  const unused=newest[1];a.equal((await call('/economy',{operationId:unused.id,command:{type:'format-upgrade'}})).status,200);
  const beforeCollision=await saved(),collision=await call('/offline/settle',{...settle,operationId:unused.id,ticketId:unused.id});
  a.equal(collision.status,409);a.equal(collision.data.code,'OFFLINE_RECEIPT_CONFLICT');a.deepEqual(await saved(),beforeCollision);
  const unrelated=await call('/offline/settle',{...settle,operationId:unused.id});a.equal(unrelated.status,409);a.equal(unrelated.data.code,'OFFLINE_RECEIPT_CONFLICT');a.deepEqual(await saved(),beforeCollision);
  await db.exec('reset role');
  await db.query("insert into public.hemicycle_account_profiles(user_id,nickname,nickname_changed_at) values($1,'DoomsGarden',now())",[actor]);
  const diagnose=async()=>{const results=await db.exec(fs.readFileSync('_dev/revisions/20261109-offline-api/diagnostico-solo-lectura.sql','utf8'));return results.find(r=>r.rows?.[0]?.diagnostico).rows[0].diagnostico;};
  const diagnostic=await diagnose();a.equal(diagnostic.offline11_habilitado,true);a.equal(diagnostic.cuentas_coincidentes,1);a.equal(diagnostic.guardados[0].identidad_coincide,true);
  a.ok(!JSON.stringify(diagnostic).includes(actor));a.deepEqual(await saved(),beforeCollision);
  // A mismatched binding must stop the transaction, never silently relink it.
  await db.query('update public.hemicycle_cloud_saves set source_id=$1 where user_id=$2',['HC-'+crypto.randomUUID(),actor]);
  await db.exec('set role service_role');
  const rejected=await call('/economy',{operationId:crypto.randomUUID(),command:{type:'pack',kind:'comun',quantity:1}});
  a.equal(rejected.status,503);a.equal(rejected.data.code,'ECONOMY_IDENTITY_CONFLICT');a.deepEqual(await saved(),beforeCollision);
  await db.exec('reset role');a.equal((await diagnose()).guardados[0].identidad_coincide,false);
 }finally{if(server)await new Promise(r=>server.close(r));await db.close();}
});
