/* Escena decorativa del menú. No modifica guardados ni reglas de combate. */
(function(root){
'use strict';
var ids=['pedro-sanchez','mariano-rajoy','angela-merkel','barack-obama','donald-trump','boris-johnson','alberto-nunez-feijoo','vladimir-putin','carles-puigdemont','emmanuel-macron','isabel-diaz-ayuso','yolanda-diaz'];
var userPaused=false,blocked=false;var TURN=12000,assets=null,loading=null,active=null,elapsed=0;
var motion=root.matchMedia('(prefers-reduced-motion: reduce)');
function loadImage(name){return new Promise(function(resolve,reject){var im=new Image();im.onload=function(){resolve(im);};im.onerror=reject;im.src='assets/menu-senate/'+name+'.webp';});}
// Main-figure bounds measured on the complete atlas, rather than fixed tiles.
// Some feet cross a tile edge; neighbouring fragments must not become part of a sprite.
var spriteBounds={"leaders-a":[[127,16,113,312],[371,18,144,308],[637,20,155,302],[913,18,158,310],[119,350,128,325],[369,353,160,320],[635,353,182,318],[919,351,173,325],[126,694,123,327],[377,695,170,323],[633,694,184,323],[927,694,175,327],[130,1039,113,320],[373,1038,170,319],[634,1039,192,317],[937,1038,164,323]],"leaders-b":[[67,9,151,339],[333,8,213,340],[628,10,164,340],[897,10,220,340],[63,355,152,350],[340,355,218,350],[634,364,153,341],[903,363,212,342],[65,707,158,335],[336,707,226,335],[636,710,150,332],[907,710,213,332],[76,1046,138,321],[345,1045,198,322],[642,1046,144,321],[915,1047,197,319]],"audience":[[43,17,275,298],[353,22,264,293],[644,17,283,299],[977,26,241,291],[26,327,286,290],[336,325,291,292],[646,334,289,285],[967,329,275,290],[36,638,256,283],[341,626,291,295],[667,638,256,284],[978,642,256,279],[21,929,304,305],[364,936,270,300],[667,927,285,312],[989,938,250,298]]};
function atlas(im,name){return spriteBounds[name].map(function(b){var sprite=document.createElement('canvas');sprite.width=b[2];sprite.height=b[3];sprite.getContext('2d').drawImage(im,b[0],b[1],b[2],b[3],0,0,b[2],b[3]);return sprite;});}
function preload(){if(!loading)loading=Promise.all(['chamber','leaders-a','leaders-b','audience'].map(loadImage)).then(function(imgs){assets={room:imgs[0],a:atlas(imgs[1],'leaders-a'),b:atlas(imgs[2],'leaders-b'),crowd:atlas(imgs[3],'audience')};return assets;}).catch(function(){loading=null;return null;});return loading;}
function speechDuration(text){return Math.min(3.1,Math.max(1.2,Array.from(text).length*.055));}
function stateAt(ms){var turn=Math.floor(Math.max(0,ms)/TURN),phase=(Math.max(0,ms)%TURN)/1000,index=turn%ids.length,quote=Math.floor(turn/ids.length)%3;
 var card=root.HemicycleCatalog&&root.HemicycleCatalog.cards.find(function(c){return c.id===ids[index];}),text=card?'«'+card.q[quote]+'»':null;
 var speechEnd=3.12+(text?speechDuration(text):3.1),departAt=speechEnd+.18;
 return {turn:turn,index:index,id:ids[index],side:turn%2,phase:phase,quote:quote,speechEnd:speechEnd,departAt:departAt,exitAt:departAt+3.3,speaking:phase>=3&&phase<departAt};}
function facingLeft(s){return s.phase>=s.departAt?s.side===0:s.side===1;}
function spokenText(text,phase,reduced){if(reduced)return text;var chars=Array.from(text),progress=Math.max(0,Math.min(1,(phase-3.12)/speechDuration(text)));return chars.slice(0,Math.floor(progress*chars.length)).join('');}
function stillTime(){return (3+stateAt(0).speechEnd)*500;}
function sprite(index,pose){return index<4?assets.a[index*4+(pose==='talk'?3:pose==='walk1'?1:pose==='walk2'?2:0)]:assets.b[(index-4)*2+(pose==='talk'?1:0)];}
function figure(ctx,im,x,foot,h,flip,angle){var w=h*im.width/im.height*(ctx.senateAspect||1);ctx.save();ctx.translate(x,foot);ctx.scale(flip?-1:1,1);ctx.rotate(angle||0);ctx.drawImage(im,-w/2,-h,w,h);ctx.restore();}
function walkPose(time){var phase=time*8;return [0,1].map(function(leg){var cycle=phase+leg*Math.PI,lift=Math.max(0,Math.sin(cycle));return {hip:Math.cos(cycle)*.24,knee:lift*.72,ankle:-Math.cos(cycle)*.1,lift:lift};});}
function walkingFigure(ctx,im,x,foot,h,flip,time){
 var w=h*im.width/im.height*(ctx.senateAspect||1),hip=.63*h,knee=.82*h,split=.51*im.width,pose=walkPose(time);
 ctx.save();ctx.translate(x,foot-h);ctx.scale(flip?-1:1,1);
 // Draw legs behind the jacket; overlaps at the joints prevent visible seams.
 [0,1].forEach(function(leg){var sx=leg?split:0,sw=leg?im.width-split:split,pivot=(leg?.12:-.12)*w,dx=-w/2+sx/im.width*w-pivot,dw=sw/im.width*w,upper=knee-hip;
  ctx.save();ctx.translate(pivot,hip-1);ctx.rotate(pose[leg].hip);
  ctx.drawImage(im,sx,im.height*.625,sw,im.height*.20,dx,-1,dw,upper+3);
  ctx.translate(0,upper);ctx.rotate(pose[leg].knee);
  ctx.drawImage(im,sx,im.height*.815,sw,im.height*.185,dx,-2,dw,h-knee+3);
  ctx.restore();
 });
 ctx.drawImage(im,0,0,im.width,im.height*.64,-w/2,0,w,h*.64);ctx.restore();
}
function smooth(t){t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);}
function point(points,t){t=Math.max(0,Math.min(.99999,t));var k=t*(points.length-1),i=Math.floor(k),f=smooth(k-i);return {x:points[i][0]+(points[i+1][0]-points[i][0])*f,y:points[i][1]+(points[i+1][1]-points[i][1])*f};}
// Each anchor follows an actual chair and the rear edge of its desk in chamber.png.
// Rows curve upwards toward the aisle; a rectangular grid puts people on the stairs.
var crowd=[];
[
 [[60,274],[145,262],[225,254],[303,250],[380,247]],
 [[67,351],[160,338],[247,328],[332,319],[415,316]],
 [[104,422],[186,408],[264,399],[340,393],[419,390]],
 [[420,480]]
].forEach(function(row,ri){row.forEach(function(seat,i){[0,1].forEach(function(side){crowd.push({x:side?1024-seat[0]:seat[0],bottom:seat[1],height:ri===0?58:ri===1?66:ri===2?72:76,slope:side?.09:-.09,id:(i+ri*5+side*7)%16,seed:i*1.7+ri*2.3+side*3});});});});
crowd.sort(function(a,b){return a.bottom-b.bottom;});
function polygon(ctx,points){ctx.beginPath();points.forEach(function(p,i){if(i)ctx.lineTo(p[0],p[1]);else ctx.moveTo(p[0],p[1]);});ctx.closePath();}
function podium(ctx,side){ctx.save();if(side){ctx.translate(1024,0);ctx.scale(-1,1);}polygon(ctx,[[139,512],[266,481],[338,501],[346,638],[384,651],[380,699],[161,731],[144,708]]);ctx.clip();if(side){ctx.scale(-1,1);ctx.translate(-1024,0);}ctx.drawImage(assets.room,0,0,1024,1536);ctx.restore();}
function render(instance,ms){if(!assets||!instance.canvas.width)return;var ctx=instance.ctx,w=instance.canvas.width,h=instance.canvas.height,s=stateAt(ms),time=motion.matches?0:ms/1000;
 ctx.senateAspect=(h/1260)/(w/1024);ctx.setTransform(w/1024,0,0,h/1260,0,0);ctx.clearRect(0,0,1024,1260);ctx.drawImage(assets.room,0,0,1024,1536);
 crowd.forEach(function(p){var im=assets.crowd[p.id],bob=Math.sin(time*1.4+p.seed)*.8;ctx.save();
 // Clip at the sloping desk edge, keeping the foreground wood in front of the torso.
 polygon(ctx,[[-200,-200],[1224,-200],[1224,p.bottom+(1224-p.x)*p.slope],[-200,p.bottom+(-200-p.x)*p.slope]]);ctx.clip();
 figure(ctx,im,p.x,p.bottom+2+bob,p.height,p.x>512,Math.sin(time*.65+p.seed)*.006);ctx.restore();});
 // Entrances run along the side stairs. The front of each podium masks the legs.
 if(s.phase<s.exitAt){var path=[[-75,820],[72,760],[110,690],[170,650],[250,624]],p,walk=false;
  if(s.phase<3){p=point(path,s.phase/3);walk=true;}else if(s.phase<s.departAt){p={x:250,y:624};}else{p=point(path,1-(s.phase-s.departAt)/3.3);walk=true;}
  if(s.side)p.x=1024-p.x;var bob=walk?Math.abs(Math.sin(time*8))*2:Math.sin(time*2)*1.5;
  var pose=walk?(Math.floor(time*7)%2?'walk1':'walk2'):(s.speaking&&s.phase<s.speechEnd&&Math.sin(time*2.6)>-.7?'talk':'idle');
  // Soft stage glow is painted beneath the actor, never over the cards.
  if(s.speaking){var glow=ctx.createRadialGradient(p.x,500,5,p.x,500,145);glow.addColorStop(0,'rgba(244,204,115,.15)');glow.addColorStop(1,'rgba(244,204,115,0)');ctx.fillStyle=glow;ctx.fillRect(p.x-150,345,300,310);}
  if(walk)walkingFigure(ctx,sprite(s.index,'idle'),p.x,p.y-bob,240,facingLeft(s),time);else figure(ctx,sprite(s.index,pose),p.x,p.y-bob,240,facingLeft(s),walk?Math.sin(time*9)*.018:Math.sin(time*2)*.008);
 }
 podium(ctx,0);podium(ctx,1);
 if(s.speaking&&!motion.matches){var ex=s.side?736:288,ey=432,beat=(s.phase-3)%1.5,f=beat/1.5,color=s.quote===2?'#7fe0b0':s.quote===1?'#9cddff':'#f5d58a';ctx.save();ctx.globalAlpha=(1-f)*.8;ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(ex,ey,18+f*60,9+f*30,0,0,Math.PI*2);ctx.stroke();for(var i=0;i<8;i++){var a=i*Math.PI/4,rad=25+f*68;ctx.fillStyle=color;ctx.save();ctx.translate(ex+Math.cos(a)*rad,ey+Math.sin(a)*rad*.6);ctx.rotate(a+time);ctx.fillRect(-2,-5,4,10);ctx.restore();}ctx.restore();}
 var shade=ctx.createLinearGradient(0,900,0,1260);shade.addColorStop(0,'rgba(10,15,26,0)');shade.addColorStop(1,'rgba(10,15,26,.28)');ctx.fillStyle=shade;ctx.fillRect(0,900,1024,360);
 var card=root.HemicycleCatalog&&root.HemicycleCatalog.cards.find(function(c){return c.id===s.id;});
 instance.host.dataset.speaker=s.id;instance.host.dataset.side=s.side?'right':'left';instance.host.dataset.phase=s.speaking?'speaking':s.phase<3?'arriving':s.phase<s.exitAt?'leaving':'waiting';
 instance.host.dataset.facing=facingLeft(s)?'left':'right';
 if(card&&s.speaking){var key=s.turn+':'+s.quote;if(instance.quoteKey!==key){instance.name.textContent=card.n;instance.words.textContent='«'+card.q[s.quote]+'»';instance.quoteKey=key;}var visible=spokenText(instance.words.textContent,s.phase,motion.matches);if(instance.words.dataset.visibleText!==visible){instance.words.dataset.visibleText=visible;if(!motion.matches&&!paused()&&visible.length%2===0&&/[^\s«».,!?]/.test(visible.slice(-1))&&root.HemicycleAudio&&root.HemicycleAudio.dialogue)root.HemicycleAudio.dialogue(s.index,visible.length);}instance.balloon.hidden=false;instance.balloon.dataset.side=s.side?'right':'left';}else instance.balloon.hidden=true;
 instance.frames++;
}
function resize(instance){var r=instance.host.getBoundingClientRect(),dpr=Math.min(root.devicePixelRatio||1,1.5);if(!r.width||!r.height)return;instance.canvas.width=Math.round(r.width*dpr);instance.canvas.height=Math.round(r.height*dpr);render(instance,motion.matches?stillTime():elapsed);}
function requestResize(instance){if(instance.resizeFrame)return;instance.resizeFrame=requestAnimationFrame(function(){instance.resizeFrame=0;if(active===instance&&assets)resize(instance);});}
function paused(){return userPaused||document.hidden||blocked;}
function updateBlocked(){var app=document.getElementById('app');blocked=!!document.getElementById('launchScreen')||!!(app&&app.inert)||Array.from(document.querySelectorAll('.tutorial-layer:not([hidden]),.modal-bg,.audio-options,.profile-shade,.online-shade,.history-shade')).some(function(el){return el.getClientRects().length>0;});}
function stop(){if(!active)return;cancelAnimationFrame(active.raf);cancelAnimationFrame(active.resizeFrame);active.observer.disconnect();active.balloon.hidden=true;active=null;}
function sync(){var host=document.getElementById('menuSenateRoot'),screen=document.getElementById('screen');if(!host)return;if(!screen||screen.dataset.view!=='menu'){stop();host.hidden=true;return;}host.hidden=false;updateBlocked();if(active&&active.host===host){wake();return;}stop();var canvas=host.querySelector('canvas'),balloon=host.querySelector('.senate-quote'),ctx=canvas.getContext('2d');if(!ctx)return;
 var instance={host:host,canvas:canvas,ctx:ctx,balloon:balloon,name:balloon.querySelector('b'),words:balloon.querySelector('span'),frames:0,raf:0,resizeFrame:0,last:0,stamp:0,quoteKey:null,observer:new ResizeObserver(function(){requestResize(instance);})};active=instance;instance.observer.observe(host);
 preload().then(function(ok){if(active!==instance)return;if(!ok){host.dataset.failed='true';return;}host.dataset.ready='true';resize(instance);wake();});
}
function tick(stamp){var i=active;if(!i)return;i.raf=0;if(paused()||motion.matches){i.last=0;wake();return;}if(!i.last)i.last=stamp;var delta=Math.min(100,stamp-i.last);i.last=stamp;elapsed+=delta;if(stamp-i.stamp>=1000/30-1){render(i,elapsed);i.stamp=stamp;}i.raf=requestAnimationFrame(tick);}
function wake(){var screen=document.getElementById('screen');if(screen){var frozen=paused()||motion.matches;screen.dataset.senatePaused=String(frozen);var title=screen.querySelector('.senate-title img'),src='assets/menu-senate/title-'+(frozen?'still':'loop')+'.webp';if(title&&title.getAttribute('src')!==src)title.src=src;}if(!active||!assets)return;if(paused()||motion.matches){cancelAnimationFrame(active.raf);active.raf=0;active.last=0;if(motion.matches)render(active,stillTime());return;}if(!active.raf){active.last=0;active.raf=requestAnimationFrame(tick);}}
root.addEventListener('online',function(){if(!assets){stop();sync();}});
document.addEventListener('visibilitychange',wake);document.addEventListener('hemicycle:entered',function(){updateBlocked();wake();});root.addEventListener('pageshow',wake);motion.addEventListener('change',wake);
new MutationObserver(function(){updateBlocked();if(active&&!active.host.isConnected)stop();wake();}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['inert','hidden']});
root.HemicycleMenuSenate={seek:function(ms){elapsed=ms;if(active)render(active,ms);},pause:function(value){userPaused=value;wake();},sync:sync,stop:stop,stateAt:stateAt,walkPose:walkPose,ids:ids.slice(),inspect:function(){return {mounted:!!active,running:!!(active&&active.raf),frames:active?active.frames:0,elapsed:elapsed,ready:!!assets,state:stateAt(elapsed),crowd: crowd.length};}};
})(window);
