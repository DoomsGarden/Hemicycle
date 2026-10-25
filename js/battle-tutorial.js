/* Práctica guiada aislada: el motor real ejecuta las acciones de cada ejercicio. */
(function(root){
'use strict';
var KEY='hemiciclo_tutorial_v1';
function create(api){
 var key=api.key||KEY,textId=api.textId||'tutorialText';
 var active=false,index=0,highlight=null,previous=null,frame=0,steps=[],waiting=false,run=0;
 var layer=document.createElement('div');layer.id=api.layerId||'tutorialRoot';layer.className='tutorial-layer';document.body.appendChild(layer);
 function seen(){var value=api.read(key);return !!value&&(value.status==='completed'||value.status==='skipped');}
 function save(status){api.write(key,{status:status,version:3,updatedAt:Date.now()});}
 function makeSteps(){return [
  ['coin','[data-tutorial="coin"]','Tu primer debate','Práctica con cromos prestados. Ensayamos cara y empiezas tú; fuera del tutorial el sorteo es al 50 %. Toca la moneda.','begin'],
  ['votes','.vbars','Gana con 100 votos','Azul: tus votos. Rojo: los del rival. Ganas al llegar a 100. El número lateral es el reloj: 90 segundos en Normal y Clasificatoria; 60 en Rápida. No hay límite de rondas. En esta práctica no corre. Toca los marcadores.'],
  ['cabinet','.gab','Tu gabinete y el mazo','Cinco oradores y hasta dos acciones. Tres oradores en mesa y dos cartas en mano, nunca dos acciones juntas. Los expulsados descansan y se barajan con el mazo; no vuelven en tu siguiente turno. Toca el gabinete.'],
  ['tdp','[data-tutorial="resources"]','Tiempo de Palabra','El TdP paga el coste de presentar cromos. Se renueva cada turno; su base crece hasta 6 y algunas pasivas permiten llegar a 8. Toca los cristales.'],
  ['play-leader','[data-tutorial="hand"] .lead','Presenta a tu líder','La estrella identifica al líder: +1 Zasca y +3 Aguante. Z indica el daño; A, su resistencia. Este cuesta 1 TdP. Tócalo para presentarlo.','play-leader'],
  ['passive','[data-tutorial="resources"]','Tu pasiva','Vieja Guardia mejora el Zasca al presentar y al terminar el turno, hasta +3. Requiere al líder en la Tribuna y puede ser neutralizada. Toca la doctrina.'],
  ['select','[data-tutorial="player"] .lead','Abre las tres frases','Cada orador dispone de una acción por turno, incluso al entrar. Toca al líder para abrir sus frases encima del cromo.','select-leader'],
  ['normal','[data-baction="normal"]','Primera frase: ataque normal','Esta primera frase causa el Zasca vigente del cromo. El número incluye bonificaciones. El fuerte se habilita en el tercer turno propio en mesa; su icono tiene tres secciones. Toca esta opción.','choose-normal'],
  ['attack','[data-tutorial="enemy"] .cromo','Elige el objetivo','Toca al orador rival para lanzar la primera frase. Tiene poco Aguante: lo expulsarás y ganarás sus escaños como votos.','attack'],
  ['log','.log','Una acción por orador','El registro muestra la frase elegida, el daño y los votos. «Hecho» indica que ese cromo ya usó su acción. Toca el registro.'],
  ['end','[data-act="end"]','Cede el turno','Al pasar, el rival roba, recibe recursos y presenta un orador. Tu líder recuperará su acción cuando vuelva tu turno. Pulsa Pasar turno.','end'],
  ['enemy','[data-tutorial="enemy"] .cromo','Practica con daño recibido','Este golpe preparado hará 4 de daño a tu líder y te devolverá el turno. Así podrás probar la curación sin riesgo. Toca al rival.','enemy'],
  ['heal-select','[data-tutorial="player"] .lead','Tercera frase: apoyo','Tu líder está herido. Tócalo para volver a abrir las tres frases.','select-leader'],
  ['support-heal','[data-baction="support"]','Elige la tercera frase','La tercera frase abre dos opciones dentro de esta misma ventana: defensa o curación. Tócala.','choose-support'],
  ['heal','[data-baction="heal"]','Recupera Aguante','Cura la mitad de lo que te falta, redondeando hacia arriba: mínimo 3, sin superar tu máximo. Consume su acción y no podrá curarse en tu siguiente turno. Pulsa Curación.','choose-heal'],
  ['member','[data-tutorial="hand"] .cromo','Presenta un segundo orador','Tu líder ya ha actuado, pero puedes usar otro cromo. Presenta este miembro de tu mano.','play-member'],
  ['guard-select','[data-tutorial="player"] .cromo:not(.lead)','Ensaya una defensa','Este segundo orador conserva su acción. Tócalo para abrir sus frases.','select-member'],
  ['support-guard','[data-baction="support"]','La misma tercera frase','Esta vez usaremos la tercera frase para defender. Tócala para abrir sus dos opciones.','choose-support'],
  ['guard','[data-baction="guard"]','Reduce el próximo golpe','Defensa reduce al 50 % el siguiente golpe que reciba este cromo y después desaparece. No se acumula y consume su acción. Pulsa Defensa.','choose-guard'],
  ['end-guard','[data-act="end"]','Observa el escudo','El cromo muestra que tiene una defensa preparada. Caduca tras recibir un golpe o al comenzar tu siguiente turno. Pulsa Pasar turno.','end'],
  ['enemy-guard','[data-tutorial="enemy"] .cromo','Comprueba la reducción','Este golpe de práctica causa 4 de daño: con la defensa solo recibirás 2. Toca al rival para comprobarlo y recuperar el turno.','enemy-guard'],
  ['guard-log','.log','Una defensa, un golpe','El registro muestra la reducción. El escudo ya se ha consumido; los golpes posteriores tendrán su daño habitual. Toca el registro.'],
  ['strong-select','[data-tutorial="player"] .lead','Prueba el ataque fuerte','Tu líder vuelve a tener una acción disponible. Tócalo para abrir sus frases.','select-leader'],
  ['strong','[data-baction="strong"]','Segunda frase: ataque fuerte','Usa la segunda frase y causa el 150 % del Zasca vigente. Se redondea hacia arriba. Cuesta 1 de Aguante y necesitas al menos 2. Solo está disponible este turno: úsalo o espera al siguiente ciclo de tres turnos. Toca esta opción.','choose-strong'],
  ['strong-attack','[data-tutorial="enemy"] .cromo','Lanza la segunda frase','Toca al rival para usar el ataque fuerte. El registro conservará la segunda frase, distinta de la del ataque normal.','attack'],
  ['select-member','[data-tutorial="player"] .cromo:not(.lead)','Cada miembro tiene su acción','Tu segundo orador también puede actuar este turno. Tócalo para abrir sus frases.','select-member'],
  ['normal-empty','[data-baction="normal"]','Elige el ataque normal','Usaremos su primera frase para atacar un espacio vacío y restar votos al rival. Toca Ataque normal.','choose-normal'],
  ['empty','[data-tutorial="enemy"] [data-buid="__EMPTY"]','Resta votos al rival','Un ataque a una bancada vacía resta votos hasta su daño, sin entregártelos. Toca «Restar votos».','empty'],
  ['action-card','[data-tutorial="hand"] .action-card','Una carta de acción','Las acciones no ocupan sitio en la Tribuna. Su marco indica la rareza y el número, su coste en TdP. Toca esta acción prestada para consultar sus reglas.','inspect-demo-action'],
  ['action-rules','#localActionRoot .action-rules','Consulta antes de activar','Aquí ves efecto, coste, límite por turno y qué sucede después de usarla. Las acciones más potentes pueden exigir condiciones adicionales. Toca la explicación.'],
  ['action-use','#localActionRoot [data-local-action="activate"]','Elige el objetivo','Turno de palabra cuesta 1 TdP y mejora el Zasca de un orador este turno. Pulsa Elegir objetivo: la ficha se cerrará y se iluminarán los cromos válidos.','prepare-demo-target'],
  ['action-target','[data-tutorial="player"] .lead','Toca el cromo en la mesa','El objetivo se elige igual que al atacar. Toca tu líder iluminado para aplicar la acción; los TdP se consumen una sola vez.','activate-demo-action'],
  ['action-return','.draw-pile','Regresa al mazo','La acción ha salido de tu mano, ha mostrado su efecto y vuelve al mazo. Podrá salir al renovar la mano de un turno posterior. Toca el mazo.'],
  ['action-discard','.action-discard','Acciones de un solo uso','Esta miniatura prestada muestra cómo queda una acción ya agotada: sombreada y fuera del barajado. Es un descarte distinto del descanso de oradores. Tócala para preparar la victoria final.','prepare-final'],
  ['final-votes','.vbars','Ensayo de la victoria','Adelantamos tu marcador a 98 votos y preparamos un rival con 1 de Aguante y 2 escaños. Toca los marcadores.'],
  ['final-select','[data-tutorial="player"] .lead','Última acción de práctica','Tu líder dispone de una última acción preparada para terminar el ejercicio. Tócalo.','select-leader'],
  ['final-normal','[data-baction="normal"]','Prepara el último zasca','El ataque normal basta para este rival. Escoge la primera frase.','choose-normal'],
  ['final-attack','[data-tutorial="enemy"] .cromo','Consigue los dos votos','Toca al rival. La victoria llega al alcanzar 100 votos. En partidas reales verás los FS, el Elo y el cromo del resultado; esta práctica no da premios.','attack']
 ];}

 function start(){
  if(active)return;
  active=true;waiting=false;run++;index=0;steps=api.steps||makeSteps();save('in-progress');api.prepare();render();
 }
 function clear(){
  if(highlight){highlight.classList.remove('tutorial-focus');for(var key in previous){if(previous[key]===null)highlight.removeAttribute(key);else highlight.setAttribute(key,previous[key]);}}
  highlight=null;previous=null;layer.innerHTML='';layer.hidden=true;cancelAnimationFrame(frame);
 }
 function finish(status){if(!active)return;active=false;waiting=false;run++;clear();save(status);api.leave(status);}
 function advance(){
  if(waiting)return;
  var step=steps[index],token=run;index++;
  function next(){if(!active||token!==run)return;waiting=false;if(!api.steps&&step[0]==='empty')api.action('prepare-action');if(index>=steps.length){finish('completed');return;}render();}
  // A menu demonstration may animate before its next target exists.
  waiting=true;var result=step[4]?api.action(step[4]):null;
  if(result&&typeof result.then==='function'){clear();result.then(next,function(){if(active&&token===run)finish('skipped');});}else next();
 }
 function place(){
  if(!highlight||!layer.firstChild)return;
  var card=layer.querySelector('.tutorial-coach'),screen=document.getElementById('screen').getBoundingClientRect(),r=highlight.getBoundingClientRect();
  var top=Math.max(6,screen.top+6),bottom=Math.min(innerHeight-6,screen.bottom-6),left=Math.max(6,screen.left+8),right=Math.min(innerWidth-6,screen.right-8);
  var sideLeft=r.left-left-12,sideRight=right-r.right-12;
  if(innerWidth>650&&Math.max(sideLeft,sideRight)>200&&Math.max(r.top-top,bottom-r.bottom)<160){var sideWidth=Math.min(260,Math.max(sideLeft,sideRight));card.style.width=sideWidth+'px';card.style.maxHeight=(bottom-top)+'px';card.style.left=(sideRight>=sideLeft?r.right+12:r.left-sideWidth-12)+'px';card.style.top=Math.max(top,Math.min(bottom-card.offsetHeight,r.top))+'px';return;}
  var above=r.top-top-12,below=bottom-r.bottom-12,useAbove=above>below,room=Math.max(above,below);
  card.style.width=Math.min(310,right-left)+'px';card.style.maxHeight=Math.max(56,room)+'px';
  var h=card.getBoundingClientRect().height,x=Math.min(right-card.offsetWidth,Math.max(left,r.left+(r.width-card.offsetWidth)/2));
  card.style.left=x+'px';card.style.top=(useAbove?Math.max(top,r.top-h-12):r.bottom+12)+'px';
 }
 function render(){
  clear();
  if(!active||waiting)return;
  if(!api.inBattle()){active=false;api.pause();return;}
  if(document.querySelector('#modalRoot .modal'))return;
  var step=steps[index];if(!step)return;
  highlight=document.querySelector(step[1]);if(!highlight){if(api.steps){active=false;api.pause();}return;}
  layer.hidden=false;layer.setAttribute('aria-hidden',String(!!document.getElementById('launchScreen')));previous={tabindex:highlight.getAttribute('tabindex'),role:highlight.getAttribute('role'),'aria-describedby':highlight.getAttribute('aria-describedby')};
  highlight.classList.add('tutorial-focus');if(!highlight.matches('button')){highlight.setAttribute('tabindex','0');highlight.setAttribute('role','button');}highlight.setAttribute('aria-describedby',textId);
  layer.innerHTML='<section class="tutorial-coach" role="region" aria-label="'+(api.label||'Guía del combate')+'"><small>'+(api.caption||'PRÁCTICA')+' · '+(index+1)+' / '+steps.length+'</small><h3>'+step[2]+'</h3><p id="'+textId+'">'+step[3]+'</p><span>Toca la zona iluminada para continuar.</span>'+(api.exitSelector?'<button type="button" class="mini tutorial-exit" id="menuTutorialExit">Salir de la guía</button>':'')+'</section>';
  highlight.scrollIntoView({block:'nearest',inline:'nearest'});place();frame=requestAnimationFrame(place);highlight.focus({preventScroll:true});
 }
 document.addEventListener('click',function(ev){
  if(!active||!api.inBattle())return;
  if(api.exitSelector&&ev.target.closest(api.exitSelector)){ev.preventDefault();ev.stopImmediatePropagation();finish('skipped');return;}
  if(ev.target.closest('#modalRoot'))return;
  if(!api.exitSelector&&ev.target.closest('[data-act="abandon"]'))return;
  ev.preventDefault();ev.stopImmediatePropagation();
  if(highlight&&highlight.contains(ev.target)){var step=steps[index];if(api.select&&step[4]&&step[4].indexOf('choose-')===0)api.select(highlight,advance);else advance();}
 },true);
 document.addEventListener('keydown',function(ev){
  if(!active||!api.inBattle()||document.querySelector('#modalRoot .modal'))return;
  if((ev.key==='Enter'||ev.key===' ')&&highlight&&highlight.contains(ev.target)&&!ev.target.closest('button')){ev.preventDefault();advance();}
  if(ev.key==='Tab'){
   var abandon=document.querySelector(api.exitSelector||'[data-act="abandon"]');ev.preventDefault();
   if(document.activeElement===highlight&&abandon)abandon.focus();else if(highlight)highlight.focus({preventScroll:true});
  }
 },true);
 window.addEventListener('resize',place);window.addEventListener('scroll',place,true);
 return {start:start,seen:seen,render:render,finish:finish,get active(){return active;},get step(){return active?steps[index][0]:null;},key:key};
}
root.HemicycleTutorial={create:create,key:KEY};
})(typeof globalThis!=='undefined'?globalThis:this);
