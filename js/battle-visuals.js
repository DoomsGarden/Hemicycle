/* Presentación local compartida: nunca modifica el estado ni aplaza acciones del motor. */
(function(root){
'use strict';
var pending=[],current=null,cleanups=new Set(),observer=null,observed=null;
function reduced(){return !!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);}
function rect(selector){var el=document.querySelector(selector);if(!el)return null;var r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height};}
function card(uid){return uid?rect('.tribuna [data-buid="'+String(uid).replace(/[^a-zA-Z0-9_-]/g,'')+'"]'):null;}
function bar(side){return rect('.vbar.'+(side==='p'?'me':'foe'));}
function queue(game,type,data){if(!game||game.over)return;pending.push({game:game,type:type,data:data,origin:card(data.uid),target:card(data.target),score:bar(data.side)});if(pending.length>24)pending.shift();}
function clear(){cleanups.forEach(clearTimeout);cleanups.clear();var host=document.getElementById('battleFxRoot');if(host)host.replaceChildren();}
function temporary(node,ms){var timer=setTimeout(function(){node.remove();cleanups.delete(timer);},ms);cleanups.add(timer);}
function effect(host,kind,point,label,duration){if(!point||!host)return;var el=document.createElement('span');el.className='battle-fx '+kind;el.style.left=point.x+'px';el.style.top=point.y+'px';el.setAttribute('aria-hidden','true');if(label)el.textContent=label;host.appendChild(el);temporary(el,reduced()?600:(duration||1050));return el;}
function particles(el,count,kind){if(!el)return;for(var i=0;i<count;i++){var p=document.createElement('i'),angle=(i/count)*Math.PI*2,radius=kind==='heal'?32:42;p.className='fx-particle '+kind;p.style.setProperty('--px',Math.cos(angle)*radius+'px');p.style.setProperty('--py',Math.sin(angle)*radius+'px');p.style.setProperty('--rot',(i*360/count)+'deg');p.style.setProperty('--delay',(i%3)*25+'ms');el.appendChild(p);}}
function impact(host,point,strong){var el=effect(host,'impact'+(strong?' strong':''),point,'',950);if(!el)return;el.style.setProperty('--fx-size',Math.max(42,Math.min(strong?104:72,(point.w||72)*(strong?1.05:.8)))+'px');el.innerHTML='<i class="impact-core"></i><i class="impact-wave"></i>'+(strong?'<i class="impact-wave echo"></i><i class="impact-slash second"></i>':'')+'<i class="impact-slash"></i>';if(!reduced())particles(el,strong?12:6,'spark');}
function projectile(host,from,to,strong){if(!from||!to||reduced())return;var dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy);if(length<4)return;var el=effect(host,'attack-trail'+(strong?' strong':''),from,'',500);el.style.setProperty('--travel',length+'px');el.style.setProperty('--angle',Math.atan2(dy,dx)+'rad');el.innerHTML='<i></i>';}
function support(host,kind,point){var el=effect(host,kind==='heal'?'healing-ring':'shield-ring',point,'',1200);if(!el)return;el.style.setProperty('--fx-size',Math.max(54,Math.min(110,(point.w||76)*1.03))+'px');if(kind==='heal'){el.innerHTML='<i class="heal-aura"></i><i class="heal-orbit"></i><i class="heal-orbit second"></i><svg viewBox="0 0 60 60" aria-hidden="true"><path d="M26 14h8v12h12v8H34v12h-8V34H14v-8h12Z" fill="currentColor"/></svg>';if(!reduced())particles(el,7,'heal');}else el.innerHTML='<i class="shield-aura"></i><svg viewBox="0 0 64 76" aria-hidden="true"><path d="m32 4 25 9v24c0 18-25 34-25 34S7 55 7 37V13Z" fill="#092a49cc" stroke="#bfefff" stroke-width="2"/><path d="m32 10 19 7v20c0 12-19 27-19 27S13 49 13 37V17Z" fill="#6cc7fa28" stroke="#70d8ff"/><path d="m19 36 9 9 18-22" fill="none" stroke="#e9fcff" stroke-width="4"/><path d="M32 10v54" stroke="#c4f4ff44"/></svg><i class="shield-sheen"></i>';}
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
  if(e.type==='attack'){
   var actor=document.querySelector('.tribuna [data-buid="'+String(d.uid).replace(/[^a-zA-Z0-9_-]/g,'')+'"]');
   if(actor&&!reduced()){actor.classList.remove('is-attacking');void actor.offsetWidth;actor.style.setProperty('--attack-step',d.side==='p'?'-7px':'7px');actor.classList.add('is-attacking');}
   var target=e.target||card(d.target)||rect('[data-tutorial="'+(d.side==='p'?'enemy':'player')+'"]');if(d.target)locations[d.target]=target;
   projectile(host,origin,target,!!d.strong);impact(host,target,!!d.strong);
  }
  if(e.type==='damage'){effect(host,'damage-number',origin,'−'+d.value);if(d.guarded)effect(host,'guard-hit',origin,'',700);}
  if(e.type==='heal'){support(host,'heal',origin);effect(host,'heal-number',origin,'+'+d.value);}
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
root.HemicycleBattleVisuals={queue:queue,render:render};
})(typeof window!=='undefined'?window:globalThis);
