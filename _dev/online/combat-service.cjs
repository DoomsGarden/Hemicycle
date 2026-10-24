'use strict';
const E=require('./combat.cjs'),crypto=require('node:crypto');
function create({url,key,secret,fetcher=fetch}){
 async function rpc(name,args){const response=await fetcher(url.replace(/\/$/,'')+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('No se pudo guardar o recuperar el combate. Comprueba el SQL y la configuración del servidor.');return response.json();}
 return async function handle(auth,roomId,command,operationId){
  if(!secret){const e=Error('Combate pendiente de configurar: falta la clave privada en Render.');e.status=503;throw e;}
  const identity=await fetcher(url.replace(/\/$/,'')+'/auth/v1/user',{headers:{apikey:key,Authorization:auth},signal:AbortSignal.timeout(8000)});if(!identity.ok){const e=Error('Inicia sesión de nuevo.');e.status=401;throw e;}const actor=(await identity.json()).id;if(!actor)throw Error('Cuenta no válida.');
  const request=command||null;
  for(let attempt=0;attempt<5;attempt++){
   const load=await rpc('hemicycle_combat_load',{p_room_id:roomId,p_actor:actor,p_operation_id:operationId||null,p_request:request}),state=load.state||E.initial(load.mode||'normal');
   if(load.processed)return {...E.project(state,load.side,load.revision,load.now),rankedElo:load.rating};
   let next=structuredClone(state);const timedOut=E.timeout(next,load.now);
   if(!timedOut&&command)next=E.apply(state,load.side,command,load.now);
   if(!timedOut&&!command)return {...E.project(state,load.side,load.revision,load.now),rankedElo:load.rating};
   const ok=await rpc('hemicycle_combat_commit',{p_room_id:roomId,p_actor:actor,p_expected_revision:load.revision,p_state:next,p_operation_id:operationId||crypto.randomUUID(),p_request:request||{type:'timeout'}});
   if(ok){const saved=await rpc('hemicycle_combat_load',{p_room_id:roomId,p_actor:actor,p_operation_id:null,p_request:null});return {...E.project(saved.state,load.side,saved.revision,saved.now),rankedElo:saved.rating};}
  }
  throw Error('El estado cambió. Actualiza la partida y reintenta.');
 };
}
module.exports={create};
