'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs');
const C=require('../js/orator-catalog.js'),A=require('../js/action-cards.js'),S=require('../js/action-status.js'),E=require('../_dev/online/combat.cjs'),Format=require('../js/game-format.js'),Events=require('../js/expansion-event.js'),Economy=require('../_dev/online/economy.cjs'),Visuals=require('../js/action-state-visuals.js'),{fixture}=require('./helpers/basic-effects-fixture.cjs');
test('global review preserves identity and the original legendary statistics, with a single coherent tier table',()=>{
 const before=require('../_dev/revisions/20261107/catalog-before.json'),original=new Set(require('../_dev/expansions/activation-v32/baseline/orator-catalog.js').cards.map(c=>c.id)),ranks={comun:0,raro:1,especial:2,legendario:3};
 a.equal(C.balanceVersion,'balance-v4');a.deepEqual(C.cards.map(c=>c.id).sort(),before.map(c=>c.id).sort());let preserved=0;
 for(const old of before){const c=C.cards.find(c=>c.id===old.id);for(const key of ['n','pa','country','q'])a.deepEqual(c[key],old[key],old.id+' '+key);a.equal(c.v,ranks[c.r]+1);if(original.has(c.id)){if(old.r==='legendario'){for(const key of ['r','c','a','h'])a.equal(c[key],old[key],c.id);preserved++;}else a.ok(ranks[c.r]>=ranks[old.r],c.id);}}
 a.equal(preserved,12);a.deepEqual(Object.fromEntries(Object.keys(ranks).map(r=>[r,C.cards.filter(c=>c.r===r).length])),{comun:359,raro:270,especial:180,legendario:90});
 for(const [id,tier]of [['joe-biden','legendario'],['alfredo-perez-rubalcaba','especial'],['elena-salgado','especial'],['pedro-solbes','especial'],['joaquin-francisco-puig-ferrer','raro']]){a.equal(C.cards.find(c=>c.id===id).r,tier,id);}
});
test('one-time format upgrade preserves old leader, members, resources and claimed events; repeated defeats preserve the minimum',()=>{
 const old={album:C.cards.slice(0,5).map(c=>c.id),actionAlbum:['replica','receso'],fs:999,w:40,l:9,expansionEvent:{id:Events.id,announced:true,claimed:['fs']}};const leader=old.album[2],slot={ids:old.album.slice(),leader,actions:old.actionAlbum.slice()},receipt=JSON.stringify(old.expansionEvent),added=Format.ensureCollection(old,C.cards,A.cards);a.equal(added.orators.length,3);a.equal(added.actions.length,2);a.equal(old.fs,999);a.equal(JSON.stringify(old.expansionEvent),receipt);const migrated=Format.selection(slot,old.album,old.actionAlbum);a.equal(migrated.leader,leader);a.deepEqual(migrated.ids.slice(0,5),slot.ids);a.equal(migrated.ids.length,8);a.equal(migrated.actions.length,4);a.deepEqual(Format.ensureCollection(old,C.cards,A.cards),{orators:[],actions:[]});
 old.album.push(...old.album);old.actionAlbum.push(...old.actionAlbum);
 for(let n=0;n<100;n++){const pool=A.lootPool(old.album,old.actionAlbum,old);if(!pool.length)break;A.removeCopy(old,pool[0]);a.ok(new Set(old.album).size>=8);a.ok(new Set(old.actionAlbum).size>=4);}
 a.equal(old.album.length,8);a.equal(old.actionAlbum.length,4);a.deepEqual(A.lootPool(old.album,old.actionAlbum,old),[]);for(const id of [...old.album,...old.actionAlbum])a.throws(()=>A.removeCopy(old,id),/Seguro/);
});
for(const action of A.cards)test(action.id+': browser and authoritative engine apply the same reviewed action',()=>{
 const f=fixture(),local=f.local,p=f.remote.players[0];p.hand=[{uid:'spell',id:action.id,action:true}];local.G.hand.p=[{uid:'spell',k:action.id,action:true}];
 for(const i of [0,1]){const r=f.r(i),l=f.l(i);r.hp=l.h=20;r.maxHp=l.hm=40;r.basicAbility=l.basicAbility=null;r.doctrine=l.pa=null;}
 if(action.effect==='silence'){for(const suffix of ['second','third']){f.remote.players[0].field.push({...structuredClone(f.r(0)),uid:suffix});local.G.field.p.push({...structuredClone(f.l(0)),uid:suffix});}f.remote.players[1].votes=local.G.votes.e=20;}
 if(action.effect.startsWith('cleanse')||action.effect.startsWith('purge'))for(const i of [0,1])for(const c of [f.r(i),f.l(i)]){S.grant(c,'weakness',1,2,2,i);S.grant(c,'wound',1,2,2,i);S.grant(c,'strength',1,2,2,i);S.grant(c,'precision',1,2,2,i);c.guard=true;}
 const target=action.target==='self'?f.r(0).uid:action.target==='rival'?f.r(1).uid:undefined;
 const result=E.apply(f.remote,0,{type:'action',id:action.id,target},0,()=>.1);a.equal(local.useLocalAction('p','spell',target),true);a.equal(result.players[0].tdp,local.G.tdp.p);a.equal(result.players[0].hand.length,local.G.hand.p.length);
 for(const i of [0,1]){const side=i?'e':'p';a.equal(result.players[i].field.length,local.G.field[side].length);for(let j=0;j<result.players[i].field.length;j++){const r=result.players[i].field[j],l=local.G.field[side][j];a.equal(r.hp,l.h);a.equal(r.guard,l.guard);a.equal(E.power(result,i,r),local.battleZasca(side,l));const states=c=>S.states(c).map(({kind,value,expires})=>({kind,value,expires}));a.deepEqual(states(r),JSON.parse(JSON.stringify(states(l))));}}
});
test('all actions have exclusive art and distinct mechanical signatures',()=>{
 const art=require('../js/action-art.js'),positions=new Set(),mechanics=new Set();for(const c of A.cards){const r=art[c.id];a.ok(r,c.id);a.ok(fs.existsSync(r.url),r.url);const key=[r.url,r.column,r.row].join(':');a.ok(!positions.has(key),c.id);positions.add(key);const signature=JSON.stringify([c.effect,c.target,c.status||null,['confused','precision'].includes(c.status)?null:c.value,c.duration||null,!!c.oncePerBattle]);a.ok(!mechanics.has(signature),c.id);mechanics.add(signature);}a.equal(positions.size,92);
});
test('state loops follow real status expiry, purging, guards and authoritative buff adapters',()=>{
 const c={};for(const kind of Object.keys(S.definitions)){S.grant(c,kind,1,1,0,0);a.ok(Visuals.markup(c,null,1000).includes('data-statefx="'+kind+'"'));S.end(c,1);a.deepEqual(Visuals.kinds(c),[]);}c.guard=true;a.ok(Visuals.kinds(c).includes('guard'));S.purge(c,1);a.deepEqual(Visuals.kinds(c),[]);a.ok(Visuals.kinds({visualBuffs:[{value:1}]}).includes('strength'));a.match(fs.readFileSync('css/action-state-visuals.css','utf8'),/prefers-reduced-motion/);
});
test('both events retain independent five deliveries, separate receipts and all unopened pack contents',()=>{
 const now=Date.parse('2026-11-07T12:00:00Z'),actor='account',payload=Economy.starter('HC-11111111-1111-4111-8111-111111111111',now,()=>.25);let state={accounts:{[actor]:{revision:0,payload}},market:{players:[],listings:[],trades:[],quotes:[],receipts:[]}};const initial=payload.profile.fs;
 function claim(event,grant){const result=Economy.operate(state,actor,{type:'expansion-claim',event:event.id,grant},now,()=>.25);state.market=result.market;for(const update of result.updates)state.accounts[update.userId]={revision:update.revision+1,payload:update.payload};return result;}
 claim(Events,'fs');const oldReceipt=JSON.stringify(state.accounts[actor].payload.profile.expansionEvent);a.equal(Events.review.pending(state.accounts[actor].payload.profile,now).length,5);
 for(const event of Events.all)for(const grant of event.grants){if(event.id===Events.id&&grant.key==='fs')continue;claim(event,grant.key);a.throws(()=>claim(event,grant.key),/reclamad/);}
 const profile=state.accounts[actor].payload.profile;a.equal(profile.fs,initial+20000);a.equal(Events.pending(profile,now).length,0);a.equal(Events.review.pending(profile,now).length,0);a.equal(state.market.packOpenings.length,8);a.equal(state.market.packOpenings.flatMap(r=>r.packs).length,24);a.ok(state.market.packOpenings.every(r=>r.opened.every(v=>!v)));a.equal(new Set(state.market.packOpenings.map(r=>r.id)).size,8);a.equal(JSON.parse(oldReceipt).claimed[0],'fs');
 const newcomer=Economy.starter('HC-22222222-2222-4222-8222-222222222222',Date.parse('2026-12-01T00:00:00Z'),()=>.25);a.equal(Events.review.pending(newcomer.profile,now).length,0);
});
test('old matches display their frozen action costs and rules; Collection still shows the current edition',()=>{
 const Frozen=require('../_dev/online/legacy-v32.cjs'),old=require('../js/action-data-v32.js'),{loadBattle}=require('./helpers/battle.cjs');a.deepEqual(old.cards,JSON.parse(JSON.stringify(Frozen.frozenModule('js/action-cards.js').cards)));
 const c=loadBattle(),id='apunte-oportuno';c.SCREEN='battle';c.G.authoritative=true;c.G.catalogVersion='balance-v3';a.equal(c.battleActionDefinition(id).cost,old.byId[id].cost);a.equal(c.battleActionDefinition(id).effect,old.byId[id].effect);a.match(c.actionRulesHTML(c.BYID[id]),new RegExp(old.byId[id].text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));c.SCREEN='coleccion';a.equal(c.battleActionDefinition(id).effect,A.byId[id].effect);a.notEqual(old.byId[id].effect,A.byId[id].effect);
});
