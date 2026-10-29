/* Audio local: ninguna petición a terceros, y ningún fallo bloquea el juego. */
(function(root){
 'use strict';
 var KEY='hemicycle_audio_v1',defaults={muted:false,master:1,music:0.28,effects:0.65,ambience:0,musicEnabled:true,effectsEnabled:true};
 var prefs=Object.assign({},defaults),ctx=null,master=null,musicBus=null,fxBus=null,roomBus=null;
 var state={screen:'menu',game:null,result:null},scene='',activeGame=null,epoch=0,unlocked=false;
 var buffers={},music=[],voices=[],room=null,layer=null,scoreGain=null,intensity=null,lastFx={},lastClock='',results=new WeakSet();
 var metrics={musicStarts:0,results:0,effects:{}};
 var effects=['ui','error','card','coin','normal','strong','guard','heal','expel','turn','timer','pack','reward'];
 var urlBase=new URL('../audio/',document.currentScript.src).href;
 function clamp(n,fallback){return typeof n==='number'&&isFinite(n)?Math.max(0,Math.min(1,n)):fallback;}
 try{var saved=JSON.parse(localStorage.getItem(KEY));if(saved&&typeof saved==='object'){prefs.muted=saved.muted===true;['master','music','effects','ambience'].forEach(function(k){prefs[k]=clamp(saved[k],defaults[k]);});['musicEnabled','effectsEnabled'].forEach(function(k){prefs[k]=saved[k]!==false;});}}catch(ignore){}
 function available(){return unlocked&&ctx&&ctx.state==='running'&&!document.hidden&&!prefs.muted;}
 function buffer(name){
  if(!buffers[name])buffers[name]=fetch(urlBase+name+'.mp3').then(function(r){if(!r.ok)throw Error('Audio unavailable');return r.arrayBuffer();}).then(function(bytes){return ctx.decodeAudioData(bytes);}).catch(function(){return null;});
  return buffers[name];
 }
 function disconnect(node){try{node.stop();}catch(ignore){}try{node.disconnect();}catch(ignore){}}
 function score(){if(!scoreGain){scoreGain=ctx.createGain();scoreGain.gain.value=0;scoreGain.connect(musicBus);ramp(scoreGain.gain,1,.12);}return scoreGain;}
 function stopMusic(immediate){
  epoch++;var old=music,oldLayer=layer,oldGain=scoreGain;music=[];layer=null;scoreGain=null;intensity=null;
  function clean(){old.forEach(disconnect);if(oldLayer)oldLayer.disconnect();if(oldGain)oldGain.disconnect();}
  if(immediate||!oldGain||!ctx||ctx.state!=='running'){clean();return;}
  ramp(oldGain.gain,0,.12);old.forEach(function(source){try{source.stop(ctx.currentTime+.14);}catch(ignore){}});setTimeout(clean,180);
 }
 function stopAll(){stopMusic(true);voices.forEach(disconnect);voices=[];if(room){disconnect(room);room=null;}scene='';activeGame=null;}
 function node(data,bus,loop,at){var source=ctx.createBufferSource();source.buffer=data;source.loop=!!loop;source.connect(bus);source.start(at===undefined?ctx.currentTime:at);return source;}
 function ramp(param,target,seconds){var now=ctx.currentTime;if(param.cancelAndHoldAtTime)param.cancelAndHoldAtTime(now);else{var value=param.value;param.cancelScheduledValues(now);param.setValueAtTime(value,now);}param.linearRampToValueAtTime(target,now+seconds);}
 function glorious(){return !!(state.game&&Math.max(state.game.votes.p,state.game.votes.e)>50);}
 function updateIntensity(){var next=glorious();if(layer&&next!==intensity){ramp(layer.gain,next?1:0,1.5);intensity=next;}}
 function desiredScene(){
  if(state.screen==='result'&&state.result)return 'result';
  if(state.screen==='battle'&&state.game&&!state.game.over&&state.game.n>0)return 'battle';
  if(state.screen==='battle'&&state.game&&state.game.over)return 'none';
  return 'menu';
 }
 function roomSound(){
  if(!available()||!prefs.ambience||!prefs.effectsEnabled||!prefs.effects){if(room){disconnect(room);room=null;}return;}
  if(room)return;
  // Reservar la petición para evitar duplicar el ambiente durante varios repintados.
  var marker={pending:true};room=marker;
  buffer('ambience').then(function(data){if(room!==marker)return;if(!data||!available()||!prefs.ambience||!prefs.effectsEnabled||!prefs.effects){room=null;return;}room=node(data,roomBus,true);});
 }
 function reconcile(){
  if(!available()){stopAll();return;}
  roomSound();
  var next=desiredScene(),game=state.game;
  if(next===scene&&(next!=='battle'&&next!=='result'||game===activeGame)){updateIntensity();return;}
  stopMusic();if(game!==activeGame)lastClock='';scene=next;activeGame=game;
  if(!prefs.music||!prefs.musicEnabled||next==='none')return;
  var ticket=epoch;
  if(next==='result'){
   if(!game||results.has(game)||['p','e'].indexOf(state.result)<0)return;
   buffer(state.result==='p'?'victory':'defeat').then(function(data){
    if(ticket!==epoch||!data||!available()||scene!=='result'||!prefs.music||!prefs.musicEnabled)return;
    results.add(game);music=[node(data,score(),false)];metrics.results++;
   });return;
  }
  if(next==='battle'){
   Promise.all([buffer('combat-base'),buffer('combat-layer')]).then(function(pair){
    if(ticket!==epoch||!available()||!prefs.music||!prefs.musicEnabled||pair.some(function(b){return !b;}))return;
    if(pair[0].length!==pair[1].length)return;
    layer=ctx.createGain();intensity=glorious();layer.gain.value=intensity?1:0;layer.connect(score());
    var start=ctx.currentTime+0.035;music=[node(pair[0],score(),true,start),node(pair[1],layer,true,start)];metrics.musicStarts++;
   });
  }else buffer('menu').then(function(data){if(ticket===epoch&&data&&available()&&prefs.music&&prefs.musicEnabled){music=[node(data,score(),true)];metrics.musicStarts++;}});
 }
 function levels(fade){if(!ctx)return;master.gain.setTargetAtTime(prefs.muted?0:prefs.master,ctx.currentTime,.02);musicBus.gain.setTargetAtTime(prefs.musicEnabled?prefs.music*(document.getElementById('launchScreen')?0.7:1):0,ctx.currentTime,fade||.03);fxBus.gain.setTargetAtTime(prefs.effectsEnabled?prefs.effects:0,ctx.currentTime,.02);roomBus.gain.setTargetAtTime(prefs.effectsEnabled?prefs.ambience*prefs.effects:0,ctx.currentTime,.03);}
 function unlock(){
  if(document.hidden)return Promise.resolve();
  try{
   if(!ctx){var Audio=root.AudioContext||root.webkitAudioContext;if(!Audio)return Promise.resolve();ctx=new Audio();master=ctx.createGain();master.connect(ctx.destination);musicBus=ctx.createGain();fxBus=ctx.createGain();roomBus=ctx.createGain();[musicBus,fxBus,roomBus].forEach(function(b){b.connect(master);});levels();}
   return ctx.resume().then(function(){if(!unlocked){unlocked=true;effects.concat(['combat-base','combat-layer','victory','defeat']).forEach(buffer);}reconcile();}).catch(function(){});
  }catch(ignore){return Promise.resolve();}
 }
 function effect(name){
  if(effects.indexOf(name)<0||!available()||!prefs.effectsEnabled||!prefs.effects)return;
  var now=Date.now(),minimum=name==='timer'?900:name==='error'?350:name==='ui'?60:120;
  if(lastFx[name]&&now-lastFx[name]<minimum)return;lastFx[name]=now;
  var requestedGame=state.game,requestedScreen=state.screen;
  buffer(name).then(function(data){
   if(!data||!available()||!prefs.effectsEnabled||!prefs.effects||Date.now()-now>650||state.game!==requestedGame||state.screen!==requestedScreen)return;
   if(voices.length>=6)disconnect(voices.shift());
   var source=node(data,fxBus,false);voices.push(source);metrics.effects[name]=(metrics.effects[name]||0)+1;
   source.onended=function(){var i=voices.indexOf(source);if(i>=0)voices.splice(i,1);source.disconnect();};
  });
 }
 var lastDialogue=-1;
 function dialogue(speaker,letter){
  if(!available()||state.screen!=='menu'||!prefs.effectsEnabled||!prefs.effects||typeof ctx.createOscillator!=='function')return;
  var now=ctx.currentTime;if(now-lastDialogue<.085)return;lastDialogue=now;
  var pitches=[176,158,236,184,154,208,170,162,222,190,246,226],tone=ctx.createOscillator(),gain=ctx.createGain(),filters=[];
  var pitch=pitches[Math.abs(speaker)%pitches.length]*(1+Math.sin(letter*1.7)*.045);
  tone.type='sawtooth';tone.frequency.setValueAtTime(pitch,now);tone.frequency.exponentialRampToValueAtTime(pitch*.95,now+.07);
  // Short voiced syllables: two vowel formants make RPG chatter, not words.
  if(typeof ctx.createBiquadFilter==='function'){
   var vowels=[[720,1200],[500,1700],[300,2100],[480,900],[350,750]],formants=vowels[(Math.abs(letter)+speaker*2)%vowels.length],timbre=.88+(speaker%5)*.055;
   formants.forEach(function(f,i){var filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.setValueAtTime(f*timbre,now);filter.frequency.linearRampToValueAtTime(f*timbre*1.06,now+.05);filter.Q.value=i?4:3;tone.connect(filter);filter.connect(gain);filters.push(filter);});
  }else{tone.type='triangle';tone.connect(gain);}
  gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.12,now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+.075);
  gain.connect(fxBus);voices.push(tone);metrics.effects.dialogue=(metrics.effects.dialogue||0)+1;
  tone.onended=function(){var at=voices.indexOf(tone);if(at>=0)voices.splice(at,1);tone.disconnect();filters.forEach(function(filter){filter.disconnect();});gain.disconnect();};tone.start(now);tone.stop(now+.085);
 }
 var optionsHost=null,optionsFocus=null;
 function refreshControls(){
  ['master','music','effects','ambience'].forEach(function(k){var value=k==='master'&&prefs.muted?0:prefs[k];document.querySelectorAll('[data-audio-value="'+k+'"]').forEach(function(el){el.textContent=Math.round(value*100)+' %';});document.querySelectorAll('[data-audio-volume="'+k+'"]').forEach(function(el){el.value=Math.round(value*100);});});
  document.querySelectorAll('[data-audio-toggle]').forEach(function(b){var k=b.getAttribute('data-audio-toggle'),enabled=prefs[k+'Enabled'];b.setAttribute('aria-checked',String(enabled));b.setAttribute('aria-label',(enabled?'Desactivar ':'Activar ')+(k==='music'?'música':'efectos'));b.querySelector('span').textContent=enabled?(k==='music'?'Activada':'Activados'):(k==='music'?'Apagada':'Apagados');});
 }
 function set(change){
  var wasMusic=!!prefs.music&&prefs.musicEnabled,wasMuted=prefs.muted;
  ['muted','musicEnabled','effectsEnabled'].forEach(function(k){if(typeof change[k]==='boolean')prefs[k]=change[k];});
  ['master','music','effects','ambience'].forEach(function(k){if(k in change)prefs[k]=clamp(change[k],prefs[k]);});
  try{localStorage.setItem(KEY,JSON.stringify(prefs));}catch(ignore){}
  levels();
  if(wasMuted!==prefs.muted)stopAll();
  else if(wasMusic!==(!!prefs.music&&prefs.musicEnabled)){stopMusic(true);scene='';}
  if(!prefs.effectsEnabled||!prefs.effects){voices.forEach(disconnect);voices=[];}
  reconcile();refreshControls();
 }
 function appVersion(){var screen=document.getElementById('screen');return screen&&screen.dataset.version||'';}
 function panel(){return '<header><div><small>HEMICICLO</small><h2 id="audioOptionsTitle">Opciones</h2></div><button type="button" class="audio-close" data-audio-close aria-label="Cerrar opciones"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 6 12 12M6 18 18 6"/></svg></button></header><div class="audio-settings">'+[['master','Volumen maestro'],['effects','Efectos'],['music','Música']].map(function(row){var key=row[0],value=key==='master'&&prefs.muted?0:prefs[key];return '<div class="audio-setting"><div class="audio-setting-title"><label for="audio-'+key+'">'+row[1]+'</label><output data-audio-value="'+key+'">'+Math.round(value*100)+' %</output></div><div class="audio-setting-control"><input id="audio-'+key+'" type="range" min="0" max="100" value="'+Math.round(value*100)+'" data-audio-volume="'+key+'" aria-label="'+row[1]+'">'+(key==='master'?'':'<button type="button" role="switch" class="audio-toggle" data-audio-toggle="'+key+'" aria-checked="'+prefs[key+'Enabled']+'"><i aria-hidden="true"></i><span></span></button>')+'</div></div>';}).join('')+'</div>'+(typeof HemicycleUIPreferences!=='undefined'?HemicycleUIPreferences.control():'')+(root.HemicycleLegal?'<button type="button" class="mini audio-legal-link" data-legal-open>Información legal y contacto<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 5 7 7-7 7"/></svg></button>':'')+'<p class="audio-remember">Se guarda automáticamente en este dispositivo.</p><button type="button" class="btn sm audio-done" data-audio-close>Cerrar</button><small class="audio-version">'+String(appVersion()).replace(/[^a-zA-Z0-9.\-]/g,'')+'</small>';}
 function closeOptions(restore){
  if(!optionsHost||!optionsHost.firstChild)return;
  optionsHost.innerHTML='';var app=document.getElementById('app');if(app){app.inert=false;app.removeAttribute('aria-hidden');}
  if(restore!==false){var target=optionsFocus&&optionsFocus.isConnected?optionsFocus:document.querySelector('[data-audio-open]');if(target)target.focus({preventScroll:true});}
  optionsFocus=null;
 }
 function openOptions(){
  var app=document.getElementById('app');if(state.screen!=='menu'||!app||app.inert||document.getElementById('launchScreen'))return;
  optionsHost=document.getElementById('audioOptionsRoot');if(!optionsHost)return;
  optionsFocus=document.activeElement;app.inert=true;app.setAttribute('aria-hidden','true');
  optionsHost.innerHTML='<div class="audio-options-shade"><section class="audio-options" role="dialog" aria-modal="true" aria-labelledby="audioOptionsTitle">'+panel()+'</section></div>';refreshControls();optionsHost.querySelector('input').focus({preventScroll:true});
 }
 function sync(screen,game,result){if(screen!=='menu')closeOptions(false);state={screen:screen,game:game,result:result};reconcile();}
 function battleEvent(kind,data,game){
  if(state.screen!=='battle'||state.game!==game)return;
  if(kind==='attack')effect(data.strong?'strong':'normal');
  else if(kind==='damage'&&data.guarded)effect('guard');
  else if(kind==='guard'||kind==='heal'||kind==='card'||kind==='expel')effect(kind);
  else if(kind==='turn'&&data.side==='p')effect('turn');
  updateIntensity();
 }
 function clock(game,left){
  if(state.screen!=='battle'||state.game!==game||!game||game.side!=='p'||game.tutorial||left<1||left>10)return;
  var key=game.n+':'+left;if(lastClock===key)return;lastClock=key;effect('timer');
 }
 document.addEventListener('hemicycle:entered',function(){levels(.4);reconcile();});
 document.addEventListener('pointerdown',unlock,{passive:true});
 document.addEventListener('keydown',function(e){if(!e.repeat&&(e.key==='Enter'||e.key===' '||e.key==='Tab'))unlock();});
 document.addEventListener('click',function(e){
  var button=e.target.closest&&e.target.closest('button,[data-pick],[data-card],[data-buid],summary');if(!button||button.disabled)return;
  if(button.hasAttribute('data-audio-open')){unlock().then(function(){effect('ui');});openOptions();return;}
  if(button.hasAttribute('data-legal-open')){closeOptions(false);document.addEventListener('hemicycle:legal-closed',function(){openOptions();},{once:true});root.HemicycleLegal.open();return;}
  if(button.hasAttribute('data-audio-close')){closeOptions();return;}
  if(button.hasAttribute('data-audio-toggle')){var change={};var key=button.getAttribute('data-audio-toggle')+'Enabled';change[key]=!prefs[key];unlock();set(change);return;}
  if(!button.closest('#app,#profileRoot,#cloudRoot,#launchScreen,#audioOptionsRoot'))return;
  // El clic no sustituye los sonidos semánticos del motor ni su validación.
  unlock().then(function(){effect('ui');});
 });
 document.addEventListener('input',function(e){var key=e.target.getAttribute&&e.target.getAttribute('data-audio-volume');if(!key)return;var change={};change[key]=Number(e.target.value)/100;if(key==='master')change.muted=false;unlock();set(change);});
 document.addEventListener('visibilitychange',function(){if(document.hidden){stopAll();if(ctx)ctx.suspend().catch(function(){});}else if(unlocked)unlock();});
 document.addEventListener('click',function(e){if(e.target.matches&&e.target.matches('.audio-options-shade'))closeOptions();});
 document.addEventListener('keydown',function(e){if(!optionsHost||!optionsHost.firstChild)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeOptions();return;}if(e.key==='Tab'){var items=Array.prototype.slice.call(optionsHost.querySelectorAll('button:not(:disabled),input:not(:disabled)')),at=items.indexOf(document.activeElement);if(at<0||e.shiftKey&&at===0||!e.shiftKey&&at===items.length-1){e.preventDefault();items[e.shiftKey?items.length-1:0].focus();}}},true);
 root.addEventListener('popstate',function(){closeOptions(false);});
 root.addEventListener('pagehide',function(){stopAll();if(ctx)ctx.suspend().catch(function(){});});
 root.addEventListener('pageshow',function(){if(unlocked&&!document.hidden)unlock();});
 root.addEventListener('online',function(){buffers={};});
 root.HemicycleAudio={unlock:unlock,sync:sync,effect:effect,dialogue:dialogue,battleEvent:battleEvent,clock:clock,panel:panel,open:openOptions,close:closeOptions,set:set,preferences:function(){return Object.assign({},prefs);},status:function(){return {context:ctx?ctx.state:'locked',scene:scene,intense:!!intensity,musicSources:music.length,effectSources:voices.length,musicStarts:metrics.musicStarts,results:metrics.results,effects:Object.assign({},metrics.effects)};}};
})(window);
