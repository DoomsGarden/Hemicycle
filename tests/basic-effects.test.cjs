'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),C=require('../js/orator-catalog.js'),B=require('../js/basic-effects.js'),E=require('../_dev/online/combat.cjs'),{loadBattle}=require('./helpers/battle.cjs');
const keys=Object.keys(B.definitions),base=id=>C.cards.find(c=>c.id===id);
const {fixture}=require('./helpers/basic-effects-fixture.cjs');
test('all 120 speakers retain approved stats; all have exactly one ability; all marked high-cost cards are covered',()=>{
 a.equal(Object.keys(B.assignments).length,120);for(const id of Object.keys(B.assignments)){a.ok(base(id));a.ok(B.definition(B.ability(id)));}
 a.equal(C.cards.filter(c=>!B.ability(c.id)).length,0);const old=require('../js/basic-effects-v1.js');for(const [id,effect]of Object.entries(old.assignments))a.equal(B.ability(id),effect);
 for(const c of require('../_dev/balance/pending-utility.json').cards)a.ok(B.ability(c.id),c.id);
});
for(const first of keys)for(const second of keys)test(first+' followed by '+second+' obeys one slot and negative priority',()=>{const card={};a.equal(B.grant(card,first,2,0),true);const saved=structuredClone(card.basicStatus),replaces=B.definition(first).polarity==='positive'&&B.definition(second).polarity==='negative';a.equal(B.grant(card,second,3,1),replaces);if(replaces){a.equal(card.basicStatus.id,second);a.equal(card.basicStatus.appliedTurn,3);a.equal(card.basicStatus.source,1);}else a.deepEqual(card.basicStatus,saved);});
for(const side of [0,1])for(const id of keys)test(id+' lifetime follows affected own turns on side '+side,()=>{const card={};B.grant(card,id,4,1-side);const saved=structuredClone(card);a.equal(B.begin(card,4),null);if(id==='surge'){a.equal(B.normalZ(card,4,2),2);a.equal(B.normalZ(card,5,2),3);B.end(card,4);a.ok(B.state(card));B.end(card,5);a.equal(B.state(card),null);}else if(id==='archive'||id==='coffee'){const first=B.begin(card,5);a.equal(first.damage,id==='archive'?1:0);a.equal(first.heal,id==='coffee'?1:0);a.equal(B.begin(card,5),null);if(id==='archive'){a.equal(card.basicStatus.ticksLeft,1);a.equal(B.begin(card,6).damage,1);}a.equal(B.state(card),null);}else{B.end(card,4);a.ok(B.state(card));B.end(card,5);a.equal(B.state(card),null);}a.equal(saved.basicStatus.source,1-side);});
for(const effect of keys){const attacker=Object.keys(B.assignments).find(id=>B.ability(id)===effect);test(effect+' triggers identically in local and authoritative combat, then expires on the proper turn',()=>{const f=fixture(attacker);if(effect==='summon'){const c=base('ana-pastor');f.remote.players[0].deck=[{...c,id:c.id,rarity:c.r,uid:'draw'}];f.local.G.deck.p=[f.local.mk(c,false,'p')];}if(effect==='fasttrack'){f.remote.players[0].deck=[{id:'receso',action:true,availableTurn:5}];f.local.G.deck.p=[{k:'receso',action:true,availableTurn:5}];}f.hit();const owner=B.definition(effect).target==='self'?0:1;a.equal(f.r(owner).basicStatus.id,effect);for(let i=0;i<4;i++)f.end();a.equal(f.r(owner)?.basicStatus,undefined);});}
test('surge is delayed, affects only one normal attack, and cannot change the strong attack',()=>{
 const f=fixture();f.hit();a.equal(E.normalPower(f.remote,0,f.r(0)),2);f.end();f.end();a.equal(E.normalPower(f.remote,0,f.r(0)),3);a.equal(f.local.battleNormalZasca('p',f.l(0)),3);a.equal(E.power(f.remote,0,f.r(0)),2);
 const clone=structuredClone(f.remote);clone.players[0].turn=5;clone.players[0].field[0].basicStatus.expires=5;const c=clone.players[0].field[0];c.ready=true;const hit=E.apply(clone,0,{type:'attack',uid:c.uid,target:'c1',variant:'strong'},0,()=>.1);a.equal(hit.visualEvents.findLast(e=>e.kind==='damage'&&e.uid==='c1').value,3);
});
test('normal modifiers are consumed without changing base Zasca; an idle effect expires',()=>{const c={};B.grant(c,'tongue',2,1);a.equal(B.normalZ(c,2,1),1);a.equal(B.normalZ(c,2,6),5);B.consumeAttack(c,2);a.equal(B.state(c),null);B.grant(c,'surge',2,0);B.consumeAttack(c,2);a.ok(B.state(c));B.consumeAttack(c,3);a.equal(B.state(c),null);});
test('shield absorbs one after defense; microphone adds one before defense; neither alters strong or action damage',()=>{
 for(const [id,expected]of [['shield',0],['microphone',2]]){const f=fixture();for(const [c,src]of [[f.r(1),0],[f.l(1),'p']])B.grant(c,id,2,src);f.r(1).guard=f.l(1).guard=true;const before=f.r(1).hp;f.hit();a.equal(before-f.r(1).hp,expected);a.equal(f.r(1).guard,false);}
 for(const id of ['shield','microphone']){const f=fixture();for(const [c,src]of [[f.r(1),0],[f.l(1),'p']])B.grant(c,id,2,src);f.r(1).guard=f.l(1).guard=true;const before=f.r(1).hp;f.hit('strong');a.equal(before-f.r(1).hp,2);a.equal(f.r(1).basicStatus.id,id);}
});
test('zero damage, empty slots and strong attacks never trigger abilities',()=>{
 const zero=fixture();for(const [c,src]of [[zero.r(1),1],[zero.l(1),'e']]){B.grant(c,'shield',2,src);c.guard=true;}zero.hit();a.equal(zero.r(0).basicStatus,undefined);
 const strong=fixture();strong.hit('strong');a.equal(strong.r(0).basicStatus,undefined);
 const f=fixture();f.remote.players[1].field=[];f.local.G.field.e=[];f.remote.players[1].votes=10;f.local.G.votes.e=10;const result=E.apply(f.remote,0,{type:'attack',uid:'c0',target:'empty',variant:'normal'},0,()=>.1);a.equal(f.local.attack(f.l(0),'__EMPTY','p','normal'),true);a.equal(result.players[0].field[0].basicStatus,undefined);a.equal(f.l(0).basicStatus,undefined);
});
test('periodic expulsion credits exactly one award before passive votes even after the source has left',()=>{
 const f=fixture('nacho-alvarez');f.hit();f.r(1).hp=f.l(1).h=1;f.remote.players[0].field=[];f.local.G.field.p=[];f.end();a.equal(f.remote.players[0].votes,4);a.equal(f.remote.players[1].votes,3);a.equal(f.remote.players[1].rest[0].basicStatus,undefined);f.end();f.end();a.equal(f.remote.players[0].votes,7);
});
test('Aforado and reflection resolve before assigning a new state',()=>{
 const f=fixture('nacho-alvarez','giorgia-meloni');f.remote.players[1].leader='giorgia-meloni';f.local.G.leader.e=f.l(1);f.r(1).hp=f.l(1).h=1;f.hit();a.equal(f.r(1).hp,3);a.equal(f.r(1).basicStatus.id,'archive');
 const dead=fixture('toni-canto','justin-trudeau');dead.remote.players[1].leader='justin-trudeau';dead.local.G.leader.e=dead.l(1);dead.r(0).hp=dead.l(0).h=1;dead.hit();a.equal(dead.remote.players[0].field.length,0);a.equal(dead.remote.players[0].rest[0].basicStatus,undefined);
});
test('rooms created before this feature keep basic abilities disabled for both players',()=>{let s=E.initial();delete s.effectsVersion;const ids=['toni-canto','nacho-alvarez','hillary-clinton','donald-trump','mariano-rajoy'],cabinet={orators:ids,leader:ids[0],actions:[]};for(const side of [0,1])s=E.apply(s,side,{type:'ready',cabinet},0,()=>.1);for(const p of s.players)for(const c of [...p.hand,...p.deck])a.equal(c.basicAbility,undefined);});
test('basic icons follow the affected card and have textual descriptions',()=>{const S=require('../js/battle-status.js'),c={};B.grant(c,'archive',2,0);a.ok(S.card({effectsVersion:B.version,turns:{e:2}},'e',c).some(s=>s.icon==='basic-archive'&&s.text.includes('Hemeroteca')));a.equal(S.card({turns:{e:2}},'e',c).length,0);a.match(B.symbol('archive'),/<svg/);});

test('successful abilities rest for one full own turn; blocked attempts do not spend recovery',()=>{
 const attacker={basicAbility:'surge'},context={damage:2,attackerHealth:4,targetHealth:8,ownTurn:1,rivalTurn:1,source:0};a.ok(B.afterHit(attacker,{},context));a.equal(attacker.basicReadyTurn,3);B.clear(attacker);a.equal(B.afterHit(attacker,{}, {...context,ownTurn:2}),null);a.ok(B.afterHit(attacker,{}, {...context,ownTurn:3}));
 const control={basicAbility:'archive'},target={};B.grant(target,'archive',1,1);a.equal(B.afterHit(control,target,context),null);a.equal(control.basicReadyTurn,undefined);B.reset(attacker);a.equal(attacker.basicReadyTurn,undefined);
});

test('action damage and support bonuses coexist with a basic status without consuming or multiplying it',()=>{
 for(const id of ['shield','microphone']){const f=fixture();const s=structuredClone(f.remote),p=s.players[0],target=s.players[1].field[0];B.grant(target,id,2,0);target.guard=true;p.hand=[{uid:'action',id:'replica',action:true}];p.tdp=8;const result=E.apply(s,0,{type:'action',id:'replica',target:target.uid},0,()=>.1);a.equal(result.players[1].field[0].hp,target.hp-1);a.equal(result.players[1].field[0].basicStatus.id,id);}
 const f=fixture();f.r(0).buff=3;f.r(0).buffs=[{value:2,until:3}];B.grant(f.r(0),'surge',1,0);a.equal(E.power(f.remote,0,f.r(0)),4);a.equal(E.normalPower(f.remote,0,f.r(0)),5);
});
test('golden leaders keep their exact bonuses and full strong damage under basic modifiers',()=>{
 let s=E.initial();const ids=['donald-trump','toni-canto','ana-pastor','hillary-clinton','nacho-alvarez'],cabinet={orators:ids,leader:'donald-trump',actions:[]};for(const i of [0,1])s=E.apply(s,i,{type:'ready',cabinet},0,()=>.1,{dtGoldUnlocked:true,dtGoldActive:true});s.side=0;const p=s.players[0],c=p.hand.find(c=>c.id==='donald-trump');a.equal(c.z,10);a.equal(c.maxHp,16);p.tdp=8;s=E.apply(s,0,{type:'play',uid:c.uid},0,()=>.1);const leader=s.players[0].field[0];B.grant(leader,'tongue',s.players[0].turn,1);a.equal(E.normalPower(s,0,leader),9);a.equal(E.power(s,0,leader),10);a.equal(leader.maxHp,16);
});
test('the published offline3 engines stay byte-identical while offline4 contains the new deterministic rules',()=>{
 const fs=require('node:fs'),{execFileSync}=require('node:child_process');for(const file of ['js/offline-rules-v3.js','_dev/online/offline-v3.cjs'])a.deepEqual(fs.readFileSync(file),execFileSync('git',['show','19abdb4:'+file],{maxBuffer:1024*1024}));a.equal(require('../_dev/online/offline-v4.cjs').version,'offline4');
});
