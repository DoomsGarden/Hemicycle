/* Práctica guiada aislada: el motor real ejecuta las acciones de cada ejercicio. */
(function(root){
'use strict';
var KEY='hemiciclo_tutorial_v1';
function create(api){
 var active=false,index=0,highlight=null,previous=null,frame=0,steps=[];
 var layer=document.createElement('div');layer.id='tutorialRoot';document.body.appendChild(layer);
 function seen(){var value=api.read(KEY);return !!value&&(value.status==='completed'||value.status==='skipped');}
 function save(status){api.write(KEY,{status:status,version:1,updatedAt:Date.now()});}
 function makeSteps(){return [
  ['coin','[data-tutorial="coin"]','Tu primer debate','Práctica sin riesgo: cromos prestados y rival muy fácil. Ensayamos cara y empiezas tú; en partidas normales el sorteo es al 50 %. Toca la moneda.','begin'],
  ['votes','.vbars','Gana con 100 votos','Alcanza 100 votos para ganar al instante. Si nadie llega, se cuentan los votos tras 7 rondas. Cada turno suma 3 votos más los escaños de tu Tribuna. Toca los marcadores.'],
  ['cabinet','.gab','Tu gabinete y el mazo','Juegas con cinco cromos distintos. Aquí ves si están en la mano, la Tribuna, el mazo o descansando. Robas al empezar tu turno; los expulsados podrán volver al mazo. Toca el gabinete.'],
  ['tdp','[data-tutorial="resources"]','Tiempo de Palabra','El TdP paga el coste de la esquina superior de cada cromo. Se renueva al empezar tu turno y aumenta su base hasta 6; algunas pasivas permiten llegar a 8. Toca los cristales.'],
  ['play-leader','[data-tutorial="hand"] .lead','Presenta a tu líder','La estrella señala al líder: tiene +1 Zasca y +3 Aguante. Z indica el daño y A la resistencia. Este cuesta 1 TdP. Tócalo para llevarlo a la Tribuna.','play-leader'],
  ['passive','[data-tutorial="resources"]','Tu pasiva está activa','Vieja Guardia aumenta el Zasca al presentar oradores y al terminar el turno, hasta +3. Solo funciona con el líder en la Tribuna. Cada doctrina tiene una debilidad circular frente a otra. Toca la doctrina.'],
  ['select','[data-tutorial="player"] .lead','Elige quién ataca','Los oradores pueden atacar una vez por turno, incluso al entrar. Toca a tu líder en la Tribuna para seleccionarlo.','select-leader'],
  ['attack','[data-tutorial="enemy"] .cromo','Elige el objetivo','Toca el cromo rival para lanzar el zasca. Hemos reducido su Aguante solo en esta práctica: lo expulsarás y sumarás sus escaños como votos.','attack'],
  ['log','.log','Comprueba lo ocurrido','El registro muestra el zasca, el daño y los votos ganados. «Hecho» indica que tu orador ya atacó; recuperará su acción en tu próximo turno. Toca el registro.'],
  ['end','[data-act="end"]','Cede el turno','Puedes presentar hasta tres oradores en la Tribuna. Cuando termines tus acciones, pulsa Pasar turno. Vieja Guardia reforzará a tus oradores.','end'],
  ['enemy','[data-tutorial="enemy"] .cromo','También juega el rival','El rival recibe TdP y votos, roba y presenta un orador. En este ensayo solo atacará con 1 de Zasca. Toca su cromo para observar el ataque y recuperar el turno.','enemy'],
  ['member','[data-tutorial="hand"] .cromo','Refuerza tu Tribuna','Se han renovado tu TdP y las acciones de tus oradores. Presenta este segundo miembro; su coste se descontará y también recibirá la bonificación activa.','play-member'],
  ['select-again','[data-tutorial="player"] .lead','Tu líder vuelve a estar listo','Toca al líder para preparar otro zasca. Ahora es más fuerte gracias a Vieja Guardia.','select-leader'],
  ['attack-again','[data-tutorial="enemy"] .cromo','Deja la bancada vacía','Ataca al orador rival. Al expulsarlo sumarás sus escaños y quedará una bancada vacía a la que también se puede atacar.','attack'],
  ['select-member','[data-tutorial="player"] .cromo:not(.lead)','Otro orador, otra acción','Tu segundo miembro aún no ha intervenido. Tócalo para seleccionarlo.','select-member'],
  ['empty','[data-tutorial="enemy"] [data-buid="__EMPTY"]','Resta votos al rival','Con la bancada vacía, un zasca resta votos al rival hasta el valor de tu Zasca. No te entrega esos votos. Toca «Restar votos».','empty'],
  ['final-votes','.vbars','Ensayo de la victoria','Para el último ejercicio adelantamos tu marcador a 98 votos y colocamos un rival con 1 de Aguante y 2 escaños. Toca el marcador: bastará expulsarlo para llegar a 100.'],
  ['final-select','[data-tutorial="player"] .lead','Último zasca','Hemos preparado una última acción de práctica. Selecciona a tu líder.','select-leader'],
  ['final-attack','[data-tutorial="enemy"] .cromo','Consigue los dos votos','Toca el rival. Al llegar a 100, la victoria será inmediata y no habrá turno de respuesta.','attack']
 ];}
 function start(){
  if(active)return;
  active=true;index=0;steps=makeSteps();save('in-progress');api.prepare();render();
 }
 function clear(){
  if(highlight){highlight.classList.remove('tutorial-focus');for(var key in previous){if(previous[key]===null)highlight.removeAttribute(key);else highlight.setAttribute(key,previous[key]);}}
  highlight=null;previous=null;layer.innerHTML='';layer.hidden=true;cancelAnimationFrame(frame);
 }
 function finish(status){if(!active)return;active=false;clear();save(status);api.leave(status);}
 function advance(){
  var step=steps[index];index++;
  if(step[4])api.action(step[4]);
  if(active){if(step[0]==='empty')api.action('prepare-final');render();}
 }
 function place(){
  if(!highlight||!layer.firstChild)return;
  var card=layer.querySelector('.tutorial-coach'),screen=document.getElementById('screen').getBoundingClientRect(),r=highlight.getBoundingClientRect();
  var top=Math.max(6,screen.top+6),bottom=Math.min(innerHeight-6,screen.bottom-6),left=Math.max(6,screen.left+8),right=Math.min(innerWidth-6,screen.right-8);
  var above=r.top-top-12,below=bottom-r.bottom-12,useAbove=above>below,room=Math.max(above,below);
  card.style.width=Math.min(310,right-left)+'px';card.style.maxHeight=Math.max(56,room)+'px';
  var h=card.getBoundingClientRect().height,x=Math.min(right-card.offsetWidth,Math.max(left,r.left+(r.width-card.offsetWidth)/2));
  card.style.left=x+'px';card.style.top=(useAbove?Math.max(top,r.top-h-12):r.bottom+12)+'px';
 }
 function render(){
  clear();
  if(!active)return;
  if(!api.inBattle()){active=false;api.pause();return;}
  if(document.querySelector('#modalRoot .modal'))return;
  var step=steps[index];if(!step)return;
  highlight=document.querySelector(step[1]);if(!highlight)return;
  layer.hidden=false;previous={tabindex:highlight.getAttribute('tabindex'),role:highlight.getAttribute('role'),'aria-describedby':highlight.getAttribute('aria-describedby')};
  highlight.classList.add('tutorial-focus');if(!highlight.matches('button')){highlight.setAttribute('tabindex','0');highlight.setAttribute('role','button');}highlight.setAttribute('aria-describedby','tutorialText');
  layer.innerHTML='<section class="tutorial-coach" role="region" aria-label="Guía del combate"><small>PRÁCTICA · '+(index+1)+' / '+steps.length+'</small><h3>'+step[2]+'</h3><p id="tutorialText">'+step[3]+'</p><span>Toca la zona iluminada para continuar.</span></section>';
  highlight.scrollIntoView({block:'nearest',inline:'nearest'});place();frame=requestAnimationFrame(place);highlight.focus({preventScroll:true});
 }
 document.addEventListener('click',function(ev){
  if(!active||!api.inBattle())return;
  if(ev.target.closest('#modalRoot'))return;
  if(ev.target.closest('[data-act="abandon"]'))return;
  ev.preventDefault();ev.stopImmediatePropagation();
  if(highlight&&highlight.contains(ev.target))advance();
 },true);
 document.addEventListener('keydown',function(ev){
  if(!active||!api.inBattle()||document.querySelector('#modalRoot .modal'))return;
  if((ev.key==='Enter'||ev.key===' ')&&highlight&&highlight.contains(ev.target)&&!ev.target.closest('button')){ev.preventDefault();advance();}
  if(ev.key==='Tab'){
   var abandon=document.querySelector('[data-act="abandon"]');ev.preventDefault();
   if(document.activeElement===highlight&&abandon)abandon.focus();else if(highlight)highlight.focus({preventScroll:true});
  }
 },true);
 window.addEventListener('resize',place);window.addEventListener('scroll',place,true);
 return {start:start,seen:seen,render:render,finish:finish,get active(){return active;},get step(){return active?steps[index][0]:null;},key:KEY};
}
root.HemicycleTutorial={create:create,key:KEY};
})(typeof globalThis!=='undefined'?globalThis:this);
