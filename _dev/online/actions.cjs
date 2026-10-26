'use strict';
// Prototipo: no importa ni altera inventarios de jugadores reales.
const cards=require('../../js/action-cards.js').cards;
const byId=Object.fromEntries(cards.map(c=>[c.id,c]));
function check(ok,message){if(!ok)throw Error(message);}
function shuffle(list,random=Math.random){const a=list.slice();for(let i=a.length-1;i>0;i--){const x=random();check(Number.isFinite(x)&&x>=0&&x<1,'Azar no válido');const j=Math.floor(x*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function renew(hand,deck,random=Math.random){
 const pool=shuffle([...hand,...deck],random),next=[],rest=[];
 check(new Set(pool.map(c=>c.uid)).size===pool.length,'Carta duplicada entre mano y mazo');
 for(const c of pool){if(next.length<2&&(!c.action||!next.some(x=>x.action)))next.push(c);else rest.push(c);}
 return {hand:next,deck:rest};
}
function renewBalanced(hand,deck,turn,random=Math.random){
 const pool=shuffle([...hand,...deck],random),orators=pool.filter(c=>!c.action).slice(0,2),support=pool.find(c=>c.action&&(c.availableTurn||0)<=turn),chosen=new Set(orators);if(support)chosen.add(support);
 return {hand:[...orators,...(support?[support]:[])],deck:pool.filter(c=>!chosen.has(c))};
}
function recycle(rest,deck,turn,random=Math.random){const eligible=rest.filter(c=>turn>=c.availableTurn);return {rest:rest.filter(c=>!eligible.includes(c)),deck:shuffle([...deck,...eligible.map(c=>({...c,hp:c.maxHp}))],random)};}
function validateCabinet(cabinet,owned,oratorIds){
 check(cabinet&&Array.isArray(cabinet.orators)&&Array.isArray(cabinet.actions),'Gabinete no válido');
 check(cabinet.orators.length===5&&new Set(cabinet.orators).size===5,'Elige cinco oradores distintos');
 check(cabinet.orators.every(id=>oratorIds.includes(id)&&owned.includes(id)),'Orador no disponible');
 check(cabinet.orators.includes(cabinet.leader),'Líder no válido');
 check(cabinet.actions.length<=2&&new Set(cabinet.actions).size===cabinet.actions.length,'Hasta dos acciones distintas');
 check(cabinet.actions.every(id=>byId[id]&&owned.includes(id)),'Acción no disponible');
 return structuredClone(cabinet);
}
// Cinco cartas por sobre. Un único hueco puede contener acción (20 %).
// Se conserva exactamente la rareza de ese hueco y las cuatro cartas restantes.
function pack(slots,random=Math.random){
 check(Array.isArray(slots)&&slots.length===5,'Sobre no válido');
 const out=structuredClone(slots),roll=random();check(roll>=0&&roll<1,'Azar no válido');
 if(roll<0.2){const i=Math.floor(random()*out.length);check(i>=0&&i<5,'Azar no válido');const pool=cards.filter(c=>c.r===out[i].r);check(pool.length,'Rareza no válida');const j=Math.floor(random()*pool.length);check(j>=0&&j<pool.length,'Azar no válido');out[i]={...pool[j],action:true};}
 return out;
}
function covers(pool,rarity){return pool.filter(c=>!c.action&&c.r===rarity);}
function targets(state,side,card,uid){const rival=1-side;if(card.target==='player-rival')return [];
 const groups=card.target==='all'?[side,rival]:[card.target.includes('rival')?rival:side];
 const list=groups.flatMap(s=>state.players[s].field.map(c=>({s,c})));
 if(card.target.startsWith('all'))return list;
 return list.filter(x=>x.c.uid===uid);
}
function apply(original,side,id,uid){
 const s=structuredClone(original),p=s.players[side],foe=s.players[1-side],card=byId[id];
 check(s.status==='active'&&s.side===side&&p,'No es tu turno');check(card,'Acción desconocida');
 check(!p.silenced,'Turno silenciado');check(p.hand.some(c=>c.action&&c.id===id),'La acción no está en tu mano');
 check(!card.oncePerBattle||!p.usedActions.includes(id),'Acción ya utilizada en esta partida');check(p.actionUsedTurn!==p.turn,'Solo una acción por turno');check(p.tdp>=card.cost,'TdP insuficiente');
 const affected=targets(s,side,card,uid);check(card.effect==='silence'||affected.length,'Objetivo no válido');
 if(card.effect==='heal')check(affected.some(({c})=>c.hp<c.maxHp),'No falta Aguante');
 if(card.effect==='guard')check(affected.some(({c})=>!c.guard),'Defensa ya activa');
 if(card.effect==='silence'){
  check(p.field.length===3&&p.field.every(c=>c.ready),'Necesitas tres oradores listos');
  check(p.votes<foe.votes,'Debes tener menos votos que el rival');
  check(!foe.pendingSilence&&foe.turn>(foe.silenceImmuneThrough??-1),'Rival protegido frente al silencio');
  foe.pendingSilence=true;p.field.forEach(c=>c.ready=false);
 }
 p.tdp-=card.cost;p.usedActions.push(id);p.actionUsedTurn=p.turn;const instance=p.hand.find(c=>c.action&&c.id===id);p.hand=p.hand.filter(c=>c!==instance);if(card.oncePerBattle){p.actionDiscard=p.actionDiscard||[];p.actionDiscard.push(instance);}else p.deck.push(instance);
 for(const {s:owner,c}of affected){
  if(card.effect==='heal')c.hp=Math.min(c.maxHp,c.hp+card.value);
  if(card.effect==='boost'){const until=s.players[owner].turn+(owner===side?0:1);c.buffs.push({value:card.value,until});}
  if(card.effect==='guard')c.guard=true;
  if(card.effect==='damage'){const amount=c.guard?Math.ceil(card.value/2):card.value;c.guard=false;c.hp-=amount;}
 }
 for(const player of s.players){const expelled=player.field.filter(c=>c.hp<=0);player.field=player.field.filter(c=>c.hp>0);player.rest.push(...expelled.map(c=>({...c,availableTurn:player.turn+2,guard:false,buffs:[]})));}
 return s;
}
function begin(original,side,random=Math.random){const s=structuredClone(original);check(s.status==='active','Partida terminada');s.side=side;const p=s.players[side];p.turn++;
 p.silenced=!!p.pendingSilence;p.pendingSilence=false;if(p.silenced)p.silenceImmuneThrough=p.turn+2;
 for(const c of p.field){c.guard=false;c.ready=true;c.buffs=c.buffs.filter(b=>b.until>=p.turn);}
 const recycled=recycle(p.rest,p.deck,p.turn,random);p.rest=recycled.rest;
 const next=renew(p.hand,recycled.deck,random);p.hand=next.hand;p.deck=next.deck;
 p.votes+=3+p.field.reduce((sum,c)=>sum+c.votes,0);if(p.votes>=100){s.status='finished';s.winner=side;}
 return s;
}
const api={renewBalanced,cards,byId,shuffle,renew,recycle,validateCabinet,pack,covers,apply,begin};if(typeof module!=='undefined')module.exports=api;else globalThis.HemicycleOnlineActions=api;
