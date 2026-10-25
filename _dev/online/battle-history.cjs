'use strict';
function record(market,player,data,now){
 market.receipts=market.receipts||[];
 if(market.receipts.some(r=>r.player===player&&r.kind==='battle'&&r.data.resultId===data.resultId))return;
 market.receipts.push({id:data.resultId+':'+player,player,kind:'battle',data,created:now});
 const counts={};market.receipts=market.receipts.slice().reverse().filter(r=>(counts[r.player]=(counts[r.player]||0)+1)<=100).reverse();
}
module.exports={record};
