/* Audio local: ninguna petición a terceros, y ningún fallo bloquea el juego. */
(function(root){
 'use strict';
 var KEY='hemicycle_audio_v1',defaults={muted:false,music:0.28,effects:0.65,ambience:0};
 var prefs=Object.assign({},defaults),ctx=null,master=null,musicBus=null,fxBus=null,roomBus=null;
 var state={screen:'menu',game:null,result:null},scene='',activeGame=null,epoch=0,unlocked=false;
 var buffers={},music=[],voices=[],room=null,layer=null,scoreGain=null,intensity=null,lastFx={},lastClock='',results=new WeakSet();
 var metrics={musicStarts:0,results:0,effects:{}};
 var effects=['ui','error','card','coin','normal','strong','guard','heal','expel','turn','timer','pack','reward'];
 var urlBase=new URL('../audio/',document.currentScript.src).href;
 function clamp(n,fallback){return typeof n==='number'&&isFinite(n)?Math.max(0,Math.min(1,n)):fallback;}
 try{var saved=JSON.parse(localStorage.getItem(KEY));if(saved&&typeof saved==='object'){prefs.muted=saved.muted===true;['music','effects','ambience'].forEach(function(k){prefs[k]=clamp(saved[k],defaults[k]);});}}catch(ignore){}
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
  if(!available()||!prefs.ambience){if(room){disconnect(room);room=null;}return;}
  if(room)return;
  // Reservar la petición para evitar duplicar el ambiente durante varios repintados.
  var marker={pending:true};room=marker;
  buffer('ambience').then(function(data){if(room!==marker)return;if(!data||!available()||!prefs.ambience){room=null;return;}room=node(data,roomBus,true);});
 }
 function reconcile(){
  if(!available()){stopAll();return;}
  roomSound();
  var next=desiredScene(),game=state.game;
  if(next===scene&&(next!=='battle'&&next!=='result'||game===activeGame)){updateIntensity();return;}
  stopMusic();if(game!==activeGame)lastClock='';scene=next;activeGame=game;
  if(!prefs.music||next==='none')return;
  var ticket=epoch;
  if(next==='result'){
   if(!game||results.has(game)||['p','e'].indexOf(state.result)<0)return;
   buffer(state.result==='p'?'victory':'defeat').then(function(data){
    if(ticket!==epoch||!data||!available()||scene!=='result'||!prefs.music)return;
    results.add(game);music=[node(data,score(),false)];metrics.results++;
   });return;
  }
  if(next==='battle'){
   Promise.all([buffer('combat-base'),buffer('combat-layer')]).then(function(pair){
    if(ticket!==epoch||!available()||!prefs.music||pair.some(function(b){return !b;}))return;
    if(pair[0].length!==pair[1].length)return;
    layer=ctx.createGain();intensity=glorious();layer.gain.value=intensity?1:0;layer.connect(score());
    var start=ctx.currentTime+0.035;music=[node(pair[0],score(),true,start),node(pair[1],layer,true,start)];metrics.musicStarts++;
   });
  }else buffer('menu').then(function(data){if(ticket===epoch&&data&&available()&&prefs.music){music=[node(data,score(),true)];metrics.musicStarts++;}});
 }
 function levels(){if(!ctx)return;master.gain.setTargetAtTime(prefs.muted?0:1,ctx.currentTime,.02);musicBus.gain.setTargetAtTime(prefs.music,ctx.currentTime,.03);fxBus.gain.setTargetAtTime(prefs.effects,ctx.currentTime,.02);roomBus.gain.setTargetAtTime(prefs.ambience,ctx.currentTime,.03);}
 function unlock(){
  if(document.hidden)return Promise.resolve();
  try{
   if(!ctx){var Audio=root.AudioContext||root.webkitAudioContext;if(!Audio)return Promise.resolve();ctx=new Audio();master=ctx.createGain();master.connect(ctx.destination);musicBus=ctx.createGain();fxBus=ctx.createGain();roomBus=ctx.createGain();[musicBus,fxBus,roomBus].forEach(function(b){b.connect(master);});levels();}
   return ctx.resume().then(function(){if(!unlocked){unlocked=true;effects.concat(['combat-base','combat-layer','victory','defeat']).forEach(buffer);}reconcile();}).catch(function(){});
  }catch(ignore){return Promise.resolve();}
 }
 function effect(name){
  if(effects.indexOf(name)<0||!available()||!prefs.effects)return;
  var now=Date.now(),minimum=name==='timer'?900:name==='error'?350:name==='ui'?60:120;
  if(lastFx[name]&&now-lastFx[name]<minimum)return;lastFx[name]=now;
  var requestedGame=state.game,requestedScreen=state.screen;
  buffer(name).then(function(data){
   if(!data||!available()||!prefs.effects||Date.now()-now>650||state.game!==requestedGame||state.screen!==requestedScreen)return;
   if(voices.length>=6)disconnect(voices.shift());
   var source=node(data,fxBus,false);voices.push(source);metrics.effects[name]=(metrics.effects[name]||0)+1;
   source.onended=function(){var i=voices.indexOf(source);if(i>=0)voices.splice(i,1);source.disconnect();};
  });
 }
 function set(change){
  var wasMusic=!!prefs.music,wasMuted=prefs.muted;
  if(typeof change.muted==='boolean')prefs.muted=change.muted;
  ['music','effects','ambience'].forEach(function(k){if(k in change)prefs[k]=clamp(change[k],prefs[k]);});
  try{localStorage.setItem(KEY,JSON.stringify(prefs));}catch(ignore){}
  levels();if(wasMusic!==!!prefs.music||wasMuted!==prefs.muted){stopAll();}reconcile();
  document.querySelectorAll('[data-audio-mute]').forEach(function(b){b.setAttribute('aria-pressed',String(prefs.muted));b.textContent=prefs.muted?'Activar sonido':'Silenciar todo';});
  ['music','effects','ambience'].forEach(function(k){document.querySelectorAll('[data-audio-value="'+k+'"]').forEach(function(el){el.textContent=Math.round(prefs[k]*100)+' %';});});
 }
 function panel(){return '<div class="panel"><h3>Sonido y música</h3><p class="sub">La música de combate se intensifica si cualquiera supera los 50 votos y vuelve al estado normal cuando ambos están a 50 o menos. Los avisos visuales se mantienen con el sonido apagado.</p><div class="audio-settings"><button type="button" class="btn ghost sm" data-audio-mute aria-pressed="'+prefs.muted+'">'+(prefs.muted?'Activar sonido':'Silenciar todo')+'</button>'+[['music','Música'],['effects','Efectos'],['ambience','Ambiente de sala']].map(function(row){return '<label><span>'+row[1]+' <output data-audio-value="'+row[0]+'">'+Math.round(prefs[row[0]]*100)+' %</output></span><input type="range" min="0" max="100" value="'+Math.round(prefs[row[0]]*100)+'" data-audio-volume="'+row[0]+'" aria-label="Volumen de '+row[1].toLowerCase()+'"></label>';}).join('')+'</div><p class="sub">Se recuerda tu elección en este dispositivo. El audio se detiene al salir de la aplicación. Música original con instrumentos virtuales TimGM6mb.</p></div>';}
 function sync(screen,game,result){state={screen:screen,game:game,result:result};reconcile();}
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
 document.addEventListener('pointerdown',unlock,{passive:true});
 document.addEventListener('keydown',function(e){if(!e.repeat&&(e.key==='Enter'||e.key===' '||e.key==='Tab'))unlock();});
 document.addEventListener('click',function(e){
  var button=e.target.closest&&e.target.closest('button,[data-pick],[data-card],[data-buid],summary');if(!button||button.disabled)return;
  if(button.hasAttribute('data-audio-mute')){unlock();set({muted:!prefs.muted});return;}
  if(!button.closest('#app,#profileRoot,#cloudRoot,#launchScreen'))return;
  // El clic no sustituye los sonidos semánticos del motor ni su validación.
  unlock().then(function(){effect('ui');});
 });
 document.addEventListener('input',function(e){var key=e.target.getAttribute&&e.target.getAttribute('data-audio-volume');if(!key)return;var change={};change[key]=Number(e.target.value)/100;unlock();set(change);});
 document.addEventListener('visibilitychange',function(){if(document.hidden){stopAll();if(ctx)ctx.suspend().catch(function(){});}else if(unlocked)unlock();});
 root.addEventListener('pagehide',function(){stopAll();if(ctx)ctx.suspend().catch(function(){});});
 root.addEventListener('pageshow',function(){if(unlocked&&!document.hidden)unlock();});
 root.addEventListener('online',function(){buffers={};});
 root.HemicycleAudio={sync:sync,effect:effect,battleEvent:battleEvent,clock:clock,panel:panel,set:set,preferences:function(){return Object.assign({},prefs);},status:function(){return {context:ctx?ctx.state:'locked',scene:scene,intense:!!intensity,musicSources:music.length,effectSources:voices.length,musicStarts:metrics.musicStarts,results:metrics.results,effects:Object.assign({},metrics.effects)};}};
})(window);
