'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
const B=require('../js/basic-effects.js'),C=require('../js/orator-catalog.js'),E=require('../_dev/online/combat.cjs'),P=require('../js/basic-ability-preview.js'),{fixture}=require('./helpers/basic-effects-fixture.cjs');
const positive=['surge','coffee','shield','escort','fineprint','bank','summon','fasttrack'],negative=['archive','tongue','microphone','acta','paperwork','lane'];
const speaker=effect=>Object.keys(B.assignments).find(id=>B.ability(id)===effect);
function setup(effect){const f=fixture(speaker(effect));f.r(1).hp=f.r(1).maxHp=f.l(1).h=f.l(1).hm=40;
 if(effect==='summon'){const c=C.cards.find(c=>c.id==='ana-pastor');f.remote.players[0].deck=[{...c,rarity:c.r,uid:'draw'}];f.local.G.deck.p=[f.local.mk(c,false,'p')];}
 if(effect==='fasttrack'){f.remote.players[0].deck=[{id:'receso',action:true,availableTurn:5}];f.local.G.deck.p=[{k:'receso',action:true,availableTurn:5}];}return f;}
function grant(f,owner,id){B.grant(f.r(owner),id,2,owner);B.grant(f.l(owner),id,2,owner?'e':'p');}
for(const effect of positive)for(const existing of [...positive,...negative])test(effect+' self benefit does not cleanse rival '+existing,()=>{
 const f=setup(effect);grant(f,1,existing);const before={remote:structuredClone(f.r(1).basicStatus),local:structuredClone(f.l(1).basicStatus)};f.hit();a.equal(f.r(0).basicStatus.id,effect);a.equal(f.r(0).basicReadyTurn,4);
 if(['shield','microphone'].includes(existing)){a.equal(f.r(1).basicStatus,undefined);a.equal(f.l(1).basicStatus,undefined);}else{a.deepEqual(f.r(1).basicStatus,before.remote);a.deepEqual(f.l(1).basicStatus,before.local);}
});
for(const effect of negative)for(const existing of positive)test(effect+' replaces rival benefit '+existing+' after positive damage',()=>{
 const f=setup(effect);grant(f,1,existing);f.hit();a.equal(f.r(1).basicStatus.id,effect);a.equal(f.r(1).basicStatus.source,0);a.equal(f.r(1).basicStatus.appliedTurn,2);a.equal(f.r(0).basicReadyTurn,4);a.equal(f.r(0).basicStatus,undefined);a.equal(f.r(1).basicStatus.banked,undefined);a.equal(f.r(1).basicStatus.outcome,undefined);
});
for(const effect of negative)for(const existing of negative.filter(id=>id!=='microphone'))test(effect+' does not overwrite or refresh active rival '+existing,()=>{
 const f=setup(effect);grant(f,1,existing);const old=structuredClone(f.r(1).basicStatus);f.hit();a.deepEqual(f.r(1).basicStatus,old);a.equal(f.r(0).basicReadyTurn,undefined);
});
test('replacement spends only the attacking ability cooldown, keeps one slot, and takes effect on the affected next turns',()=>{const f=setup('archive');grant(f,1,'coffee');f.r(1).basicReadyTurn=f.l(1).basicReadyTurn=9;f.hit();a.equal(f.r(1).basicReadyTurn,9);const hp=f.r(1).hp;f.end();a.equal(f.r(1).hp,hp-1);a.equal(f.r(1).basicStatus.ticksLeft,1);f.end();f.end();a.equal(f.r(1).hp,hp-2);a.equal(f.r(1).basicStatus,undefined);});
test('zero damage, strong, recovery and a dead source cannot replace a positive state',()=>{
 const zero=setup('archive');zero.r(0).z=zero.l(0).a=1;grant(zero,1,'shield');zero.r(1).guard=zero.l(1).guard=true;zero.hit();a.equal(zero.r(0).basicReadyTurn,undefined);a.equal(zero.r(1).basicStatus,undefined);
 const strong=setup('archive');grant(strong,1,'coffee');strong.hit('strong');a.equal(strong.r(1).basicStatus.id,'coffee');
 for(const context of [{damage:0},{attackerHealth:0},{targetHealth:0},{ownTurn:1}]){const attacker={basicAbility:'archive',basicReadyTurn:2},target={};B.grant(target,'bank',2,1);const old=structuredClone(target);a.equal(B.afterHit(attacker,target,{damage:2,attackerHealth:4,targetHealth:10,ownTurn:2,rivalTurn:2,...context}),null);a.deepEqual(target,old);}
});
test('removing a banked benefit loses its reserve; replacing instant markers does not undo their work or restore shared turn uses',()=>{
 const bank={};B.grant(bank,'bank',2,0);a.equal(B.bank([bank],2,4),3);a.equal(B.grant(bank,'tongue',2,1),true);a.equal(B.collect([bank],3),0);
 const f=setup('fasttrack');f.hit();a.equal(f.remote.players[0].fasttrackUsedTurn,2);a.equal(f.remote.players[0].deck[0].availableTurn,4);a.equal(B.grant(f.r(0),'archive',2,1),true);a.equal(f.remote.players[0].fasttrackUsedTurn,2);a.equal(f.remote.players[0].deck[0].availableTurn,4);
});
test('preview distinguishes replaceable benefits, blocked negatives and historical rooms without mutating statuses',()=>{
 const f=setup('archive');grant(f,1,'coffee');const old=JSON.stringify(f.l(1));a.equal(P.describe(f.local.G,'p',f.l(0)).state,'ready');a.match(P.describe(f.local.G,'p',f.l(0)).availability,/sustituye un positivo/);a.equal(JSON.stringify(f.l(1)),old);
 B.clear(f.l(1));B.grant(f.l(1),'archive',2,'e');a.equal(P.describe(f.local.G,'p',f.l(0)).state,'blocked');
 B.clear(f.l(1));B.grant(f.l(1),'coffee',2,'e');f.local.G.effectsVersion='basic2';a.equal(P.describe(f.local.G,'p',f.l(0)).state,'blocked');a.match(P.describe(f.local.G,'p',f.l(0)).availability,/estado activo/);
});
test('frozen offline1 through offline5 and basic2 sources remain identical to their published counterparts',()=>{
 for(const file of ['js/offline-rules-v1.js','js/offline-rules.js','js/offline-rules-v3.js','js/offline-rules-v4.js','js/offline-rules-v5.js','_dev/online/offline-v1.cjs','_dev/online/offline-v2.cjs','_dev/online/offline-v3.cjs','_dev/online/offline-v4.cjs','_dev/online/offline-v5.cjs'])a.deepEqual(fs.readFileSync(file),execFileSync('git',['show','7365f5e:'+file],{maxBuffer:1024*1024}));
 a.equal(fs.readFileSync('js/basic-effects-v2.js','utf8'),execFileSync('git',['show','7365f5e:js/basic-effects.js'],{encoding:'utf8'}).replace('root.HemicycleBasicEffects=api','root.HemicycleBasicEffectsV2=api'));
 a.equal(fs.readFileSync('_dev/online/combat-basic2.cjs','utf8'),execFileSync('git',['show','7365f5e:_dev/online/combat.cjs'],{encoding:'utf8'}).replace("require('../../js/basic-effects.js')","require('../../js/basic-effects-v2.js')"));
});
test('already preparing basic2 rooms preserve both sides assignments, effects and projection',()=>{const old=require('../_dev/online/combat-basic2.cjs');let s=old.initial();const cabinet={orators:C.cards.slice(0,5).map(c=>c.id),leader:C.cards[0].id,actions:[]};s=old.apply(s,0,{type:'ready',cabinet},0,()=>.1);a.deepEqual(E.apply(s,1,{type:'ready',cabinet},0,()=>.1),old.apply(s,1,{type:'ready',cabinet},0,()=>.1));s=old.apply(s,1,{type:'ready',cabinet},0,()=>.1);a.deepEqual(E.project(s,0,1,0),old.project(s,0,1,0));a.equal(B.forVersion('basic2').version,'basic2');a.equal(B.forVersion('basic1').version,'basic1');});
test('browser and server apply the same replacement and replay the corrected version',()=>{const context=vm.createContext({structuredClone});vm.runInContext(fs.readFileSync('js/offline-rules-v6.js','utf8'),context);const client=context.HemicycleOfflineRules,server=require('../_dev/online/offline-v6.cjs');for(const existing of positive){const f=setup('archive');f.remote.effectsVersion='basic3';grant(f,1,existing);const command={type:'attack',uid:'c0',target:'c1',variant:'normal'},state=server.move(f.remote,command,0,()=>.1),browser=client.move(JSON.parse(JSON.stringify(f.remote)),command,0,()=>.1);a.equal(state.players[1].field[0].basicStatus.id,'archive');a.deepEqual(JSON.parse(JSON.stringify(browser)),JSON.parse(JSON.stringify(state)));}a.equal(server.version,'offline6');});
