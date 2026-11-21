'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),{createRequire}=require('node:module');
const A=require('../js/action-cards.js'),S=require('../js/action-status.js'),E=require('../_dev/online/combat.cjs'),{fixture}=require('./helpers/basic-effects-fixture.cjs');
const changed=['renovacion-del-consenso','mocion-de-escrutinio'];
test('all 92 action cards and their display aliases fit the ordinary six-TdP budget',()=>{
 a.equal(A.cards.length,92);for(const c of A.cards){a.ok(Number.isInteger(c.cost)&&c.cost>=1&&c.cost<=6,c.id);a.equal(c.c,c.cost);a.equal(A.byId[c.id].cost,c.cost);a.ok(A.rules(c).includes('Coste: '+c.cost+' TdP.'));}
 const previous={exports:{}};vm.runInNewContext(fs.readFileSync('_dev/online/frozen-v11/action-cards.js','utf8'),{module:previous,require:createRequire(path.resolve('js/action-cards.js'))});
 a.deepEqual(Array.from(previous.exports.cards.filter(c=>c.cost!==A.byId[c.id].cost),c=>c.id),changed);
 for(const c of previous.exports.cards){const current=A.byId[c.id],expected=JSON.parse(JSON.stringify(c));if(changed.includes(c.id)){a.equal(c.cost,7);a.equal(current.cost,6);expected.cost=expected.c=6;expected.ruleLines=expected.ruleLines.map(line=>line==='Coste: 7 TdP.'?'Coste: 6 TdP.':line);}a.deepEqual(JSON.parse(JSON.stringify(current)),expected,c.id);}
});
function setup(id,tdp){const f=fixture();f.local.HemicycleActionArt={};f.remote.players[0].tdp=f.local.G.tdp.p=tdp;const card=A.byId[id];
 f.remote.players[0].hand=[{uid:'spell',id,action:true,cost:card.cost}];f.local.G.hand.p=[{uid:'spell',k:id,action:true,c:card.cost}];
 for(const i of [0,1]){f.r(i).hp=f.l(i).h=4;f.r(i).maxHp=f.l(i).hm=10;}
 const side=id===changed[0]?0:1,kinds=side===0?['weakness','attrition']:['strength','regeneration'];for(const kind of kinds){S.grant(f.r(side),kind,1,2,2,side===0?1:0);S.grant(f.l(side),kind,1,2,2,side===0?'e':'p');}
 return f;
}
for(const id of changed)test(id+' is playable at six TdP with no active leader, preserving effects and recovery',()=>{
 const f=setup(id,6);a.equal(E.active(f.remote,0),null);a.equal(f.local.activeDoc('p'),null);
 const next=E.apply(f.remote,0,{type:'action',id},0,()=>.1);a.equal(f.local.useLocalAction('p','spell'),true);
 a.equal(next.players[0].tdp,0);a.equal(f.local.G.tdp.p,0);a.equal(next.players[0].hand.length,0);a.equal(f.local.G.hand.p.length,0);
 a.equal(next.players[0].deck[0].availableTurn,5);a.equal(f.local.G.deck.p[0].availableTurn,5);
 const side=id===changed[0]?0:1,expectedHealth=side===0?6:2;a.equal(next.players[side].field[0].hp,expectedHealth);a.equal(f.l(side).h,expectedHealth);
 for(const kind of side===0?['weakness','attrition']:['strength','regeneration']){a.equal(S.value(next.players[side].field[0],kind),0);a.equal(S.value(f.l(side),kind),0);}
 a.throws(()=>E.apply(next,0,{type:'action',id},0),/fuera de la mano/);a.equal(f.local.useLocalAction('p','spell'),false);
});
for(const id of changed)test(id+' cannot be played at five TdP or consume a card while unaffordable',()=>{
 const f=setup(id,5),before=JSON.stringify(f.remote);a.throws(()=>E.apply(f.remote,0,{type:'action',id},0),/TdP insuficiente/);a.equal(JSON.stringify(f.remote),before);
 a.equal(f.local.useLocalAction('p','spell'),false);a.equal(f.local.G.tdp.p,5);a.equal(f.local.G.hand.p.length,1);a.equal(f.local.G.deck.p.length,0);
});
for(const id of changed)test(id+' preserves a cost-seven instance already issued in an older match',()=>{
 const f=setup(id,6);f.remote.players[0].hand[0].cost=f.local.G.hand.p[0].c=7;
 a.equal(f.local.battleActionDefinition(id,null,f.local.G.hand.p[0]).cost,7);
 a.match(f.local.actionRulesHTML(f.local.battleActionDefinition(id)),/7 TdP/);
 a.match(f.local.actionCromoHTML(A.byId[id],{instance:f.local.G.hand.p[0]}),/aria-label="7 TdP"/);
 a.throws(()=>E.apply(f.remote,0,{type:'action',id},0),/TdP insuficiente/);a.equal(f.local.useLocalAction('p','spell'),false);
 f.remote.players[0].tdp=f.local.G.tdp.p=7;const next=E.apply(f.remote,0,{type:'action',id},0,()=>.1);a.equal(f.local.useLocalAction('p','spell'),true);a.equal(next.players[0].tdp,0);a.equal(f.local.G.tdp.p,0);
 a.equal(A.byId[id].cost,6);a.ok(A.rules(id).includes('Coste: 6 TdP.'));
});
test('a supplied instance cannot invent a discount or raise a different card cost',()=>{
 const Costs=require('../js/action-costs.js');for(const cost of [0,1,5,8,'7',-1])a.equal(Costs.forInstance(A.byId[changed[0]],{cost}).cost,6);
 a.equal(Costs.forInstance(A.byId.replica,{cost:7}).cost,1);a.equal(Costs.forInstance(A.byId[changed[0]],{}).cost,6);
});
test('successor browser/server bundles use cost six while issued offline11 retains cost seven',()=>{
 const build={browser:fs.readFileSync('js/offline-rules-v12.js','utf8'),server:fs.readFileSync('_dev/online/offline-v12.cjs','utf8')};
 for(const [text,needle]of [[build.browser,'root.HemicycleOfflineRules=load("_dev/online/offline-rules.cjs");'],[build.server,'module.exports=load("_dev/online/offline-rules.cjs");']]){
  a.ok(text.includes(needle));const context=vm.createContext({module:{exports:{}},structuredClone});vm.runInContext(text.replace(needle,'root.actions=load("js/action-cards.js");'+needle),context);for(const id of changed)a.equal(context.actions.byId[id].cost,6);
 }
 const manifest=require('../_dev/releases/v32.0.0.3/offline12-manifest.json');
 for(const key of ['browser','server'])a.equal(require('node:crypto').createHash('sha256').update(build[key]).digest('hex'),manifest[key+'Sha256']);
 const old=fs.readFileSync('js/offline-rules-v11.js','utf8'),needle='root.HemicycleOfflineRules=load("_dev/online/offline-rules.cjs");',context=vm.createContext({structuredClone});a.ok(old.includes(needle));vm.runInContext(old.replace(needle,'root.actions=load("js/action-cards.js");'+needle),context);for(const id of changed)a.equal(context.actions.byId[id].cost,7);
 for(const row of JSON.parse(fs.readFileSync('_dev/revisions/20261117-action-cost/legacy-engines.json','utf8')))a.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync(row.file)).digest('hex'),row.sha256,row.file);
});
