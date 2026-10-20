const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadBattle}=require('./helpers/battle.cjs');
function snapshot(c){return JSON.stringify({profile:c.D(),league:c.ligaLoad(),build:c.BUILD,last:c.LAST_BUILD});}
test('first battle is intercepted only when the tutorial has not been seen',()=>{
const c=loadBattle();let calls=0;c.TUTORIAL={seen:()=>false,start:()=>calls++};const before=snapshot(c);c.newBattle('ranked');assert.equal(calls,1);assert.equal(snapshot(c),before);
c.TUTORIAL.seen=()=>true;c.newBattle('ranked');assert.equal(c.G.mode,'ranked');assert.equal(c.G.tutorial,false);assert.equal(calls,1);
});
test('practice lends a deterministic cheap cabinet, weak rival and player first without editing the collection',()=>{
const c=loadBattle(),before=snapshot(c);c.newBattle('normal',null,true);assert.equal(c.G.tutorial,true);assert.equal(c.G.first,'p');assert.equal(c.G.leader.p.k,'celia-villalobos');assert.equal(c.G.hand.p[0].c,1);assert.equal(c.G.field.e[0].h,3);assert.equal(c.G.field.e[0].a,1);assert.equal(snapshot(c),before);assert.equal(c.elements.content.inert,false);assert.equal(c.elements.coinRoot.innerHTML,'');
c.beginDebate();assert.equal(c.G.tdp.p,3);assert.equal(c.G.side,'p');c.completeTurn('p');assert.equal(c.G.side,'e');assert.equal(c.timers.size,0,'the training opponent waits for the explanation instead of using normal AI');
});
for(const who of ['p','e','d'])for(const abandoned of [false,true])test('practice '+who+' / abandon='+abandoned+' never changes rewards or statistics, even without the guide module',()=>{
const c=loadBattle(),before=snapshot(c);c.newBattle('normal',null,true);c.G.votes={p:100,e:4};c.finish(who,abandoned);assert.equal(snapshot(c),before);assert.equal(c.G.done,true);assert.equal(c.SCREEN,'result');assert.equal(c.SO.tutorial,true);
});
