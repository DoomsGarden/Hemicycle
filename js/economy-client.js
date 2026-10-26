/* Operaciones verificadas y recibos recuperables; no envía saldos ni inventarios resultantes. */
(function(root){'use strict';root.HemicycleEconomyClient={create:function(api){
 var busy=null;
 function account(){var a=api.account();if(!a)throw Error('Inicia sesión para verificar esta operación.');return a;}
 function key(){return 'hemicycle_economy_pending_v1:'+account().userId;}
 async function request(path,body){var a=account(),r=await fetch(api.base+path,{method:'POST',headers:{Authorization:'Bearer '+a.accessToken,'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store',signal:AbortSignal.timeout(65000)}),data=await r.json();if(!api.account()||api.account().userId!==a.userId)throw Error('La cuenta ha cambiado.');if(!r.ok){var reference=/^[0-9a-f-]{36}$/i.test(data.requestId||'')?' Consulta: '+data.requestId+'.':'';var e=Error((data.error||'No se pudo verificar la operación.')+reference);e.definitive=r.status<500;e.code=data.code;throw e;}return data;}
 async function perform(command){
  if(busy)return busy;
  var pendingKey=key(),pending;try{pending=JSON.parse(localStorage.getItem(pendingKey));}catch(ignore){}
  if(pending&&JSON.stringify(pending.command)!==JSON.stringify(command))throw Error('Hay otra operación pendiente de verificar. Reinténtala primero.');
  if(!pending){pending={operationId:crypto.randomUUID(),command:command};localStorage.setItem(pendingKey,JSON.stringify(pending));}
  busy=(async function(){try{var value=await request('/economy',pending);localStorage.removeItem(pendingKey);await api.reconcile();return value;}catch(e){if(e.definitive)localStorage.removeItem(pendingKey);throw e;}finally{busy=null;}})();return busy;
 }
 return {active:function(){return !!api.account();},execute:perform,request:request,reconcile:api.reconcile,initialize:async function(){var snapshot=api.snapshot(),p=snapshot.profile;if(p.w+p.l>0||p.album.length>30||(p.actionAlbum||[]).length||p.fs!==1500||p.elo>0||snapshot.league){await request('/economy/import-request',{payload:snapshot});var e=Error('Tu progreso local se ha enviado para revisar su migración. Se conserva en este dispositivo y en la copia de recuperación. No se ha sustituido por una colección nueva.');e.code='LEGACY_IMPORT_PENDING';throw e;}return request('/economy/initialize',{identityId:snapshot.identity.id});},pending:function(){try{return JSON.parse(localStorage.getItem(key()));}catch(ignore){return null;}},resume:async function(){var p;try{p=JSON.parse(localStorage.getItem(key()));}catch(ignore){}return p?perform(p.command):null;}};
}};})(window);
