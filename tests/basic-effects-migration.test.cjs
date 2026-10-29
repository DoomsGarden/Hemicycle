'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),{PGlite}=require('@electric-sql/pglite');
const stable=({now,...context})=>context;
const Econ=require('../_dev/online/economy.cjs'),Engines=require('../_dev/online/offline-engines.cjs'),AI=require('../_dev/online/ai.cjs');
test('basic effects migration is idempotent, preserves old tickets and saves, allows v4 only to the server, and settles both versions once',async()=>{
 const db=new PGlite(),actor=crypto.randomUUID();
 const rpc=async(name,args)=>{await db.exec('reset role;set role service_role');return(await db.query('select public.'+name+'('+Object.keys(args).map((k,i)=>k+'=> $'+(i+1)).join(',')+') as v',Object.values(args).map(v=>v!==null&&typeof v==='object'?JSON.stringify(v):v))).rows[0].v;};
 try{
  await db.exec("create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;");
  for(const file of ['_dev/supabase/20261021_account_profiles.sql','_dev/supabase/20261021_cloud_saves.sql','_dev/online/rooms.sql','_dev/online/20261024_test_players.sql','_dev/online/20261024_private_combat.sql','_dev/online/20261024_matchmaking.sql','_dev/online/20261024_ranked_ai.sql','_dev/supabase/20261024_action_inventory.sql','_dev/online/20261025_ranked_rewards.sql','_dev/online/20261025_online_progress.sql','_dev/online/20261025_economy_authority.sql','_dev/online/20261026_reliability_balance.sql','_dev/online/20261029_balance_v3.sql'])await db.exec(fs.readFileSync(file,'utf8'));
  await db.query('insert into auth.users values($1)',[actor]);const payload=Econ.starter('HC-'+crypto.randomUUID(),Date.now());
  payload.profile.album=Econ.catalog.filter(c=>!c.action).map(c=>c.id);await rpc('hemicycle_economy_bootstrap',{p_actor:actor,p_payload:payload});
  const old=await rpc('hemicycle_offline_download',{p_actor:actor,p_rules:'offline3'}),contextBefore=await rpc('hemicycle_economy_context',{p_actor:actor});
  await db.exec('reset role');const migration=fs.readFileSync('_dev/online/20261029_basic_effects.sql','utf8');await db.exec(migration);await db.exec(migration);
  a.deepEqual(stable(await rpc('hemicycle_economy_context',{p_actor:actor})),stable(contextBefore));
  a.deepEqual(await rpc('hemicycle_offline_download',{p_actor:actor,p_rules:'offline3'}),old);
  const current=await rpc('hemicycle_offline_download',{p_actor:actor,p_rules:'offline4'});a.equal(current.length,10);a.ok(current.every(t=>t.rules==='offline4'));a.deepEqual(await rpc('hemicycle_offline_download',{p_actor:actor,p_rules:'offline4'}),current);
  a.ok((await rpc('hemicycle_offline_download',{p_actor:actor})).every(t=>t.rules==='offline1'));
  await a.rejects(rpc('hemicycle_offline_download',{p_actor:actor,p_rules:'offline5'}),/Reglas no compatibles/);
  for(const role of ['anon','authenticated']){await db.exec('reset role;set role '+role);await a.rejects(db.query("select public.hemicycle_offline_download($1,'offline4')",[actor]),/permission denied/);}
  for(const ticket of [old[0],current[0]]){
   const engine=Engines.forTicket(ticket),orators=ticket.profile.album.slice(0,5),cabinet={orators,leader:orators[0],actions:[]};let {state,rng}=engine.start(ticket,cabinet,'normal');const commands=[];
   for(let i=0;state.status==='active'&&i<1500;i++){const command=AI.choose(state,0,0);commands.push({at:0,command});state=engine.move(state,command,0,rng);}a.equal(state.status,'finished');
   const request={type:'offline-settle',ticketId:ticket.id,record:{mode:'normal',cabinet,commands}},context=await rpc('hemicycle_economy_context',{p_actor:actor,p_operation_id:ticket.id,p_request:request});
   const result=Econ.operate(context,actor,request),args={p_actor:actor,p_operation_id:ticket.id,p_request:request,p_version:context.version,p_market:result.market,p_updates:result.updates,p_result:result.result};
   const first=await rpc('hemicycle_economy_commit',args);const saved=await rpc('hemicycle_economy_context',{p_actor:actor});
   a.deepEqual(await rpc('hemicycle_economy_commit',args),first);a.deepEqual(stable(await rpc('hemicycle_economy_context',{p_actor:actor})),stable(saved));
  }
 }finally{await db.close();}
});
