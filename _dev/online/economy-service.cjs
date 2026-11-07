'use strict';
const crypto=require('node:crypto'),E=require('./economy.cjs');
function create({url,key,secret,fetcher=fetch,observe={conflict(){},rejected(){}},queueOptions={}}){
 async function read(response){try{return await response.json();}catch{throw Object.assign(Error('La respuesta del servidor está incompleta. Tu operación se conserva para reintentar.'),{status:503,code:'ECONOMY_UNAVAILABLE'});}}
 const writes=require('./write-queue.cjs').create({...queueOptions,onReject:()=>observe.rejected()});
 async function rpc(name,args){const r=await fetcher(url.replace(/\/$/,'')+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:secret,Authorization:'Bearer '+secret,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(10000)});if(!r.ok){
   let detail;try{detail=await r.json();}catch(ignore){}
   const code=detail?.code,message=detail?.message;let status=503,kind='ECONOMY_UNAVAILABLE',text='No se pudo contactar con el guardado del servidor. Tu progreso sigue en este dispositivo. Reinténtalo en unos instantes.';
   if(['PGRST202','42P01','42883'].includes(code)){kind='ECONOMY_SCHEMA_REQUIRED';text='El servidor no tiene disponible la función necesaria para activar o migrar el progreso. El administrador debe revisar la actualización de Supabase. Tu progreso local se conserva.';}
   else if(code==='42501'||r.status===401||r.status===403){kind='ECONOMY_PERMISSION_REQUIRED';text='El servicio no tiene permiso para verificar el guardado. El administrador debe revisar la configuración del servidor. Tu progreso local se conserva.';}
   else if(code==='P0001'&&['Partida descargada no disponible.','Partida descargada ya procesada o caducada.'].includes(message)){status=409;kind='OFFLINE_TICKET_UNAVAILABLE';text='Esta preparación ya no puede validarse. El registro se conserva para revisión; los demás resultados pueden sincronizarse.';}
   else if(code==='P0001'&&message==='Activa primero la nube.'){status=409;kind='CLOUD_REQUIRED';text='El guardado de tu cuenta aún no está listo. Se prepara automáticamente al entrar; revisa el estado en Perfil → Nube si no termina.';}
   else if(code==='P0001'&&message==='Esta cuenta ya tiene un respaldo vinculado. Recupéralo primero.'){status=409;kind='CLOUD_RESTORE_REQUIRED';text='Esta cuenta ya tiene un respaldo vinculado. Recupéralo desde Perfil → Nube antes de continuar.';}
   const label=name==='hemicycle_request_legacy_import'?'MIGRACION':name==='hemicycle_economy_bootstrap'?'ACTIVACION':name==='hemicycle_offline_download'?'PARTIDA':'GUARDADO',reference=/^(?:[A-Z0-9]{5}|PGRST[0-9]+)$/.test(code||'')?code:'HTTP'+r.status;const e=Error(text+' Referencia: '+label+'-'+reference+'.');e.status=status;e.code=kind;throw e;
  }return read(r);}
 return async(auth,path,method,body={})=>{
  if(!secret)throw Error('Economía pendiente de configurar.');
  const identity=await fetcher(url.replace(/\/$/,'')+'/auth/v1/user',{headers:{apikey:key,Authorization:auth},signal:AbortSignal.timeout(8000)});if(!identity.ok){const denied=[401,403].includes(identity.status);throw Object.assign(Error(denied?'Inicia sesión de nuevo.':'No se pudo comprobar la sesión. Reinténtalo en unos instantes.'),{status:denied?401:503,code:denied?'SESSION_REQUIRED':'ECONOMY_UNAVAILABLE'});}const actor=(await read(identity)).id;if(!actor)throw Error('Cuenta no válida.');
  if(path==='/economy/initialize'&&method==='POST'){await rpc('hemicycle_economy_bootstrap',{p_actor:actor,p_payload:E.starter(body.identityId,Date.now())});return {initialized:true};}
  if(path==='/economy/import-request'&&method==='POST'){
   let backup;try{backup=require('../../js/player-backup.js').validate(body.payload,E.catalog.filter(c=>!c.action).map(c=>c.id));}catch(e){throw Object.assign(Error(e.message),{status:400,code:'IMPORT_INVALID'});}
   const result=await rpc('hemicycle_request_legacy_import',{p_actor:actor,p_payload:backup});
   if(result?.status==='approved'||result?.status==='pending')return result;
   const failures={existing_cloud:['CLOUD_RESTORE_REQUIRED','Esta cuenta ya tiene un respaldo vinculado. Recupéralo desde Perfil → Nube antes de continuar.'],source_conflict:['IMPORT_ALREADY_LINKED','Este progreso ya está vinculado a otra cuenta. Usa la cuenta original para recuperarlo.'],rejected:['IMPORT_REJECTED','Esta copia tiene una revisión anterior rechazada. Tu respaldo local se conserva.'],invalid:['IMPORT_INVALID','El respaldo no supera las comprobaciones de migración. Tu copia local se conserva.'],changed:['IMPORT_CHANGED','La solicitud ha cambiado. Vuelve a comprobar la nube antes de reintentar.'],consumed:['IMPORT_CONSUMED','Esta cuenta ya utilizó su importación inicial. Conserva tu respaldo y solicita recuperar su guardado.']};
   const failure=failures[result?.status];
   throw Object.assign(Error(failure?failure[1]:'No se pudo confirmar la migración. Comprueba la nube antes de reintentar.'),{status:failure?409:503,code:failure?failure[0]:'ECONOMY_UNAVAILABLE'});
  }
  if(path==='/offline/risk'&&method==='POST'){const c=body.cabinet,actions=require('./actions.cjs');if(!c||!Array.isArray(c.orators)||c.orators.length!==8||new Set(c.orators).size!==8||!Array.isArray(c.actions)||c.actions.length!==4||!['ranked','liga'].includes(body.mode))throw Object.assign(Error('Gabinete no válido.'),{status:400});const context=await rpc('hemicycle_economy_context',{p_actor:actor}),profile=context.accounts[actor]?.payload.profile;if(!profile)throw Error('Activa primero la nube.');actions.validateCabinet(c,[...profile.album,...profile.actionAlbum||[]],E.catalog.filter(x=>!x.action).map(x=>x.id));const ids=require('../../js/action-cards.js').lootPool(c.orators,c.actions,profile);return {mode:body.mode,competitive:true,ids,protected:!ids.length,verified:true};}
  if(path==='/offline/tickets'&&method==='POST'){const rules=body.rules==null?'offline1':body.rules;if(!['offline1','offline2','offline3','offline4','offline5','offline6','offline7','offline8','offline9','offline10'].includes(rules))throw Object.assign(Error('Versión de partida descargada no compatible.'),{status:400});return rpc('hemicycle_offline_download',{p_actor:actor,p_rules:rules});}
  const market=path.startsWith('/api/market'),part=market?path.slice(11):null;
  if(market&&method==='GET'){
   let context=await rpc('hemicycle_economy_context',{p_actor:actor});
   if(context.market.trades.some(t=>t.status==='pending'&&t.expires<=context.now)){
    await writes.run(async()=>{for(let i=0;i<5;i++){
     const current=await rpc('hemicycle_economy_context',{p_actor:actor});
     if(!current.market.trades.some(t=>t.status==='pending'&&t.expires<=current.now))return;
     const command={type:'maintenance'},next=E.operate(current,actor,command,current.now);
     if(await rpc('hemicycle_economy_commit',{p_actor:actor,p_operation_id:crypto.randomUUID(),p_request:command,p_version:current.version,p_market:next.market,p_updates:next.updates,p_result:next.result}))return;
     observe.conflict();await new Promise(resolve=>setTimeout(resolve,10*(i+1)));
    }throw require('./write-queue.cjs').busy();});
    context=await rpc('hemicycle_economy_context',{p_actor:actor});
   }
   if(part==='/pack-openings'){
    const current=E.view(context,actor,part),known=new Set(current.map(r=>r.id));
    try{const response=await fetcher(url.replace(/\/$/,'')+'/rest/v1/hemicycle_economy_operations?user_id=eq.'+encodeURIComponent(actor)+'&result->packs=not.is.null&select=operation_id,request,result,created_at&order=created_at.desc&limit=1000',{headers:{apikey:secret,Authorization:'Bearer '+secret},signal:AbortSignal.timeout(10000)});
    if(response.ok){const old=await read(response);if(Array.isArray(old))for(const r of old){const result=r.result,request=r.request||{};if(!Array.isArray(result?.packs)||known.has(result.presentationId||r.operation_id))continue;current.push({id:result.presentationId||r.operation_id,k:result.kind||request.kind||'comun',country:result.country||request.country||'',from:request.type==='pack'?'tienda':'buzon',created:Date.parse(r.created_at)||Date.now(),packs:result.packs,opened:result.packs.map(()=>false),free:request.type!=='pack'||!!request.free,legacy:true});}}
    }catch(ignore){/* Los recibos nuevos siguen disponibles aunque falle la consulta histórica. */}
    return current;
   }
   return E.view(context,actor,part);
  }
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
  return writes.run(async()=>{for(let attempt=0;attempt<5;attempt++){
   const context=await rpc('hemicycle_economy_context',{p_actor:actor,p_operation_id:operationId,p_request:command});if(context.processed)return context.result;
   const next=E.operate(context,actor,command,context.now);
   const saved=await rpc('hemicycle_economy_commit',{p_actor:actor,p_operation_id:operationId,p_request:command,p_version:context.version,p_market:next.market,p_updates:next.updates,p_result:next.result});
   if(saved){const receipt=await rpc('hemicycle_economy_context',{p_actor:actor,p_operation_id:operationId,p_request:command});if(receipt.processed)return receipt.result;throw require('./write-queue.cjs').busy();}
   observe.conflict();await new Promise(resolve=>setTimeout(resolve,10*(attempt+1)));
  }
  throw require('./write-queue.cjs').busy();});
 };
}
module.exports={create};
