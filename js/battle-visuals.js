/* Presentación local compartida: nunca modifica el estado ni aplaza acciones del motor. */
(function(root){
'use strict';
var pending=[],current=null,cleanups=new Set(),observer=null,observed=null,positions={},positionGame=null;
function reduced(){return !!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);}
function rect(selector){var el=document.querySelector(selector);if(!el)return null;var r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height};}
function card(uid){return uid?rect('.tribuna [data-buid="'+String(uid).replace(/[^a-zA-Z0-9_-]/g,'')+'"]'):null;}
function lane(side){return rect('[data-tutorial="'+(side==='p'?'player':'enemy')+'"]');}
function capture(game){positionGame=game;positions={};if(!game)return;['p','e'].forEach(function(side){(game.field[side]||[]).forEach(function(c){var point=card(c.uid);if(point)positions[c.uid]=point;});});}
// Old downloaded games have no action-target metadata. Use their actual effect events;
// a single boost is identified only when its current buff has exactly one recipient.
function actionTargets(game,event,following,you){
 var a=root.HemicycleActions&&root.HemicycleActions.byId[event.id];if(!a)return [];var side=event.side===you?'p':'e',owners=a.target==='all'?['p','e']:[a.target.indexOf('rival')>=0?(side==='p'?'e':'p'):side];
 if(a.effect==='silence')return [];
 if(a.effect!=='boost'){var kind={damage:'damage',heal:'heal',guard:'guard'}[a.effect],out=[];for(var e of following){if(['action','attack','turn'].includes(e.kind))break;if(e.kind===kind&&(kind!=='heal'||e.value>0)&&e.uid)out.push(e.uid);}return Array.from(new Set(out)).slice(0,6);}
 var targets=[];owners.forEach(function(owner){(game.field[owner]||[]).forEach(function(c){if((c.visualBuffs||[]).some(function(b){return b.value===a.value&&b.until>=game.turns[owner];}))targets.push(c.uid);});});return a.target==='self'&&targets.length!==1?[]:targets.slice(0,6);
}
function bar(side){return rect('.vbar.'+(side==='p'?'me':'foe'));}
function queue(game,type,data){if(!game||game.over)return;pending.push({game:game,type:type,data:data,origin:card(data.uid)||(positionGame===game?positions[data.uid]:null),target:card(data.target),score:bar(data.side),lane:lane(data.side),opponent:lane(data.side==='p'?'e':'p'),points:(data.targets||[]).slice(0,6).map(function(uid){return card(uid)||(positionGame===game?positions[uid]:null);}).filter(Boolean)});if(pending.length>24)pending.shift();}
function clear(){positions={};positionGame=null;cleanups.forEach(clearTimeout);cleanups.clear();var host=document.getElementById('battleFxRoot');if(host)host.replaceChildren();document.querySelectorAll('.action-flying').forEach(function(node){node.remove();});}
function temporary(node,ms){var timer=setTimeout(function(){node.remove();cleanups.delete(timer);},ms);cleanups.add(timer);}
function effect(host,kind,point,label,duration){if(!point||!host)return;while(host.childElementCount>=80)host.firstElementChild.remove();var el=document.createElement('span');el.className='battle-fx '+kind;el.style.left=point.x+'px';el.style.top=point.y+'px';el.setAttribute('aria-hidden','true');if(label)el.textContent=label;host.appendChild(el);temporary(el,reduced()?600:(duration||1050));return el;}
function particles(el,count,kind){if(!el)return;for(var i=0;i<count;i++){var p=document.createElement('i'),angle=(i/count)*Math.PI*2,radius=kind==='heal'?32:42;p.className='fx-particle '+kind;p.style.setProperty('--px',Math.cos(angle)*radius+'px');p.style.setProperty('--py',Math.sin(angle)*radius+'px');p.style.setProperty('--rot',(i*360/count)+'deg');p.style.setProperty('--delay',(i%3)*25+'ms');el.appendChild(p);}}
function impact(host,point,strong){var el=effect(host,'impact'+(strong?' strong':''),point,'',950);if(!el)return;el.style.setProperty('--fx-size',Math.max(42,Math.min(strong?104:72,(point.w||72)*(strong?1.05:.8)))+'px');el.innerHTML='<i class="impact-core"></i><i class="impact-wave"></i>'+(strong?'<i class="impact-wave echo"></i><i class="impact-slash second"></i>':'')+'<i class="impact-slash"></i>';if(!reduced())particles(el,strong?12:6,'spark');}
function projectile(host,from,to,strong){if(!from||!to||reduced())return;var dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy);if(length<4)return;var el=effect(host,'attack-trail'+(strong?' strong':''),from,'',500);el.style.setProperty('--travel',length+'px');el.style.setProperty('--angle',Math.atan2(dy,dx)+'rad');el.innerHTML='<i></i>';}
function support(host,kind,point){var el=effect(host,kind==='heal'?'healing-ring':'shield-ring',point,'',1200);if(!el)return;el.style.setProperty('--fx-size',Math.max(54,Math.min(110,(point.w||76)*1.03))+'px');if(kind==='heal'){el.innerHTML='<i class="heal-aura"></i><i class="heal-orbit"></i><i class="heal-orbit second"></i><svg viewBox="0 0 60 60" aria-hidden="true"><path d="M26 14h8v12h12v8H34v12h-8V34H14v-8h12Z" fill="currentColor"/></svg>';if(!reduced())particles(el,7,'heal');}else el.innerHTML='<i class="shield-aura"></i><svg viewBox="0 0 64 76" aria-hidden="true"><path d="m32 4 25 9v24c0 18-25 34-25 34S7 55 7 37V13Z" fill="#092a49cc" stroke="#bfefff" stroke-width="2"/><path d="m32 10 19 7v20c0 12-19 27-19 27S13 49 13 37V17Z" fill="#6cc7fa28" stroke="#70d8ff"/><path d="m19 36 9 9 18-22" fill="none" stroke="#e9fcff" stroke-width="4"/><path d="M32 10v54" stroke="#c4f4ff44"/></svg><i class="shield-sheen"></i>';}
function actionEffect(host,event){
 var d=event.data,a=root.HemicycleActions&&root.HemicycleActions.byId[d.id];if(!a)return;
 var powerful=a.r==='especial'||a.r==='legendario',points=event.points,source=event.lane||lane(d.side),foe=event.opponent||lane(d.side==='p'?'e':'p');
 if(a.effect==='silence'){
  if(!foe)return;var seal=effect(host,'censure-seal tier-'+a.r,foe,'',1450);
  if(seal&&!reduced())seal.innerHTML='<i class="censure-orbit"></i><svg viewBox="0 0 64 64"><rect x="25" y="8" width="14" height="29" rx="7"/><path d="M19 28v4a13 13 0 0 0 26 0v-4M32 45v10M24 55h16M11 11l42 42"/></svg>';
  effect(host,'action-notice censure-notice',{x:foe.x,y:foe.y-foe.h/2+9},'Próximo turno sin acciones',1450);return;
 }
 if(!points.length){if(a.effect==='boost'&&source)effect(host,'boost-number',source,'+'+a.value+' Zasca');return;}
 points.forEach(function(point){
  if(a.effect==='damage'){projectile(host,source,point,powerful);impact(host,point,powerful);var burst=effect(host,'action-burst tier-'+a.r,point,'',900);if(burst&&!reduced())burst.innerHTML='<i></i><i></i><i></i>';}
  if(a.effect==='boost'){
   effect(host,'boost-number',point,'+'+a.value+' Zasca');if(reduced())return;
   var boost=effect(host,'inspiration-ring tier-'+a.r,point,'',1150);boost.style.setProperty('--fx-size',Math.max(55,Math.min(110,point.w))+'px');boost.innerHTML='<i class="inspiration-aura"></i><i class="inspiration-orbit"></i><svg viewBox="0 0 60 70"><path d="m12 40 18-16 18 16M12 55l18-16 18 16M18 24l12-11 12 11"/></svg>';particles(boost,powerful?8:5,'inspire');
  }
  if((a.effect==='heal'||a.effect==='guard')&&!reduced()){
   var halo=effect(host,'action-support '+a.effect+' tier-'+a.r,point,'',1250);halo.style.width=Math.max(54,Math.min(120,point.w*1.1))+'px';halo.style.height=Math.max(65,Math.min(150,point.h*.9))+'px';halo.innerHTML='<i></i><i></i>';
  }
 });
}
function split(){var board=document.querySelector('.battle-wrap'),hud=board&&board.querySelector('.battle-hud');if(board&&hud){var a=board.getBoundingClientRect(),b=hud.getBoundingClientRect();board.style.setProperty('--battle-split-y',(b.top+b.height/2-a.top)+'px');}}
function render(game){
 var host=document.getElementById('battleFxRoot');
 if(current!==game){clear();current=game;}
 var board=game&&document.querySelector('.battle-wrap');if(observed!==board){if(observer)observer.disconnect();observed=board;if(board&&typeof ResizeObserver==='function'){observer=new ResizeObserver(split);observer.observe(board);}}
 split();
 var events=pending;pending=[];if(!game||!host||document.hidden)return;
 host.setAttribute('aria-hidden','true');var locations={};
 events.filter(function(e){return e.game===game;}).forEach(function(e){
  var d=e.data,origin=e.origin||card(d.uid)||locations[d.uid],score=bar(d.side)||e.score;
  if(e.type==='action')actionEffect(host,e);
  if(e.type==='attack'){
   var actor=document.querySelector('.tribuna [data-buid="'+String(d.uid).replace(/[^a-zA-Z0-9_-]/g,'')+'"]');
   if(actor&&!reduced()){actor.classList.remove('is-attacking');void actor.offsetWidth;actor.style.setProperty('--attack-step',d.side==='p'?'-7px':'7px');actor.classList.add('is-attacking');}
   var target=e.target||card(d.target)||rect('[data-tutorial="'+(d.side==='p'?'enemy':'player')+'"]');if(d.target)locations[d.target]=target;
   projectile(host,origin,target,!!d.strong);impact(host,target,!!d.strong);
  }
  if(e.type==='damage'){effect(host,'damage-number',origin,'−'+d.value);if(d.guarded)effect(host,'guard-hit',origin,'',700);}
  if(e.type==='heal'&&d.value>0){support(host,'heal',origin);effect(host,'heal-number',origin,'+'+d.value);}
  if(e.type==='guard')support(host,'guard',origin);
  if(e.type==='votes'||e.type==='turn')effect(host,'vote-number '+(d.side==='p'?'own':'rival'),score,(d.value>=0?'+':'')+d.value);
  if(e.type==='turn'){
   host.querySelectorAll('.turn-announcement').forEach(function(n){n.remove();});
   var hud=document.querySelector('.battle-hud'),r=hud&&hud.getBoundingClientRect();
   effect(host,'turn-announcement '+(d.side==='p'?'own':'rival'),r?{x:r.left+r.width/2,y:r.top-14}:null,d.side==='p'?'Tu turno':'Turno rival');
  }
 });
}
root.addEventListener('resize',function(){clear();split();});
if(document.addEventListener)document.addEventListener('visibilitychange',function(){if(document.hidden){pending=[];clear();}});
root.HemicycleBattleVisuals={queue:queue,render:render,capture:capture,actionTargets:actionTargets};
})(typeof window!=='undefined'?window:globalThis);
