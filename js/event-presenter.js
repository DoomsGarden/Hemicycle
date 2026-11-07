/* Avisos de evento reutilizables. La presentación nunca concede recompensas. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleEventPresenter=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function esc(value){return String(value||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function hintHTML(text){return '<span class="mail-comment-hint event-mail-hint" role="status">'+esc(text)+'</span>';}
// A server notice receipt is delivery bookkeeping, not proof that this device
// actually displayed and dismissed the animation. Keep presentation separate.
function hasDismissed(event,receipt){return !!receipt&&receipt.version===2&&receipt.id===event.id&&receipt.dismissed===true;}
function shouldPresent(event,profile,receipt,now){return event.eligible(profile,now)&&event.pending(profile,now).length>0&&!hasDismissed(event,receipt);}
function dismissal(event,now){return {version:2,id:event.id,dismissed:true,mailVisited:false,at:now};}
function reminder(event,profile,receipt,now){return event.eligible(profile,now)&&event.pending(profile,now).length>0&&(hasDismissed(event,receipt)?!receipt.mailVisited:event.state(profile).announced&&!event.state(profile).mailVisited);}
function create(api){var current=null,timer=null,observer=null,unlisten=null;
 function cleanup(){clearTimeout(timer);timer=null;if(observer)observer.disconnect();observer=null;if(unlisten)unlisten();unlisten=null;}
 function closed(){if(!current||current.node.isConnected)return;var saved=current;current=null;cleanup();if(saved.dismiss)saved.dismiss(saved.event.id,{reason:saved.reason||'interrupted'});}
 function cancel(){cleanup();current=null;}
 function show(event,onDismiss){
  if(!event||typeof event.id!=='string'||!event.id||!Number.isFinite(event.durationMs)||event.durationMs<1000)throw Error('Configuración de evento no válida.');
  cancel();var image=event.image?'<div class="expansion-gift event-gift"><img src="'+esc(event.image)+'" width="640" height="640" alt="'+esc(event.imageAlt)+'" decoding="async"></div>':'';
  var html=image+(event.paragraphs||[]).map(function(text){return '<p>'+esc(text)+'</p>';}).join('');
  var node=api.open(event.title,html,event.buttonLabel||'Genial!');if(!node)throw Error('No se pudo abrir el evento.');
  node.classList.add('event-notice','expansion-notice');node.dataset.eventId=event.id;node.dataset.eventStartedAt=String(Date.now());
  current={node:node,event:event,dismiss:onDismiss};
  var doc=node.ownerDocument;
  if(doc){
   function intent(e){if(!current||current.node!==node)return;var target=e.target,button=target&&target.closest&&target.closest('button[data-modal]');if(e.type==='keydown'?e.key==='Escape':(button&&!button.disabled&&node.contains(button))||target===node.parentNode)current.reason='user';}
   doc.addEventListener('click',intent,true);doc.addEventListener('keydown',intent,true);
   unlisten=function(){doc.removeEventListener('click',intent,true);doc.removeEventListener('keydown',intent,true);};
  }
  if(typeof MutationObserver!=='undefined'){observer=new MutationObserver(closed);observer.observe(node.parentNode.parentNode,{childList:true,subtree:true});}
  timer=setTimeout(function(){if(current&&current.node===node&&node.isConnected){current.reason='timeout';api.close();closed();}},event.durationMs);
  return node;
 }
 return {show:show,closed:closed,cancel:cancel,active:function(){return current&&current.event.id||null;}};
}
return Object.freeze({create:create,hintHTML:hintHTML,shouldPresent:shouldPresent,dismissal:dismissal,reminder:reminder});
});
