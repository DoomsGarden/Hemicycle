/* Escena local: la animación no confirma premios ni sustituye el recibo del servidor. */
(function(root){'use strict';
 var assetBase=new URL('../assets/results/',document.currentScript.src).href;
 async function show(win,verification,options){
  options=options||{};if(!verification||typeof verification!=='function'&&typeof verification.then!=='function')throw Error('Falta comprobar la partida y el guardado.');
  var host=document.createElement('div'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,verified=false,value=null,checking=false,opening=true,closed=false;
  var previousFocus=document.activeElement,app=document.getElementById('app'),previousInert=app&&app.inert,previousHidden=app&&app.getAttribute('aria-hidden');
  host.className='result-transition '+(win?'won':'lost');host.setAttribute('role','dialog');host.setAttribute('aria-modal','true');host.setAttribute('aria-labelledby','resultSceneTitle');host.setAttribute('aria-busy','true');
  var image=document.createElement('img');image.className='result-chamber';image.alt=win?'Hemiciclo realista iluminado para celebrar la victoria':'Hemiciclo realista al anochecer tras la derrota';
  var kind=win?'victory':'defeat';image.src=assetBase+kind+(reduced?'-still':'')+'.webp'+(reduced?'':'?v=medium1');image.onerror=function(){if(!image.dataset.fallback){image.dataset.fallback='true';image.src=assetBase+kind+'-still.webp';}};host.appendChild(image);
  host.insertAdjacentHTML('beforeend','<div class="chamber-result"><span class="eyebrow">HEMICICLO</span><h1 id="resultSceneTitle" tabindex="-1">'+(win?'¡VICTORIA!':'DERROTA')+'</h1></div><div class="result-verification"><p id="resultVerificationStatus" role="status" aria-live="polite">Verificando partida y guardado…</p><button type="button" class="result-retry" hidden>Reintentar verificación</button></div><footer class="result-scene-footer"><button type="button" class="btn result-next" aria-describedby="resultVerificationStatus" disabled>Siguiente</button></footer>');
  if(win&&!reduced)for(var i=0;i<70;i++){var c=document.createElement('i');c.className='chamber-confetti';c.style.cssText='--x:'+Math.random()*100+'vw;--delay:'+Math.random()*1.2+'s;--fall:'+(3+Math.random()*3)+'s;--color:'+['#f1ca71','#eadbaa','#fff1cc','#ad9867'][i%4]+';--spin:'+Math.random()*720+'deg';host.appendChild(c);}
  document.body.appendChild(host);if(app){app.inert=true;app.setAttribute('aria-hidden','true');}
  var leave=document.createElement('button');leave.type='button';leave.className='result-defer';leave.textContent='Volver al menú · verificar después';leave.hidden=true;host.querySelector('.result-verification').appendChild(leave);
  var deferred=false,slowTimer;
  var status=host.querySelector('[role=status]'),next=host.querySelector('.result-next'),retry=host.querySelector('.result-retry'),title=host.querySelector('h1'),resolveNext;
  var clicked=new Promise(function(resolve){resolveNext=resolve;});title.focus({preventScroll:true});
  function ready(){next.disabled=!verified||opening;if(verified){status.textContent=opening?'Guardado verificado · Finalizando escena…':value&&value.local?'Partida y guardado local verificados.':'Partida y guardado verificados.';}if(!next.disabled)next.focus({preventScroll:true});}
  function perform(again){
   if(checking||verified||closed)return;checking=true;clearTimeout(slowTimer);slowTimer=setTimeout(function(){if(!closed&&!verified){leave.hidden=false;status.textContent='La comprobación está tardando. Puedes volver al menú; el resultado seguirá pendiente.';}},8000);retry.hidden=true;host.setAttribute('aria-busy','true');status.textContent='Verificando partida y guardado…';
   var task=again&&(options.retry||typeof verification==='function'&&verification)||verification;
   Promise.resolve().then(function(){return typeof task==='function'?task():task;}).then(function(result){
    if(closed)return;verified=true;value=result;checking=false;clearTimeout(slowTimer);leave.hidden=true;host.setAttribute('aria-busy','false');status.textContent=result&&result.local?'Partida y guardado local verificados.':'Partida y guardado verificados.';ready();
   },function(){
    if(closed)return;checking=false;clearTimeout(slowTimer);leave.hidden=false;host.setAttribute('aria-busy','false');status.textContent=navigator.onLine?'No se pudo verificar el guardado. Tu partida se conserva. Pulsa Reintentar para comprobarlo.':'Sin conexión. Tu partida se conserva; Siguiente estará disponible cuando se verifique al reconectar.';retry.hidden=false;retry.focus({preventScroll:true});
   });
  }
  function connected(){if(!verified)perform(true);}
  function keys(event){
   if(event.key==='Escape'){if(!leave.hidden)leave.click();event.preventDefault();event.stopImmediatePropagation();return;}
   if(event.key==='Tab'){var items=Array.from(host.querySelectorAll('button:not(:disabled):not([hidden])'));if(!items.length){event.preventDefault();title.focus({preventScroll:true});return;}var at=items.indexOf(document.activeElement);if(at<0||event.shiftKey&&at===0||!event.shiftKey&&at===items.length-1){event.preventDefault();items[event.shiftKey?items.length-1:0].focus({preventScroll:true});}}
  }
  root.addEventListener('online',connected);document.addEventListener('keydown',keys,true);
  leave.onclick=function(){if(closed)return;deferred=true;closed=true;resolveNext();};
  retry.onclick=function(){perform(true);};next.onclick=function(){if(verified&&!opening&&!closed){closed=true;resolveNext();}};
  setTimeout(function(){if(closed)return;opening=false;ready();},reduced?120:4800);perform(false);
  await clicked;clearTimeout(slowTimer);root.removeEventListener('online',connected);document.removeEventListener('keydown',keys,true);host.remove();
  if(app){app.inert=previousInert;if(previousHidden===null)app.removeAttribute('aria-hidden');else app.setAttribute('aria-hidden',previousHidden);}
  if(previousFocus&&previousFocus.isConnected&&!previousFocus.closest('[inert]'))previousFocus.focus({preventScroll:true});
  return {verified:!deferred&&verified,pending:deferred,result:deferred?null:value,error:null};
 }
 root.HemicycleResultTransition={show:show};
})(window);
