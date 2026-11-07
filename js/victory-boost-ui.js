/* Presentación de un premio ya confirmado: cerrar nunca modifica su duración. */
(function(root){'use strict';
var opened=false,queued=null,seen=new Set(),asset=new URL('../assets/events/victory-boost.webp',document.currentScript.src).href;
function t(text){return root.HemicycleI18n?root.HemicycleI18n.t(text):text;}
function maybeShow(result,identity){
 var reward=result&&result.boost&&result.boost.activated;if(!reward||result.tutorial||Date.now()>=reward.expiresAt)return;
 var key='hemicycle_boost_notice_v1:'+identity+':'+reward.activation+':'+reward.startedAt;if(opened||queued||seen.has(key))return;
 try{if(localStorage.getItem(key))return;}catch(ignore){}
 function attempt(){queued=null;if(!document.querySelector('.result-summary')||Date.now()>=reward.expiresAt)return;if(document.querySelector('.result-transition,#modalRoot .modal,.victory-boost-overlay')){queued=setTimeout(attempt,350);return;}show(reward,key);}queued=setTimeout(attempt,350);
}
function show(reward,key){
 if(opened)return;opened=true;
 var host=document.createElement('div'),before=document.activeElement,app=document.getElementById('app'),prior=app&&app.inert;
 host.className='victory-boost-overlay';host.setAttribute('role','dialog');host.setAttribute('aria-modal','true');host.setAttribute('aria-labelledby','victoryBoostTitle');
 var panel=document.createElement('section');panel.className='victory-boost-dialog panel';
 var art=document.createElement('div');art.className='victory-boost-art';art.setAttribute('aria-hidden','true');
 var rays=document.createElement('i');rays.className='victory-boost-rays';art.appendChild(rays);
 var img=document.createElement('img');img.src=asset;img.alt='';art.appendChild(img);panel.appendChild(art);
 var eyebrow=document.createElement('p');eyebrow.className='eyebrow';eyebrow.textContent=t('5 victorias consecutivas');panel.appendChild(eyebrow);
 var title=document.createElement('h2');title.id='victoryBoostTitle';title.textContent=t('¡Ventaja de racha!');panel.appendChild(title);
 var amount=document.createElement('strong');amount.className='victory-boost-percent';amount.textContent='+'+reward.percent+'% FS + XP';panel.appendChild(amount);
 var detail=document.createElement('p');detail.className='sub';detail.textContent=t('Durante 1 hora, tus partidas dan más FS y XP. Después habrá 30 minutos de descanso antes de poder iniciar otra racha.');panel.appendChild(detail);
 var hint=document.createElement('p');hint.className='sub';hint.textContent=t('La ventaja ya está guardada y se aplica a partir de tu próxima partida.');panel.appendChild(hint);
 var button=document.createElement('button');button.type='button';button.className='btn';button.textContent=t('¡Genial!');panel.appendChild(button);host.appendChild(panel);document.body.appendChild(host);
 seen.add(key);try{localStorage.setItem(key,'shown');}catch(ignore){}if(app)app.inert=true;
 function close(){if(!host.isConnected)return;host.remove();opened=false;document.removeEventListener('keydown',keys,true);if(app)app.inert=prior;if(before&&before.isConnected)before.focus({preventScroll:true});}
 function keys(e){if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}else if(e.key==='Tab'){e.preventDefault();button.focus();}}
 button.onclick=close;host.onclick=function(e){if(e.target===host)close();};document.addEventListener('keydown',keys,true);button.focus({preventScroll:true});
}
root.HemicycleVictoryBoostUI={maybeShow:maybeShow};
})(window);
