'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),{PGlite}=require('@electric-sql/pglite');
const Econ=require('../_dev/online/economy.cjs'),Progress=require('../_dev/online/progression.cjs'),Boost=require('../js/victory-boost.js'),XP=require('../js/progression-xp.js'),Engine=require('../_dev/online/combat.cjs'),Cabinets=require('../js/cabinet-presets.js');
const migrations=['_dev/supabase/20261021_account_profiles.sql','_dev/supabase/20261021_cloud_saves.sql','_dev/online/rooms.sql','_dev/online/20261024_test_players.sql','_dev/online/20261024_private_combat.sql','_dev/online/20261024_matchmaking.sql','_dev/online/20261024_ranked_ai.sql','_dev/supabase/20261024_action_inventory.sql','_dev/online/20261025_ranked_rewards.sql','_dev/online/20261025_online_progress.sql','_dev/online/20261025_economy_authority.sql','_dev/online/20261026_reliability_balance.sql','_dev/online/20261029_balance_v3.sql','_dev/online/20261029_basic_effects.sql','_dev/online/20261029_basic_effects_wave2.sql','_dev/online/20261029_basic_state_priority.sql','_dev/online/20261030_debug_balance_v9.sql','_dev/online/20261030_clarity_balance_v10.sql','_dev/online/20261031_profile_xp_cosmetics.sql','_dev/online/20261031_automatic_legacy_import.sql','_dev/legal/20261029_legal_release.sql','_dev/releases/v32/deploy.sql'];
test('server boost transaction: fifth activation, next FS/XP, replay/conflict, client protection and 8+4 migration',async()=>{
 const db=new PGlite(),actor=crypto.randomUUID(),now=Date.now();
 const rpc=async(name,args={})=>(await db.query('select public.'+name+'('+Object.keys(args).map((k,i)=>k+'=> $'+(i+1)).join(',')+') as v',Object.values(args).map(v=>v!==null&&typeof v==='object'?JSON.stringify(v):v))).rows[0].v;
 const owner=async(role='service_role')=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[actor]);await db.exec('set role '+role);};
 const profile=async()=>{await db.exec('reset role');return(await db.query('select payload,revision from public.hemicycle_cloud_saves where user_id=$1',[actor])).rows[0];};
 try{
  await db.exec("create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;");
  for(const file of migrations)await db.exec(fs.readFileSync(file,'utf8'));
  await db.query('insert into auth.users values($1)',[actor]);const payload=Econ.starter('HC-'+crypto.randomUUID(),now,()=>.25);payload.profile.cabinets=Cabinets.state(payload.profile);
  for(let i=0;i<4;i++)Boost.settle(payload.profile,{win:true,fs:0,xp:0},now-10+i,()=>0);
  await owner();await rpc('hemicycle_economy_bootstrap',{p_actor:actor,p_payload:payload});const old=await rpc('hemicycle_offline_download',{p_actor:actor,p_rules:'offline9'});
  await db.exec('reset role');for(let n=0;n<2;n++)await db.exec(fs.readFileSync('_dev/online/20261107_review_v321.sql','utf8'));
  await owner();a.deepEqual(await rpc('hemicycle_offline_download',{p_actor:actor,p_rules:'offline9'}),old);a.equal((await rpc('hemicycle_offline_download',{p_actor:actor,p_rules:'offline10'})).length,10);
  async function finish(at,{stale=false,win=true}={}){
   await owner();const room=await rpc('hemicycle_ai_room',{p_actor:actor,p_request_id:crypto.randomUUID()}),ctx=await rpc('hemicycle_combat_context',{p_room_id:room.id,p_actor:actor});
   const state=Engine.initial('ranked');state.status='finished';state.winner=win?0:1;state.reason='100 votos';state.players=[{votes:win?110:30,leader:payload.profile.album[0]},{votes:win?30:110,leader:payload.profile.album[1]}];
   const progress=ctx.map((entry,side)=>entry?{userId:entry.userId,revision:entry.revision,...Progress.progress(entry.profile,state,side,at,()=>.9999)}:null);state.xpVersion='xp1';state.xpAwards=progress.map(p=>p?p.xpGain+p.boostXPGain:0);
   const args={p_room_id:room.id,p_actor:actor,p_expected_revision:0,p_state:state,p_operation_id:crypto.randomUUID(),p_request:{type:'test-finish'},p_progress:progress};
   if(stale){await db.exec('reset role');await db.query('update public.hemicycle_cloud_saves set revision=revision+1 where user_id=$1',[actor]);await owner();}
   const ok=await rpc('hemicycle_combat_commit_progress',args),receipt=await rpc('hemicycle_combat_load',{p_room_id:room.id,p_actor:actor});return {ok,args,receipt};
  }
  const fifth=await finish(now);a.equal(fifth.ok,true);a.equal(fifth.receipt.result.boost.activated.percent,50);a.equal(fifth.receipt.result.boost.bonusFS,0);a.equal(fifth.receipt.result.boost.bonusXP,0);
  const afterFifth=await profile();a.equal(afterFifth.payload.profile.victoryBoost.expiresAt,now+Boost.duration);a.equal(afterFifth.payload.profile.xp,100);
  await owner();a.equal(await rpc('hemicycle_combat_commit_progress',fifth.args),true);a.deepEqual((await profile()).payload,afterFifth.payload);
  const sixth=await finish(now+100);a.equal(sixth.ok,true);const gift=sixth.receipt.result.boost;a.equal(gift.appliedPercent,50);a.equal(gift.bonusFS,Math.floor(gift.baseFS*.5));a.equal(sixth.receipt.result.fs,gift.baseFS+gift.bonusFS);a.equal(gift.bonusXP,50);a.equal(sixth.receipt.state.xpAwards[0],150);
  const saved=await profile();a.equal(saved.payload.profile.xp,250);a.equal(saved.payload.profile.victoryBoost.activation,1);a.equal(saved.payload.profile.fs,afterFifth.payload.profile.fs+sixth.receipt.result.fs);
  const stale=await finish(now+200,{stale:true});a.equal(stale.ok,false);a.deepEqual((await profile()).payload,saved.payload);
  const loss=await finish(now+300,{win:false});a.equal(loss.receipt.result.boost.bonusXP,25);a.equal((await profile()).payload.profile.victoryBoost.streak,0);
  let cloud=await profile();await owner('authenticated');const forged=structuredClone(cloud.payload);forged.profile.victoryBoost.percent=49;await a.rejects(rpc('hemicycle_put_cloud_save',{p_payload:forged,p_expected_revision:cloud.revision,p_operation_id:crypto.randomUUID()}),/ventajas/);
  const reviewForgery=structuredClone(cloud.payload);reviewForgery.profile.revisionEvent={claimed:['fs']};await a.rejects(rpc('hemicycle_put_cloud_save',{p_payload:reviewForgery,p_expected_revision:cloud.revision,p_operation_id:crypto.randomUUID()}),/eventos/);
  // An old client omitting new fields cannot erase their canonical values.
  const oldClient=structuredClone(cloud.payload);delete oldClient.profile.victoryBoost;const put=await rpc('hemicycle_put_cloud_save',{p_payload:oldClient,p_expected_revision:cloud.revision,p_operation_id:crypto.randomUUID()});a.equal(put.status,'saved');a.deepEqual(put.save.payload.profile.victoryBoost,cloud.payload.profile.victoryBoost);
  cloud=await profile();await owner('authenticated');const switched=structuredClone(cloud.payload);switched.profile.cabinets.selected=1;switched.profile.cabinets.slots[1]=switched.profile.cabinets.slots[0];a.equal((await rpc('hemicycle_put_cloud_save',{p_payload:switched,p_expected_revision:cloud.revision,p_operation_id:crypto.randomUUID()})).status,'saved');
  for(const role of ['authenticated','anon']){await owner(role);await a.rejects(rpc('hemicycle_combat_commit_progress',fifth.args),/permission denied/);await a.rejects(rpc('hemicycle_combat_load_before_review321',{p_room_id:fifth.args.p_room_id,p_actor:actor}),/permission denied/);}
 }finally{await db.close();}
});
