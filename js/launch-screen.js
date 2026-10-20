/* La entrada se reproduce una vez por apertura, sin cambiar el guardado. */
(function(){
'use strict';
var screen=document.getElementById('launchScreen'),app=document.getElementById('app');
if(!screen||!app)return;
window.HemicycleLaunchReady=true;
var button=screen.querySelector('button'),leaving=false,ended=false,timer;
var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function finish(){
 if(ended)return;ended=true;clearTimeout(timer);screen.remove();app.inert=false;app.removeAttribute('aria-hidden');
 var target=app.querySelector('[data-act="play"]');if(target)target.focus({preventScroll:true});
}
function ready(){if(ended)return;button.disabled=false;button.focus({preventScroll:true});}
button.addEventListener('click',function(){
 if(leaving||button.disabled)return;leaving=true;button.disabled=true;screen.classList.add('leaving');
 timer=setTimeout(finish,reduced?200:1400);
});
screen.addEventListener('animationend',function(ev){if(leaving&&ev.target===screen&&ev.animationName==='launchExit')finish();});
screen.addEventListener('keydown',function(ev){if(ev.key==='Tab'){ev.preventDefault();button.focus({preventScroll:true});}});
if(reduced)ready();else setTimeout(ready,1550);
})();
