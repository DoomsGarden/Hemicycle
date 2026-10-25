'use strict';
const crypto=require('node:crypto'),{cards}=require('../market/catalog.cjs'),Goals=require('../../js/objectives.js');
const ids=new Set(cards.map(c=>c.id));
function settle(context,state,participants,rng=()=>crypto.randomInt(0,0x100000000)/0x100000000){
 if(state.status!=='finished'||state.mode!=='ranked'||state.lootVersion!==1)throw Error('Resultado sin liquidación de cromos.');
 const result={players:{}},updates=[];for(const p of participants)if(p)result.players[p.userId]={won:null,lost:null,lootStatus:'settled'};
 if(![0,1].includes(state.winner)){for(const r of Object.values(result.players))r.lootStatus='draw';return {market:context.market,updates,result};}
 const winner=state.winner,loser=1-winner,w=participants[winner],l=participants[loser];
 let candidates=(state.players[loser].cabinetIds||[]).filter(id=>ids.has(id));
 if(l){const account=context.accounts[l.userId];if(!account)throw Error('No se pudo recuperar la colección rival.');const album=account.payload.profile.album,unique=new Set(album).size;const counts={};for(const id of album)counts[id]=(counts[id]||0)+1;candidates=candidates.filter(id=>counts[id]&&(unique>5||counts[id]>1));}
 if(!candidates.length){for(const r of Object.values(result.players))r.lootStatus='protected';return {market:context.market,updates,result};}
 const id=candidates[Math.floor(rng()*candidates.length)];
 for(const [participant,win]of [[w,true],[l,false]]){
  if(!participant)continue;const account=context.accounts[participant.userId];if(!account)throw Error('No se pudo recuperar la colección.');const payload=structuredClone(account.payload),profile=payload.profile;
  if(win){profile.album.push(id);result.players[participant.userId].won=id;}else{const index=profile.album.indexOf(id);if(index<0)throw Error('La colección ha cambiado.');profile.album.splice(index,1);result.players[participant.userId].lost=id;}
  profile.objectives=Goals.snapshot(profile,cards,context.now);updates.push({userId:participant.userId,revision:account.revision,payload});
 }
 return {market:context.market,updates,result};
}
module.exports={settle};
