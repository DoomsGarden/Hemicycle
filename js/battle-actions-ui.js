/* Frases protagonistas y apoyo directo, anclados al orador sin ejecutar reglas. */
(function(root){
 'use strict';
 var current=null,frame=0,pending=0;
 function esc(text){return String(text).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
 function chargeIcon(value){return '<svg class="strong-charge'+(value===3?' is-ready':'')+'" viewBox="0 0 32 32" role="img" aria-label="Carga: '+value+' de 3 secciones">'+[0,1,2].map(function(i){return '<path class="charge-segment'+(i<value?' is-filled':'')+'" transform="rotate('+(i*120)+' 16 16)" d="M16 2 A14 14 0 0 1 28.124 23 L22.062 19.5 A7 7 0 0 0 16 9 Z"/>';}).join('')+'<path class="charge-bolt" d="m17 10-6 8h4l-1 5 7-9h-4Z"/></svg>';}
 function abilityHTML(info){if(!info||!info.id)return '';var text=info.name+'. '+info.summary+' '+info.availability,mark=info.state==='recovery'?'◷':info.state==='blocked'?'×':info.state==='conditional'?'?':'';return '<button type="button" class="battle-ability-info state-'+esc(info.state)+'" data-baction="ability-info" data-ability-id="'+esc(info.id)+'" data-ability-state="'+esc(info.state)+'" aria-label="Consultar habilidad: '+esc(text)+'" title="'+esc(text)+'">'+HemicycleBasicEffects.symbol(info.id)+(mark?'<i aria-hidden="true">'+mark+'</i>':'')+'</button>';}
 function attackButton(action,quote,value,disabled,data){var strong=action==='strong',info=data.ability,label=(strong?'Ataque fuerte':'Ataque básico')+': '+quote+'. '+value+' Zasca.'+(strong?' Coste: 1 Aguante.':info?' '+info.name+'. '+info.summary+' '+info.availability:'');if(strong&&!data.strongAllowed)label+=' '+(data.strongWait?'Disponible en '+data.strongWait+' turnos propios.':'Necesita al menos 2 de Aguante.');return '<div class="battle-attack-row '+(strong?'strong-row':info&&info.id?'has-ability':'')+'"'+(!strong?' data-ability-id="'+esc(info&&info.id||'none')+'"':'')+'><button type="button" class="battle-option" data-baction="'+action+'" aria-label="'+esc(label)+'" title="'+esc(label)+'"'+(disabled?' disabled':'')+'><span class="battle-phrase">'+esc(quote)+'</span><span class="battle-option-value">'+(strong?chargeIcon(data.strongCharge):'')+'<b>'+value+' Z</b>'+(strong?'<small>−1 A</small>':'')+'</span></button>'+(!strong?abilityHTML(info):'')+'</div>';}
 function supportButton(kind,data){var heal=kind==='heal',disabled=(heal?!data.heal||!!data.healWait:data.guard)||data.supportAffordable===false,reason=heal?data.healWait?'Curación en recuperación: '+data.healWait+' turno propio.':data.heal?'Curación: recuperar '+data.heal+' Aguante.':'Aguante completo.':data.guard?'Defensa ya preparada.':'Defensa: reducir el siguiente golpe al 50 %.';if(data.supportCost)reason+=' Papeles traspapelados: cuesta 1 TdP.';return '<button type="button" class="battle-support-button '+kind+'" data-baction="'+kind+'" aria-label="'+esc(reason)+'" title="'+esc(reason)+'"'+(disabled?' disabled':'')+'><span class="support-emblem '+kind+'">'+HemicycleBattleStatus.supportMarkup(kind)+'</span><b>'+(heal?'+'+data.heal:'50 %')+'</b>'+(data.supportCost?'<small class="support-cost" aria-label="Coste: 1 TdP">1 ◈</small>':'')+'</button>';}
 function place(){
  frame=0;var el=document.getElementById('battleActionRoot');if(!current||!el||el.hidden)return;
  var anchor=document.querySelector('[data-tutorial="player"] [data-buid="'+current.uid+'"]'),screen=document.getElementById('screen');if(!anchor||!screen){render(null);return;}
  var a=anchor.getBoundingClientRect(),s=screen.getBoundingClientRect(),wide=innerHeight<=500&&innerWidth>=600,bounds=wide?{left:0,right:innerWidth,width:innerWidth}:s;
  el.style.width=Math.min(wide?660:320,bounds.width-16)+'px';
  var w=el.offsetWidth,h=el.offsetHeight,left=Math.max(bounds.left+8,Math.min(bounds.right-w-8,a.left+a.width/2-w/2)),limit=Math.max(6,innerHeight-h-8);
  var cards=Array.from(document.querySelectorAll('.tribuna .cromo,.hand-zone .cromo,.battle-controls')).map(function(n){return {r:n.getBoundingClientRect(),weight:n===anchor?4:n.matches('.battle-controls')?1.5:n.closest('.hand-zone')?0.35:2};});
  function score(top){return cards.reduce(function(sum,item){var r=item.r,area=Math.max(0,Math.min(left+w,r.right)-Math.max(left,r.left))*Math.max(0,Math.min(top+h,r.bottom)-Math.max(top,r.top));return sum+area*item.weight;},0)+Math.abs(top+h/2-(a.top+a.height/2))*.1;}
  var choices=[a.top-h-8,a.bottom+8,innerHeight-h-8,6].map(function(top){return Math.max(6,Math.min(limit,top));}),top=choices.sort(function(x,y){return score(x)-score(y);})[0];
  el.style.left=left+'px';el.style.top=top+'px';el.dataset.placement=top>=a.bottom?'below':top+h<=a.top?'above':'floating';el.style.setProperty('--battle-arrow',Math.max(16,Math.min(w-16,a.left+a.width/2-left))+'px');
 }
 function render(data){
  var el=document.getElementById('battleActionRoot');if(!el)return;var previous=current,hadFocus=el.contains(document.activeElement);current=data;if(pending){clearTimeout(pending);pending=0;}el.inert=false;
  if(!data){el.hidden=true;el.innerHTML='';return;}
  var changed=!previous||previous.uid!==data.uid,html='<div class="battle-action-head"><span>'+esc(data.name)+'</span><button type="button" data-baction="cancel" aria-label="Cerrar frases">'+HemicycleBattleStatus.symbol('close')+'</button></div>';
  html+=attackButton('normal',data.quotes[0],data.normal,!!data.attackBlocked||!!data.normalBlocked,data);
  html+=attackButton('strong',data.quotes[1],data.strong,!data.strongAllowed||!!data.attackBlocked,data);
  html+='<section class="battle-support-block"><p class="battle-support-quote">'+esc(data.quotes[2])+'</p><div class="battle-support-actions">'+supportButton('guard',data)+supportButton('heal',data)+'</div></section>';
  if(data.attackBlocked)html+='<p class="battle-target-notice" role="status">'+esc(data.attackReason)+'</p>';
  el.setAttribute('role','dialog');el.setAttribute('aria-modal','false');el.setAttribute('aria-label','Frases de '+data.name);el.innerHTML='<div class="battle-action-content">'+html+'</div>';el.classList.toggle('opening',changed);el.dataset.view='phrases';el.hidden=false;place();
  if(changed||hadFocus){var first=el.querySelector('.battle-option:not(:disabled),.battle-support-button:not(:disabled)');if(first)first.focus({preventScroll:true});}
 }
 function queuePlace(){if(!frame)frame=requestAnimationFrame(place);}
 root.addEventListener('resize',queuePlace);root.addEventListener('scroll',queuePlace,true);if(root.visualViewport){root.visualViewport.addEventListener('resize',queuePlace);root.visualViewport.addEventListener('scroll',queuePlace);}
 function select(button,done){var el=document.getElementById('battleActionRoot');if(pending||!button||button.disabled||!el||el.hidden)return;if(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches){done();return;}button.classList.add('is-chosen');el.inert=true;pending=setTimeout(function(){pending=0;el.inert=false;done();},130);}
 root.HemicycleBattleActions={render:render,place:place,select:select};
})(typeof window!=='undefined'?window:globalThis);
