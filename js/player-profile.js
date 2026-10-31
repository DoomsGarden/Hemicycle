/* Cuenta y perfil. La sesión pertenece a Supabase; las estadísticas siguen siendo locales. */
(function(root){
'use strict';
function escape(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function create(api){
 function canUseAccount(){return !root.HemicycleLegal||root.HemicycleLegal.canUseAccount();}
 var editing=false,categoryRequest=0,cosmeticCategory='menu';
 var host=document.getElementById('profileRoot'),client=null,session=null,profile=null,verified=false,ready=false,opened=false,gate=false,readOnly=false,emailMode=false,recovering=false,busy=false,message='',nicknameDraft=null,generation=0,resolveEntry=null,previousFocus=null;
 // Capture recovery intent before the SDK consumes the callback URL. An ordinary
 // saved session or the query marker alone must never validate a recovery link.
 var recoveryKey='hemicycle_password_recovery_v1',recoveryIntent=false,recoveryCallback=false,recoveryCode=false,recoveryValid=false,recoveryError=false,implicitRecovery=false;
 try{var incoming=new URL(location.href),fragment=new URLSearchParams(incoming.hash.slice(1));recoveryIntent=incoming.searchParams.get('account')==='recovery'||fragment.get('type')==='recovery';recoveryCode=incoming.searchParams.has('code');recoveryCallback=recoveryCode||fragment.has('access_token');recoveryError=recoveryIntent&&(incoming.searchParams.has('error')||fragment.has('error')||fragment.has('error_code'));implicitRecovery=fragment.get('type')==='recovery'&&fragment.has('access_token')&&fragment.has('refresh_token');}catch(ignore){}
 recovering=recoveryIntent;
 function rememberRecovery(id){try{if(id)sessionStorage.setItem(recoveryKey,id);else sessionStorage.removeItem(recoveryKey);}catch(ignore){}}
 function rememberedRecovery(id){try{return !!id&&sessionStorage.getItem(recoveryKey)===id;}catch(ignore){return false;}}
 function clearRecovery(){recovering=false;recoveryValid=false;recoveryIntent=false;rememberRecovery(null);try{var current=new URL(location.href);current.searchParams.delete('account');current.searchParams.delete('code');current.searchParams.delete('error');current.searchParams.delete('error_code');current.searchParams.delete('error_description');var hash=new URLSearchParams(current.hash.slice(1));if(hash.has('error')||hash.has('access_token')||hash.get('type')==='recovery')current.hash='';history.replaceState(history.state,'',current.pathname+current.search+current.hash);}catch(ignore){}}
 function recoveryFailure(){recovering=true;recoveryValid=false;rememberRecovery(null);message='El enlace de recuperación ha caducado, ya se utilizó o se abrió en otro navegador. Solicita uno nuevo aquí y ábrelo en este mismo navegador.';if(!document.getElementById('launchScreen'))openRecovery();}
 var cachedKey=function(id){return 'hemiciclo_account_profile_v1:'+id;};
 function store(value){try{localStorage.setItem(cachedKey(value.user_id),JSON.stringify(value));}catch(ignore){}}
 function cached(id){try{var p=JSON.parse(localStorage.getItem(cachedKey(id)));return p&&p.user_id===id?p:null;}catch(ignore){return null;}}
 function notify(){if(opened&&!readOnly)render();if(api.changed)api.changed();}
 function errorText(error){
  if(error&&['PGRST202','42P01','42883'].includes(error.code))return 'La cuenta está conectada. Falta activar el perfil en el servidor para guardar tu nick.';
  if(error&&['22023','P0001'].includes(error.code))return error.message;
  return 'No se ha podido conectar. Comprueba tu conexión y vuelve a intentarlo.';
 }
 function profileRpc(name,args){var token=session&&session.access_token,request=client.rpc(name,args);if(token&&typeof request.setHeader==='function')request=request.setHeader('Authorization','Bearer '+token);return request;}
 async function loadProfile(){
  if(!client||!session||!canUseAccount())return;
  var id=session.user.id,ticket=++generation;verified=false;
  try{var result=await profileRpc('hemicycle_get_profile');if(result.error)throw result.error;
   if(ticket!==generation||!session||session.user.id!==id)return;
   if(!result.data||result.data.user_id!==id)throw new Error('Invalid profile');
   profile=result.data;verified=true;if(!recovering)message='';store(profile);
  }catch(error){if(ticket!==generation)return;if(!recovering)message=errorText(error);}
  notify();
 }
 function receive(next){
  var old=session&&session.user.id,id=next&&next.user&&next.user.id;
  session=id?next:null;
  if(old&&old!==id&&recoveryValid){clearRecovery();}if(old!==id){generation++;nicknameDraft=null;profile=id?cached(id):null;verified=false;}
  ready=true;if(session&&!recovering)emailMode=false;
  if(old!==id&&api.accountChanged)api.accountChanged();
  if(gate&&session&&!recovering){completeEntry();}
  if(session&&(!verified||old!==id))loadProfile();
  notify();
 }
 function focus(){var target=host.querySelector('#accountPassword,#accountEmail')||host.querySelector('[data-profile="close"],[data-profile="google"],[data-profile="guest"]');if(target)target.focus({preventScroll:true});}
 function open(asGate,asGuide,forRecovery){
  if(!forRecovery&&!asGate&&!asGuide&&api.canOpen&&!api.canOpen())return;
  opened=true;editing=false;gate=!!asGate;readOnly=!!asGuide;emailMode=false;host.dataset.tutorial=String(readOnly);previousFocus=document.activeElement;
  var app=document.getElementById('app');app.inert=true;app.setAttribute('aria-hidden','true');render();
  if(!document.getElementById('launchScreen'))focus();
 }
 function close(){
  if(gate)return;if(recovering)clearRecovery();opened=false;readOnly=false;delete host.dataset.tutorial;host.innerHTML='';var app=document.getElementById('app');
  if(!document.getElementById('launchScreen')){app.inert=false;app.removeAttribute('aria-hidden');}
  var target=previousFocus&&previousFocus.isConnected?previousFocus:document.querySelector('[data-act="profile"]');if(target)target.focus({preventScroll:true});
 }
 function completeEntry(){
  gate=false;close();if(resolveEntry){var done=resolveEntry;resolveEntry=null;done();}
 }
 function enter(){
  if(!canUseAccount())return Promise.resolve();
  if(recovering)return new Promise(function(resolve){resolveEntry=resolve;if(!document.getElementById('launchScreen'))openRecovery();});
  if(ready&&session)return Promise.resolve();
  return new Promise(function(resolve){resolveEntry=resolve;open(true);});
 }
 function metrics(){var s=api.stats();return '<div class="profile-stats">'+s.metrics.map(function(m){return '<div><span>'+escape(m[0])+'</span><b>'+escape(m[1])+'</b></div>';}).join('')+'</div><p class="profile-rarities">'+escape(s.rarities)+'</p><p class="profile-league">'+escape(s.league)+'</p><p class="profile-id" title="'+escape(s.id)+'">ID local: '+escape(s.id)+'</p>';}
 function scrollFrame(){var panel=host.querySelector(".player-profile"),scroll=document.createElement("div");scroll.className="profile-scroll";while(panel.firstChild)scroll.appendChild(panel.firstChild);panel.appendChild(scroll);}
 function render(){
  if(!opened)return;
  var oldScroll=host.querySelector('.profile-scroll'),scrollTop=oldScroll?oldScroll.scrollTop:0;
  var active=host.contains(document.activeElement)?document.activeElement:null,activeId=active&&active.id,action=active&&active.dataset.profile,draft=activeId==='profileNickname'?active.value:null;
  var previousForm=host.querySelector('#emailLoginForm'),fields=previousForm&&previousForm.dataset.mode===emailMode?Array.from(previousForm.querySelectorAll('input')).map(function(input){return [input.id,input.value];}):[];
  if(editing&&!gate&&!emailMode&&api.editor){host.innerHTML='<div class="profile-shade"><section class="player-profile cosmetic-editor" role="dialog" aria-modal="true" aria-labelledby="profileTitle"><header><button type="button" class="mini" data-profile="edit-back" aria-label="Volver al perfil">‹</button><h2 id="profileTitle">Editar perfil</h2><button type="button" class="mini profile-close" data-profile="close" aria-label="Cerrar perfil">×</button></header>'+api.editor(cosmeticCategory)+'</section></div>';scrollFrame();return;}
  var nick=profile&&profile.nickname,canEdit=!!(session&&verified&&profile.can_rename&&!readOnly),date=profile&&profile.next_nickname_change_at?new Intl.DateTimeFormat('es-ES',{dateStyle:'medium',timeZone:'Europe/Madrid'}).format(new Date(profile.next_nickname_change_at)):'';
  var account=session?'<span class="profile-status">Cuenta conectada</span><button type="button" class="mini" data-profile="cloud">Nube</button><button type="button" class="mini" data-profile="logout" '+(busy?'disabled':'')+'>Cerrar sesión</button>':'<button type="button" class="btn profile-google" data-profile="google" '+(!client||busy?'disabled':'')+'>'+(busy?'Conectando…':'Continuar con Google')+'</button><button type="button" class="mini profile-email-toggle" data-profile="email">Acceder con correo</button>';
  var nickname=session?'<label for="profileNickname">Nick de jugador</label><form id="nicknameForm"><input id="profileNickname" name="nickname" minlength="3" maxlength="20" autocomplete="nickname" value="'+escape(nicknameDraft!==null?nicknameDraft:nick||'')+'" placeholder="Elige tu nick" '+(!canEdit||busy?'disabled':'')+'><button type="submit" class="btn sm" '+(!canEdit||busy?'disabled':'')+'>Guardar</button></form><p class="profile-hint">'+(!verified?'El cambio de nick requiere conexión con tu cuenta.':profile.can_rename?(!nick?'Primera elección gratuita. Después, un cambio gratis cada año.':'Tienes disponible un cambio gratuito.'):'Próximo cambio gratuito: '+escape(date)+'.')+'</p>':'<p class="profile-hint">Conecta tu cuenta para elegir un nick y conservarlo entre dispositivos.</p>';
  if(!canUseAccount()){account='<p class="profile-hint">Modo invitado · Las cuentas están disponibles desde 14 años. Puedes revisar tu elección en Opciones → Información legal.</p>';nickname='';emailMode=false;}
  if(recovering)account='';
  if(emailMode){
   var signup=emailMode==='signup',reset=emailMode==='recover',update=emailMode==='update';
   nickname='<form id="emailLoginForm" data-mode="'+emailMode+'" class="profile-mail"><h3>'+({login:'Acceder con correo',signup:'Crear cuenta',recover:'Recuperar acceso',update:'Nueva contraseña'})[emailMode]+'</h3>'
    +(!update?'<label for="accountEmail">Correo de tu cuenta</label><input id="accountEmail" name="email" type="email" autocomplete="email" required>':'')
    +(!reset?'<label for="accountPassword">'+(signup||update?'Contraseña · al menos 8 caracteres':'Contraseña')+'</label><input id="accountPassword" name="password" type="password" autocomplete="'+(signup||update?'new-password':'current-password')+'" '+(signup||update?'minlength="8"':'')+' required>':'')
    +'<button class="btn" type="submit" '+(busy?'disabled':'')+'>'+({login:'Acceder',signup:'Crear cuenta',recover:'Enviar enlace',update:'Guardar contraseña'})[emailMode]+'</button>'
    +(emailMode==='login'?'<div class="profile-email-links"><button class="mini" type="button" data-profile="email-signup">Crear cuenta</button><button class="mini" type="button" data-profile="email-recover">He olvidado la contraseña</button></div>':'')
    +'<button class="mini" type="button" data-profile="email-back">'+(update?'Cancelar':'Volver')+'</button></form>';
  }
  if(!gate&&!emailMode&&!recovering){
   var accountOpen=!!(host.querySelector('#profileAccountDetails')&&host.querySelector('#profileAccountDetails').open),statsOpen=!!(host.querySelector('#profileStatsDetails')&&host.querySelector('#profileStatsDetails').open),stats=api.stats(),main=['Victorias','Derrotas','Elo','Fuerza Soberana'].map(function(key){return stats.metrics.find(function(m){return m[0]===key;});}).filter(Boolean);
   host.innerHTML='<div class="profile-shade"><section class="player-profile personal-profile" role="dialog" aria-modal="true" aria-labelledby="profileTitle"><header><div><img class="profile-brand" src="assets/brand-wordmark.svg" alt="Hemiciclo"><small class="profile-heading-label">Perfil de jugador</small><h2 id="profileTitle">'+escape(nick||'Tu bancada')+'</h2></div><button type="button" class="mini profile-close" data-profile="close" aria-label="Cerrar perfil">×</button></header>'+(api.experience?api.experience():'')+'<div class="profile-primary-stats">'+main.map(function(m){return '<div><span>'+escape(m[0]==='Fuerza Soberana'?'FS':m[0])+'</span><b>'+escape(m[0]==='Fuerza Soberana'?String(m[1]).replace(/\sFS$/,''):m[1])+'</b></div>';}).join('')+'</div>'+(api.editor?'<button type="button" class="btn ghost profile-edit-button" data-profile="edit"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m14 5 5 5M5 14 16 3l5 5-11 11H5Z"/><path d="M5 19c0 3-3 3-3 3s0-3 3-3Z"/></svg> Editar perfil <span aria-hidden="true">›</span></button>':'')+(api.openHistory?'<button type="button" class="mini profile-history" data-profile="history">Historial de partidas <span aria-hidden="true">›</span></button>':'')+'<details id="profileAccountDetails" class="profile-secondary"'+(accountOpen||readOnly||message?' open':'')+'><summary>Cuenta y guardado</summary><div class="profile-account"><div class="profile-account-actions">'+account+'</div><div class="profile-nickname">'+nickname+'</div><p class="profile-message" role="status">'+escape(message||(!ready?'Comprobando sesión…':session?(api.cloudLabel?api.cloudLabel():'Cuenta conectada.'):'Puedes continuar como invitado.'))+'</p>'+(api.offlineInfo?api.offlineInfo():'')+(session&&!verified?'<button type="button" class="mini" data-profile="retry" '+(busy?'disabled':'')+'>Reintentar conexión</button>':'')+'</div></details><details id="profileStatsDetails" class="profile-secondary"'+(statsOpen||readOnly?' open':'')+'><summary>Más estadísticas</summary>'+metrics()+'</details></section></div>';
  }else{
  host.innerHTML='<div class="profile-shade"><section class="player-profile '+(gate?'account-entry':'')+'" role="dialog" aria-modal="true" aria-labelledby="profileTitle"><header><div><small>HEMICICLO</small><h2 id="profileTitle">'+(recovering?'Recuperar acceso':gate?'Tu cuenta':escape(nick||'Perfil de jugador'))+'</h2></div>'+(!gate?'<button type="button" class="mini profile-close" data-profile="close" aria-label="Cerrar perfil">×</button>':'')+'</header><div class="profile-columns"><div class="profile-account"><div class="profile-account-actions">'+account+'</div><div class="profile-nickname">'+nickname+'</div><p class="profile-message" role="status">'+escape(message||(!ready?'Comprobando sesión…':session?(api.cloudLabel?api.cloudLabel():'El nick se guarda en tu cuenta. El progreso del juego todavía se guarda en este dispositivo.'):'Puedes jugar como invitado y conectar tu cuenta más adelante.'))+'</p>'+(!gate&&!emailMode&&api.editor?'<button type="button" class="btn ghost profile-edit-button" data-profile="edit">Editar perfil</button>':'')+(!gate&&!emailMode&&api.offlineInfo?api.offlineInfo():'')+(!gate&&!emailMode&&api.openHistory?'<button type="button" class="mini profile-history" data-profile="history">Historial de partidas</button>':'')+(session&&!verified&&!recovering?'<button type="button" class="mini" data-profile="retry" '+(busy?'disabled':'')+'>Reintentar conexión</button>':'')+'</div>'+(!gate&&!emailMode?'<div class="profile-overview">'+(api.experience?api.experience():'')+'<h3>Estadísticas de este dispositivo</h3>'+metrics()+'</div>':'')+'</div>'+(gate&&!recovering?'<button type="button" class="btn ghost profile-guest" data-profile="guest">Continuar sin cuenta</button>':'')+'</section></div>';
  }
  scrollFrame();host.querySelector('.profile-scroll').scrollTop=scrollTop;
  fields.forEach(function(field){var input=host.querySelector('#'+field[0]);if(input)input.value=field[1];});
  if(activeId&&fields.some(function(field){return field[0]===activeId;})){var input=host.querySelector('#'+activeId);if(input)input.focus({preventScroll:true});}
  else if(draft!==null){var input=host.querySelector('#profileNickname');if(input&&!input.disabled){input.value=draft;input.focus({preventScroll:true});}}
  else if(action){var replacement=host.querySelector('[data-profile="'+action+'"]'+(action==='theme'?'[data-theme="'+active.dataset.theme+'"]':''));if(replacement&&!replacement.disabled)replacement.focus({preventScroll:true});}
 }
 async function login(){
  if(busy||!client)return;busy=true;message='';render();
  try{
   var result=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:api.config.redirectTo,skipBrowserRedirect:true}});
   if(result.error)throw result.error;
   var url=new URL(result.data.url),project=new URL(api.config.url);
   if(url.origin!==project.origin||url.pathname!=='/auth/v1/authorize')throw new Error('Invalid OAuth destination');
   location.assign(url.href);
  }catch(error){busy=false;message=errorText(error);render();focus();}
 }
 function redirect(kind){var url=new URL(api.config.redirectTo);if(kind)url.searchParams.set('account',kind);return url.href;}
 async function loginEmail(form){
  if(busy||!client)return;var fields=new FormData(form),mode=emailMode,email=String(fields.get('email')||'').trim(),password=String(fields.get('password')||'');busy=true;message='';render();
  try{
   var result;
   if(mode==='recover'){
    result=await client.auth.resetPasswordForEmail(email,{redirectTo:redirect('recovery')});if(result.error)throw result.error;
    message='Si el correo tiene una cuenta, recibirás un enlace para elegir otra contraseña. Revisa también el correo no deseado.';
   }else if(mode==='signup'){
    result=await client.auth.signUp({email:email,password:password,options:{emailRedirectTo:redirect()}});if(result.error)throw result.error;
    if(result.data.session)receive(result.data.session);else{emailMode='login';message='Revisa tu correo para confirmar la cuenta antes de acceder.';}
   }else if(mode==='update'){
    if(!session||!recovering||!recoveryValid)throw Error('Recovery session expired');
    result=await client.auth.updateUser({password:password});if(result.error)throw result.error;
    clearRecovery();emailMode=false;message='Contraseña actualizada. Ya puedes acceder con tu nueva contraseña.';if(resolveEntry)completeEntry();
   }else{
    result=await client.auth.signInWithPassword({email:email,password:password});if(result.error)throw result.error;receive(result.data.session);
   }
  }catch(error){message=error&&error.code==='invalid_credentials'?'El correo o la contraseña no son correctos.':error&&error.code==='email_not_confirmed'?'Debes confirmar el correo de tu cuenta antes de acceder.':error&&['weak_password','validation_failed'].includes(error.code)?'La contraseña no cumple los requisitos de seguridad de tu cuenta. Prueba una más larga con mayúsculas, minúsculas y números.':error&&['over_email_send_rate_limit','over_request_rate_limit'].includes(error.code)?'Espera un poco antes de solicitar otro correo.':errorText(error);}
  finally{busy=false;render();focus();}
 }
 async function logout(){
  if(busy)return;busy=true;render();
  try{var result=await client.auth.signOut({scope:'local'});if(result.error)throw result.error;receive(null);message='Has cerrado la sesión. Tu progreso local se conserva.';}
  catch(error){message=errorText(error);}finally{busy=false;render();focus();}
 }
 async function saveNickname(form){
  if(busy||!session||!verified||!profile.can_rename)return;
  var nick=new FormData(form).get('nickname').normalize('NFC').trim();
  if(!/^[\p{L}\p{N} ._-]{3,20}$/u.test(nick)){message='Usa de 3 a 20 caracteres: letras, números, espacios, punto, guion o guion bajo.';render();return;}
  var id=session.user.id,ticket=++generation;busy=true;message='';render();
  try{var result=await profileRpc('hemicycle_set_nickname',{p_nickname:nick});if(result.error)throw result.error;
   if(ticket!==generation||!session||session.user.id!==id)return;
   if(!result.data||result.data.user_id!==id)throw new Error('Invalid profile');
   profile=result.data;nicknameDraft=null;store(profile);verified=true;message='Nick guardado.';
  }catch(error){if(ticket===generation)message=errorText(error);}finally{busy=false;render();focus();}
 }
 host.addEventListener('click',function(event){if(readOnly)return;var button=event.target.closest('[data-profile]');if(!button||button.disabled)return;var action=button.dataset.profile;
  if(action==='edit'){editing=true;render();host.querySelector('[data-profile=edit-back]').focus();return;}
  if(action==='edit-back'){editing=false;render();host.querySelector('[data-profile=edit]').focus();return;}
  if(action==='cosmetic-category'){var category=button.dataset.kind,request=++categoryRequest,status=host.querySelector('.cosmetic-status');status.textContent='Preparando colección…';Promise.resolve(api.prepareCategory&&api.prepareCategory(category)).then(function(){if(!opened||!editing||request!==categoryRequest)return;cosmeticCategory=category;if(api.refreshEditor)api.refreshEditor(host,cosmeticCategory,true);button.focus({preventScroll:true});}).catch(function(error){if(request===categoryRequest&&status.isConnected)status.textContent=error.message;});return;}
  if(action==='cosmetic-pick'&&api.setCosmetic){var kind=button.dataset.kind,id=button.dataset.id,status=host.querySelector('.cosmetic-status');status.textContent='Preparando aspecto…';Promise.resolve(api.setCosmetic(kind,id)).then(function(){if(opened&&editing&&api.refreshEditor)api.refreshEditor(host,cosmeticCategory,false);}).catch(function(error){if(status.isConnected)status.textContent=error.message;});return;}
  if(action==='theme'&&api.setAppearance){api.setAppearance(button.dataset.theme);render();}if(busy)return;if(action==='email-signup'||action==='email-recover'){emailMode=action==='email-signup'?'signup':'recover';message='';render();host.querySelector('#accountEmail').focus();}if(action==='email'){emailMode='login';render();host.querySelector('#accountEmail').focus();}if(action==='email-back'){clearRecovery();emailMode=false;if(resolveEntry)completeEntry();else{render();focus();}}if(action==='offline-sync'&&api.syncOffline)api.syncOffline().catch(function(e){message=e.message;render();});if(action==='history'&&api.openHistory)api.openHistory();if(action==='cloud'&&api.openCloud)api.openCloud();if(action==='google')login();if(action==='guest')completeEntry();if(action==='close')close();if(action==='logout')logout();if(action==='retry')loadProfile();
 });
 host.addEventListener('input',function(event){if(event.target.id==='profileNickname')nicknameDraft=event.target.value;});
 host.addEventListener('submit',function(event){if(event.target.id==='emailLoginForm'){event.preventDefault();if(!readOnly)loginEmail(event.target);return;}if(event.target.id==='nicknameForm'){event.preventDefault();if(!readOnly)saveNickname(event.target);}});
 document.addEventListener('keydown',function(e){if(!opened||!editing||!e.target.matches('[data-profile=cosmetic-category]')||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();var tabs=Array.from(host.querySelectorAll('[data-profile=cosmetic-category]')),i=tabs.indexOf(e.target),next=e.key==='Home'?0:e.key==='End'?3:(i+(e.key==='ArrowRight'?1:3))%4;tabs[next].click();});
 document.addEventListener('keydown',function(event){if(!opened||readOnly||document.getElementById('launchScreen'))return;
  if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();if(!gate)close();return;}
  if(event.key==='Tab'){var buttons=Array.from(host.querySelectorAll('button:not(:disabled),input:not(:disabled)'));var i=buttons.indexOf(document.activeElement);
   if(buttons.length&&((event.shiftKey&&i<=0)||(!event.shiftKey&&(i<0||i===buttons.length-1)))){event.preventDefault();buttons[event.shiftKey?buttons.length-1:0].focus();}}
 },true);
 function openRecovery(){open(!!resolveEntry,false,true);emailMode=recoveryValid?'update':'recover';if(recoveryValid)message='Elige una nueva contraseña para tu cuenta.';render();focus();}
 document.addEventListener('hemicycle:entered',function(){if(recovering){openRecovery();return;}if(opened){var app=document.getElementById('app');app.inert=true;app.setAttribute('aria-hidden','true');focus();}});
 try{var incoming=new URL(location.href),fragment=new URLSearchParams(location.hash.slice(1));if(!recoveryIntent&&(incoming.searchParams.has('error')||fragment.has('error')))message='No se completó el acceso con Google. Puedes volver a intentarlo.';}catch(ignore){}
 var fetchWithTimeout=function(input,options){var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},10000);options=Object.assign({},options,{signal:controller.signal});return fetch(input,options).finally(function(){clearTimeout(timer);});};
 function initAccount(){
 if(!canUseAccount()){ready=true;if(client){client.auth.stopAutoRefresh();client.auth.signOut({scope:'local'}).catch(function(){});receive(null);}return;}
 if(client){client.auth.startAutoRefresh();return;}
 ready=false;
 try{
  client=api.client||root.supabase.createClient(api.config.url,api.config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:!implicitRecovery,flowType:'pkce'},global:{fetch:fetchWithTimeout}});
  client.auth.onAuthStateChange(function(event,next){setTimeout(function(){if(next&&!recoveryError&&(event==='PASSWORD_RECOVERY'||event==='SIGNED_IN'&&!implicitRecovery&&recoveryIntent&&recoveryCode&&!new URL(location.href).searchParams.has('code'))){recovering=true;recoveryValid=true;rememberRecovery(next.user.id);receive(next);if(!document.getElementById('launchScreen'))openRecovery();}else receive(next);},0);});
  // Older email links can carry an implicit recovery session. Validate it with
  // the SDK explicitly while retaining PKCE for all subsequent Google logins.
  var initialSession=implicitRecovery&&!recoveryError?client.auth.setSession({access_token:fragment.get('access_token'),refresh_token:fragment.get('refresh_token')}).then(function(result){if(result.error)throw result.error;if(!result.data.session)throw Error('Invalid recovery session');recovering=true;recoveryValid=true;rememberRecovery(result.data.session.user.id);var current=new URL(location.href);current.hash='';history.replaceState(history.state,'',current.pathname+current.search);return result;}):client.auth.getSession();
  initialSession.then(function(result){if(result.error)throw result.error;var next=result.data.session;if(!recoveryError&&next&&!recoveryCallback&&rememberedRecovery(next.user.id)){recovering=true;recoveryValid=true;}receive(next);if(recovering){if(!recoveryValid)recoveryFailure();else if(!document.getElementById('launchScreen'))openRecovery();}}).catch(function(){ready=true;if(recoveryIntent){recoveryFailure();return;}message='No se ha podido recuperar la sesión. Puedes reintentarlo o continuar sin cuenta.';notify();});
 }catch(error){ready=true;if(recoveryIntent)recoveryFailure();else message='El acceso a cuentas no está disponible. Puedes continuar sin cuenta.';}
 }
 document.addEventListener('hemicycle:legal-accepted',initAccount);
 initAccount();
 return {enter:enter,open:function(){open(false);},openGuide:function(){open(false,true);},close:close,isOpen:function(){return opened;},account:function(){return canUseAccount()&&session?{userId:session.user.id,client:client,accessToken:session.access_token}:null;},refresh:function(){if(opened&&!gate&&!readOnly&&!editing)render();}};
}
root.HemicyclePlayerProfile={create:create};
})(typeof globalThis!=='undefined'?globalThis:this);
