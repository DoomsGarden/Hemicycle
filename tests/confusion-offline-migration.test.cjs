'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),{PGlite}=require('@electric-sql/pglite');
test('offline11 opt-in migration is idempotent and preserves the previous RPC, roles and old rules',async()=>{
 const db=new PGlite();try{await db.exec("create role anon;create role authenticated;create role service_role;create function public.hemicycle_offline_download(p_actor uuid,p_rules text) returns jsonb language plpgsql security definer set search_path='' as $$begin if p_rules not in ('offline1','offline9','offline10') then raise exception 'Reglas no compatibles.';end if;return jsonb_build_object('actor',p_actor,'rules',p_rules,'marker','preserved');end $$;");
 const migration=fs.readFileSync('_dev/online/20261108_confusion_actions2.sql','utf8');await db.exec(migration);const one=(await db.query("select pg_get_functiondef('public.hemicycle_offline_download(uuid,text)'::regprocedure) as d")).rows[0].d;await db.exec(migration);a.equal((await db.query("select pg_get_functiondef('public.hemicycle_offline_download(uuid,text)'::regprocedure) as d")).rows[0].d,one);
 for(const rules of ['offline1','offline9','offline10','offline11']){const row=(await db.query("select public.hemicycle_offline_download('00000000-0000-0000-0000-000000000001',$1) as v",[rules])).rows[0].v;a.equal(row.rules,rules);a.equal(row.marker,'preserved');}
 for(const role of ['anon','authenticated'])a.equal((await db.query("select has_function_privilege($1,'public.hemicycle_offline_download(uuid,text)','execute') as allowed",[role])).rows[0].allowed,false);
 a.equal((await db.query("select has_function_privilege('service_role','public.hemicycle_offline_download(uuid,text)','execute') as allowed")).rows[0].allowed,true);
 }finally{await db.close();}
});
test('new offline engine replays its seeded commands identically and keeps the old engine available',()=>{
 const E=require('../_dev/online/offline-v11.cjs'),Old=require('../_dev/online/offline-v10.cjs'),AI=require('../_dev/online/ai.cjs'),C=require('../js/orator-catalog.js'),A=require('../js/action-cards.js');const profile={album:C.cards.map(c=>c.id),actionAlbum:A.ids,elo:0,leagueDiv:3},orators=profile.album.slice(0,8),cabinet={orators,leader:orators[0],actions:['pregunta-enredada','duda-razonable','receso','replica']},ticket={rules:'offline11',seed:1792,profile};let {state,rng}=E.start(ticket,cabinet,'normal');const commands=[];
 for(let i=0;state.status==='active'&&i<800;i++){const command=AI.choose(state,0,0);commands.push({at:0,command});state=E.move(state,command,0,rng);}
 a.equal(state.status,'finished');const replay=E.replay(ticket,{cabinet,mode:'normal',commands});a.deepEqual(replay,state);a.equal(state.actionEffectsVersion,2);a.equal(Old.start({...ticket,rules:'offline10'},cabinet,'normal').state.actionEffectsVersion,1);
});
