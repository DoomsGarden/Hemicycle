'use strict';
const Objectives=require('../../js/objectives.js'),Mastery=require('../../js/legendary-mastery.js'),{cards}=require('../market/catalog.cjs');
function appearance(profile,id){
 const gold=id==='donald-trump'&&profile?.dtGoldUnlocked===true&&profile.dtGoldActive===true;
 let confetti=false;try{confetti=!!profile&&Mastery.enabled(profile,id);}catch{}
 return {gold,appearance:confetti?'confetti':gold?'golden':'normal'};
}
function progress(profile,state,side,now){
 const own=state.players[side],foe=state.players[1-side],win=state.winner===side,leader=own.leader;
 const event={win,mode:state.mode,votes:own.votes,enemyVotes:foe.votes,leader,doctrine:cards.find(c=>c.id===leader)?.pa};
 const updated={...profile,objectiveCatalog:cards};updated.objectives=Objectives.record(updated,event,now);
 updated.objectives=Objectives.snapshot(updated,cards,now);
 if(win&&Mastery.eligible(leader))updated.leaderMastery=Mastery.recordWin(updated,leader);
 const dtWins=(profile.dtWins||0)+(win&&state.mode==='ranked'&&leader==='donald-trump'?1:0);
 return {objectives:updated.objectives,leaderMastery:updated.leaderMastery||null,dtWins,dtGoldUnlocked:!!profile.dtGoldUnlocked||dtWins>=10};
}
module.exports={appearance,progress};
