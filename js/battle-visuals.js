/* Presentación compartida: conserva el estado autoritativo y secuencia solo su representación. */
(function(root){
'use strict';
var pending=[],current=null,cleanups=new Set(),observer=null,observed=null,positions={},positionGame=null,snapshot=null,sequence=null,waiters=[],hooks={};
function reduced(){return !!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);}
function rect(selector){var el=document.querySelector(selector);if(!el)return null;var r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height};}
function card(uid){return uid?rect('.tribuna [data-buid="'+String(uid).replace(/[^a-zA-Z0-9_-]/g,'')+'"]'):null;}
function lane(side){return rect('[data-tutorial="'+(side==='p'?'player':'enemy')+'"]');}
function cardsOf(game){var all={};if(game)['p','e'].forEach(function(side){['field','hand','pas'].forEach(function(zone){((game[zone]||{})[side]||[]).forEach(function(c){if(c&&!c.action)all[c.uid]={side:side,card:c};});});});return all;}
function boards(){return ['p','e'].map(function(side){var el=document.querySelector('[data-tutorial="'+(side==='p'?'player':'enemy')+'"]');return el?el.innerHTML:null;});}
function capture(game){
 if(sequence&&sequence.game===game)return;
 positionGame=game;positions={};snapshot={game:game,boards:boards(),cards:{}};var known=cardsOf(game);
 document.querySelectorAll('.tribuna [data-buid]').forEach(function(el){var uid=el.dataset.buid,b=el.querySelector('.aguante b'),entry=known[uid],point=card(uid);if(!entry||!point)return;positions[uid]=point;snapshot.cards[uid]={side:entry.side,card:Object.assign({},entry.card,{q:(entry.card.q||[]).slice()}),hp:b?parseInt(b.textContent,10):entry.card.h,html:el.outerHTML};});
}
function beforePaint(game){if(sequence&&sequence.game===game)sequence.boards=boards();}
function busy(game){return !!(sequence&&sequence.game===game||pending.some(function(e){return e.game===game;}));}
function settleWaiters(){var waiting=waiters;waiters=[];waiting.forEach(function(w){if(busy(w.game))waiters.push(w);else w.resolve();});}
function whenIdle(game){return new Promise(function(resolve){setTimeout(function(){if(busy(game))waiters.push({game:game,resolve:resolve});else resolve();},0);});}
/* Each principal intervention owns its damage/support events, including reflected damage. */
function plan(events,quiet){
 var groups=[],group=null,end=0;
 events.filter(function(e){return ['attack','action','turn','card','damage','heal','guard','expel','votes'].includes(e.type);}).forEach(function(e){
  var own=['attack','action','turn','card'].includes(e.type)||!group||(['guard','heal'].includes(e.type)&&(group.type!=='action'||e.data.phrase));
  if(own){group={type:e.type,events:[]};groups.push(group);}group.events.push(e);
 });
 groups.forEach(function(g){
  var strong=g.events.some(function(e){return e.type==='attack'&&e.data.strong;}),leaves=g.events.some(function(e){return e.type==='expel';}),health=g.events.some(function(e){return e.type==='damage'||e.type==='heal'&&e.data.value>0;});
  g.start=end;g.healthDuration=quiet?90:200;g.departure=quiet?40:90;
  g.impact=quiet?30:g.type==='attack'?(strong?380:340):g.type==='action'?120:g.type==='heal'?100:g.type==='guard'?80:0;
  g.duration=g.type==='turn'?0:g.type==='card'?(quiet?40:100):g.impact+(health?g.healthDuration:20)+(leaves?g.departure:0);
  end+=g.duration;
 });return {groups:groups,duration:end};
}
// Old downloaded games have no action-target metadata. Use their actual effect events;
// a single boost is identified only when its current buff has exactly one recipient.
function actionTargets(game,event,following,you){
 var a=root.HemicycleActions&&root.HemicycleActions.byId[event.id];if(!a)return [];var side=event.side===you?'p':'e',owners=a.target==='all'?['p','e']:[a.target.indexOf('rival')>=0?(side==='p'?'e':'p'):side];
 if(a.effect==='silence')return [];
 if(a.effect!=='boost'){var kind={damage:'damage',heal:'heal',guard:'guard'}[a.effect],out=[];for(var e of following){if(['action','attack','turn'].includes(e.kind))break;if(e.kind===kind&&(kind!=='heal'||e.value>0)&&e.uid)out.push(e.uid);}return Array.from(new Set(out)).slice(0,6);}
 var targets=[];owners.forEach(function(owner){(game.field[owner]||[]).forEach(function(c){if((c.visualBuffs||[]).some(function(b){return b.value===a.value&&b.until>=game.turns[owner];}))targets.push(c.uid);});});return a.target==='self'&&targets.length!==1?[]:targets.slice(0,6);
}
function bar(side){return rect('.vbar.'+(side==='p'?'me':'foe'));}
function queue(game,type,data){
 if(!game)return;if(!sequence&&!pending.length&&(!snapshot||snapshot.game!==game))capture(game);
 var known=cardsOf(game),entry=known[data.uid]||(snapshot&&snapshot.cards[data.uid]),copy=Object.assign({},data);
 if(entry){copy.side=copy.side||entry.side;if(!copy.quote&&entry.card.q&&(type==='attack'||((type==='guard'||type==='heal')&&copy.phrase)))copy.quote=entry.card.q[type==='attack'?(copy.strong?1:0):2];}
 pending.push({game:game,type:type,data:copy,origin:card(copy.uid)||(positionGame===game?positions[copy.uid]:null),target:card(copy.target)||(positionGame===game?positions[copy.target]:null),lane:lane(copy.side),opponent:lane(copy.side==='p'?'e':'p'),points:(copy.targets||[]).slice(0,6).map(function(uid){return card(uid)||(positionGame===game?positions[uid]:null);}).filter(Boolean)});
}
function clear(){
 var old=sequence;sequence=null;positions={};positionGame=null;snapshot=null;pending=[];cleanups.forEach(clearTimeout);cleanups.clear();
 if(old&&old.frame)cancelAnimationFrame(old.frame);var board=document.querySelector('.battle-wrap');if(board){board.inert=false;board.removeAttribute('aria-busy');}
 var host=document.getElementById('battleFxRoot');if(host)host.replaceChildren();document.querySelectorAll('.action-flying').forEach(function(node){node.remove();});settleWaiters();
}
function temporary(node,ms){var timer=setTimeout(function(){node.remove();cleanups.delete(timer);},ms);cleanups.add(timer);}
function effect(host,kind,point,label,duration){if(!point||!host)return;while(host.childElementCount>=80)host.firstElementChild.remove();var el=document.createElement('span');el.className='battle-fx '+kind;el.style.left=point.x+'px';el.style.top=point.y+'px';el.setAttribute('aria-hidden','true');if(label)el.textContent=label;host.appendChild(el);temporary(el,reduced()?Math.min(duration||200,kind.indexOf('battle-spoken')===0?330:200):(duration||1050));return el;}
function particles(el,count,kind){if(!el)return;for(var i=0;i<count;i++){var p=document.createElement('i'),angle=(i/count)*Math.PI*2,radius=kind==='heal'?32:42;p.className='fx-particle '+kind;p.style.setProperty('--px',Math.cos(angle)*radius+'px');p.style.setProperty('--py',Math.sin(angle)*radius+'px');p.style.setProperty('--rot',(i*360/count)+'deg');p.style.setProperty('--delay',(i%3)*25+'ms');el.appendChild(p);}}
function impact(host,point,strong){var el=effect(host,'impact'+(strong?' strong':''),point,'',950);if(!el)return;el.style.setProperty('--fx-size',Math.max(42,Math.min(strong?104:72,(point.w||72)*(strong?1.05:.8)))+'px');el.innerHTML='<i class="impact-core"></i><i class="impact-wave"></i>'+(strong?'<i class="impact-wave echo"></i><i class="impact-slash second"></i>':'')+'<i class="impact-slash"></i>';if(!reduced())particles(el,strong?12:6,'spark');}
function projectile(host,from,to,strong){if(!from||!to||reduced())return;var dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy);if(length<4)return;var el=effect(host,'attack-trail'+(strong?' strong':''),from,'',500);el.style.setProperty('--travel',length+'px');el.style.setProperty('--angle',Math.atan2(dy,dx)+'rad');el.innerHTML='<i></i>';}
function zasca(host,point,strong){
 var el=effect(host,'zasca-mark'+(strong?' strong':''),point,'',260);if(!el)return;
 el.style.setProperty('--fx-size',Math.max(40,Math.min(strong?100:82,(point.w||80)*.85))+'px');
 el.innerHTML='<i class="zasca-wave"></i>'+(strong?'<i class="zasca-wave second"></i>':'')+'<svg viewBox="0 0 96 96" fill="none" aria-hidden="true"><path class="zasca-bubble" d="M22 18h52a10 10 0 0 1 10 10v28a10 10 0 0 1-10 10H51L35 79l3-13H22A10 10 0 0 1 12 56V28a10 10 0 0 1 10-10Z"/><path class="zasca-quotes" d="M29 33h13v12H31c0 8 4 10 10 11M54 33h13v12H56c0 8 4 10 10 11"/><path class="zasca-rays" d="M7 12 1 6m88 6 6-6M6 45H0m90 0h6M12 77l-7 7m79-7 7 7"/></svg>';
}
function support(host,kind,point){var el=effect(host,kind==='heal'?'healing-ring':'shield-ring',point,'',1200);if(!el)return;el.style.setProperty('--fx-size',Math.max(54,Math.min(110,(point.w||76)*1.03))+'px');el.innerHTML=root.HemicycleBattleStatus.supportMarkup(kind);if(kind==='heal'&&!reduced())particles(el,7,'heal');}

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
function later(fn,ms){var timer=setTimeout(function(){cleanups.delete(timer);fn();},ms);cleanups.add(timer);}
function node(uid){return document.querySelector('.tribuna [data-buid="'+String(uid).replace(/[^a-zA-Z0-9_-]/g,'')+'"]');}
function phrase(host,d,from,to,kind,quiet,flight){
 if(!d.quote||!from||!to)return;host.querySelectorAll('.battle-spoken').forEach(function(n){n.remove();});
 var el=effect(host,'battle-spoken '+kind+(quiet?' still':''),from,d.quote,quiet?200:520);if(!el)return;
 var peak=1.2,width=Math.min(280,(innerWidth-24)/peak),half=width*peak/2+8,clampX=function(x){return Math.max(half,Math.min(innerWidth-half,x));};
 el.style.setProperty('--phrase-flight',Math.max(300,flight||340)+'ms');el.style.width=width+'px';el.style.setProperty('--phrase-peak',peak);el.style.setProperty('--phrase-half-x',((clampX(to.x)-clampX(from.x))/2)+'px');el.style.setProperty('--phrase-half-y',((to.y-from.y)/2)+'px');el.style.left=clampX(from.x)+'px';el.style.setProperty('--phrase-x',(clampX(to.x)-clampX(from.x))+'px');el.style.setProperty('--phrase-y',(to.y-from.y)+'px');el.dataset.side=d.side;el.dataset.target=d.target||'';
 var scale=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui-text-scale'))||1,size=26*scale;el.style.fontSize=size+'px';while(size>16*scale&&el.offsetHeight>parseFloat(getComputedStyle(el).lineHeight)*2.15){size--;el.style.fontSize=size+'px';}
}
function restoreBoards(saved){['p','e'].forEach(function(side,i){var el=document.querySelector('[data-tutorial="'+(side==='p'?'player':'enemy')+'"]');if(el&&saved[i]!==null)el.innerHTML=saved[i];});if(hooks.refreshArt)hooks.refreshArt();}
function mount(uid,known){
 if(node(uid)||!known[uid]||!hooks.cardHTML)return;
 var entry=known[uid],field=document.querySelector('[data-tutorial="'+(entry.side==='p'?'player':'enemy')+'"]');
 // Cards and empty slots are direct grid children. Never put a card inside either.
 var slot=field&&Array.from(field.children).find(function(n){return n.matches('.slot,.cromo.is-leaving');});
 if(!slot)return;var template=document.createElement('template');template.innerHTML=hooks.cardHTML(entry.card,entry.side);var c=template.content.firstElementChild;
 if(c&&c.matches('.cromo')){slot.replaceWith(c);if(hooks.refreshArt)hooks.refreshArt();}
}
function lock(){var board=document.querySelector('.battle-wrap');if(board){board.inert=true;board.setAttribute('aria-busy','true');}var popup=document.getElementById('battleActionRoot');if(popup)popup.hidden=true;}
function render(game,options){
 if(options)hooks=options;
 var host=document.getElementById('battleFxRoot');
 if(current!==game){var incoming=pending.filter(function(e){return e.game===game;}),saved=snapshot;clear();pending=incoming;snapshot=saved&&saved.game===game?saved:null;current=game;}
 var board=game&&document.querySelector('.battle-wrap');if(observed!==board){if(observer)observer.disconnect();observed=board;if(board&&typeof ResizeObserver==='function'){observer=new ResizeObserver(split);observer.observe(board);}}
 split();if(!game||!host){settleWaiters();return;}
 if(document.hidden){clear();return;}
 if(sequence){restoreBoards(sequence.boards);lock();return;}
 var events=pending.filter(function(e){return e.game===game;});pending=[];if(!events.length){settleWaiters();return;}
 var quiet=reduced(),timeline=plan(events,quiet),known=cardsOf(game),saved=snapshot&&snapshot.game===game?snapshot:null,currentBoards=boards();
 if(saved)restoreBoards(saved.boards);
 // New arrivals that act within a server batch may not exist in the previous DOM.
 var needed=new Set();events.forEach(function(e){if(e.data.uid)needed.add(e.data.uid);if(e.data.target)needed.add(e.data.target);(e.data.targets||[]).forEach(function(uid){needed.add(uid);});});
 needed.forEach(function(uid){if(!events.some(function(e){return e.type==='card'&&e.data.uid===uid;}))mount(uid,known);});
 var state={game:game,boards:boards(),health:{},targets:{},tweens:[],frame:0};sequence=state;snapshot=null;lock();host.setAttribute('aria-hidden','true');
 document.querySelectorAll('.tribuna [data-buid]').forEach(function(el){var uid=el.dataset.buid,b=el.querySelector('.aguante b'),start=saved&&saved.cards[uid];state.health[uid]=start?start.hp:b?parseInt(b.textContent,10):0;});
 // A newly played card starts at full health, even if the final snapshot has sent it to the aisle.
 needed.forEach(function(uid){if(saved&&saved.cards[uid]||!known[uid])return;var entry=known[uid];state.health[uid]=entry.card.hm;});
 function paintHealth(uid,value){var el=node(uid),b=el&&el.querySelector('.aguante b'),entry=known[uid]||(saved&&saved.cards[uid]);if(b){var max=entry?entry.card.hm:0;b.textContent=Math.max(0,Math.round(value));var tail=document.createElement('i');tail.textContent='/'+max;b.appendChild(tail);el.querySelector('.aguante').setAttribute('aria-label','Aguante '+Math.max(0,Math.round(value))+' de '+max);}}
 Object.keys(state.health).forEach(function(uid){paintHealth(uid,state.health[uid]);});
 function tween(uid,to,duration){var from=state.health[uid];var survivor=known[uid];if(to<=0&&survivor&&survivor.card.h>0&&game.field[survivor.side].some(function(c){return c.uid===uid;}))to=survivor.card.h;state.targets[uid]=Math.max(0,to);if(!Number.isFinite(from))return;state.tweens=state.tweens.filter(function(t){return t.uid!==uid;});state.tweens.push({uid:uid,from:from,to:Math.max(0,to),at:performance.now(),duration:duration});var el=node(uid);if(el)el.classList.add('health-changing');}
 function tick(now){if(sequence!==state)return;state.tweens=state.tweens.filter(function(t){var fraction=Math.min(1,(now-t.at)/t.duration),value=t.from+(t.to-t.from)*fraction;state.health[t.uid]=value;paintHealth(t.uid,value);if(fraction===1){var el=node(t.uid);if(el)el.classList.remove('health-changing');}return fraction<1;});state.frame=requestAnimationFrame(tick);}
 state.frame=requestAnimationFrame(tick);
 timeline.groups.forEach(function(group){
  later(function(){if(sequence!==state)return;
   group.events.forEach(function(e){var d=e.data;if(d.uid&&!node(d.uid)){mount(d.uid,known);paintHealth(d.uid,state.health[d.uid]);}var origin=card(d.uid)||e.origin,scope=lane(d.side)||e.lane;
    if(e.type==='action'){e.points=(d.targets||[]).map(function(uid){return card(uid);}).filter(Boolean);actionEffect(host,e);}
    if(e.type==='attack'){var target=card(d.target)||e.target||lane(d.side==='p'?'e':'p');phrase(host,d,origin,target,d.strong?'strong':'normal',quiet,group.impact);var actor=node(d.uid);if(actor&&!quiet){actor.classList.remove('is-speaking');void actor.offsetWidth;actor.classList.add('is-speaking');}later(function(){if(sequence!==state)return;zasca(host,card(d.target)||target,!!d.strong);},group.impact);}
    if((e.type==='guard'||e.type==='heal')&&group.type!=='action'&&d.quote){var ownHalf=rect('.battle-backdrop.'+(d.side==='p'?'player':'enemy')),local=ownHalf&&origin?{x:origin.x,y:ownHalf.y}:origin;phrase(host,d,origin,local,e.type,quiet,group.impact);}
    if(e.type==='turn'){var hud=document.querySelector('.battle-hud'),r=hud&&hud.getBoundingClientRect();effect(host,'turn-announcement '+(d.side==='p'?'own':'rival'),r?{x:r.left+r.width/2,y:r.top-14}:null,d.side==='p'?'Tu turno':'Turno rival');}
   });
  },group.start);
  later(function(){if(sequence!==state)return;group.events.forEach(function(e){var d=e.data,origin=card(d.uid)||e.origin;
   if(e.type==='damage'){effect(host,'damage-number',origin,'−'+d.value);if(d.guarded)effect(host,'guard-hit',origin,'',700);tween(d.uid,(state.targets[d.uid]===undefined?state.health[d.uid]||0:state.targets[d.uid])-d.value,group.healthDuration);}
   if(e.type==='heal'&&d.value>0){support(host,'heal',origin);effect(host,'heal-number',origin,'+'+d.value);tween(d.uid,Math.min(known[d.uid]?known[d.uid].card.hm:Infinity,(state.targets[d.uid]===undefined?state.health[d.uid]||0:state.targets[d.uid])+d.value),group.healthDuration);}
   if(e.type==='guard')support(host,'guard',origin);
   if(e.type==='votes'||e.type==='turn')effect(host,'vote-number '+(d.side==='p'?'own':'rival'),bar(d.side),(d.value>=0?'+':'')+d.value);
  });},group.start+group.impact);
  later(function(){if(sequence!==state)return;group.events.filter(function(e){return e.type==='expel';}).forEach(function(e){var el=node(e.data.uid);if(el){paintHealth(e.data.uid,0);el.classList.add('is-leaving');}});},group.start+group.duration-group.departure);
 });
 later(function(){if(sequence!==state)return;cancelAnimationFrame(state.frame);sequence=null;if(pending.some(function(e){return e.game===game;}))capture(game);var el=document.querySelector('.battle-wrap');if(el){el.inert=false;el.removeAttribute('aria-busy');}if(hooks.refresh)hooks.refresh();else restoreBoards(currentBoards);settleWaiters();},timeline.duration);
}
root.addEventListener('resize',function(){split();});
if(document.addEventListener)document.addEventListener('visibilitychange',function(){if(document.hidden){var active=sequence;clear();if(active&&hooks.refresh)hooks.refresh();}});
root.HemicycleBattleVisuals={queue:queue,render:render,capture:capture,beforePaint:beforePaint,busy:busy,whenIdle:whenIdle,plan:plan,actionTargets:actionTargets};
})(typeof window!=='undefined'?window:globalThis);
