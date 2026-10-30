'use strict';
const E=require('./combat.cjs'),A=require('./actions.cjs'),Policy=require('../../js/tactical-policy.js');
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
 if(state.catalogVersion!=='balance-v3')return require('./ai-v9.cjs').choose(state,side,now);
 const p=state.players[side],foe=state.players[1-side];
 const valid=command=>{try{E.apply(state,side,command,now,()=>.5);return true;}catch{return false;}};
 const opening=p.field.length<2&&p.hand.filter(c=>!c.action&&c.cost<=p.tdp).sort((a,b)=>(b.id===p.leader)-(a.id===p.leader)||b.votes-a.votes)[0];if(opening)return {type:'play',uid:opening.uid};
 for(const card of p.hand.filter(c=>c.action)){const a=A.byId[card.id],targets=a.target==='self'?p.field:a.target==='rival'?foe.field:[null];for(const target of targets){const command={type:'action',id:a.id,...(target?{target:target.uid}:{})};if(valid(command))return command;}}
 if(p.field.length<3){const playable=p.hand.filter(c=>!c.action&&c.cost<=p.tdp).sort((a,b)=>(b.id===p.leader)-(a.id===p.leader)||b.votes-a.votes);if(playable[0])return {type:'play',uid:playable[0].uid};}
 const options=[],enemyWinsNext=foe.votes+3+foe.field.reduce((n,c)=>n+c.votes,0)>=100;
 for(const c of p.field.filter(c=>c.ready)){
  let threat=0;for(const enemy of foe.field){let hit=E.normalPower(state,1-side,enemy)+(E.active(state,1-side)==='viperina'&&c.id===p.leader?2:0);if((foe.turn+1-enemy.enteredTurn)%3===2&&enemy.hp>=2)hit=Math.max(hit,Math.ceil(E.power(state,1-side,enemy)*1.5));threat=Math.max(threat,hit);}
  for(const type of ['heal','guard'])if(valid({type,uid:c.uid}))options.push({type,uid:c.uid,hp:c.hp,seats:c.votes,amount:Math.min(c.maxHp-c.hp,Math.max(3,Math.ceil((c.maxHp-c.hp)/2))),threat,enemyWinsNext});
  for(const variant of ['normal',...(E.strong(p,c)?['strong']:[])])for(const target of [...foe.field,...(foe.field.length<3?[{uid:'empty',hp:0,votes:0}]:[])]){
   const command={type:'attack',uid:c.uid,target:target.uid,variant},forecast=E.forecast(state,side,command);if(!forecast.valid)continue;options.push({...command,targetHp:target.hp,seats:target.votes,forecast});
  }
 }
 const selected=Policy.choose(options);if(selected){const {type,uid,target,variant}=selected;return {type,uid,...(target?{target}:{}),...(variant?{variant}:{})};}
 return {type:'end'};
}
function advance(state,now,random=Math.random){let next=state;for(let i=0;next.status==='active'&&next.side===1&&i<24;i++)next=E.apply(next,1,choose(next,1,now),now,random);if(next.status==='active'&&next.side===1)throw Error('La IA no pudo terminar su turno.');return next;}
module.exports={cabinet,choose,advance};
