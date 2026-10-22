/* Ventana de acciones anclada al cromo. El motor valida y ejecuta cada elección. */
(function(root){
 'use strict';
 var current=null,frame=0,pending=0;
 function esc(text){return String(text).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
 function button(action,label,quote,value,disabled){
  return '<button type="button" class="battle-option" data-baction="'+action+'"'+(disabled?' disabled':'')+'><span class="battle-option-copy"><small>'+esc(label)+'</small><span>'+esc(quote)+'</span></span><b>'+esc(value)+'</b></button>';
 }
 function place(){
  frame=0;
  var el=document.getElementById('battleActionRoot');if(!current||!el||el.hidden)return;
  var anchor=document.querySelector('[data-tutorial="player"] [data-buid="'+current.uid+'"]'),screen=document.getElementById('screen');
  if(!anchor||!screen){render(null);return;}
  var a=anchor.getBoundingClientRect(),s=screen.getBoundingClientRect();
  var wide=innerHeight<=500&&innerWidth>=600,bounds=wide?{left:0,right:innerWidth,width:innerWidth}:s;
  el.style.width=Math.min(wide?720:350,bounds.width-16)+'px';
  var w=el.offsetWidth,h=el.offsetHeight,left=Math.max(bounds.left+8,Math.min(bounds.right-w-8,a.left+a.width/2-w/2));
  el.style.left=left+'px';el.style.top=(a.top-h-8)+'px';
  el.style.setProperty('--battle-arrow',Math.max(16,Math.min(w-16,a.left+a.width/2-left))+'px');
 }
 function render(data){
  var el=document.getElementById('battleActionRoot');if(!el)return;
  var previous=current,hadFocus=el.contains(document.activeElement);current=data;if(pending){clearTimeout(pending);pending=0;}el.inert=false;
  if(!data){el.hidden=true;el.innerHTML='';return;}
  var changed=!previous||previous.uid!==data.uid||previous.support!==data.support;
  var header='<div class="battle-action-head"><span>'+esc(data.support?'Defensa o curación':data.name)+'</span><button type="button" data-baction="'+(data.support?'back':'cancel')+'" aria-label="'+(data.support?'Volver a las tres frases':'Cerrar acciones')+'">'+(data.support?'&#8592;':'&#215;')+'</button></div>';
  el.setAttribute('role','dialog');el.setAttribute('aria-modal','false');el.setAttribute('aria-label','Acciones de '+data.name);
  if(data.support){
   header+='<p class="battle-support-quote">«'+esc(data.quotes[2])+'»</p>';
   header+=button('guard','Defensa',data.guard?'Ya está preparada':'Solo el próximo golpe','−50 %',data.guard);
   header+=button('heal','Curación',data.heal?'Recuperar Aguante':'Aguante completo','+'+data.heal+' A',!data.heal);
  }else{
   header+=button('normal','Ataque normal',data.quotes[0],data.normal+' Z');
   header+=button('strong','Ataque fuerte'+(data.strongWait?' · en '+data.strongWait+' turno'+(data.strongWait===1?'':'s'):' · listo'),data.quotes[1],data.strong+' Z',data.strongWait>0);
   header+=button('support','Defensa / curación',data.quotes[2],'50 % / +'+data.heal+' A');
  }
  el.innerHTML='<div class="battle-action-content'+(changed&&previous?' swapping':'')+'">'+header+'</div>';el.classList.toggle('opening',!previous||previous.uid!==data.uid);el.dataset.view=data.support?'support':'phrases';el.hidden=false;place();
  if(changed||hadFocus){var first=el.querySelector('.battle-option:not(:disabled)');if(first)first.focus({preventScroll:true});}
 }
 function queuePlace(){if(!frame)frame=requestAnimationFrame(place);}
 root.addEventListener('resize',queuePlace);root.addEventListener('scroll',queuePlace,true);
 if(root.visualViewport){root.visualViewport.addEventListener('resize',queuePlace);root.visualViewport.addEventListener('scroll',queuePlace);}
 function select(button,done){
  var el=document.getElementById('battleActionRoot');if(pending||!button||button.disabled||!el||el.hidden)return;
  if(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches){done();return;}
  button.classList.add('is-chosen');el.inert=true;
  pending=setTimeout(function(){pending=0;el.inert=false;done();},130);
 }
 root.HemicycleBattleActions={render:render,place:place,select:select};
})(typeof window!=='undefined'?window:globalThis);
