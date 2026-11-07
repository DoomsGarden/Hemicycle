'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),{PGlite}=require('@electric-sql/pglite');
const E=require('../_dev/online/economy.cjs'),Backup=require('../js/player-backup.js');
const migration=fs.readFileSync('_dev/online/20261031_automatic_legacy_import.sql','utf8');
const source=fs.readFileSync('_dev/online/20261025_economy_authority.sql','utf8');
const copy=x=>JSON.parse(JSON.stringify(x));
const payload=()=>{const p=E.starter('HC-'+crypto.randomUUID(),Date.now());delete p.profile.cabinets;p.profile.actionAlbum=['replica','receso'];p.profile.album=require('../_dev/expansions/activation-v32/baseline/orator-catalog.js').cards.slice(0,30).map(c=>c.id);return p;};
test('automatic initial imports approve pending and new requests exactly once, preserving existing clouds and private audit',async()=>{
 const db=new PGlite();try{
  await db.exec("create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;");
  for(const f of ['_dev/supabase/20261021_account_profiles.sql','_dev/supabase/20261021_cloud_saves.sql'])await db.exec(fs.readFileSync(f,'utf8'));
  await db.exec(source.slice(source.indexOf('create or replace function public.hemicycle_economy_bootstrap'),source.indexOf('create or replace function public.hemicycle_offline_download')));
  await db.exec(source.slice(source.indexOf('create table if not exists public.hemicycle_legacy_import_requests'),source.indexOf('create or replace function public.hemicycle_combat_commit_progress')));
  const query=async(sql,args=[])=> (await db.query(sql,args.map(v=>v&&typeof v==='object'?JSON.stringify(v):v))).rows;
  const rpc=async(name,...args)=>(await query('select public.'+name+'('+args.map((_,i)=>'$'+(i+1)).join(',')+') as result',args))[0].result;
  let seq=0;async function pending(p=payload()){const id=crypto.randomUUID();await query('insert into auth.users values($1)',[id]);await query("insert into public.hemicycle_legacy_import_requests(user_id,payload,submitted_at) values($1,$2,'2026-10-01'::timestamptz+$3*interval '1 second')",[id,p,++seq]);return {id,p};}
  const good=payload();good.profile.fs=8765432;good.profile.w=356;good.profile.l=39;good.profile.elo=3531;good.profile.xp=108;good.profile.actionAlbum=['replica','receso'];good.profile.cosmetics={menu:'book',mat:'cats',back:'orbital',coin:'imperial'};
  const first=await pending(good),cloud=await pending(),bad=await pending(),duplicate=await pending(copy(good)),second=await pending(),rejected=await pending();
  const different=payload();await rpc('hemicycle_economy_bootstrap',cloud.id,different);
  await query("update public.hemicycle_legacy_import_requests set payload=jsonb_set(payload,'{profile,fs}','-1') where user_id=$1",[bad.id]);
  await db.exec("create table public.hemicycle_import_reviews(user_id uuid not null references auth.users(id),payload_hash text not null,decision text not null,reason text not null,reviewed_by text not null,reviewed_at timestamptz not null default now(),primary key(user_id,payload_hash));");
  await query("insert into public.hemicycle_import_reviews(user_id,payload_hash,decision,reason,reviewed_by) select user_id,md5(payload::text),'reject','Rechazo administrativo anterior','admin' from public.hemicycle_legacy_import_requests where user_id=$1",[rejected.id]);
  await db.exec(migration);
  for(const row of [first,second]){a.deepEqual((await query('select payload,revision,source_id from public.hemicycle_cloud_saves where user_id=$1',[row.id]))[0],{payload:row.p,revision:1,source_id:row.p.identity.id});a.ok((await query('select approved_at from public.hemicycle_legacy_import_requests where user_id=$1',[row.id]))[0].approved_at);}
  a.deepEqual((await query('select payload from public.hemicycle_cloud_saves where user_id=$1',[cloud.id]))[0].payload,different);
  a.deepEqual(await rpc('hemicycle_accept_pending_imports'),{approved:0,skipped:{existing_cloud:1,invalid:1,source_conflict:1,rejected:1}});
  await db.exec(migration);a.equal((await query("select count(*)::int n from public.hemicycle_import_reviews where decision='approve'"))[0].n,2);
  const actor=crypto.randomUUID(),p=payload();await query('insert into auth.users values($1)',[actor]);
  a.deepEqual(await rpc('hemicycle_request_legacy_import',actor,p),{status:'approved',alreadyApproved:false});
  const saved=(await query('select * from public.hemicycle_cloud_saves where user_id=$1',[actor]))[0];
  const retry=copy(p);retry.exportedAt='later';retry.gameVersion='later';a.deepEqual(await rpc('hemicycle_request_legacy_import',actor,retry),{status:'approved',alreadyApproved:true});
  a.deepEqual((await query('select * from public.hemicycle_cloud_saves where user_id=$1',[actor]))[0],saved);
  const changed=copy(p);changed.profile.fs++;a.equal((await rpc('hemicycle_request_legacy_import',actor,changed)).status,'existing_cloud');
  await query("update public.hemicycle_cloud_saves set payload=jsonb_set(payload,'{profile,fs}','2500'),revision=revision+1 where user_id=$1",[actor]);
  a.equal((await rpc('hemicycle_request_legacy_import',actor,p)).status,'approved');a.equal((await query('select revision,payload from public.hemicycle_cloud_saves where user_id=$1',[actor]))[0].payload.profile.fs,2500);
  const hash=(await query('select md5(payload::text) hash from public.hemicycle_legacy_import_requests where user_id=$1',[bad.id]))[0].hash;
  a.equal((await rpc('hemicycle_accept_legacy_import',bad.id,'0'.repeat(32))).status,'changed');
  a.equal((await rpc('hemicycle_accept_legacy_import',bad.id,hash)).status,'invalid');
  for(const edit of [p=>p.profile.fs=-1,p=>p.profile.w=.1,p=>p.profile.elo='100',p=>p.profile.album=['unknown'],p=>p.profile.album=[3],p=>p.profile.actionAlbum=['unknown'],p=>p.profile.dtGoldActive='bad',p=>p.profile.xp=Number.MAX_SAFE_INTEGER,p=>p.identity.id='bad']){const v=payload();edit(v);a.equal(await rpc('hemicycle_legacy_import_valid',v),false);}
  await query('update public.hemicycle_cloud_saves set payload=null where user_id=$1',[actor]);a.equal((await rpc('hemicycle_request_legacy_import',actor,p)).status,'consumed');
  for(const role of ['anon','authenticated']){await db.exec('set role '+role);await a.rejects(rpc('hemicycle_request_legacy_import',actor,p),/permission denied/);await a.rejects(rpc('hemicycle_accept_pending_imports'),/permission denied/);await a.rejects(query('select * from public.hemicycle_import_reviews'),/permission denied/);await db.exec('reset role');}
  await db.exec('set role service_role');a.equal((await rpc('hemicycle_accept_pending_imports')).approved,0);await db.exec('reset role');
 }finally{await db.close();}
});

test('the authenticated import service validates the entire backup before RPC and translates conflicts',async()=>{
 const {create}=require('../_dev/online/economy-service.cjs');const actor=crypto.randomUUID(),seen=[];let result={status:'approved',alreadyApproved:false};
 const service=create({url:'https://test.invalid',key:'public',secret:'private',fetcher:async(url,args)=>url.endsWith('/auth/v1/user')?{ok:true,json:async()=>({id:actor})}:(seen.push(JSON.parse(args.body)),{ok:true,json:async()=>result})});
 const p=payload();p.executable='ignored';a.equal((await service('Bearer local','/economy/import-request','POST',{payload:p,userId:'not-the-actor'})).status,'approved');a.equal(seen[0].p_actor,actor);a.equal(seen[0].p_payload.executable,undefined);a.deepEqual(seen[0].p_payload,Backup.validate(p,E.catalog.filter(c=>!c.action).map(c=>c.id)));
 const invalid=payload();invalid.profile.cabinets={selected:9,slots:[]};await a.rejects(service('Bearer local','/economy/import-request','POST',{payload:invalid}),e=>e.status===400&&e.code==='IMPORT_INVALID');a.equal(seen.length,1);
 for(const [status,code]of Object.entries({existing_cloud:'CLOUD_RESTORE_REQUIRED',source_conflict:'IMPORT_ALREADY_LINKED',rejected:'IMPORT_REJECTED',invalid:'IMPORT_INVALID',changed:'IMPORT_CHANGED',consumed:'IMPORT_CONSUMED'})){result={status};await a.rejects(service('Bearer local','/economy/import-request','POST',{payload:p}),e=>e.status===409&&e.code===code);}
 result={status:'pending'};a.equal((await service('Bearer local','/economy/import-request','POST',{payload:p})).status,'pending');result={unexpected:true};await a.rejects(service('Bearer local','/economy/import-request','POST',{payload:p}),e=>e.status===503);
});
