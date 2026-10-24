/* Un único compositor transparente compartido: el retrato original nunca se mueve. */
(function(root){
 'use strict';
 var targets=[],observer=null,raf=null,started=null,last=-1,surface=null,ctx=null,effect=null;
 var reduced=root.matchMedia?root.matchMedia('(prefers-reduced-motion: reduce)'):null;
 function stop(){if(raf!==null)root.cancelAnimationFrame(raf);raf=null;}
 function draw(now){
  if(!surface){surface=document.createElement('canvas');surface.width=420;surface.height=560;ctx=surface.getContext('2d');if(!ctx){surface=null;return;}effect=CardConfetti.create(CardConfetti.TRUMP);}
  if(started===null)started=now;
  var elapsed=reduced&&reduced.matches?0:Math.max(0,now-started),frame=Math.floor(elapsed/ (1000/30));
  if(frame!==last){ctx.clearRect(0,0,420,560);effect.draw(ctx,elapsed);last=frame;}
  targets.forEach(function(t){if(!t.visible||!t.el.isConnected||t.frame===frame)return;var c=t.canvas.getContext('2d');if(c){c.clearRect(0,0,420,560);c.drawImage(surface,0,0);t.frame=frame;}});
 }
 function tick(now){raf=null;if(document.hidden||!targets.some(function(t){return t.visible&&t.el.isConnected;}))return;draw(now);if(!(reduced&&reduced.matches))raf=root.requestAnimationFrame(tick);}
 function wake(){if(raf===null&&!document.hidden)raf=root.requestAnimationFrame(tick);}
 function sync(){
  stop();if(observer)observer.disconnect();targets=[];
  document.querySelectorAll('.legendary-confetti').forEach(function(el){var canvas=el.querySelector('canvas');if(!canvas){canvas=document.createElement('canvas');canvas.width=420;canvas.height=560;canvas.setAttribute('aria-hidden','true');el.appendChild(canvas);}targets.push({el:el,canvas:canvas,frame:-1,visible:!root.IntersectionObserver});});
  if(root.IntersectionObserver){observer=new root.IntersectionObserver(function(entries){entries.forEach(function(e){var t=targets.find(function(t){return t.el===e.target;});if(t)t.visible=e.isIntersecting;});wake();});targets.forEach(function(t){observer.observe(t.el);});}
  wake();
 }
 document.addEventListener('visibilitychange',function(){if(document.hidden)stop();else wake();});
 root.addEventListener('pagehide',stop);root.addEventListener('pageshow',sync);
 if(reduced){if(reduced.addEventListener)reduced.addEventListener('change',sync);else if(reduced.addListener)reduced.addListener(sync);}
 root.HemicycleLegendaryConfetti={sync:sync};
})(window);
