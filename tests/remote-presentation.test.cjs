'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{loadBattle}=require('./helpers/battle.cjs'),E=require('../_dev/online/combat.cjs'),A=require('../js/action-cards.js');
function fixture(kind='player'){
 const client=loadBattle();for(const card of A.cards)client.BYID[card.id]=card;
 const ids=E.cards.filter(c=>c.r==='comun').slice(0,5).map(c=>c.id),cabinet={orators:ids,leader:ids[0],actions:['replica','receso']};
 let server=E.apply(E.initial('normal'),0,{type:'ready',cabinet},1000,()=>.25);server=E.apply(server,1,{type:'ready',cabinet},1000,()=>.25);
 const controls={id:'match-one',busy:false,send(){},close(){},retry(){}};
 function show(revision){client.receiveRemoteBattle({...E.project(server,0,revision,1000),opponentKind:kind},controls);}
 return {client,server,controls,show};
}
for(const kind of ['player','ai'])test(kind+': consecutive authoritative updates preserve the game identity and refresh live values',()=>{
 const f=fixture(kind);f.show(1);const original=f.client.G,oldField=original.field;original.sel='selected';original.move='normal';f.server.players[0].votes=51;f.show(2);
 assert.equal(f.client.G,original);assert.notEqual(f.client.G.field,oldField);assert.equal(f.client.G.votes.p,51);assert.equal(f.client.G.sel,null);assert.equal(f.client.G.move,null);
 f.client.G.sel='same-revision-selection';f.controls.busy=true;f.show(2);assert.equal(f.client.G,original);assert.equal(f.client.G.sel,'same-revision-selection');assert.equal(f.client.G.networkBusy,true);
});
test('a genuinely different match gets a new game identity',()=>{const f=fixture();f.show(1);const first=f.client.G;f.controls.id='match-two';f.show(1);assert.notEqual(f.client.G,first);assert.equal(f.client.G.remoteId,'match-two');});
