'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
const B=require('../js/basic-effects.js'),Old=require('../js/basic-effects-v3.js'),E=require('../_dev/online/combat.cjs'),AI=require('../_dev/online/ai.cjs'),C=require('../js/orator-catalog.js'),P=require('../js/basic-ability-preview.js'),A=require('../js/action-cards.js'),{fixture}=require('./helpers/basic-effects-fixture.cjs');
const context=team=>({damage:1,attackerHealth:8,targetHealth:30,ownTurn:team.turn,rivalTurn:2,source:0,team,actions:A.byId,random:()=>.9});
const attack=(id,team,card={basicAbility:id})=>B.afterHit(card,{},context(team));
test('approved reassignment changes exactly 46 of 120, retains stats, and covers each rarity by role',()=>{
 a.equal(B.version,'basic4');a.equal(Object.keys(B.assignments).length,120);a.equal(C.cards.filter(c=>B.ability(c.id)!==Old.ability(c.id)).length,46);
 a.deepEqual(B.assignments,require('../_dev/balance/drafts/ability-reassignment-v1.cjs').assignments);
 a.equal(fs.readFileSync('js/orator-catalog-v2.js','utf8'),execFileSync('git',['show','2d8319a:js/orator-catalog.js'],{encoding:'utf8'}).replace('root.HemicycleCatalog=factory()','root.HemicycleCatalogV2=factory()'));
 for(const r of ['comun','raro','especial','legendario'])for(const effects of Object.values(require('../_dev/balance/drafts/ability-reassignment-v1.cjs').categories))a.ok(C.cards.some(c=>c.r===r&&effects.includes(B.ability(c.id))),r);
 for(const c of C.cards.filter(c=>B.ability(c.id)==='escort'))a.ok(c.h===14||c.id==='giorgia-meloni');
});
for(const id of ['fasttrack','summon'])test(id+' shared turn cap survives clearing status, expulsion/reset, and changing carriers; next turn opens independently',()=>{
 const team={turn:2,hand:[],deck:id==='fasttrack'?[{id:'receso',action:true,availableTurn:8},{id:'escudo-parlamentario',action:true,availableTurn:8}]:[{id:'a',cost:2},{id:'b',cost:3}]},first={basicAbility:id},other={basicAbility:id};
 a.ok(attack(id,team,first));a.equal(first.basicReadyTurn,4);B.reset(first);a.equal(attack(id,team,first),null);a.equal(attack(id,team,other),null);a.equal(other.basicReadyTurn,undefined);
 team.turn=3;a.ok(attack(id,team,other));a.equal(other.basicReadyTurn,5);a.equal(team[id==='fasttrack'?'fasttrackUsedTurn':'summonUsedTurn'],3);
});
for(const id of ['fasttrack','summon'])test(id+' retains personal two-turn recovery and blocked/no-candidate attempts consume nothing',()=>{
 const team={turn:1,hand:[],deck:[]},card={basicAbility:id};a.equal(attack(id,team,card),null);a.equal(card.basicReadyTurn,undefined);a.equal(team.fasttrackUsedTurn,undefined);a.equal(team.summonUsedTurn,undefined);
 team.deck=id==='fasttrack'?[{id:'receso',action:true,availableTurn:8}]:[{id:'a',cost:2}];a.ok(attack(id,team,card));B.clear(card);team.turn=2;team.hand=[];team.deck=id==='fasttrack'?[{id:'receso',action:true,availableTurn:8}]:[{id:'b',cost:3}];a.equal(attack(id,team,card),null);team.turn=3;a.ok(attack(id,team,card));
});
test('summon chooses lowest current cost without rarity, uses deck order for ties, does not touch actions/rest or expose drawn identity',()=>{
 const team={turn:2,hand:[{id:'held'}],deck:[{id:'receso',action:true,cost:0},{id:'legend',rarity:'legendario',cost:5},{id:'tie-first',rarity:'especial',cost:3},{id:'tie-second',rarity:'raro',cost:3}],rest:[{id:'dead',cost:1}]};
 const effect=attack('summon',team);a.equal(team.hand[1].id,'tie-first');a.equal(team.deck.length,3);a.equal(team.rest.length,1);a.equal(effect.utility.name,'Un orador del mazo');a.equal(effect.card.basicStatus.outcome,'Un orador del mazo');
 const local={turn:2,hand:[],deck:[{k:'x',r:'legendario',c:5},{k:'y',r:'especial',c:3}]};attack('summon',local);a.equal(local.hand[0].k,'y');
 for(const hand of [[{},{}],[{action:true},{},{}]]){const t={turn:2,hand,deck:[{cost:1}]};a.equal(attack('summon',t),null);a.equal(t.summonUsedTurn,undefined);}
});
test('utility caps are independent and do not affect the other player',()=>{
 const team={turn:2,hand:[],deck:[{id:'receso',action:true,availableTurn:7},{id:'orator',cost:3}]};a.ok(attack('fasttrack',team));a.ok(attack('summon',team));const foe={turn:2,hand:[],deck:[{id:'receso',action:true,availableTurn:7},{id:'orator',cost:3}]};a.ok(attack('summon',foe));a.ok(attack('fasttrack',foe));
});
for(const roll of [0,.999])test('fasttrack random eligibility with roll '+roll+' excludes attacks, short cooldown and once-per-battle actions',()=>{
 const team={turn:2,hand:[],deck:[{id:'receso',action:true,availableTurn:5},{id:'escudo-parlamentario',action:true,availableTurn:4},{id:'replica',action:true,availableTurn:5},{id:'mocion-de-censura',action:true,availableTurn:5},{id:'turno-de-palabra',action:true,availableTurn:3}]},card={basicAbility:'fasttrack',lastHealTurn:2};a.ok(B.afterHit(card,{}, {...context(team),random:()=>roll}));a.equal(team.deck[roll<.5?0:1].availableTurn,roll<.5?4:3);a.equal(card.lastHealTurn,2);a.equal(team.deck[2].availableTurn,5);a.equal(team.deck[3].availableTurn,5);
});
for(const id of ['summon','fasttrack'])test('local and server persist '+id+' cap and expose accurate preview',()=>{
 const f=fixture(id==='summon'?'pablo-iglesias':'christine-lagarde');f.r(1).hp=f.r(1).maxHp=f.l(1).h=f.l(1).hm=40;
 const card=C.cards.find(c=>c.id==='hillary-clinton');f.remote.players[0].deck=id==='summon'?[{...card,cost:card.c,rarity:card.r,uid:'draw'}]:[{id:'receso',action:true,availableTurn:6}];f.local.G.deck.p=id==='summon'?[f.local.mk(card,false,'p')]:[{k:'receso',action:true,availableTurn:6}];
 f.hit();const key=id==='summon'?'summonUsedTurn':'fasttrackUsedTurn';a.equal(f.remote.players[0][key],2);a.equal(f.local.G[key].p,2);B.clear(f.l(0));f.l(0).basicReadyTurn=0;const info=P.describe(f.local.G,'p',f.l(0));a.equal(info.state,'blocked');a.match(info.availability,/este turno propio/);a.equal(f.remote.players[0].fasttrackUsed,undefined);
});
test('basic3 rooms retain original assignments, permanent utility cap and projection when preparing and playing',()=>{
 const legacy=require('../_dev/online/combat-basic3.cjs');const cabinet={orators:['ursula-von-der-leyen','toni-canto','pablo-iglesias','donald-trump','ana-pastor'],leader:'ursula-von-der-leyen',actions:['receso']};let s=legacy.apply(legacy.initial(),0,{type:'ready',cabinet},0,()=>.1);
 a.deepEqual(E.apply(s,1,{type:'ready',cabinet},0,()=>.1),legacy.apply(s,1,{type:'ready',cabinet},0,()=>.1));s=E.apply(s,1,{type:'ready',cabinet},0,()=>.1);a.deepEqual(E.project(s,0,1,0),legacy.project(s,0,1,0));for(const p of s.players)for(const c of [...p.hand,...p.deck].filter(c=>!c.action))a.equal(c.basicAbility,Old.ability(c.id));a.deepEqual(E.apply(s,s.side,{type:'end'},0,()=>.1),legacy.apply(s,s.side,{type:'end'},0,()=>.1));
 a.equal(B.forVersion('basic3'),Old);const team={turn:1,hand:[],deck:[{id:'receso',action:true,availableTurn:8}]},card={basicAbility:'fasttrack'};a.ok(Old.afterHit(card,{},context(team)));Old.reset(card);team.turn=3;a.equal(Old.afterHit(card,{},context(team)),null);
});
test('all six previous downloaded engines and basic3 sources match publication exactly',()=>{
 for(const file of ['js/offline-rules-v1.js','js/offline-rules.js',...[3,4,5,6].map(n=>'js/offline-rules-v'+n+'.js'),...[1,2,3,4,5,6].map(n=>'_dev/online/offline-v'+n+'.cjs')])a.deepEqual(fs.readFileSync(file),execFileSync('git',['show','2d8319a:'+file],{maxBuffer:4*1024*1024}));
 a.equal(fs.readFileSync('js/basic-effects-v3.js','utf8'),execFileSync('git',['show','2d8319a:js/basic-effects.js'],{encoding:'utf8'}).replace('root.HemicycleBasicEffects=api','root.HemicycleBasicEffectsV3=api'));
 a.equal(fs.readFileSync('_dev/online/combat-basic3.cjs','utf8'),execFileSync('git',['show','2d8319a:_dev/online/combat.cjs'],{encoding:'utf8'}).replace("require('../../js/basic-effects.js')","require('../../js/basic-effects-v3.js')"));execFileSync('node',['_dev/build-offline.cjs','--check']);
});
test('new offline7 browser and server play complete seeded games and replay with the same rules',()=>{
 const box=vm.createContext({structuredClone});vm.runInContext(fs.readFileSync('js/offline-rules-v7.js','utf8'),box);const browser=box.HemicycleOfflineRules,server=require('../_dev/online/offline-v7.cjs');a.equal(server.version,'offline7');
 const cabinet={orators:['christine-lagarde','monica-garcia','pablo-iglesias','angela-merkel','vladimir-putin'],leader:'angela-merkel',actions:['receso','escudo-parlamentario']};
 for(let seed=1;seed<=12;seed++){const ticket={id:'v9-'+seed,rules:'offline7',seed,profile:{album:C.cards.map(c=>c.id),actionAlbum:A.ids,elo:0}},start=server.start(ticket,cabinet,'normal'),client=browser.start(ticket,cabinet,'normal'),commands=[];let {state,rng}=start;
  for(let n=0;state.status==='active'&&n<1500;n++){const command=AI.choose(state,0,0);commands.push({at:0,command});state=server.move(state,command,0,rng);client.state=browser.move(client.state,command,0,client.rng);a.deepEqual(JSON.parse(JSON.stringify(client.state)),JSON.parse(JSON.stringify(state)));}a.equal(state.status,'finished');a.deepEqual(server.replay(ticket,{mode:'normal',cabinet,commands}),state);
 }
});
test('private projection reports utility eligibility without disclosing deck order, names or the other player eligibility',()=>{
 const f=fixture('pablo-iglesias');f.remote.players[0].deck=[{id:'hillary-clinton',cost:3},{id:'receso',action:true,availableTurn:5}];
 let projected=E.project(f.remote,0,1,0);a.deepEqual(projected.players[0].basicUtilityReady,{summon:true,fasttrack:true});a.equal(projected.players[0].deck,undefined);a.equal(projected.players[1].basicUtilityReady,undefined);
 f.remote.players[0].summonUsedTurn=2;projected=E.project(f.remote,0,2,0);a.equal(projected.players[0].basicUtilityReady.summon,false);
 const g=f.local.G;g.authoritative=true;g.deck.p=new Array(3);g.basicUtilityReady={summon:true,fasttrack:true};a.doesNotMatch(P.describe(g,'p',f.l(0)).availability,/No quedan/);g.basicUtilityReady.summon=false;a.match(P.describe(g,'p',f.l(0)).availability,/No quedan/);
 a.match(P.detail('summon','basic3'),/común/);a.match(P.detail('fasttrack','basic3'),/por jugador y partida/);a.doesNotMatch(P.detail('fasttrack'),/por jugador y partida/);
});
