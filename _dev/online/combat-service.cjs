'use strict';
const E=require('./combat.cjs'),crypto=require('node:crypto');
function create({url,key,secret,fetcher=fetch,observe={conflict(){}}}){
 async function rpc(name,args){const response=await fetcher(url.replace(/\/$/,'')+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('No se pudo guardar o recuperar el combate. Comprueba el SQL y la configuración del servidor.');return response.json();}
 async function resultSnapshot(load,roomId,actor){
  const state=load.state;let result=load.result||null;
  if(state?.status==='finished'&&state.mode==='ranked'&&result){
   if(state.lootVersion===1){
    const participants=await rpc('hemicycle_combat_context',{p_room_id:roomId,p_actor:actor}),owner=participants[0].userId;
    const request={type:'ranked-loot',roomId,recipient:participants[1]?.userId||null};let receipt;const receipts={[actor]:load.result};
    for(const p of participants)if(p&&p.userId!==actor){const other=await rpc('hemicycle_combat_load',{p_room_id:roomId,p_actor:p.userId,p_operation_id:null,p_request:null});receipts[p.userId]=other.result;}
    for(let i=0;i<5;i++){
     const context=await rpc('hemicycle_economy_context',{p_actor:owner,p_operation_id:roomId,p_request:request});
     if(context.processed){receipt=context.result;break;}
     const next=require('./ranked-loot.cjs').settle(context,state,participants,undefined,{roomId,receipts});
     if(await rpc('hemicycle_economy_commit',{p_actor:owner,p_operation_id:roomId,p_request:request,p_version:context.version,p_market:next.market,p_updates:next.updates,p_result:next.result})){const canonical=await rpc('hemicycle_economy_context',{p_actor:owner,p_operation_id:roomId,p_request:request});if(canonical.processed){receipt=canonical.result;break;}}
     observe.conflict();await new Promise(resolve=>setTimeout(resolve,10*(i+1)));
    }
    if(!receipt?.players?.[actor])throw Error('No se pudo verificar el cromo de la partida. Reintenta para recuperar el resultado.');
    result={...result,...receipt.players[actor]};
   }else result={...result,lootStatus:'legacy'};
  }
  if(state?.status==='finished'&&state.xpVersion==='xp1'&&Array.isArray(state.xpAwards))result={...result,xp:state.xpAwards[load.side]||0};
  return {...E.project(state||E.initial(load.mode||'normal'),load.side,load.revision,load.now),rankedElo:load.rating,result,opponentKind:load.opponentKind||'player'};
 }
 return async function handle(auth,roomId,command,operationId){
  if(!secret){const e=Error('Combate pendiente de configurar: falta la clave privada en Render.');e.status=503;throw e;}
  const identity=await fetcher(url.replace(/\/$/,'')+'/auth/v1/user',{headers:{apikey:key,Authorization:auth},signal:AbortSignal.timeout(8000)});if(!identity.ok){const e=Error('Inicia sesión de nuevo.');e.status=401;throw e;}const actor=(await identity.json()).id;if(!actor)throw Error('Cuenta no válida.');
  const request=command||null,AI=require('./ai.cjs');
  for(let attempt=0;attempt<5;attempt++){
   const load=await rpc('hemicycle_combat_load',{p_room_id:roomId,p_actor:actor,p_operation_id:operationId||null,p_request:request}),state=load.state||E.initial(load.mode||'normal');
   if(load.processed)return resultSnapshot(load,roomId,actor);
   let context=null;if(command?.type==='ready')context=await rpc('hemicycle_combat_context',{p_room_id:roomId,p_actor:actor});
   let next=structuredClone(state);const timedOut=E.timeout(next,load.now);
   if(!timedOut&&command)next=E.apply(state,load.side,command,load.now,undefined,context?.[load.side]?.profile);
   if(load.opponentKind==='ai'&&command?.type==='ready'&&!next.players[1])next=E.apply(next,1,{type:'ready',cabinet:AI.cabinet(command.cabinet,load.rating||0,undefined,load.mode==='ranked'?undefined:command.cabinet.orators.map(id=>E.catalog[id].r))},load.now);
   if(load.opponentKind==='ai')next=AI.advance(next,load.now);
   if(!timedOut&&!command)return resultSnapshot(load,roomId,actor);
   const args={p_room_id:roomId,p_actor:actor,p_expected_revision:load.revision,p_state:next,p_operation_id:operationId||crypto.randomUUID(),p_request:request||{type:'timeout'}};
   if(next.status==='finished'){
    if(next.mode==='ranked'&&state.status!=='finished')next.lootVersion=1;
    context=await rpc('hemicycle_combat_context',{p_room_id:roomId,p_actor:actor});
    args.p_progress=context.map((entry,side)=>entry?{userId:entry.userId,revision:entry.revision,...require('./progression.cjs').progress(entry.profile,next,side,load.now)}:null);
    next.xpVersion='xp1';next.xpAwards=args.p_progress.map(p=>p?p.xpGain:0);
   }
   const ok=await rpc(next.status==='finished'?'hemicycle_combat_commit_progress':'hemicycle_combat_commit',args);
   if(!ok)observe.conflict();
   if(ok){const saved=await rpc('hemicycle_combat_load',{p_room_id:roomId,p_actor:actor,p_operation_id:null,p_request:null});return resultSnapshot(saved,roomId,actor);}
  }
  throw Error('El estado cambió. Actualiza la partida y reintenta.');
 };
}
module.exports={create};
