'use strict';
const XP=require('../../js/progression-xp.js');
const Boost=require('../../js/victory-boost.js'),crypto=require('node:crypto');
const Objectives=require('../../js/objectives.js'),Mastery=require('../../js/legendary-mastery.js'),{cards}=require('../market/catalog.cjs');
function appearance(profile,id){
 const gold=id==='donald-trump'&&profile?.dtGoldUnlocked===true&&profile.dtGoldActive===true;
 let confetti=false;try{confetti=!!profile&&Mastery.enabled(profile,id);}catch{}
 return {gold,appearance:confetti?'confetti':gold?'golden':'normal'};
}
function progress(profile,state,side,now,random=()=>crypto.randomInt(0,0x100000000)/0x100000000){
 const own=state.players[side],foe=state.players[1-side],win=state.winner===side,leader=own.leader;
 const event={win,mode:state.mode,votes:own.votes,enemyVotes:foe.votes,leader,doctrine:cards.find(c=>c.id===leader)?.pa};
 const updated={...profile,objectiveCatalog:cards};updated.objectives=Objectives.record(updated,event,now);
 updated.objectives=Objectives.snapshot(updated,cards,now);
 if(win&&Mastery.eligible(leader))updated.leaderMastery=Mastery.recordWin(updated,leader);
 const dtWins=(profile.dtWins||0)+(win&&state.mode==='ranked'&&leader==='donald-trump'?1:0);
 const baseXP=XP.match(state.mode,win,state.reason);
 const boost=Boost.settle(updated,{win,fs:0,xp:baseXP,eligible:state.mode==='ranked'},now,random);
 // The existing XP transaction accepts the base award (at most 100). The new
 // transaction commits the capped extra XP and saved boost in the same lock.
 const xpGain=XP.add(updated,baseXP),boostXPGain=XP.add(updated,boost.bonusXP);
 boost.bonusXP=boostXPGain;boost.xp=xpGain+boostXPGain;
 return {xp:updated.xp,xpGain,boostXPGain,boost:state.mode==='ranked'?boost:null,victoryBoost:updated.victoryBoost||null,objectives:updated.objectives,leaderMastery:updated.leaderMastery||null,dtWins,dtGoldUnlocked:!!profile.dtGoldUnlocked||dtWins>=require('../../js/cosmetic-entitlements.js').goldWins(profile)};
}
module.exports={appearance,progress};
