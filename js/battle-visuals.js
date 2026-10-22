/* Presentación del debate: nunca modifica el estado ni aplaza acciones del motor. */
(function(root){
'use strict';
var pending=[],current=null,cleanups=new Set(),observer=null,observed=null;
function rect(selector){var el=document.querySelector(selector);if(!el)return null;var r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height};}
function card(uid){return uid?rect('.tribuna [data-buid="'+String(uid).replace(/[^a-zA-Z0-9_-]/g,'')+'"]'):null;}
function bar(side){return rect('.vbar.'+(side==='p'?'me':'foe'));}
function queue(game,type,data){if(!game||game.over)return;pending.push({game:game,type:type,data:data,origin:card(data.uid),target:card(data.target),score:bar(data.side)});if(pending.length>24)pending.shift();}
function clear(){cleanups.forEach(clearTimeout);cleanups.clear();var host=document.getElementById('battleFxRoot');if(host)host.replaceChildren();}
function temporary(node,ms){var timer=setTimeout(function(){node.remove();cleanups.delete(timer);},ms);cleanups.add(timer);}
function effect(host,kind,point,label){if(!point||!host)return;var el=document.createElement('span');el.className='battle-fx '+kind;el.style.left=point.x+'px';el.style.top=point.y+'px';if(label)el.textContent=label;host.appendChild(el);temporary(el,1050);return el;}
function split(){var board=document.querySelector('.battle-wrap'),hud=board&&board.querySelector('.battle-hud');if(board&&hud){var a=board.getBoundingClientRect(),b=hud.getBoundingClientRect();board.style.setProperty('--battle-split-y',(b.top+b.height/2-a.top)+'px');}}
function render(game){
 var host=document.getElementById('battleFxRoot');
 if(current!==game){clear();current=game;}
 var board=game&&document.querySelector('.battle-wrap');if(observed!==board){if(observer)observer.disconnect();observed=board;if(board&&typeof ResizeObserver==='function'){observer=new ResizeObserver(split);observer.observe(board);}}
 split();
 var events=pending;pending=[];if(!game||!host)return;
 events.filter(function(e){return e.game===game;}).forEach(function(e){
  var d=e.data,origin=e.origin||card(d.uid),score=bar(d.side)||e.score;
  if(e.type==='attack'){
   var actor=document.querySelector('.tribuna [data-buid="'+d.uid+'"]');
   if(actor){actor.classList.remove('is-attacking');void actor.offsetWidth;actor.style.setProperty('--attack-step',d.side==='p'?'-7px':'7px');actor.classList.add('is-attacking');}
   effect(host,'impact'+(d.strong?' strong':''),e.target||rect('[data-tutorial="'+(d.side==='p'?'enemy':'player')+'"]'),'');
  }
  if(e.type==='damage')effect(host,'damage-number',origin,'−'+d.value);
  if(e.type==='heal'){effect(host,'healing-ring',origin,'');effect(host,'heal-number',origin,'+'+d.value);}
  if(e.type==='guard'){var shield=effect(host,'shield-ring',origin,'');if(shield)shield.innerHTML='<svg viewBox="0 0 40 48" aria-hidden="true"><path d="M20 3 35 9v13c0 12-15 21-15 21S5 34 5 22V9Z" fill="#102f4280" stroke="#bceeff" stroke-width="2"/><path d="m12 23 6 6 11-13" fill="none" stroke="#bceeff" stroke-width="3"/></svg>';}
  if(e.type==='votes'||e.type==='turn')effect(host,'vote-number '+(d.side==='p'?'own':'rival'),score,(d.value>=0?'+':'')+d.value);
  if(e.type==='turn'){
   host.querySelectorAll('.turn-announcement').forEach(function(n){n.remove();});
   var hud=document.querySelector('.battle-hud'),r=hud&&hud.getBoundingClientRect();
   effect(host,'turn-announcement '+(d.side==='p'?'own':'rival'),r?{x:r.left+r.width/2,y:r.top-14}:null,d.side==='p'?'Tu turno':'Turno rival');
  }
 });
}
root.addEventListener('resize',split);
root.HemicycleBattleVisuals={queue:queue,render:render};
})(typeof window!=='undefined'?window:globalThis);
