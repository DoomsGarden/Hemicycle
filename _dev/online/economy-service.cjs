'use strict';
const crypto=require('node:crypto'),E=require('./economy.cjs');
function create({url,key,secret,fetcher=fetch}){
 async function rpc(name,args){const r=await fetcher(url.replace(/\/$/,'')+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(10000)});if(!r.ok){
   let detail;try{detail=await r.json();}catch(ignore){}
   const code=detail?.code,message=detail?.message;let status=503,kind='ECONOMY_UNAVAILABLE',text='No se pudo contactar con el guardado del servidor. Tu progreso sigue en este dispositivo. Reinténtalo en unos instantes.';
   if(['PGRST202','42P01','42883'].includes(code)){kind='ECONOMY_SCHEMA_REQUIRED';text='El servidor no tiene disponible la función necesaria para activar o migrar el progreso. El administrador debe revisar la actualización de Supabase. Tu progreso local se conserva.';}
   else if(code==='42501'||r.status===401||r.status===403){kind='ECONOMY_PERMISSION_REQUIRED';text='El servicio no tiene permiso para verificar el guardado. El administrador debe revisar la configuración del servidor. Tu progreso local se conserva.';}
   else if(code==='P0001'&&message==='Activa primero la nube.'){status=409;kind='CLOUD_REQUIRED';text='Activa primero el guardado desde Perfil → Nube. Si ya jugaste en este dispositivo, conserva tu copia para migrar el progreso.';}
   else if(code==='P0001'&&message==='Esta cuenta ya tiene un respaldo vinculado. Recupéralo primero.'){status=409;kind='CLOUD_RESTORE_REQUIRED';text='Esta cuenta ya tiene un respaldo vinculado. Recupéralo desde Perfil → Nube antes de continuar.';}
   const label=name==='hemicycle_request_legacy_import'?'MIGRACION':name==='hemicycle_economy_bootstrap'?'ACTIVACION':name==='hemicycle_offline_download'?'PARTIDA':'GUARDADO',reference=/^(?:[A-Z0-9]{5}|PGRST[0-9]+)$/.test(code||'')?code:'HTTP'+r.status;const e=Error(text+' Referencia: '+label+'-'+reference+'.');e.status=status;e.code=kind;throw e;
  }return r.json();}
 return async(auth,path,method,body={})=>{
  if(!secret)throw Error('Economía pendiente de configurar.');
  const identity=await fetcher(url.replace(/\/$/,'')+'/auth/v1/user',{headers:{apikey:key,Authorization:auth},signal:AbortSignal.timeout(8000)});if(!identity.ok){const e=Error('Inicia sesión de nuevo.');e.status=401;throw e;}const actor=(await identity.json()).id;if(!actor)throw Error('Cuenta no válida.');
  if(path==='/economy/initialize'&&method==='POST'){await rpc('hemicycle_economy_bootstrap',{p_actor:actor,p_payload:E.starter(body.identityId,Date.now())});return {initialized:true};}
  if(path==='/economy/import-request'&&method==='POST'){const backup=require('../../js/player-backup.js').validate(body.payload,E.catalog.filter(c=>!c.action).map(c=>c.id));return rpc('hemicycle_request_legacy_import',{p_actor:actor,p_payload:backup});}
  if(path==='/offline/tickets'&&method==='POST')return rpc('hemicycle_offline_download',{p_actor:actor});
  const market=path.startsWith('/api/market'),part=market?path.slice(11):null;
  if(market&&method==='GET'){for(let i=0;i<5;i++){const context=await rpc('hemicycle_economy_context',{p_actor:actor});if(!context.market.trades.some(t=>t.status==='pending'&&t.expires<=context.now))return E.view(context,actor,part);const command={type:'maintenance'},next=E.operate(context,actor,command,context.now);await rpc('hemicycle_economy_commit',{p_actor:actor,p_operation_id:crypto.randomUUID(),p_request:command,p_version:context.version,p_market:next.market,p_updates:next.updates,p_result:next.result});}throw Error('Actualiza el mercado.');}
  if(method!=='POST')throw Error('Ruta no disponible.');
  let command,operationId=body.operationId||body.key;
  if(path==='/economy')command=body.command;
  else if(path==='/offline/settle')command={type:'offline-settle',ticketId:body.ticketId,record:body.record};
  else if(part==='/sales/machine')command={type:'machine',id:body.id,quantity:body.quantity};
  else if(part==='/visibility')command={type:'visibility',visible:body.visible};
  else if(part==='/listings')command={type:'listing',id:body.id,quantity:body.quantity};
  else if(part==='/quotes/purchase')command={type:'quote',listing:body.listing,quantity:body.quantity};
  else if(part==='/purchases'){command={type:'purchase',quote:body.quote};operationId=body.quote;}
  else if(part==='/trades'){if(body.accept!==true)throw Error('Revisa y confirma la propuesta.');command={type:'trade',recipient:body.recipient,give:body.give,receive:body.receive};}
  else if(/^\/trades\/[0-9a-f-]{36}\/(accept|cancel)$/.test(part))command={type:part.endsWith('/accept')?'accept-trade':'cancel-trade',id:part.split('/')[2]};
  else if(/^\/listings\/[0-9a-f-]{36}\/cancel$/.test(part))command={type:'cancel-listing',id:part.split('/')[2]};
  else throw Error('Ruta no disponible.');
  if(command?.type==='ranked-loot')throw Error('La recompensa de Clasificatoria solo la confirma el servidor.');
  if(!command||typeof command!=='object'||Array.isArray(command)||!(/^[0-9a-f-]{36}$/i).test(operationId||''))throw Error('Operación no válida.');
  for(let attempt=0;attempt<5;attempt++){
   const context=await rpc('hemicycle_economy_context',{p_actor:actor,p_operation_id:operationId,p_request:command});if(context.processed)return context.result;
   const next=E.operate(context,actor,command,context.now);
   const saved=await rpc('hemicycle_economy_commit',{p_actor:actor,p_operation_id:operationId,p_request:command,p_version:context.version,p_market:next.market,p_updates:next.updates,p_result:next.result});
   if(saved)return next.result;
  }
  throw Error('La colección cambió mientras se verificaba. Actualiza y reintenta.');
 };
}
module.exports={create};
