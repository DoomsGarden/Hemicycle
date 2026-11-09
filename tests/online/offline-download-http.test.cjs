'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {PGlite}=require('@electric-sql/pglite'),{createServer}=require('../../_dev/online/server.cjs');
const Offline=require('../../_dev/online/offline-engines.cjs'),E=require('../../_dev/online/economy.cjs');
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
 const db=new PGlite(),actor=crypto.randomUUID();let server;
 const rpc=async(name,args)=>(await db.query('select public.'+name+'('+Object.keys(args).map((k,i)=>k+'=> $'+(i+1)).join(',')+') as v',Object.values(args).map(v=>v!==null&&typeof v==='object'?JSON.stringify(v):v))).rows[0].v;
 try{
  await db.exec("create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;");
  for(const file of migrations)await db.exec(fs.readFileSync(file,'utf8'));
  await db.query('insert into auth.users values($1)',[actor]);
  const payload=E.starter('HC-'+crypto.randomUUID(),Date.now());
  payload.profile.album=E.catalog.filter(c=>!c.action).map(c=>c.id);
  payload.profile.actionAlbum=E.catalog.filter(c=>c.action).map(c=>c.id);
  payload.profile.w=415;payload.profile.l=56;payload.profile.fs=3929;payload.profile.elo=3738;
  await db.exec('set role service_role');await rpc('hemicycle_economy_bootstrap',{p_actor:actor,p_payload:payload});
  const saved=async()=>(await rpc('hemicycle_economy_context',{p_actor:actor})).accounts[actor].payload;
  const before=await saved();
  server=createServer({url:'https://example.supabase.co',key:'public',secret:'server',origins:'https://hemicycle.online',logger:()=>{},fetch:async(url,options)=>{
   if(url.endsWith('/auth/v1/user'))return options.headers.Authorization==='Bearer test-session'?{ok:true,json:async()=>({id:actor})}:{ok:false,status:401};
   try{const data=await rpc(url.split('/').at(-1),JSON.parse(options.body));return {ok:true,json:async()=>data};}
   catch(error){return {ok:false,status:400,json:async()=>({code:error.code,message:error.message})};}
  }});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+server.address().port;
  async function call(path,body,token='test-session'){
   const response=await fetch(base+path,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',Origin:'https://hemicycle.online'},body:JSON.stringify(body)});
   return {status:response.status,data:await response.json()};
  }
  a.equal((await call('/offline/tickets',{rules:'offline11'},'invalid')).status,401);
  let newest;
  for(const rules of Offline.versions){const r=await call('/offline/tickets',{rules});a.equal(r.status,200,JSON.stringify(r));a.equal(r.data.length,10);a.ok(r.data.every(ticket=>ticket.rules===rules));a.ok(Offline.forTicket(r.data[0]));if(rules==='offline11')newest=r.data;}
  a.ok(newest,'latest published client rules are downloadable');
  a.deepEqual((await call('/offline/tickets',{rules:'offline11'})).data,newest,'retries reuse unused preparations');
  a.ok((await call('/offline/tickets',{})).data.every(ticket=>ticket.rules==='offline1'));
  for(const rules of ['offline12','__proto__','toString',{},['offline11'],11])a.equal((await call('/offline/tickets',{rules})).status,400);
  a.deepEqual(await saved(),before,'downloading/rejecting rules never changes resources');
  const ticket=newest[0],engine=Offline.forTicket(ticket),AI=require('../../_dev/online/ai.cjs');
  const cabinet={orators:ticket.profile.album.slice(0,8),leader:ticket.profile.album[0],actions:ticket.profile.actionAlbum.slice(0,4)};
  let {state,rng}=engine.start(ticket,cabinet,'normal');const commands=[];
  for(let i=0;state.status==='active'&&i<1500;i++){const command=AI.choose(state,0,0);commands.push({at:0,command});state=engine.move(state,command,0,rng);}
  a.equal(state.status,'finished');
  const record={cabinet,mode:'normal',commands},settle={ticketId:ticket.id,operationId:ticket.id,record};
  const first=await call('/offline/settle',settle);a.equal(first.status,200,JSON.stringify(first));
  const after=await saved();a.equal(after.profile.w+after.profile.l,472);
  a.deepEqual(await call('/offline/settle',settle),first,'same receipt after retry');a.deepEqual(await saved(),after,'no duplicate rewards');
  // A replay with changed data cannot replace a previously confirmed result.
  const conflict=await call('/offline/settle',{...settle,record:{...record,mode:'rapida'}});
  a.equal(conflict.status,503);a.equal(conflict.data.code,'ECONOMY_OPERATION_CONFLICT');a.deepEqual(await saved(),after);
  await db.exec('reset role');
  await db.query("insert into public.hemicycle_account_profiles(user_id,nickname,nickname_changed_at) values($1,'DoomsGarden',now())",[actor]);
  const diagnose=async()=>{const results=await db.exec(fs.readFileSync('_dev/revisions/20261109-offline-api/diagnostico-solo-lectura.sql','utf8'));return results.find(r=>r.rows?.[0]?.diagnostico).rows[0].diagnostico;};
  const diagnostic=await diagnose();a.equal(diagnostic.offline11_habilitado,true);a.equal(diagnostic.cuentas_coincidentes,1);a.equal(diagnostic.guardados[0].identidad_coincide,true);
  a.ok(!JSON.stringify(diagnostic).includes(actor));a.deepEqual(await saved(),after);
  // A mismatched binding must stop the transaction, never silently relink it.
  await db.query('update public.hemicycle_cloud_saves set source_id=$1 where user_id=$2',['HC-'+crypto.randomUUID(),actor]);
  await db.exec('set role service_role');
  const rejected=await call('/economy',{operationId:crypto.randomUUID(),command:{type:'pack',kind:'comun',quantity:1}});
  a.equal(rejected.status,503);a.equal(rejected.data.code,'ECONOMY_IDENTITY_CONFLICT');a.deepEqual(await saved(),after);
  await db.exec('reset role');a.equal((await diagnose()).guardados[0].identidad_coincide,false);
 }finally{if(server)await new Promise(r=>server.close(r));await db.close();}
});
