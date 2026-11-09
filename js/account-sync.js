/* Coordina el guardado y los resultados sin repetir operaciones ni descartar recibos. */
(function(root,factory){var value=factory();if(typeof module==='object'&&module.exports)module.exports=value;else root.HemicycleAccountSync=value;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function create(api){
 var flight=null,timer=null,owner=null,phase='idle',error='',blocked=false,failures=0,lastSuccess=null,retryAt=null,disposed=false;
 var later=api.setTimeout||setTimeout,cancel=api.clearTimeout||clearTimeout,now=api.now||Date.now;
 var permanent=['ECONOMY_OPERATION_CONFLICT','ECONOMY_IDENTITY_CONFLICT','ECONOMY_OPERATION_INVALID','ECONOMY_ACCOUNT_REQUIRED','OFFLINE_SCHEMA_REQUIRED','ECONOMY_SCHEMA_REQUIRED','ECONOMY_PERMISSION_REQUIRED','CLOUD_RESTORE_REQUIRED','SESSION_REQUIRED','CLOUD_CONFLICT'];
 function account(){var a=api.account();return a&&a.userId;}
 function state(){return {phase:phase,error:error,running:!!flight,blocked:blocked};}
 function changed(){if(api.changed)api.changed(state());}
 function schedule(delay){if(disposed||blocked||!account())return;cancel(timer);timer=later(function(){timer=null;wake();},delay);}
 function current(id){return !disposed&&id===account();}
 function check(id){if(!current(id))throw Object.assign(Error('La cuenta ha cambiado.'),{code:'ACCOUNT_CHANGED'});}
 function checkCloud(){var s=api.cloud.state();if(s.phase==='conflict')throw Object.assign(Error('Hay otra copia más reciente. Revisa las copias antes de recuperarla.'),{code:'CLOUD_CONFLICT'});if(s.phase==='error')throw Error(s.error||'No se pudo confirmar el guardado.');return s.enabled;}
 function wake(force){
  if(disposed)return Promise.resolve(state());
  var id=account();
  if(id!==owner){owner=id;blocked=false;error='';failures=0;lastSuccess=null;retryAt=null;phase='idle';cancel(timer);}
  if(flight)return flight.promise;
  if(!id)return Promise.resolve(state());
  if(blocked&&!force)return Promise.resolve(state());
  if(!force&&retryAt!==null&&now()<retryAt){schedule(retryAt-now());return Promise.resolve(state());}
  if(api.online&&!api.online()||api.visible&&!api.visible()||api.ready&&!api.ready()){schedule(15000);return Promise.resolve(state());}
  if(!force&&lastSuccess!==null&&now()-lastSuccess<60000&&(!api.hasPending||!api.hasPending())){schedule(60000-(now()-lastSuccess));return Promise.resolve(state());}
  cancel(timer);blocked=false;retryAt=null;phase='syncing';error='';var task={owner:id};flight=task;
  task.promise=Promise.resolve().then(async function(){
   try{
    await api.offline.refresh();check(id);
    await api.cloud.reconnect();check(id);
    var cloud=api.cloud.state();
    // Receipts may already be committed after a lost response. Reconcile those
    // pending operations before treating a newer server revision as a conflict.
    if(cloud.phase==='error'||cloud.phase==='conflict'&&(!api.hasPending||!api.hasPending()))checkCloud();
    if(!cloud.enabled){phase='idle';return;}
    await api.economy.resume();check(id);
    await api.offline.flush();check(id);
    checkCloud();await api.cloud.save();check(id);checkCloud();
    lastSuccess=now();failures=0;phase='idle';
   }catch(e){if(current(id)){phase='error';error=e.message||'La sincronización se reintentará automáticamente.';blocked=permanent.includes(e.code);failures++;}}
   finally{
    if(flight===task)flight=null;
    if(!current(id)){phase='idle';error='';blocked=false;lastSuccess=null;}
    var delay=!current(id)?0:phase==='error'?Math.min(15000*Math.pow(2,Math.min(failures-1,4)),240000):60000;
    if(phase==='error'&&!blocked)retryAt=now()+delay;
    if(!disposed)changed();schedule(delay);
   }
   return state();
  });changed();return task.promise;
 }
 return {wake:wake,state:state,dispose:function(){disposed=true;cancel(timer);}};
}
return {create:create};
});
