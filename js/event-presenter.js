/* Avisos de evento reutilizables. La presentación nunca concede recompensas. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleEventPresenter=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function esc(value){return String(value||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function hintHTML(text){return '<span class="mail-comment-hint event-mail-hint" role="status">'+esc(text)+'</span>';}
function create(api){var current=null,timer=null,observer=null;
 function closed(){if(!current||current.node.isConnected)return;var saved=current;current=null;clearTimeout(timer);timer=null;if(observer){observer.disconnect();observer=null;}if(saved.dismiss)saved.dismiss(saved.event.id);}
 function cancel(){clearTimeout(timer);timer=null;if(observer)observer.disconnect();observer=null;current=null;}
 function show(event,onDismiss){
  if(!event||typeof event.id!=='string'||!event.id||!Number.isFinite(event.durationMs)||event.durationMs<1000)throw Error('Configuración de evento no válida.');
  cancel();var image=event.image?'<div class="expansion-gift event-gift"><img src="'+esc(event.image)+'" width="640" height="640" alt="'+esc(event.imageAlt)+'" decoding="async"></div>':'';
  var html=image+(event.paragraphs||[]).map(function(text){return '<p>'+esc(text)+'</p>';}).join('');
  var node=api.open(event.title,html,event.buttonLabel||'Genial!');if(!node)throw Error('No se pudo abrir el evento.');
  node.classList.add('event-notice','expansion-notice');node.dataset.eventId=event.id;node.dataset.eventStartedAt=String(Date.now());
  current={node:node,event:event,dismiss:onDismiss};
  if(typeof MutationObserver!=='undefined'){observer=new MutationObserver(closed);observer.observe(node.parentNode.parentNode,{childList:true,subtree:true});}
  timer=setTimeout(function(){if(current&&current.node===node&&node.isConnected){api.close();closed();}},event.durationMs);
  return node;
 }
 return {show:show,closed:closed,cancel:cancel,active:function(){return current&&current.event.id||null;}};
}
return Object.freeze({create:create,hintHTML:hintHTML});
});
