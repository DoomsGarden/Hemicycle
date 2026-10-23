/* Ventana de acciones anclada al cromo. El motor valida y ejecuta cada elección. */
(function(root){
 'use strict';
 var current=null,frame=0,pending=0;
 function esc(text){return String(text).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
 function chargeIcon(value){return '<svg class="strong-charge'+(value===3?' is-ready':'')+'" viewBox="0 0 32 32" role="img" aria-label="Carga: '+value+' de 3 secciones">'+[0,1,2].map(function(i){return '<path class="charge-segment'+(i<value?' is-filled':'')+'" transform="rotate('+(i*120)+' 16 16)" d="M16 2 A14 14 0 0 1 28.124 23 L22.062 19.5 A7 7 0 0 0 16 9 Z"/>';}).join('')+'<path class="charge-bolt" d="m17 10-6 8h4l-1 5 7-9h-4Z"/></svg>';}
 function button(action,label,quote,value,disabled,charge){
  return '<button type="button" class="battle-option" data-baction="'+action+'"'+(disabled?' disabled':'')+'><span class="battle-option-copy"><small'+(action==='strong'?' class="battle-strong-label"':'')+'>'+(action==='strong'?chargeIcon(charge):'')+esc(label)+'</small><span>'+esc(quote)+'</span></span><b>'+esc(value)+(action==='strong'?'<small>Coste: 1 A</small>':'')+'</b></button>';
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
   header+=button('guard','Defensa',data.guard?'Ya está preparada':'Un golpe; hasta tu próximo turno','−50 %',data.guard);
   header+=button('heal','Curación',data.healWait?'Descansa este turno':data.heal?'Recuperar Aguante':'Aguante completo','+'+data.heal+' A',!data.heal||!!data.healWait);
  }else{
   header+=button('normal','Ataque normal',data.quotes[0],data.normal+' Z');
   header+=button('strong','Ataque fuerte'+(data.strongWait?' · cargando':data.strongHealth<2?' · necesita 2 A':' · este turno'),data.quotes[1],data.strong+' Z',!data.strongAllowed,data.strongCharge);
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
