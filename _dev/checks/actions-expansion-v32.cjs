'use strict';const a=require('node:assert/strict'),A=require('../../js/action-cards.js'),S=require('../../js/action-status.js'),E=require('../online/combat.cjs'),AI=require('../online/ai.cjs'),O=require('../online/offline-v9.cjs');
const base=E.cards.filter(c=>c.r==='comun').slice(0,5).map(c=>c.id),cabinet={orators:base,leader:base[0],actions:[]};
function scenario(action){let s=E.apply(E.initial(),0,{type:'ready',cabinet},0,()=>.2);s=E.apply(s,1,{type:'ready',cabinet},0,()=>.2);s.side=0;s.deadline=90000;for(const p of s.players){const all=[...p.hand,...p.deck].filter(c=>!c.action);p.field=all.slice(0,3);p.hand=all.slice(3);p.deck=[];p.turn=2;p.tdp=8;p.field.forEach(c=>{c.hp=10;c.maxHp=20;c.ready=true;c.enteredTurn=1;c.guard=false;});}s.players[0].hand.push({uid:'action',action:true,id:action.id});return s;}
a.equal(A.cards.length,92);a.equal(new Set(A.ids).size,92);
for(const action of A.cards.filter(c=>c.artFamily!==undefined)){
 const before=scenario(action),owners=action.target.includes('rival')?[1]:[0],target=before.players[owners[0]].field[0].uid,after=E.apply(before,0,{type:'action',id:action.id,target},0,()=>.2);
 a.equal(after.players[0].tdp,8-action.cost,action.id);a.equal(after.players[0].actionUsedTurn,2);a.equal(after.players[0].hand.some(c=>c.id===action.id),false);a.equal(after.players[0].deck.find(c=>c.id===action.id).availableTurn,5);
 const affected=after.players[owners[0]].field.filter(c=>action.target.startsWith('all')||c.uid===target);a.equal(affected.length,action.target.startsWith('all')?3:1);
 if(action.effect==='status')a.ok(affected.every(c=>S.value(c,action.status)===action.value),action.id);
 if(action.effect==='damage')a.ok(affected.every(c=>c.hp===10-action.value),action.id);
 if(action.effect==='heal'||action.effect==='cleanse-heal')a.ok(affected.every(c=>c.hp===10+action.value),action.id);
 if(action.effect==='purge-damage')a.ok(affected.every(c=>c.hp===10-action.value),action.id);
 a.throws(()=>E.apply(after,0,{type:'action',id:action.id,target},0),/mano|acción por turno/);
}
const c={};S.grant(c,'strength',2,1,2,0);S.grant(c,'weakness',1,1,2,1);a.equal(S.power(c,4),5);S.grant(c,'strength',1,1,2,0);a.equal(S.power(c,4),5,'same state refreshes, never stacks');S.grant(c,'fullness',1,1,2,0);S.grant(c,'fortress',2,1,2,0);S.grant(c,'exposed',1,1,2,1);a.equal(S.incoming(c,6),4);S.grant(c,'wound',2,1,2,1);a.equal(S.healing(c,4),3);S.grant(c,'relief',1,1,2,0);a.equal(S.healing(c,4),4);S.grant(c,'confused',1,1,2,1);a.equal(S.canEmpty(c),false);S.grant(c,'precision',1,1,2,0);a.equal(S.pierces(c),true);S.clear(c,'negative');a.equal(S.power(c,4),6);a.equal(S.canEmpty(c),true);S.clear(c,'positive');a.equal(S.states(c).length,0);
S.grant(c,'regeneration',2,2,2,0);S.grant(c,'attrition',1,2,2,1);a.deepEqual(S.begin(c,3),{heal:2,damage:1,source:1});a.deepEqual(S.begin(c,3),{heal:0,damage:0,source:null});S.end(c,3);a.equal(S.states(c).length,2);S.begin(c,4);S.end(c,4);a.equal(S.states(c).length,0);
// Forecast and actual guarded damage agree with interacting action states.
let s=scenario(A.byId.conviccion);
s.players[1].field=s.players[1].field.slice(0,2);var attack=s.players[0].field[0],target=s.players[1].field[0];target.guard=true;S.grant(attack,'precision',1,1,2,0);S.grant(target,'exposed',1,1,2,0);const forecast=E.forecast(s,0,{uid:attack.uid,target:target.uid,variant:'normal'}),next=E.apply(s,0,{type:'attack',uid:attack.uid,target:target.uid,variant:'normal'},0,()=>.2);a.equal(forecast.damage,10-next.players[1].field.find(c=>c.uid===target.uid).hp);S.grant(attack,'confused',1,1,2,1);a.equal(E.forecast(s,0,{uid:attack.uid,target:'empty',variant:'normal'}).valid,false);a.throws(()=>E.apply(s,0,{type:'attack',uid:attack.uid,target:'empty',variant:'strong'},0,()=>.2),/Confundido|fuerte/);
// Every pair of action states remains consistent between the preview and the
// authoritative hit, including damage reflected through armor and defense.
let pairs=0;for(const own of [null,...Object.keys(S.definitions)])for(const other of [null,...Object.keys(S.definitions)])for(const variant of ['normal','strong']){
 const sample=scenario(A.byId.conviccion),p=sample.players[0],foe=sample.players[1],actor=p.field[0],victim=foe.field[0];p.leader='outside';actor.enteredTurn=0;foe.leader=victim.id;victim.doctrine='giro';actor.hp=actor.maxHp=40;victim.hp=victim.maxHp=40;actor.guard=victim.guard=true;
 if(own)S.grant(actor,own,2,1,p.turn,0);if(other)S.grant(victim,other,2,1,foe.turn,1);
 const command={type:'attack',uid:actor.uid,target:victim.uid,variant},f=E.forecast(sample,0,command),actual=E.apply(sample,0,command,0,()=>.2);a.equal(f.damage,40-actual.players[1].field[0].hp,own+'/'+other+'/'+variant);a.equal(f.attackerRemaining,actual.players[0].field[0].hp,own+'/'+other+'/'+variant+' reflection');pairs++;
}
a.equal(pairs,338);
// Downloaded v9 and the service execute exactly the same seeded full match.
const played={...cabinet,actions:['debate-confuso','renovacion-del-consenso']},ticket={id:'test',seed:442,expires:Date.now()+86400000,rules:'offline9',profile:{album:base,actionAlbum:played.actions,elo:0,leagueDiv:3}},started=O.start(ticket,played,'normal');let state=started.state,commands=[];for(let i=0;state.status==='active'&&i<1200;i++){const command=AI.choose(state,0,0);commands.push({at:0,command});state=O.move(state,command,0,started.rng);}a.equal(state.status,'finished');a.equal(O.replay(ticket,{cabinet:played,mode:'normal',commands}).winner,state.winner);a.equal(require('../online/offline-v8.cjs').version,'offline8');console.log('PASS 80 new action activations, costs/cooldowns/targets, all 12 states, stacking/cleansing/durations, forecast/guard consistency, confusion, downloaded deterministic replay and v8 preserved.');
