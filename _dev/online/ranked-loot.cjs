'use strict';
const crypto=require('node:crypto'),{cards}=require('../market/catalog.cjs'),Goals=require('../../js/objectives.js');
const ids=new Set(cards.map(c=>c.id));
function settle(context,state,participants,rng=()=>crypto.randomInt(0,0x100000000)/0x100000000,history={}){
 if(state.status!=='finished'||state.mode!=='ranked'||state.lootVersion!==1)throw Error('Resultado sin liquidación de cromos.');
 const market=structuredClone(context.market),result={players:{}},updates=[];
 function complete(){if(history.roomId)participants.forEach((p,side)=>{if(p)require('./battle-history.cjs').record(market,p.userId,{...(history.receipts?.[p.userId]||{}),...result.players[p.userId],resultId:'online:'+history.roomId,mode:state.mode,win:state.winner===side,votes:state.players[side].votes,enemyVotes:state.players[1-side].votes},context.now);});return {market,updates,result};}
 for(const p of participants)if(p)result.players[p.userId]={won:null,lost:null,lootStatus:'settled'};
 if(![0,1].includes(state.winner)){for(const r of Object.values(result.players))r.lootStatus='draw';return complete();}
 const winner=state.winner,loser=1-winner,w=participants[winner],l=participants[loser];
 let candidates=(state.players[loser].cabinetIds||[]).filter(id=>ids.has(id));
 if(l){const account=context.accounts[l.userId];if(!account)throw Error('No se pudo recuperar la colección rival.');const album=account.payload.profile.album,unique=new Set(album).size;const counts={};for(const id of album)counts[id]=(counts[id]||0)+1;candidates=candidates.filter(id=>counts[id]&&(unique>5||counts[id]>1));}
 if(!candidates.length){for(const r of Object.values(result.players))r.lootStatus='protected';return complete();}
 const id=candidates[Math.floor(rng()*candidates.length)];
 for(const [participant,win]of [[w,true],[l,false]]){
  if(!participant)continue;const account=context.accounts[participant.userId];if(!account)throw Error('No se pudo recuperar la colección.');const payload=structuredClone(account.payload),profile=payload.profile;
  if(win){profile.album.push(id);result.players[participant.userId].won=id;}else{const index=profile.album.indexOf(id);if(index<0)throw Error('La colección ha cambiado.');profile.album.splice(index,1);result.players[participant.userId].lost=id;}
  profile.objectives=Goals.snapshot(profile,cards,context.now);updates.push({userId:participant.userId,revision:account.revision,payload});
 }
 return complete();
}
module.exports={settle};
