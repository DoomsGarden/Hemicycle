/* Respaldo cloud del prelanzamiento: revisiones, consentimiento y reintentos idempotentes. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleCloudSave=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
var OWNER='hemiciclo_cloud_local_owner_v1',RECOVERY='hemiciclo_cloud_recovery_v1',REMOTE_RECOVERY='hemiciclo_cloud_remote_recovery_v1';
function canonical(value){if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(function(k){return JSON.stringify(k)+':'+canonical(value[k]);}).join(',')+'}';return JSON.stringify(value);}
function fingerprint(value){var data=JSON.parse(JSON.stringify(value));delete data.exportedAt;delete data.gameVersion;return canonical(data);}
function create(api){
 var epoch=0,remote=null,phase='guest',error='',timer=null,running=null,applying=false;
 var bindKey=function(id){return 'hemiciclo_cloud_binding_v1:'+id;},pendingKey=function(id){return 'hemiciclo_cloud_pending_v1:'+id;},importKey=function(id){return 'hemiciclo_cloud_import_v1:'+id;};
 function account(){var a=api.account();return a&&a.userId?a:null;}
 function read(k){try{return JSON.parse(api.storage.getItem(k));}catch(ignore){return null;}}
 function write(k,v){if(v===null)api.storage.removeItem(k);else api.storage.setItem(k,JSON.stringify(v));}
 function changed(){if(api.changed)api.changed(state());}
 function state(){var a=account(),binding=a&&read(bindKey(a.userId)),owner=read(OWNER);return {phase:phase,error:error,remote:remote,connected:!!a,enabled:!!(a&&binding&&owner&&owner.userId===a.userId&&owner.identityId===api.snapshot().identity.id),binding:binding};}
 function fail(e){error=e&&['PGRST202','42P01','42883'].includes(e.code)?'Falta activar el guardado en Supabase. Puedes seguir jugando en este dispositivo.':e&&['P0001','22023'].includes(e.code)?e.message:'No se ha podido guardar en la nube. Tu progreso sigue en este dispositivo.';phase='error';changed();if(state().enabled&&api.autoRetry!==false){clearTimeout(timer);timer=setTimeout(reconnect,15000);}}
 async function rpc(a,name,args){var request=a.client.rpc(name,args);if(a.accessToken&&typeof request.setHeader==='function')request=request.setHeader('Authorization','Bearer '+a.accessToken);var r=await request;if(r.error)throw r.error;return r.data;}
 function validateRemote(value,a){if(!value||value.user_id!==a.userId||!Number.isSafeInteger(value.revision)||value.revision<0)throw new Error('Invalid cloud response');if(value.revision>0){value.payload=api.validate(value.payload);if(!value.payload)throw new Error('Invalid backup');}return value;}
 function remember(a,save,fp){write(bindKey(a.userId),{revision:save.revision,fingerprint:fp,identityId:save.payload.identity.id});write(OWNER,{userId:a.userId,identityId:save.payload.identity.id});write(pendingKey(a.userId),null);write(importKey(a.userId),null);}
 function evaluate(a){
  var binding=read(bindKey(a.userId)),owner=read(OWNER),local=api.snapshot(),fp=fingerprint(local),pending=read(pendingKey(a.userId));
  if(pending&&remote.revision>0&&remote.last_operation_id===pending.operationId&&fingerprint(remote.payload)===pending.fingerprint){remember(a,remote,pending.fingerprint);binding=read(bindKey(a.userId));owner=read(OWNER);}
  if(!remote.revision){var migration=read(importKey(a.userId));phase=migration&&migration.identityId===local.identity.id?'migration':'empty';return;}
  if(!binding||!owner||owner.userId!==a.userId||owner.identityId!==local.identity.id){phase='available';return;}
  if(fingerprint(remote.payload)===fp){remember(a,remote,fp);phase='synced';return;}
  if(remote.revision!==binding.revision){phase='conflict';return;}
  phase='pending';
 }
 function lock(fn){return api.lock?api.lock(fn):Promise.resolve().then(fn);}
 async function refresh(){
  if(running)return running.then(refresh);
  var a=account(),ticket=epoch;if(!a){remote=null;phase='guest';changed();return state();}
  phase='checking';error='';changed();
  try{var value=validateRemote(await rpc(a,'hemicycle_get_cloud_save'),a);if(ticket!==epoch||!account()||account().userId!==a.userId)return state();remote=value;evaluate(a);changed();}
  catch(e){if(ticket===epoch)fail(e);}return state();
 }
 async function put(activate){
  var a=account(),ticket=epoch;if(!a)throw new Error('Debes iniciar sesión.');
  var binding=read(bindKey(a.userId)),owner=read(OWNER),snapshot=api.validate(api.prepare&&remote&&remote.payload?api.prepare(api.snapshot(),remote.payload):api.snapshot()),fp=fingerprint(snapshot);
  if(!activate&&(!binding||!owner||owner.userId!==a.userId||owner.identityId!==snapshot.identity.id))return;
  if(activate&&(!remote||remote.revision!==0))throw new Error('Revisa primero el guardado de la cuenta.');
  if(!activate&&fp===binding.fingerprint&&remote&&remote.revision===binding.revision){phase='synced';changed();return;}
  var pending=read(pendingKey(a.userId));
  if(pending&&pending.fingerprint!==fp){
   var head=validateRemote(await rpc(a,'hemicycle_get_cloud_save'),a);
   if(ticket!==epoch||!account()||account().userId!==a.userId)return;
   if(head.last_operation_id===pending.operationId&&fingerprint(head.payload)===pending.fingerprint){remember(a,head,pending.fingerprint);binding=read(bindKey(a.userId));remote=head;activate=false;pending=null;}
   else if(head.revision!==(activate?0:binding.revision)){remote=head;phase='conflict';changed();return;}
  }
  var expected=activate?0:binding.revision;
  if(!pending||pending.fingerprint!==fp||pending.expectedRevision!==expected){pending={operationId:api.uuid(),fingerprint:fp,expectedRevision:expected,payload:snapshot};write(pendingKey(a.userId),pending);}
  phase='saving';error='';changed();
  var response=await rpc(a,'hemicycle_put_cloud_save',{p_payload:pending.payload,p_expected_revision:expected,p_operation_id:pending.operationId});
  if(ticket!==epoch||!account()||account().userId!==a.userId)return;
  remote=validateRemote(response.save,a);
  if(response.status==='conflict'){
   if(remote.last_operation_id===pending.operationId&&fingerprint(remote.payload)===fp){remember(a,remote,fp);evaluate(a);}else phase='conflict';
  }else if(response.status==='saved'){remember(a,remote,fp);evaluate(a);}else throw new Error('Invalid save result');changed();
 }
 function save(activate){
  if(running)return running;var ticket=epoch;
  running=lock(function(){return put(!!activate);}).catch(function(e){if(ticket===epoch)fail(e);}).finally(function(){running=null;if(phase==='pending')dirty();});return running;
 }
 function dirty(){
  if(applying||!state().enabled||['conflict','available','checking','error'].includes(phase))return;clearTimeout(timer);
  phase='pending';changed();timer=setTimeout(function(){save(false);},api.debounce==null?1800:api.debounce);
 }
 async function restore(expectedRevision){
  if(api.canRestore&&!api.canRestore())throw new Error('Termina el debate o la guía antes de recuperar una copia.');
  var a=account(),ticket=epoch;if(!a)throw new Error('Debes iniciar sesión.');
  var value=validateRemote(await rpc(a,'hemicycle_get_cloud_save'),a);
  if(ticket!==epoch||!account()||account().userId!==a.userId)throw new Error('La cuenta ha cambiado.');
  if(!value.revision||value.revision!==expectedRevision)throw new Error('La copia ha cambiado. Vuelve a revisarla antes de recuperar.');
  var payload=api.validate(value.payload),values={};values[RECOVERY+':'+a.userId]={savedAt:new Date().toISOString(),payload:api.snapshot()};values[bindKey(a.userId)]={revision:value.revision,fingerprint:fingerprint(payload),identityId:payload.identity.id};values[OWNER]={userId:a.userId,identityId:payload.identity.id};values[pendingKey(a.userId)]=null;
  clearTimeout(timer);applying=true;try{api.restore(payload,values);}finally{applying=false;}remote=value;error='';phase='synced';evaluate(a);changed();if(phase==='pending')dirty();
 }
 async function adopt(){
  await refresh();var a=account();if(phase==='error')throw Error(error||'No se pudo verificar la nube.');if(!a||!remote||!remote.revision)throw Error('No hay un respaldo confirmado para esta cuenta.');
  if(remote.payload.identity.id!==api.snapshot().identity.id)throw Error('Recupera primero la copia vinculada a tu cuenta.');
  applying=true;try{if(api.applyCanonical)api.applyCanonical(remote.payload);else return;}finally{applying=false;}
  remember(a,remote,fingerprint(remote.payload));error='';evaluate(a);changed();if(phase==='pending')dirty();
 }
 async function useLocal(expectedRevision){
  var a=account(),ticket=epoch;if(!a||!state().enabled)throw new Error('Recupera o vincula primero el progreso de esta cuenta.');
  var value=validateRemote(await rpc(a,'hemicycle_get_cloud_save'),a);
  if(ticket!==epoch||!account()||account().userId!==a.userId)throw new Error('La cuenta ha cambiado.');
  if(!value.revision||value.revision!==expectedRevision)throw new Error('La copia ha cambiado. Revisa de nuevo el conflicto.');
  if(value.payload.identity.id!==api.snapshot().identity.id)throw new Error('Las copias no pertenecen al mismo progreso.');
  write(REMOTE_RECOVERY+':'+a.userId,{savedAt:new Date().toISOString(),payload:value.payload});
  write(bindKey(a.userId),{revision:value.revision,fingerprint:fingerprint(value.payload),identityId:value.payload.identity.id});
  write(pendingKey(a.userId),null);remote=value;phase='pending';return save(false);
 }
 function localReplaced(){epoch++;clearTimeout(timer);var a=account();if(a){write(bindKey(a.userId),null);write(pendingKey(a.userId),null);}write(OWNER,null);phase=remote&&remote.revision?'available':account()?'empty':'guest';changed();}
 function accountChanged(){epoch++;clearTimeout(timer);remote=null;phase=account()?'checking':'guest';error='';if(account()){refresh().then(function(){if(phase==='pending')dirty();});}else{changed();}}
 async function reconnect(){if(!account())return;await refresh();if(phase==='pending')return save(false);}
 return {state:state,refresh:refresh,adopt:adopt,save:function(){return save(false);},activate:api.initialize?async function(){var a=account(),ticket=epoch;if(!a)throw Error('Inicia sesión.');var identityId=api.snapshot().identity.id;write(RECOVERY+':'+a.userId,{savedAt:new Date().toISOString(),payload:api.snapshot()});try{await api.initialize();}catch(e){if(ticket!==epoch||account()?.userId!==a.userId)throw Error('La cuenta ha cambiado.');if(e.code!=='LEGACY_IMPORT_PENDING')throw e;write(importKey(a.userId),{identityId:identityId,submittedAt:new Date().toISOString()});error='';phase='migration';changed();return;}if(ticket!==epoch||account()?.userId!==a.userId)throw Error('La cuenta ha cambiado.');await refresh();if(phase==='error')throw Error(error);if(remote&&remote.revision)await restore(remote.revision);}:function(){return save(true);},restore:restore,useLocal:useLocal,localReplaced:localReplaced,dirty:dirty,accountChanged:accountChanged,reconnect:reconnect,recovery:function(){var a=account();return a?read(RECOVERY+':'+a.userId):null;},remoteRecovery:function(){var a=account();return a?read(REMOTE_RECOVERY+':'+a.userId):null;},dispose:function(){epoch++;clearTimeout(timer);}};
}
return {create:create,fingerprint:fingerprint,ownerKey:OWNER,recoveryKey:RECOVERY};
});
