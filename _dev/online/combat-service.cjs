'use strict';
const E=require('./combat.cjs'),crypto=require('node:crypto');
function create({url,key,secret,fetcher=fetch}){
 async function rpc(name,args){const response=await fetcher(url.replace(/\/$/,'')+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('No se pudo guardar o recuperar el combate. Comprueba el SQL y la configuración del servidor.');return response.json();}
 return async function handle(auth,roomId,command,operationId){
  if(!secret){const e=Error('Combate pendiente de configurar: falta la clave privada en Render.');e.status=503;throw e;}
  const identity=await fetcher(url.replace(/\/$/,'')+'/auth/v1/user',{headers:{apikey:key,Authorization:auth},signal:AbortSignal.timeout(8000)});if(!identity.ok){const e=Error('Inicia sesión de nuevo.');e.status=401;throw e;}const actor=(await identity.json()).id;if(!actor)throw Error('Cuenta no válida.');
  const request=command||null,AI=require('./ai.cjs');
  for(let attempt=0;attempt<5;attempt++){
   const load=await rpc('hemicycle_combat_load',{p_room_id:roomId,p_actor:actor,p_operation_id:operationId||null,p_request:request}),state=load.state||E.initial(load.mode||'normal');
   if(load.processed)return {...E.project(state,load.side,load.revision,load.now),rankedElo:load.rating,result:load.result||null,opponentKind:load.opponentKind||'player'};
   let context=null;if(command?.type==='ready')context=await rpc('hemicycle_combat_context',{p_room_id:roomId,p_actor:actor});
   let next=structuredClone(state);const timedOut=E.timeout(next,load.now);
   if(!timedOut&&command)next=E.apply(state,load.side,command,load.now,undefined,context?.[load.side]?.profile);
   if(load.opponentKind==='ai'&&command?.type==='ready'&&!next.players[1])next=E.apply(next,1,{type:'ready',cabinet:AI.cabinet(command.cabinet,load.rating||0)},load.now);
   if(load.opponentKind==='ai')next=AI.advance(next,load.now);
   if(!timedOut&&!command)return {...E.project(state,load.side,load.revision,load.now),rankedElo:load.rating,result:load.result||null,opponentKind:load.opponentKind||'player'};
   const args={p_room_id:roomId,p_actor:actor,p_expected_revision:load.revision,p_state:next,p_operation_id:operationId||crypto.randomUUID(),p_request:request||{type:'timeout'}};
   if(next.status==='finished'){
    context=await rpc('hemicycle_combat_context',{p_room_id:roomId,p_actor:actor});
    args.p_progress=context.map((entry,side)=>entry?{userId:entry.userId,revision:entry.revision,...require('./progression.cjs').progress(entry.profile,next,side,load.now)}:null);
   }
   const ok=await rpc(next.status==='finished'?'hemicycle_combat_commit_progress':'hemicycle_combat_commit',args);
   if(ok){const saved=await rpc('hemicycle_combat_load',{p_room_id:roomId,p_actor:actor,p_operation_id:null,p_request:null});return {...E.project(saved.state,load.side,saved.revision,saved.now),rankedElo:saved.rating,result:saved.result||null,opponentKind:saved.opponentKind||'player'};}
  }
  throw Error('El estado cambió. Actualiza la partida y reintenta.');
 };
}
module.exports={create};
