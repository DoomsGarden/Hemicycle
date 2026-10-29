/* La entrada se reproduce una vez por apertura, sin cambiar el guardado. */
(function(){
'use strict';
var screen=document.getElementById('launchScreen'),app=document.getElementById('app');
if(!screen||!app)return;
window.HemicycleLaunchReady=true;
var button=screen.querySelector('.launch-start'),musicButton=screen.querySelector('[data-intro-music]'),musicRequested=false,musicTouched=false,leaving=false,ended=false,timer;
var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function finish(){
 if(ended)return;ended=true;clearTimeout(timer);screen.hidden=true;
 var entry=window.HemicycleLegal?HemicycleLegal.enter():Promise.resolve(true);
 entry.then(function(allowed){
  if(!allowed){ended=false;leaving=false;screen.hidden=false;screen.classList.remove('leaving');button.disabled=false;button.focus({preventScroll:true});return;}
  screen.remove();app.inert=false;app.removeAttribute('aria-hidden');
  var target=app.querySelector('[data-act="play"]');if(target)target.focus({preventScroll:true});
  window.HemicycleEntryRequested=true;document.dispatchEvent(new Event('hemicycle:entry-request'));
  window.HemicycleEntered=true;document.dispatchEvent(new Event('hemicycle:entered'));
 });
}
function musicLabel(){
 if(!musicButton||!window.HemicycleAudio)return;var prefs=HemicycleAudio.preferences(),active=musicRequested&&prefs.musicEnabled;
 musicButton.setAttribute('aria-pressed',String(active));musicButton.setAttribute('aria-label',active?'Desactivar música de inicio':'Activar música de inicio');
 musicButton.querySelector('[data-intro-music-label]').textContent=active?(prefs.muted||!prefs.master||!prefs.music?'Volumen silenciado en Opciones':'Música activada'):'Activar música';
}
if(musicButton){musicButton.addEventListener('pointerdown',function(){musicTouched=true;});musicButton.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' ')musicTouched=true;});}
if(musicButton)musicButton.addEventListener('click',function(){
 if(ended||leaving||!window.HemicycleAudio)return;musicRequested=!musicRequested;HemicycleAudio.set({musicEnabled:musicRequested});HemicycleAudio.unlock().then(musicLabel);musicLabel();
});
if(window.HemicycleAudio)HemicycleAudio.unlock().then(function(){if(!ended&&!musicTouched&&HemicycleAudio.status().context==='running'){musicRequested=HemicycleAudio.preferences().musicEnabled;musicLabel();}});
function ready(){if(ended)return;button.disabled=false;button.focus({preventScroll:true});}
button.addEventListener('click',function(){
 if(leaving||button.disabled)return;leaving=true;button.disabled=true;
 screen.classList.add('leaving');
 timer=setTimeout(finish,reduced?200:1400);
});
screen.addEventListener('animationend',function(ev){if(leaving&&ev.target===screen&&ev.animationName==='launchExit')finish();});
screen.addEventListener('keydown',function(ev){if(ev.key==='Tab'){var items=Array.from(screen.querySelectorAll('button:not(:disabled)')),i=items.indexOf(document.activeElement);if(items.length){ev.preventDefault();items[(i+(ev.shiftKey?-1:1)+items.length)%items.length].focus({preventScroll:true});}}});
if(reduced)ready();else setTimeout(ready,1550);
})();
