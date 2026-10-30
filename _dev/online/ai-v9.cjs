'use strict';
const E=require('./combat.cjs'),A=require('./actions.cjs');
function cabinet(human,elo,random=Math.random,recipeOverride){
 const tiersList=['comun','raro','especial','legendario'],level=r=>tiersList.indexOf(r);
 let recipe=recipeOverride||(elo<2500?['comun','comun','comun','raro','raro']:elo<5000?['comun','comun','raro','raro','especial']:elo<7500?['comun','raro','raro','especial','legendario']:['raro','raro','especial','especial','legendario']);
 if(!recipeOverride&&human.orators?.length===5){const own=human.orators.map(id=>E.catalog[id].r).sort((a,b)=>level(a)-level(b));recipe=recipe.slice().sort((a,b)=>level(a)-level(b)).map((r,i)=>tiersList[Math.max(level(r),level(own[i]))]);}

 const orators=[];for(const rarity of recipe){const pool=E.cards.filter(c=>c.r===rarity&&!orators.includes(c.id));orators.push(pool[Math.floor(random()*pool.length)].id);}
 const tiers={comun:0,raro:1,especial:2,legendario:3},leader=orators.slice().sort((a,b)=>tiers[E.catalog[b].r]-tiers[E.catalog[a].r])[0],actions=[];
 for(const id of human.actions){const pool=A.cards.filter(c=>c.r===A.byId[id].r&&!actions.includes(c.id));actions.push(pool[Math.floor(random()*pool.length)].id);}
 return {orators,leader,actions};
}
function choose(state,side=1,now=Date.now()){
 const p=state.players[side],foe=state.players[1-side];
 const valid=command=>{try{E.apply(state,side,command,now,()=>.5);return true;}catch{return false;}};
 const opening=p.field.length<2&&p.hand.filter(c=>!c.action&&c.cost<=p.tdp).sort((a,b)=>(b.id===p.leader)-(a.id===p.leader)||b.votes-a.votes)[0];if(opening)return {type:'play',uid:opening.uid};
 for(const card of p.hand.filter(c=>c.action)){const a=A.byId[card.id],targets=a.target==='self'?p.field:a.target==='rival'?foe.field:[null];for(const target of targets){const command={type:'action',id:a.id,...(target?{target:target.uid}:{})};if(valid(command))return command;}}
 if(p.field.length<3){const playable=p.hand.filter(c=>!c.action&&c.cost<=p.tdp).sort((a,b)=>(b.id===p.leader)-(a.id===p.leader)||b.votes-a.votes);if(playable[0])return {type:'play',uid:playable[0].uid};}
 for(const c of p.field.filter(c=>c.ready)){
  if(c.hp<c.maxHp/3&&valid({type:'heal',uid:c.uid}))return {type:'heal',uid:c.uid};
  const variant=E.strong(p,c)?'strong':'normal',targets=foe.field.slice().sort((a,b)=>a.hp-b.hp||b.votes-a.votes);
  for(const target of targets){const command={type:'attack',uid:c.uid,target:target.uid,variant};if(valid(command))return command;}
  if(foe.field.length<3){const normal=E.normalPower(state,side,c),limit=Math.min(foe.votes,state.emptyVoteLimit==null?Infinity:state.emptyVoteLimit-(p.emptyVotesTaken||0)),command={type:'attack',uid:c.uid,target:'empty',variant:normal>=limit?'normal':variant};if(valid(command))return command;}
 }
 return {type:'end'};
}
function advance(state,now,random=Math.random){let next=state;for(let i=0;next.status==='active'&&next.side===1&&i<24;i++)next=E.apply(next,1,choose(next,1,now),now,random);if(next.status==='active'&&next.side===1)throw Error('La IA no pudo terminar su turno.');return next;}
module.exports={cabinet,choose,advance};
