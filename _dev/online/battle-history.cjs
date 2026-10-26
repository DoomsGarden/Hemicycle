'use strict';
function record(market,player,data,now){
 market.receipts=market.receipts||[];
 if(market.receipts.some(r=>r.player===player&&r.kind==='battle'&&r.data.resultId===data.resultId))return;
 market.receipts.push({id:data.resultId+':'+player,player,kind:'battle',data,created:now});
 const counts={};market.receipts=market.receipts.slice().reverse().filter(r=>(counts[r.player]=(counts[r.player]||0)+1)<=100).reverse();
}
function context(state,side){const cards=require('../market/catalog.cjs').cards,byId=Object.fromEntries(cards.map(c=>[c.id,c])),p=state.players[side],foe=state.players[1-side],tiers={comun:0,raro:0,especial:0,legendario:0};for(const id of p.cabinetIds||[]){const r=byId[id]?.r;if(r in tiers)tiers[r]++;}return {doctrine:byId[p.leader]?.pa,opponentDoctrine:byId[foe.leader]?.pa,tiers,actionSlots:(p.cabinetActions||[]).length,actionsPlayed:(p.usedActions||[]).length};}
module.exports={record,context};
