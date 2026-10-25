/* Catálogo de acciones: compartido por colección, sobres y ambos motores. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleActions=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const cards = Object.freeze([
 {id:'turno-de-palabra',n:'Turno de palabra',r:'comun',cost:1,effect:'boost',target:'self',value:1,text:'+1 Zasca a un orador propio durante este turno.'},
 {id:'replica',n:'Réplica',r:'comun',cost:1,effect:'damage',target:'rival',value:2,text:'Causa 2 de daño a un orador rival.'},
 {id:'receso',n:'Receso',r:'comun',cost:1,effect:'heal',target:'self',value:2,text:'Restaura 2 de Aguante a un orador propio.'},
 {id:'disciplina-de-grupo',n:'Disciplina de grupo',r:'raro',cost:2,effect:'boost',target:'all-self',value:1,text:'+1 Zasca a todos tus oradores durante este turno.'},
 {id:'pregunta-incomoda',n:'Pregunta incómoda',r:'raro',cost:2,effect:'damage',target:'rival',value:4,text:'Causa 4 de daño a un orador rival.'},
 {id:'pausa-parlamentaria',n:'Pausa parlamentaria',r:'raro',cost:2,effect:'heal',target:'all',value:2,text:'Todos los oradores de ambos jugadores recuperan 2 de Aguante.'},
 {id:'escudo-parlamentario',n:'Escudo parlamentario',r:'especial',cost:3,effect:'guard',target:'all-self',value:1,text:'Cada orador propio reduce a la mitad el próximo golpe, hasta su siguiente turno.'},
 {id:'interpelacion',n:'Interpelación',r:'especial',cost:3,effect:'damage',target:'all-rival',value:2,text:'Causa 2 de daño a cada orador rival.'},
 {id:'debate-abierto',n:'Debate abierto',r:'especial',cost:3,effect:'boost',target:'all',value:2,text:'+2 Zasca a ambos bandos, cada uno durante su siguiente turno activo.'},
 {id:'mocion-de-censura',n:'Moción de censura',r:'legendario',cost:4,oncePerBattle:true,effect:'silence',target:'player-rival',value:1,text:'El rival no realiza acciones en su próximo turno, pero conserva el robo y los votos.'},
 {id:'mayoria-reforzada',n:'Mayoría reforzada',r:'legendario',cost:4,effect:'boost',target:'all-self',value:2,text:'+2 Zasca a todos tus oradores durante este turno.'},
 {id:'acuerdo-de-estado',n:'Acuerdo de Estado',r:'legendario',cost:4,effect:'heal',target:'all-self',value:4,text:'Todos tus oradores recuperan 4 de Aguante.'}
].map(Object.freeze));
const byId=Object.fromEntries(cards.map((c,index)=>[c.id,Object.freeze({...c,action:true,c:c.cost,index,ruleLines:rules(c)})]));
Object.setPrototypeOf(byId,null);
function rules(card){const c=typeof card==='string'?byId[card]:card;if(!c)return [];return [c.text,'Coste: '+c.cost+' TdP.','Máximo una carta de acción por turno.',c.oncePerBattle?'Una activación por partida. Va al descarte de acciones.':'Después de activarse vuelve al mazo.',...(c.effect==='silence'?['Exige tres oradores propios listos y menos votos que el rival; los tres agotan su acción.','El rival conserva el robo y los votos pasivos. Queda protegido contra otro silencio durante dos turnos propios adicionales.']:[])];}
function inject(out,random=Math.random){const result=out.slice();if(random()<.2){const index=Math.floor(random()*result.length),pool=cards.filter(c=>c.r===result[index].r);if(pool.length)result[index]=byId[pool[Math.floor(random()*pool.length)].id];}return result;}
function award(profile,ids){ids.forEach(function(id){if(byId[id]){if(!profile.actionAlbum)profile.actionAlbum=[];profile.actionAlbum.push(id);}else profile.album.push(id);});}
function describeAction(card,actor,scope,targets){
 const names=targets.map(t=>t.name+' ('+t.team+')');if(card.target==='self'||card.target==='rival')scope=names.join('; ');let effect;
 if(card.effect==='silence')effect=scope+': no puede realizar acciones en su próximo turno; conserva el robo y los votos.';
 else if(card.effect==='damage')effect=(card.target.startsWith('all')?scope+': ':'')+targets.map((t,i)=>names[i]+': '+t.amount+' de daño').join('; ')+'.';
 else if(card.effect==='heal')effect=(card.target.startsWith('all')?scope+': ':'')+targets.map((t,i)=>names[i]+': +'+t.amount+' de Aguante').join('; ')+'.';
 else if(card.effect==='boost')effect=scope+': +'+card.value+' Zasca '+(card.target==='all'?'durante el turno activo de cada equipo.':'durante este turno.');
 else effect=scope+': defensa del 50 % frente al próximo golpe, hasta el siguiente turno propio.';
 return actor+' activa '+card.n+' · '+card.cost+' TdP. '+effect+' '+(card.oncePerBattle?'Pasa al descarte de acciones.':'Regresa al mazo.');
}
return {describeAction,award,cards:cards.map(c=>byId[c.id]),byId,ids:cards.map(c=>c.id),rules,inject};
});
