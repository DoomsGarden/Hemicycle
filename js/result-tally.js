/* Animación de números confirmados. Nunca escribe en el perfil ni en la nube. */
(function(root){'use strict';var active=null,frame=0,seen=new Set(),games=new WeakMap();
function render(result,game,profile){
 if(!result||result.tutorial||!['p','e','season'].includes(result.who)){cancelAnimationFrame(frame);active=null;return;}
 var key=result.ticketId||game?.remoteId||(game&&(games.get(game)||(()=>{var id=crypto.randomUUID();games.set(game,id);return id;})()));if(!key)return;
 if(!active||active.key!==key){cancelAnimationFrame(frame);if(seen.has(key)){document.querySelectorAll('[data-result-gain]').forEach(n=>n.classList.add('tally-done'));return;}seen.add(key);active={key,start:performance.now(),fs:Math.max(0,result.fs||0),elo:result.eloDelta||0,afterFS:profile.fs,afterElo:profile.elo};}
 active.afterFS=profile.fs;active.afterElo=profile.elo;
 function tick(){if(!document.querySelector('.result-summary')){active=null;return;}if(!active)return;var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,t=reduced?1:Math.min(1,(performance.now()-active.start)/1200),progress=1-Math.pow(1-t,3),fsLeft=Math.round(active.fs*(1-progress)),eloLeft=Math.round(active.elo*(1-progress));
 document.querySelectorAll('[data-player-fs],[data-result-total-fs]').forEach(n=>n.textContent=(active.afterFS-fsLeft)+(n.hasAttribute('data-player-fs')?' FS':''));document.querySelectorAll('[data-player-elo]').forEach(n=>n.textContent=active.afterElo-eloLeft);
 for(const [kind,value]of [['fs',fsLeft],['elo',eloLeft]]){const el=document.querySelector('[data-result-gain="'+kind+'"]');if(el){el.textContent=(value>0?'+':'')+value+' '+(kind==='fs'?'FS':'Elo');el.classList.toggle('tally-done',t===1);if(t===1)el.setAttribute('aria-hidden','true');}}
 if(t<1)frame=requestAnimationFrame(tick);
 }
 cancelAnimationFrame(frame);tick();
}
root.HemicycleResultTally={render};})(globalThis);
