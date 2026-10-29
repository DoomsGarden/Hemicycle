/* Partidas descargadas: jugadas reproducibles, premios pendientes y consumo único al validar. */
(function(root){'use strict';root.HemicycleOfflineCombat={create:function(api){
 var live=null,clock=null,busy=false,preparing=false,connection=null,dbPromise,releaseLease=null;
 function db(){return dbPromise||(dbPromise=new Promise(function(resolve,reject){var r=indexedDB.open('hemicycle-offline-v1',1);r.onupgradeneeded=function(){r.result.createObjectStore('accounts');};r.onsuccess=function(){resolve(r.result);};r.onerror=function(){reject(Error('No se pudo abrir el registro de partidas descargadas.'));};}));}
 async function read(id){var d=await db();return new Promise(function(resolve,reject){var tx=d.transaction('accounts'),q=tx.objectStore('accounts').get(id);q.onsuccess=function(){resolve(q.result||{tickets:[],pending:[],active:null});};q.onerror=function(){reject(q.error);};});}
 async function write(id,value){var d=await db();return new Promise(function(resolve,reject){var tx=d.transaction('accounts','readwrite');tx.objectStore('accounts').put(value,id);tx.oncomplete=resolve;tx.onerror=function(){reject(Error('No se pudo guardar la partida. Comprueba el espacio disponible.'));};tx.onabort=tx.onerror;});}
 function owner(){return api.account()&&api.account().userId;}
 async function lock(id,fn){return navigator.locks?navigator.locks.request('hemicycle-offline:'+id,fn):fn();}
 async function notify(){if(api.changed)api.changed(await status());}
 async function download(){var id=owner();if(!id||!navigator.onLine)return;var tickets=await api.economy.request('/offline/tickets',{rules:'offline3'});await lock(id,async function(){var store=await read(id),keep=store.tickets.filter(t=>store.pending.some(p=>p.ticketId===t.id)||store.active&&store.active.ticketId===t.id);store.tickets=Array.from(new Map(keep.concat(tickets).map(t=>[t.id,t])).values());await write(id,store);});await notify();}
 async function settle(item,id){
  if(!navigator.onLine)throw Error('Sin conexión.');if(owner()!==id)throw Error('La cuenta ha cambiado.');
  var result=await api.economy.request('/offline/settle',item);await api.economy.reconcile();
  if(owner()!==id)throw Error('La cuenta ha cambiado.');
  await lock(id,async function(){var store=await read(id);store.pending=store.pending.filter(p=>p.operationId!==item.operationId);store.tickets=store.tickets.filter(t=>t.id!==item.ticketId);await write(id,store);});
  await notify();if(api.onReceipt)api.onReceipt(item.ticketId,result);return result;
 }
 async function flush(){if(connection)return connection;var id=owner();if(!id||!navigator.onLine)return;connection=(async function(){var pending=(await read(id)).pending;for(var item of pending){try{await settle(item,id);}catch(e){if(e.code!=='OFFLINE_TICKET_UNAVAILABLE')throw e;await lock(id,async function(){var store=await read(id);store.rejected=store.rejected||[];if(!store.rejected.some(r=>r.ticketId===item.ticketId))store.rejected.push({...item,ticket:store.tickets.find(t=>t.id===item.ticketId)||null,error:e.message,rejectedAt:Date.now()});store.pending=store.pending.filter(r=>r.ticketId!==item.ticketId);store.tickets=store.tickets.filter(t=>t.id!==item.ticketId);await write(id,store);});}}await notify();await download();})().finally(function(){connection=null;});return connection;}

 function project(){var now=Math.max(0,Date.now()-live.record.startedAt),s=live.rules.project(live.state,0,live.record.commands.length+1,now);s.opponentKind='ai';s.offline=true;return s;}
 function render(){api.battle(project(),{id:'offline-'+live.ticket.id,busy:busy,send:send,retry:function(){if(live)render();},close:detach});}
 function detach(){clearInterval(clock);clock=null;live=null;if(releaseLease){releaseLease();releaseLease=null;}}
 async function acquire(id){if(!navigator.locks)return;await new Promise(function(resolve,reject){navigator.locks.request('hemicycle-active-offline:'+id,{ifAvailable:true},async function(lease){if(!lease){reject(Error('Esta partida está abierta en otra pestaña. Ciérrala allí para continuar aquí.'));return;}var lifetime=new Promise(function(done){releaseLease=done;});resolve();await lifetime;}).catch(reject);});}
 async function finished(){
  clearInterval(clock);clock=null;var match=live,id=match.owner,record=match.record,item={operationId:match.ticket.id,ticketId:match.ticket.id,record};
  await lock(id,async function(){var store=await read(id);if(!store.pending.some(p=>p.ticketId===item.ticketId))store.pending.push(item);store.active=null;await write(id,store);});
  var snapshot=project();detach();
  var verification=async function(){var result=await settle(item,id);download().catch(function(){});return result;};
  notify().catch(function(){});api.finished(snapshot,item.ticketId,verification);
 }
 function send(command){if(busy||!live||owner()!==live.owner)return false;busy=true;
  (async function(){try{var at=Math.max(live.record.commands.at(-1)?.at||0,Date.now()-live.record.startedAt),next=live.rules.move(live.state,command,at,live.rng);live.state=next;live.record.commands.push({at,command});var match=live;
   await lock(match.owner,async function(){var store=await read(match.owner);store.active=match.record;await write(match.owner,store);});
   if(next.status==='finished')await finished();else{busy=false;render();if(api.events)api.events(next.visualEvents.filter(e=>e.sequence>match.lastSequence),0);match.lastSequence=next.visualSequence||0;}
  }catch(e){if(api.error)api.error(e.message);if(live){busy=false;render();}}finally{busy=false;}})();return true;
 }
 async function start(cabinet,mode){
  var id=owner();if(!id)throw Error('Inicia sesión.');if(live){render();return;}
  // Cached games start immediately; only a missing cabinet needs a network download.
  if(preparing)return;preparing=true;if(api.preparing)api.preparing(true);
  try{await acquire(id);if(owner()!==id)throw Error('La cuenta ha cambiado.');var cached=await read(id);if(owner()!==id)throw Error('La cuenta ha cambiado.');if(mode==='liga'&&cached.pending.some(p=>p.record.mode==='liga')){if(navigator.onLine){await flush();cached=await read(id);}if(cached.pending.some(p=>p.record.mode==='liga'))throw Error('Valida la jornada pendiente al reconectar antes de jugar la siguiente jornada de Liga.');}if(!cached.active&&!cached.tickets.some(t=>t.rules==='offline3'&&t.expires>Date.now()&&!cached.pending.some(p=>p.ticketId===t.id)&&cabinet.orators.every(c=>t.profile.album.includes(c))&&cabinet.actions.every(c=>(t.profile.actionAlbum||[]).includes(c)))&&navigator.onLine)await download();
if(owner()!==id)throw Error('La cuenta ha cambiado.');await lock(id,async function(){var store=await read(id),record=store.active,ticket;if(owner()!==id)throw Error('La cuenta ha cambiado.');
   if(record){ticket=store.tickets.find(t=>t.id===record.ticketId);if(!ticket)throw Error('No se encuentra la partida guardada.');}
   else{ticket=store.tickets.find(t=>t.rules==='offline3'&&t.expires>Date.now()&&!store.pending.some(p=>p.ticketId===t.id)&&cabinet.orators.every(c=>t.profile.album.includes(c))&&cabinet.actions.every(c=>(t.profile.actionAlbum||[]).includes(c)));if(!ticket)throw Error('Conecta un momento para descargar partidas con este gabinete. Los premios pendientes se conservan.');record={ticketId:ticket.id,mode,cabinet,startedAt:Date.now(),commands:[]};store.active=record;await write(id,store);}
   var engine=HemicycleOfflineRules.forTicket(ticket),playback=engine.start(ticket,record.cabinet,record.mode);for(var step of record.commands)playback.state=engine.move(playback.state,step.command,step.at,playback.rng);
   live={owner:id,ticket,record,rules:engine,state:playback.state,rng:playback.rng,lastSequence:playback.state.visualSequence||0};
  });
  render();clock=setInterval(function(){if(live&&live.state.status==='active'&&Date.now()-live.record.startedAt>=live.state.deadline)send({type:'end'});},500);
  }catch(e){detach();throw e;}finally{preparing=false;if(api.preparing)api.preparing(false);}
 }
 async function status(){var id=owner();if(!id)return {tickets:0,pending:0};var store=await read(id);return {tickets:store.tickets.filter(t=>t.rules==='offline3'&&t.expires>Date.now()&&!store.pending.some(p=>p.ticketId===t.id)&&(!store.active||store.active.ticketId!==t.id)).length,rejected:(store.rejected||[]).length,pending:store.pending.length,active:!!store.active};}
 async function resume(){var id=owner();if(!id)return false;var active=(await read(id)).active;if(!active)return false;await start(active.cabinet,active.mode);return true;}
 return {start,resume,flush,download,detach,status,rejected:async function(){var id=owner();return id?(await read(id)).rejected||[]:[];}};
}};})(window);
