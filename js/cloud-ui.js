/* Guardado automático y recuperación explícita de copias, sin mezclar inventarios. */
(function(root){
'use strict';
var LABELS={guest:'Sin cuenta',checking:'Comprobando copia…',empty:'Preparando guardado automático',migration:'Importación inicial pendiente',available:'Copia disponible en tu cuenta',synced:'Progreso guardado en la nube',pending:'Cambios pendientes de guardar',saving:'Guardando en la nube…',preparing:'Preparando tu guardado en la nube…',conflict:'Hay otra copia más reciente',error:'Guardado pendiente de conexión'};
function create(api){
 var service=api.service,host=document.getElementById('cloudRoot'),opened=false,reviewed=false,previousFocus=null,operation=false,localError='',reviewedFingerprint=null,reviewedRevision=null;
 function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
 function summary(p){return p.album.length+' oradores'+(p.actionAlbum?' · '+p.actionAlbum.length+' acciones':'')+' · '+p.w+' victorias · '+p.l+' derrotas · '+p.fs+' FS · '+p.elo+' Elo';}
 function syncState(){return api.syncState?api.syncState():{};}
 function label(){var s=service.state(),sync=syncState(),offline=api.offlineStatus&&api.offlineStatus();if(sync.running)return 'Sincronizando progreso y partidas…';if(sync.error)return 'Sincronización pendiente';if(offline&&offline.pending)return 'Resultados pendientes de confirmar';return LABELS[s.phase]||'Comprobando';}
 function render(){
  if(!opened)return;
  var focused=host.contains(document.activeElement)&&document.activeElement.getAttribute('data-cloud'),details=host.querySelector('.cloud-recovery-options'),expanded=details&&details.open;
  var s=service.state(),sync=syncState(),offline=api.offlineStatus&&api.offlineStatus(),local=api.snapshot(),remote=s.remote&&s.remote.payload;
  var canSave=s.connected&&!s.automatic&&s.phase==='empty',canRestore=remote&&(s.phase==='conflict'||!s.automatic&&s.phase!=='checking');
  var busy=operation||sync.running||['saving','checking','preparing'].includes(s.phase),failure=localError||sync.error||s.error;
  var description=s.phase==='migration'?'Tu progreso local y su copia de recuperación se conservan. La importación inicial está pendiente; se volverá a comprobar automáticamente al conectar.':s.phase==='conflict'?'Las copias no se suman. Recupera la nube para actualizar tus recursos; las jugadas offline pendientes se validarán por separado.':s.connected?'Tu progreso y los resultados de partidas se sincronizan automáticamente. Las recompensas se abonan una sola vez al confirmar cada resultado.':'Inicia sesión para guardar y recuperar tu progreso automáticamente en otros dispositivos.';
  host.innerHTML='<div class="cloud-shade"><section class="cloud-panel" role="dialog" aria-modal="true" aria-labelledby="cloudTitle">'
   +'<header><h2 id="cloudTitle">Guardado en la nube</h2><button class="mini" data-cloud="close" aria-label="Cerrar guardado">×</button></header>'
   +'<p class="cloud-status" role="status">'+esc(label())+'</p><p class="cloud-error" role="alert">'+esc(failure)+'</p>'
   +'<div class="cloud-copy"><h3>Este dispositivo</h3><p>'+esc(summary(local.profile))+'</p></div>'
   +(remote?'<div class="cloud-copy"><h3>Tu cuenta</h3><p>'+esc(summary(remote.profile))+'</p><small>'+esc(new Intl.DateTimeFormat(root.HemicycleI18n?root.HemicycleI18n.tag:'es-ES',{dateStyle:'medium',timeStyle:'short'}).format(new Date(s.remote.updated_at)))+'</small></div>':'')
   +'<p class="cloud-description">'+esc(description)+'</p>'
   +(offline?'<p class="cloud-description" data-cloud-offline-status>'+esc('Partidas preparadas: '+offline.tickets+' · Resultados por sincronizar: '+offline.pending+' · Para revisar: '+(offline.rejected||0))+'</p>'+(offline.pending?'<p class="cloud-description">Son resultados de partidas, no regalos del buzón. Se confirmarán automáticamente al conectar.</p>':''):'')
   +(failure&&s.connected?'<button class="mini" data-cloud="retry" '+(busy?'disabled':'')+'>Reintentar</button>':'')
   +((canSave||canRestore)?'<p class="cloud-description">Revisa los datos y marca el tick para confirmar '+(canSave?'el primer guardado.':'la recuperación.')+'</p><div class="cloud-confirm"><button class="btn ghost" data-cloud="close">Cancelar</button><button class="btn ghost cloud-review '+(reviewed?'is-reviewed':'')+'" data-cloud="review" aria-label="He revisado los datos" aria-pressed="'+reviewed+'" '+(busy?'disabled':'')+'>✓</button><button class="btn" data-cloud="'+(canSave?'activate':'restore')+'" '+(!reviewed||busy?'disabled':'')+'>'+(canSave?'Activar guardado':'Recuperar copia')+'</button></div>':'')
   +'<details class="cloud-recovery-options" '+(expanded?'open':'')+'><summary data-cloud="recovery-options">Copias de seguridad y recuperación</summary><div class="cloud-actions">'
   +'<button class="mini" data-cloud="export">Descargar copia local</button>'
   +(offline&&offline.rejected&&api.downloadRejected?'<button class="mini" data-cloud="rejected">Exportar partidas para revisión</button>':'')
   +(service.remoteRecovery()?'<button class="mini" data-cloud="remote-recovery">Descargar copia anterior de la nube</button>':'')
   +(service.recovery()?'<button class="mini" data-cloud="recovery">Descargar copia anterior a la última recuperación</button>':'')
   +'</div></details></section></div>';
  if(focused){var next=host.querySelector('[data-cloud="'+focused+'"]')||host.querySelector('[data-cloud=close]');if(next)next.focus({preventScroll:true});}
 }
 function changed(){if(opened){reviewed=false;localError='';render();}if(api.changed)api.changed();}
 function open(){
  if(api.canOpen&&!api.canOpen())return;opened=true;reviewed=false;localError='';previousFocus=document.activeElement;
  document.getElementById('app').inert=true;document.getElementById('app').setAttribute('aria-hidden','true');render();host.querySelector('[data-cloud=close]').focus();
  Promise.resolve().then(function(){if(api.refreshOffline)return api.refreshOffline();}).then(function(){if(api.sync)return api.sync(false);return service.reconnect();}).catch(function(e){if(opened){localError=e.message;render();}});
 }
 function close(){opened=false;host.innerHTML='';var app=document.getElementById('app');app.inert=false;app.removeAttribute('aria-hidden');var target=previousFocus&&previousFocus.isConnected?previousFocus:document.querySelector('[data-act=profile]');if(target)target.focus({preventScroll:true});}
 async function action(name){
  if(operation&&name!=='close')return;
  if(name==='close'){close();return;}
  if(name==='activate'||name==='restore'){
   if(!reviewed)return;
   if(reviewedFingerprint!==root.HemicycleCloudSave.fingerprint(api.snapshot())||reviewedRevision!==(service.state().remote&&service.state().remote.revision)){reviewed=false;localError='El progreso ha cambiado. Revisa de nuevo las copias antes de confirmar.';render();return;}
   operation=true;render();
   try{if(name==='activate')await service.activate();else await service.restore(service.state().remote.revision);}
   catch(e){localError=e.message;}
   finally{operation=false;reviewed=false;render();}return;
  }
  if(name==='retry'){operation=true;localError='';render();try{if(api.sync)await api.sync(true);else await service.reconnect();}catch(e){localError=e.message;}finally{operation=false;render();}return;}
  if(name==='rejected'&&api.downloadRejected){await api.downloadRejected();return;}
  if(name==='export')api.export();
  if(name==='recovery'){var saved=service.recovery();if(saved)api.download(saved.payload,'recuperacion');}
  if(name==='remote-recovery'){var remoteSaved=service.remoteRecovery();if(remoteSaved)api.download(remoteSaved.payload,'nube-anterior');}
 }
 host.addEventListener('click',function(event){var b=event.target.closest('[data-cloud]');if(!b||b.disabled)return;if(b.dataset.cloud==='review'){reviewed=!reviewed;reviewedFingerprint=root.HemicycleCloudSave.fingerprint(api.snapshot());reviewedRevision=service.state().remote&&service.state().remote.revision;render();host.querySelector('[data-cloud=review]').focus();}else action(b.dataset.cloud);});
 document.addEventListener('keydown',function(event){if(!opened)return;if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close();}if(event.key==='Tab'){var buttons=Array.from(host.querySelectorAll('button:not(:disabled),summary')).filter(function(el){return el.getClientRects().length;});var i=buttons.indexOf(document.activeElement);if(buttons.length&&((event.shiftKey&&i<=0)||(!event.shiftKey&&(i<0||i===buttons.length-1)))){event.preventDefault();buttons[event.shiftKey?buttons.length-1:0].focus();}}},true);
 return {open:open,close:close,changed:changed,offlineChanged:render,isOpen:function(){return opened;},label:function(){return syncState().error||service.state().error||label();}};
}
root.HemicycleCloudUI={create:create};
})(typeof globalThis!=='undefined'?globalThis:this);
