/* Directorio compacto. El modo procede del selector de Inicio. */
(function(root){
'use strict';
function create(api){
 const host=document.getElementById('onlineRoot'),base=api.base;
 let opened=false,busy=false,poll=null,directory=null,room=null,pending=null,viewer=null,epoch=0,previousFocus=null,autoRoom=null,mode='normal',queue=null,preview=false,aiPending=null;
 host.innerHTML='<div class="online-shade" hidden><section class="online-dialog" role="dialog" aria-modal="true" aria-labelledby="online-title"><header><h2 id="online-title">Jugadores</h2><button type="button" data-online="close" aria-label="Cerrar partidas online">×</button></header><div class="online-body"><p id="online-message" role="status" aria-live="polite"></p><div id="online-controls"></div><section id="combat" hidden><p id="combat-message" role="status"></p><div class="combat-tools"><button type="button" id="combat-retry">Actualizar / reintentar</button><button type="button" id="combat-close">Volver a jugadores</button></div><div id="combat-content"></div></section></div></section></div>';
 const $=id=>document.getElementById(id),node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const message=text=>{$('online-message').textContent=text;};
 const modeName=()=>({normal:'Normal · 90 s',rapida:'Rápida · 60 s',ranked:'Clasificatoria · por Elo',liga:'Liga · contra IA'})[mode];
 const combat=HemicycleTestCombat.create({base,initialCabinet:api.cabinet,artURL:new URL('assets/actions/art-atlas.png',location.href).href,
  onVisibility(active){host.classList.toggle('combat-active',active);$('online-title').textContent=active?'Partida online':'Jugadores';},
  onFinished(id){if(room?.id===id){room={...room,status:'finished'};queue=null;rememberRoom();}},
  renderPreparation:api.preparation?function(state,controls){opened=false;clearInterval(poll);host.querySelector('.online-shade').hidden=true;$('app').inert=false;$('app').removeAttribute('aria-hidden');return api.preparation(state,controls);}:null,
 renderBattle:api.battle?function(state,controls){if(state.status==='preparing')return false;opened=false;clearInterval(poll);host.querySelector('.online-shade').hidden=true;$('app').inert=false;$('app').removeAttribute('aria-hidden');return api.battle(state,controls);}:null,onStatus:api.battleStatus,onAction:api.actionVisual,onProgressResult:api.reconcileRanked,account:()=>{const a=api.account();return a?{user:{id:a.userId},access_token:a.accessToken}:null;}});
 $('combat-retry').onclick=()=>combat.retry();$('combat-close').onclick=()=>{combat.close();render();};
 function button(text,fn,disabled=false){const b=node('button',text);b.type='button';b.disabled=busy||disabled;b.onclick=fn;return b;}
 function row(player,demo){
  const item=node('div',undefined,'online-player');item.setAttribute('role','listitem');item.dataset.player=player.id;
  const avatar=node('span',player.nickname.trim().split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase(),'online-avatar');avatar.setAttribute('aria-hidden','true');
  const text=node('div',undefined,'online-player-name');text.append(node('b',player.nickname),node('small',player.online?'Conectado':'Desconectado',player.online?'is-online':''));
  const invite=button('Invitar',()=>invitePlayer(player.id),demo||!directory?.self?.visible||!['normal','rapida'].includes(mode)||hasInvitation());
  invite.setAttribute('aria-label','Invitar a '+player.nickname);item.append(avatar,text,invite);return item;
 }
 function render(){
  const box=$('online-controls');box.replaceChildren();
  const top=node('div',undefined,'online-toolbar'),badge=node('span',modeName(),'online-mode');badge.id='online-mode';top.append(badge);
  if(!preview){const retry=button('↻',()=>aiPending?startAI():pending?invitePlayer(pending.target):run(refresh));retry.setAttribute('aria-label','Actualizar jugadores');top.append(retry);}box.append(top);
  if(preview){box.append(node('p','Ejemplo: el modo se elige junto a Jugar. No se envían invitaciones.','online-note'));}
  else if(!api.account()){box.append(node('p','Accede a tu cuenta para invitar a otros jugadores.','online-note'),button('Acceder a mi cuenta',()=>{close();api.login();}));return;}
  if(!preview){
   const label=node('label',undefined,'online-presence'),check=node('input');check.type='checkbox';check.checked=!!directory?.self?.visible;check.disabled=busy;
   check.onchange=()=>run(async()=>{directory=await request('/players/presence',{visible:check.checked,online:true});});label.append(check,node('span','Mostrarme a otros jugadores'));box.append(label);
   for(const invitation of directory?.invitations||[]){const item=node('div',undefined,'online-invitation');item.append(node('span',invitation.nickname+' te invita'),button('Aceptar',()=>run(async()=>{room=await request('/rooms/accept',{roomId:invitation.id});await refresh();openCombat();})));box.append(item);}
   if(queue?.status==='waiting'){const wait=node('div',undefined,'online-invitation');wait.append(node('span','Buscando rival · '+queue.rating+' Elo'+(queue.band===null?' · sin límite':' · ±'+queue.band)),button('Cancelar',()=>run(async()=>{await request('/queue/cancel',{});queue=null;})));box.append(wait);}
   if(hasInvitation()){const wait=node('div',undefined,'online-invitation');wait.append(node('span',room.status==='paired'?'Invitación aceptada':'Invitación enviada · esperando respuesta'));if(room.status==='paired')wait.append(button('Continuar',openCombat));box.append(wait);}
   if(mode==='ranked')box.append(node('p','La Clasificatoria online se busca por Elo desde el selector de Jugar. Las invitaciones son para Normal y Rápida.','online-note'));
   if(mode==='liga')box.append(node('p','La Liga se juega contra IA. Elige Normal o Rápida en Inicio para invitar.','online-note'));
  }
  const list=node('div',undefined,'online-player-list');list.id='online-players';list.setAttribute('role','list');list.setAttribute('aria-label','Jugadores conectados y desconectados');
  const players=preview?[{id:'demo1',nickname:'Probador de ejemplo',online:true},{id:'demo2',nickname:'Probadora de ejemplo',online:false}]:(directory?.players||[]);
  for(const connected of [true,false]){const group=players.filter(p=>!!p.online===connected);if(!group.length)continue;list.append(node('small',(connected?'Conectados':'Desconectados')+' · '+group.length,'online-group'));for(const p of group)list.append(row(p,preview));}
  if(!players.length)list.append(node('p',busy?'Cargando jugadores…':'Todavía no hay otros jugadores visibles.','online-empty'));box.append(list);
 }
 async function request(path,body){
  const account=api.account(),ticket=epoch;if(!account)throw Error('Inicia sesión.');
  const response=await fetch(base+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+account.accessToken,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store',signal:AbortSignal.timeout(65000)}),data=await response.json();
  if(ticket!==epoch||api.account()?.userId!==account.userId)throw Error('La sesión ha cambiado.');
  if(!response.ok)throw Error(response.status===401?'Inicia sesión de nuevo.':data.error||'No se pudo conectar.');return data;
 }
 async function refresh(){
  if(queue?.status==='waiting'){queue=await request('/queue',{mode:'ranked'});if(queue.status==='matched'){room=queue.room;openCombat();}}
  directory=await request('/players');if(directory.self?.visible)directory=await request('/players/presence',{visible:true,online:true});
  if(hasInvitation()){const before=room.status;room=await request('/rooms/'+room.id);if(before!=='paired'&&room.status==='paired')openCombat();rememberRoom();}render();
 }
 async function run(fn,quiet=false){
  if(busy)return;const ticket=epoch;busy=true;render();if(!quiet)message('Conectando…');
  try{await fn();if(ticket===epoch&&!quiet)message('');}
  catch(e){if(ticket===epoch)message(e.name==='TimeoutError'?'Conexión lenta. Pulsa actualizar.':e.name==='TypeError'?'Sin conexión. Puedes reintentar o seguir jugando contra IA.':e.message);}
  finally{if(ticket===epoch){busy=false;render();}}
 }
 async function invitePlayer(target){
  if(!['normal','rapida'].includes(mode))return;
  if(hasInvitation()){message('Ya tienes una invitación pendiente.');return;}
  if(pending&&(pending.target!==target||pending.mode!==mode)){message('Hay una invitación pendiente de confirmar. Pulsa actualizar.');return;}
  return run(async()=>{if(!pending)pending={target,mode,operationId:crypto.randomUUID()};room=await request('/rooms/invite',{playerId:target,operationId:pending.operationId,mode:pending.mode});rememberRoom();pending=null;if(room.status==='paired')openCombat();});
 }
 function storageKey(){const user=api.account()?.userId;return user?'hemicycle_active_match_v1:'+user:null;}
 function rememberRoom(){const key=storageKey();if(!key)return;try{if(room&&['waiting','paired'].includes(room.status))sessionStorage.setItem(key,JSON.stringify({id:room.id,kind:room.kind||'player',mode:room.mode||mode,status:room.status}));else sessionStorage.removeItem(key);}catch{}}
 function restoreRoom(){if(room)return;const key=storageKey();if(!key)return;try{const saved=JSON.parse(sessionStorage.getItem(key));if(saved&&/^[a-f0-9-]{36}$/i.test(saved.id)&&['waiting','paired'].includes(saved.status))room=saved;}catch{}}
 function hasInvitation(){return !!room&&room.kind!=='ai'&&['waiting','paired'].includes(room.status);}
 async function startAI(){if(!open('ranked',false))return;await run(async()=>{if(!api.account())throw Error('Inicia sesión.');if(api.ensureCloud)await api.ensureCloud();if(!aiPending)aiPending=crypto.randomUUID();room=await request('/ai',{operationId:aiPending});aiPending=null;autoRoom=null;openCombat();});}
 function openCombat(){if(room?.status!=='paired')return;rememberRoom();if(autoRoom===room.id&&!$('combat').hidden)return;autoRoom=room.id;combat.open(room.id);$('combat').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 function close(){
  if(!opened)return;
  if(queue?.status==='waiting'){const a=api.account();if(a)fetch(base+'/queue/cancel',{method:'POST',headers:{Authorization:'Bearer '+a.accessToken,'Content-Type':'application/json'},body:'{}',keepalive:true}).catch(()=>{});queue=null;}
  opened=false;preview=false;epoch++;busy=false;clearInterval(poll);combat.close();host.querySelector('.online-shade').hidden=true;
  const app=$('app');app.inert=false;app.removeAttribute('aria-hidden');const target=previousFocus?.isConnected?previousFocus:document.querySelector('[data-act=online]');if(target)target.focus({preventScroll:true});
 }
 function open(preferred,loadDirectory=true){
  restoreRoom();if(api.canOpen&&!api.canOpen())return false;combat.close();
  mode=preferred||api.mode?.()||'normal';opened=true;preview=false;epoch++;busy=false;viewer=api.account()?.userId;previousFocus=document.activeElement;
  $('app').inert=true;$('app').setAttribute('aria-hidden','true');host.querySelector('.online-shade').hidden=false;render();host.querySelector('[data-online=close]').focus();
  if(viewer&&loadDirectory)run(refresh);clearInterval(poll);poll=setInterval(()=>{if(opened&&!busy&&!document.hidden&&$('combat').hidden&&api.account())run(refresh,true);},5000);return true;
 }
 host.querySelector('[data-online=close]').onclick=close;
 document.addEventListener('keydown',e=>{
  if(!opened)return;
  if(e.key==='Escape'){if(host.querySelector('.combat-popup,.combat-targeting'))return;e.preventDefault();e.stopImmediatePropagation();close();}
  if(e.key==='Tab'){const all=[...host.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(n=>n.getClientRects().length),at=all.indexOf(document.activeElement);if(all.length&&((e.shiftKey&&at<=0)||(!e.shiftKey&&(at<0||at===all.length-1)))){e.preventDefault();all[e.shiftKey?all.length-1:0].focus();}}
 },true);
 return {
  open,close,startAI,hasActiveMatch(){restoreRoom();return room?.status==='paired';},resume(){restoreRoom();if(room?.status==='paired'&&open(room.mode||'normal',false))openCombat();},hasInvitation(){restoreRoom();return hasInvitation()||!!pending;},
  async searchRanked(){if(!open('ranked',false))return;await run(async()=>{if(!api.account())throw Error('Inicia sesión para buscar rival.');if(api.ensureCloud)await api.ensureCloud();queue=await request('/queue',{mode:'ranked'});if(queue.status==='matched'){room=queue.room;openCombat();}});},
  openGuide(){combat.close();preview=true;mode=api.mode?.()||'normal';opened=true;epoch++;previousFocus=document.activeElement;$('app').inert=true;$('app').setAttribute('aria-hidden','true');host.querySelector('.online-shade').hidden=false;render();},
  accountChanged(){if(api.account()?.userId!==viewer){close();combat.close();if(api.clearBattle)api.clearBattle();directory=room=pending=queue=aiPending=null;viewer=api.account()?.userId;}}
 };
}
root.HemicycleOnlineUI={create};
})(globalThis);
