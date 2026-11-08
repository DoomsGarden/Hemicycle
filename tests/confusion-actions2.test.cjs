'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const S=require('../js/action-status.js'),E=require('../_dev/online/combat.cjs'),F=require('../js/attack-forecast.js'),{fixture}=require('./helpers/basic-effects-fixture.cjs');
function duel(roll=.1,ally=true){const f=fixture();for(const i of [0,1]){Object.assign(f.r(i),{hp:40,maxHp:40,z:4,basicAbility:null});Object.assign(f.l(i),{h:40,hm:40,a:4,basicAbility:null});}
 if(ally){f.remote.players[0].field.push({...f.r(0),uid:'friend',name:'Compañero',basicStatus:null});f.local.G.field.p.push({...f.l(0),uid:'friend',n:'Compañero',basicStatus:null});}
 S.grant(f.r(0),'confused',1,2,2,1);S.grant(f.l(0),'confused',1,2,2,'e');f.local.Math.random=()=>roll;return f;}
for(const variant of ['normal','strong'])for(const [roll,expected]of [[0,'c1'],[.499999,'c1'],[.5,'c0'],[.749999,'c0'],[.75,'friend'],[.999999,'friend']])test(`${variant}: confirmed roll ${roll} resolves to ${expected} in local and server`,()=>{
 const f=duel(roll),before=JSON.stringify(f.remote),r=E.apply(f.remote,0,{type:'attack',uid:'c0',target:'c1',variant},0,()=>roll);
 a.equal(JSON.stringify(f.remote),before);a.equal(f.local.attack(f.l(0),f.l(1),'p',variant),true);
 a.equal(r.visualEvents.filter(e=>e.kind==='attack').at(-1).target,expected);
 for(const i of [0,1])a.deepEqual(r.players[i].field.map(c=>[c.uid,c.hp]),Array.from(f.local.G.field[i===0?'p':'e'],c=>[c.uid,c.h]));
 a.equal(S.value(r.players[0].field[0],'confused'),0);a.equal(S.value(f.local.G.field.p[0],'confused'),0);
 a.equal(r.players[0].field[0].ready,false);a.equal(f.local.G.field.p[0].ready,false);
});
test('one random draw determines both category and uniformly selected ally; single orator fallback is self',()=>{
 for(const [roll,id]of [[.75,'b'],[.874999,'b'],[.875,'c'],[.99999,'c']]){const actor={uid:'a'},b={uid:'b'},c={uid:'c'};S.grant(actor,'confused',1,2,2,0);let calls=0;const result=S.confusionTarget(actor,{},[actor,b,c],()=>{calls++;return roll;});a.equal(result.target.uid,id);a.equal(calls,1);}
 const f=duel(.99,false),r=E.apply(f.remote,0,{type:'attack',uid:'c0',target:'c1',variant:'normal'},0,()=>.99);a.equal(r.visualEvents.filter(e=>e.kind==='attack').at(-1).target,'c0');
});
for(const type of ['guard','heal'])test(`${type} never draws or consumes confusion, and heal recovery is enforced`,()=>{
 const f=duel();f.r(0).hp=f.l(0).h=20;const r=E.apply(f.remote,0,{type,uid:'c0'},0,()=>{throw Error('Support must not roll confusion');});
 f.local.Math.random=()=>{throw Error('Support must not roll confusion');};a.equal(f.local.useSupport(f.l(0),type,'p'),true);
 a.equal(S.value(r.players[0].field[0],'confused'),1);a.equal(S.value(f.l(0),'confused'),1);a.equal(r.players[0].field[0].hp,f.l(0).h);
 if(type==='heal'){r.players[0].field[0].ready=true;r.players[0].field[0].hp=10;a.throws(()=>E.apply(r,0,{type:'heal',uid:'c0'},0),/no disponible/);a.equal(f.local.healWait('p',f.l(0)),2);}
});
test('invalid targets, unavailable strong and exhausted actors do not roll or consume confusion',()=>{
 for(const bad of [{target:'friend'}, {variant:'invalid'}, {uid:'missing'}]){const f=duel(),command={type:'attack',uid:'c0',target:'c1',variant:'normal',...bad};let calls=0;a.throws(()=>E.apply(f.remote,0,command,0,()=>{calls++;return .5;}));a.equal(calls,0);a.equal(S.value(f.r(0),'confused'),1);}
});
test('confusion is consumed only once and still expires without an attack',()=>{
 const actor={};S.grant(actor,'confused',1,2,2,0);S.confusionTarget(actor,null,[actor],()=>.5);S.confusionTarget(actor,null,[actor],()=>{throw Error('Only the next attack rolls');});S.grant(actor,'confused',1,2,2,0);S.end(actor,3);a.equal(S.value(actor,'confused'),1);S.end(actor,4);a.equal(S.value(actor,'confused'),0);
});
test('self-hit respects guard and strong cost once; friendly expulsion gives no votes to its attacker',()=>{
 const f=duel(.5);f.r(0).guard=f.l(0).guard=true;let r=E.apply(f.remote,0,{type:'attack',uid:'c0',target:'c1',variant:'strong'},0,()=>.5);f.local.attack(f.l(0),f.l(1),'p','strong');a.equal(r.players[0].field[0].hp,36);a.equal(f.l(0).h,36);a.equal(r.players[0].field[0].guard,false);
 const g=duel(.8);g.remote.players[0].field[1].hp=1;g.local.G.field.p[1].h=1;r=E.apply(g.remote,0,{type:'attack',uid:'c0',target:'c1',variant:'normal'},0,()=>.8);g.local.attack(g.l(0),g.l(1),'p','normal');a.equal(r.players[0].votes,0);a.equal(g.local.G.votes.p,0);a.equal(r.players[0].field.length,1);a.equal(g.local.G.field.p.length,1);a.equal(r.players[1].votes,g.local.G.votes.e);
});
test('previews never draw a result, mutate state or promise a kill; old games retain old confusion',()=>{
 const f=duel(),before=JSON.stringify(f.remote);for(let i=0;i<10;i++){const preview=E.forecast(f.remote,0,{uid:'c0',target:'c1',variant:'normal'});a.equal(preview.uncertain,true);a.equal(preview.expels,false);a.equal(preview.win,false);a.match(F.summary(preview),/50 %/);a.equal(JSON.stringify(f.remote),before);}
 const old=structuredClone(f.remote);old.actionEffectsVersion=1;const next=E.apply(old,0,{type:'attack',uid:'c0',target:'c1',variant:'normal'},0,()=>.99);a.equal(next.visualEvents.filter(e=>e.kind==='attack').at(-1).target,'c1');a.equal(S.value(next.players[0].field[0],'confused'),1);a.throws(()=>E.apply(old,0,{type:'attack',uid:'c0',target:'empty',variant:'normal'},0,()=>.1),/Confundido/);
});
test('historical offline10 bundles remain byte-identical',()=>{
 for(const file of ['js/offline-rules-v10.js','_dev/online/offline-v10.cjs']){const baseline=require('node:child_process').execFileSync('git',['show','2ec3915:'+file],{maxBuffer:16*1024*1024});a.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),crypto.createHash('sha256').update(baseline).digest('hex'));}
 a.equal(require('../_dev/online/offline-v11.cjs').version,'offline11');
});
test('strong unavailable and an exhausted speaker reject the move before drawing',()=>{
 for(const change of [{hp:1},{ready:false}]){const f=duel();Object.assign(f.r(0),change);let calls=0;a.throws(()=>E.apply(f.remote,0,{type:'attack',uid:'c0',target:'c1',variant:'strong'},0,()=>{calls++;return .5;}));a.equal(calls,0);a.equal(S.value(f.r(0),'confused'),1);}
});
test('a self-expulsion happens once; Aforado on the actual victim is respected',()=>{
 for(const saved of [false,true]){const f=duel(.5);f.r(0).hp=f.l(0).h=3;if(saved){f.r(0).doctrine='aforado';f.remote.players[0].leader=f.r(0).id;f.l(0).pa='aforado';f.local.G.leader.p=f.l(0);}
 const r=E.apply(f.remote,0,{type:'attack',uid:'c0',target:'c1',variant:'normal'},0,()=>.5);f.local.attack(f.l(0),f.l(1),'p','normal');a.equal(r.players[0].field.length,saved?2:1);a.equal(f.local.G.field.p.length,saved?2:1);a.equal(r.visualEvents.filter(e=>e.kind==='expel'&&e.uid==='c0').length,saved?0:1);if(saved){a.equal(r.players[0].field[0].hp,3);a.equal(f.l(0).h,3);}}
});
