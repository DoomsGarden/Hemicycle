'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const C=require('../js/orator-catalog.js'),before=require('../_dev/balance/catalog-before.json'),E=require('../_dev/online/combat.cjs'),AI=require('../_dev/online/ai.cjs'),dispatch=require('../_dev/online/offline-engines.cjs');
test('before snapshot comes from the published catalog, not a regenerated baseline',()=>{const context=vm.createContext({});vm.runInContext(require('node:child_process').execFileSync('git',['show','3a00b45:js/orator-catalog.js'],{encoding:'utf8'}),context);a.deepEqual(JSON.parse(JSON.stringify(context.HemicycleCatalog.cards)),before);});
const stats=c=>({c:c.c,a:c.a,h:c.h,v:c.v});
const expected={comun:{1:[2,4,2],2:[2,5,2]},raro:{2:[4,6,3],3:[4,7,3],4:[4,7,3]},especial:{3:[5,8,4],4:[6,8,4]},legendario:{4:[7,11,5],5:[7,14,5]}};
test('all 120 speakers match the approved table without changing identity, quotes, countries or doctrines',()=>{
 a.equal(C.cards.length,120);const old=new Map(before.map(c=>[c.id,c]));
 for(const c of C.cards){const previous=old.get(c.id),cost=previous.r==='comun'?Math.min(2,previous.c):previous.c;const [zasca,aguante,votes]=expected[c.r][cost];a.deepEqual(stats(c),{c:cost,a:zasca,h:aguante,v:votes},c.id);const metadata=({c,a,h,v,...rest})=>rest;a.deepEqual(metadata(c),metadata(previous),c.id);}
 a.deepEqual(C.statsFor('especial',5),{a:6,h:8,v:4});a.equal(C.cards.filter(c=>c.r==='especial'&&c.c===5).length,0);
});
test('future utility register contains exactly the 12 former cost-3 commons and 12 cost-4 rares',()=>{
 const marks=require('../_dev/balance/pending-utility.json');a.equal(marks.cards.length,24);
 a.deepEqual(marks.cards.map(c=>c.id).sort(),before.filter(c=>c.r==='comun'&&c.c===3||c.r==='raro'&&c.c===4).map(c=>c.id).sort());
 for(const mark of marks.cards){a.deepEqual(mark.before,stats(before.find(c=>c.id===mark.id)));a.deepEqual(mark.after,stats(C.cards.find(c=>c.id===mark.id)));a.equal(mark.status,'pending-design');}
});
const ids=['donald-trump','mariano-rajoy','javier-milei','ana-pastor','celia-villalobos'];
const cabinet={orators:ids,leader:ids[4],actions:[]};
function battle(legacy=false,profile){let s=E.initial();if(legacy)delete s.catalogVersion;for(const i of [0,1])s=E.apply(s,i,{type:'ready',cabinet},0,()=>.1,profile);return s;}
const all=p=>[...p.hand,...p.deck,...p.field,...p.rest].filter(c=>!c.action);
test('new live rooms use current values; already preparing legacy rooms finish preparation with old values on both sides',()=>{
 for(const legacy of [false,true]){const s=battle(legacy);for(const p of s.players)for(const c of all(p)){const base=(legacy?before:C.cards).find(x=>x.id===c.id),leader=c.id===p.leader;a.equal(c.cost,base.c);a.equal(c.z,base.a+(leader?1:0));a.equal(c.hp,base.h+(leader?3:0));a.equal(c.votes,base.v);}}
 let partial=E.initial();delete partial.catalogVersion;partial=E.apply(partial,0,{type:'ready',cabinet},0,()=>.1);const first=JSON.stringify(all(partial.players[0]));partial=E.apply(partial,1,{type:'ready',cabinet},0,()=>.1);a.deepEqual(all(partial.players[0]).map(c=>[c.id,c.z,c.maxHp,c.votes]).sort(),JSON.parse(first).map(c=>[c.id,c.z,c.maxHp,c.votes]).sort());
});
test('two legendary speakers and a special yield 17 per turn instead of 24, including the unchanged 3 base votes',()=>{
 for(const [legacy,gain]of [[false,17],[true,24]]){let s=battle(legacy);s.players[0].field=all(s.players[0]).filter(c=>ids.slice(0,3).includes(c.id));s.players[0].votes=0;s=E.apply(s,0,{type:'end'},0,()=>.1);s=E.apply(s,1,{type:'end'},0,()=>.1);a.equal(s.players[0].votes,gain);}
});
test('expulsion grants the target rarity seats on each side; strong attacks retain 150%, health cost and three-turn cycle',()=>{
 for(const side of [0,1])for(const tier of Object.keys(expected)){let s=battle();s.side=side;const p=s.players[side],foe=s.players[1-side];const attacker=all(p).find(c=>c.id==='javier-milei'),base=C.cards.find(c=>c.r===tier);const target={...structuredClone(attacker),uid:'target',id:base.id,votes:base.v,hp:1,maxHp:20};p.field=[attacker];foe.field=[target];p.votes=0;attacker.ready=true;attacker.enteredTurn=0;p.turn=2;
  a.equal(E.strong(p,attacker),true);const oldHp=attacker.hp;const result=E.apply(s,side,{type:'attack',uid:attacker.uid,target:target.uid,variant:'strong'},0,()=>.1);a.equal(result.players[side].votes,base.v);a.equal(result.players[side].field[0].hp,oldHp-1);a.equal(result.visualEvents.findLast(e=>e.kind==='damage'&&e.uid==='target').value,9);a.equal(E.strong(result.players[side],result.players[side].field[0]),false);
  attacker.strongUsedTurn=null;p.turn=3;a.equal(E.strong(p,attacker),false);p.turn=5;a.equal(E.strong(p,attacker),true);
 }
});
test('gold and leader bonuses remain additive and do not inflate the new base seats',()=>{
 const s=battle(false,{dtGoldUnlocked:true,dtGoldActive:true});const trump=all(s.players[0]).find(c=>c.id==='donald-trump');a.equal(trump.z,9);a.equal(trump.hp,13);a.equal(trump.votes,5);
});
test('browser and server dispatch select the exact historical or current engine and reproduce a complete match',()=>{
 const context=vm.createContext({structuredClone});for(const [file,key]of [['js/offline-rules-v1.js','offline1'],['js/offline-rules.js','offline2'],['js/offline-rules-v3.js','offline3']]){vm.runInContext(fs.readFileSync(file,'utf8'),context);context[key]=context.HemicycleOfflineRules;}
 vm.runInContext(fs.readFileSync('js/offline-rule-dispatch.js','utf8'),context);const browser=context.HemicycleOfflineRuleDispatch.create(context);
 for(const version of ['offline1','offline2','offline3']){const engine=dispatch.forTicket({rules:version});const ticket={rules:version,seed:71,profile:{album:C.cards.map(c=>c.id),actionAlbum:[],elo:0}};let {state,rng}=engine.start(ticket,cabinet,'normal');const commands=[];const client=browser.forTicket(ticket).start(ticket,cabinet,'normal');a.deepEqual(JSON.parse(JSON.stringify(client.state)),JSON.parse(JSON.stringify(state)));
  for(let n=0;state.status==='active'&&n<1000;n++){const command=AI.choose(state,0,0);commands.push({at:0,command});state=engine.move(state,command,0,rng);client.state=browser.forTicket(ticket).move(client.state,command,0,client.rng);}
  a.equal(state.status,'finished');a.deepEqual(engine.replay(ticket,{mode:'normal',cabinet,commands}),state);a.deepEqual(JSON.parse(JSON.stringify(client.state)),JSON.parse(JSON.stringify(state)));a.throws(()=>engine.replay(ticket,{mode:'normal',cabinet,commands:[...commands,{at:0,command:{type:'end'}}]}),/después/);
 }
 for(const rules of ['offline4','__proto__',null]){a.throws(()=>dispatch.forTicket({rules}));a.throws(()=>browser.forTicket({rules}));}
});

test('download negotiation preserves absent-version legacy clients and rejects unknown versions',async()=>{
 const calls=[],service=require('../_dev/online/economy-service.cjs').create({url:'https://example.supabase.co',key:'public',secret:'test',fetcher:async(url,options)=>{if(url.endsWith('/auth/v1/user'))return {ok:true,json:async()=>({id:'actor'})};calls.push(JSON.parse(options.body));return {ok:true,json:async()=>[]};}});
 for(const rules of [undefined,'offline1','offline2','offline3']){await service('Bearer test','/offline/tickets','POST',{rules});a.equal(calls.at(-1).p_rules,rules||'offline1');}
 const count=calls.length;await a.rejects(service('Bearer test','/offline/tickets','POST',{rules:'offline4'}),e=>e.status===400);a.equal(calls.length,count);
});
