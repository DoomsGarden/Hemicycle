/* Cuenta y perfil. La sesión pertenece a Supabase; las estadísticas siguen siendo locales. */
(function(root){
'use strict';
function escape(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function create(api){
 var host=document.getElementById('profileRoot'),client=null,session=null,profile=null,verified=false,ready=false,opened=false,gate=false,readOnly=false,emailMode=false,busy=false,message='',nicknameDraft=null,generation=0,resolveEntry=null,previousFocus=null;
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
  if(!client||!session)return;
  var id=session.user.id,ticket=++generation;verified=false;
  try{var result=await profileRpc('hemicycle_get_profile');if(result.error)throw result.error;
   if(ticket!==generation||!session||session.user.id!==id)return;
   if(!result.data||result.data.user_id!==id)throw new Error('Invalid profile');
   profile=result.data;verified=true;message='';store(profile);
  }catch(error){if(ticket!==generation)return;message=errorText(error);}
  notify();
 }
 function receive(next){
  var old=session&&session.user.id,id=next&&next.user&&next.user.id;
  session=id?next:null;
  if(old!==id){generation++;nicknameDraft=null;profile=id?cached(id):null;verified=false;}
  ready=true;if(session)emailMode=false;
  if(old!==id&&api.accountChanged)api.accountChanged();
  if(gate&&session){completeEntry();}
  if(session&&(!verified||old!==id))loadProfile();
  notify();
 }
 function focus(){var target=host.querySelector('[data-profile="close"],[data-profile="google"],[data-profile="guest"]');if(target)target.focus({preventScroll:true});}
 function open(asGate,asGuide){
  if(!asGate&&!asGuide&&api.canOpen&&!api.canOpen())return;
  opened=true;gate=!!asGate;readOnly=!!asGuide;emailMode=false;host.dataset.tutorial=String(readOnly);previousFocus=document.activeElement;
  var app=document.getElementById('app');app.inert=true;app.setAttribute('aria-hidden','true');render();
  if(!document.getElementById('launchScreen'))focus();
 }
 function close(){
  if(gate)return;opened=false;readOnly=false;delete host.dataset.tutorial;host.innerHTML='';var app=document.getElementById('app');
  if(!document.getElementById('launchScreen')){app.inert=false;app.removeAttribute('aria-hidden');}
  var target=previousFocus&&previousFocus.isConnected?previousFocus:document.querySelector('[data-act="profile"]');if(target)target.focus({preventScroll:true});
 }
 function completeEntry(){
  gate=false;close();if(resolveEntry){var done=resolveEntry;resolveEntry=null;done();}
 }
 function enter(){
  if(ready&&session)return Promise.resolve();
  return new Promise(function(resolve){resolveEntry=resolve;open(true);});
 }
 function metrics(){var s=api.stats();return '<div class="profile-stats">'+s.metrics.map(function(m){return '<div><span>'+escape(m[0])+'</span><b>'+escape(m[1])+'</b></div>';}).join('')+'</div><p class="profile-rarities">'+escape(s.rarities)+'</p><p class="profile-league">'+escape(s.league)+'</p><p class="profile-id" title="'+escape(s.id)+'">ID local: '+escape(s.id)+'</p>';}
 function render(){
  if(!opened)return;
  var active=host.contains(document.activeElement)?document.activeElement:null,activeId=active&&active.id,action=active&&active.dataset.profile,draft=activeId==='profileNickname'?active.value:null;
  var nick=profile&&profile.nickname,canEdit=!!(session&&verified&&profile.can_rename&&!readOnly),date=profile&&profile.next_nickname_change_at?new Intl.DateTimeFormat('es-ES',{dateStyle:'medium',timeZone:'Europe/Madrid'}).format(new Date(profile.next_nickname_change_at)):'';
  var account=session?'<span class="profile-status">Cuenta conectada</span><button type="button" class="mini" data-profile="cloud">Nube</button><button type="button" class="mini" data-profile="logout" '+(busy?'disabled':'')+'>Cerrar sesión</button>':'<button type="button" class="btn profile-google" data-profile="google" '+(!client||busy?'disabled':'')+'>'+(busy?'Conectando…':'Continuar con Google')+'</button><button type="button" class="mini profile-email-toggle" data-profile="email">Acceder con correo</button>';
  var nickname=session?'<label for="profileNickname">Nick de jugador</label><form id="nicknameForm"><input id="profileNickname" name="nickname" minlength="3" maxlength="20" autocomplete="nickname" value="'+escape(nicknameDraft!==null?nicknameDraft:nick||'')+'" placeholder="Elige tu nick" '+(!canEdit||busy?'disabled':'')+'><button type="submit" class="btn sm" '+(!canEdit||busy?'disabled':'')+'>Guardar</button></form><p class="profile-hint">'+(!verified?'El cambio de nick requiere conexión con tu cuenta.':profile.can_rename?(!nick?'Primera elección gratuita. Después, un cambio gratis cada año.':'Tienes disponible un cambio gratuito.'):'Próximo cambio gratuito: '+escape(date)+'.')+'</p>':'<p class="profile-hint">Conecta tu cuenta para elegir un nick y conservarlo entre dispositivos.</p>';
  if(emailMode)nickname='<form id="emailLoginForm" class="profile-mail"><label for="accountEmail">Correo de tu cuenta</label><input id="accountEmail" name="email" type="email" autocomplete="username" required><label for="accountPassword">Contraseña</label><input id="accountPassword" name="password" type="password" autocomplete="current-password" required><button class="btn" type="submit" '+(busy?'disabled':'')+'>Acceder</button><button class="mini" type="button" data-profile="email-back">Volver</button></form>';
  host.innerHTML='<div class="profile-shade"><section class="player-profile '+(gate?'account-entry':'')+'" role="dialog" aria-modal="true" aria-labelledby="profileTitle"><header><div><small>HEMICICLO</small><h2 id="profileTitle">'+(gate?'Tu cuenta':escape(nick||'Perfil de jugador'))+'</h2></div>'+(!gate?'<button type="button" class="mini profile-close" data-profile="close" aria-label="Cerrar perfil">×</button>':'')+'</header><div class="profile-columns"><div class="profile-account"><div class="profile-account-actions">'+account+'</div><div class="profile-nickname">'+nickname+'</div><p class="profile-message" role="status">'+escape(message||(!ready?'Comprobando sesión…':session?(api.cloudLabel?api.cloudLabel():'El nick se guarda en tu cuenta. El progreso del juego todavía se guarda en este dispositivo.'):'Puedes jugar como invitado y conectar tu cuenta más adelante.'))+'</p>'+(session&&!verified?'<button type="button" class="mini" data-profile="retry" '+(busy?'disabled':'')+'>Reintentar conexión</button>':'')+'</div>'+(!gate&&!emailMode?'<div class="profile-overview"><h3>Estadísticas de este dispositivo</h3>'+metrics()+'</div>':'')+'</div>'+(gate?'<button type="button" class="btn ghost profile-guest" data-profile="guest">Continuar sin cuenta</button>':'')+'</section></div>';
  if(draft!==null){var input=host.querySelector('#profileNickname');if(input&&!input.disabled){input.value=draft;input.focus({preventScroll:true});}}
  else if(action){var replacement=host.querySelector('[data-profile="'+action+'"]');if(replacement&&!replacement.disabled)replacement.focus({preventScroll:true});}
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
 async function loginEmail(form){
  if(busy||!client)return;var fields=new FormData(form);busy=true;message='';
  try{var result=await client.auth.signInWithPassword({email:String(fields.get('email')).trim(),password:String(fields.get('password'))});if(result.error)throw result.error;receive(result.data.session);}
  catch(error){message=error&&error.code==='invalid_credentials'?'El correo o la contraseña no son correctos.':error&&error.code==='email_not_confirmed'?'Debes confirmar el correo de tu cuenta antes de acceder.':errorText(error);}
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
  if(action==='email'){emailMode=true;render();host.querySelector('#accountEmail').focus();}if(action==='email-back'){emailMode=false;render();focus();}if(action==='cloud'&&api.openCloud)api.openCloud();if(action==='google')login();if(action==='guest')completeEntry();if(action==='close')close();if(action==='logout')logout();if(action==='retry')loadProfile();
 });
 host.addEventListener('input',function(event){if(event.target.id==='profileNickname')nicknameDraft=event.target.value;});
 host.addEventListener('submit',function(event){if(event.target.id==='emailLoginForm'){event.preventDefault();if(!readOnly)loginEmail(event.target);return;}if(event.target.id==='nicknameForm'){event.preventDefault();if(!readOnly)saveNickname(event.target);}});
 document.addEventListener('keydown',function(event){if(!opened||readOnly||document.getElementById('launchScreen'))return;
  if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();if(!gate)close();return;}
  if(event.key==='Tab'){var buttons=Array.from(host.querySelectorAll('button:not(:disabled),input:not(:disabled)'));var i=buttons.indexOf(document.activeElement);
   if(buttons.length&&((event.shiftKey&&i<=0)||(!event.shiftKey&&(i<0||i===buttons.length-1)))){event.preventDefault();buttons[event.shiftKey?buttons.length-1:0].focus();}}
 },true);
 document.addEventListener('hemicycle:entered',function(){if(opened){var app=document.getElementById('app');app.inert=true;app.setAttribute('aria-hidden','true');focus();}});
 try{var incoming=new URL(location.href),fragment=new URLSearchParams(location.hash.slice(1));if(incoming.searchParams.has('error')||fragment.has('error'))message='No se completó el acceso con Google. Puedes volver a intentarlo.';}catch(ignore){}
 var fetchWithTimeout=function(input,options){var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},10000);options=Object.assign({},options,{signal:controller.signal});return fetch(input,options).finally(function(){clearTimeout(timer);});};
 try{
  client=api.client||root.supabase.createClient(api.config.url,api.config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'},global:{fetch:fetchWithTimeout}});
  client.auth.onAuthStateChange(function(event,next){setTimeout(function(){receive(next);},0);});
  client.auth.getSession().then(function(result){if(result.error)throw result.error;receive(result.data.session);}).catch(function(){ready=true;message='No se ha podido recuperar la sesión. Puedes reintentarlo o continuar sin cuenta.';notify();});
 }catch(error){ready=true;message='El acceso a cuentas no está disponible. Puedes continuar sin cuenta.';}
 return {enter:enter,open:function(){open(false);},openGuide:function(){open(false,true);},close:close,isOpen:function(){return opened;},account:function(){return session?{userId:session.user.id,client:client,accessToken:session.access_token}:null;},refresh:function(){if(opened&&!gate&&!readOnly)render();}};
}
root.HemicyclePlayerProfile={create:create};
})(typeof globalThis!=='undefined'?globalThis:this);
