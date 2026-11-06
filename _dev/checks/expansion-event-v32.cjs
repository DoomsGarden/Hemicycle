'use strict';
const a=require('node:assert/strict'),crypto=require('node:crypto'),E=require('../online/economy.cjs'),Gift=require('../../js/expansion-event.js'),Appearance=require('../../js/cosmetic-entitlements.js');
const november=Date.parse('2026-11-30T22:59:59.999Z'),cutoff=Date.parse('2026-11-30T23:00:00Z'),actor=crypto.randomUUID();
function context(now){return {market:{players:[],listings:[],trades:[],quotes:[],receipts:[]},accounts:{[actor]:{revision:1,payload:E.starter('HC-'+crypto.randomUUID(),now,()=>.4)}}};}
function commit(s,command,now=november){const n=E.operate(s,actor,command,now,()=>.4);return {state:{...s,market:n.market,accounts:{...s.accounts,...Object.fromEntries(n.updates.map(u=>[u.userId,{revision:u.revision+1,payload:u.payload}]))}},result:n.result};}
let s=context(november),profile=s.accounts[actor].payload.profile;
a.equal(Gift.pending(profile,november).length,5);a.equal(Gift.pending(profile,cutoff+86400000).length,5);
a.equal(Gift.eligible(context(cutoff).accounts[actor].payload.profile,cutoff),false);
a.throws(()=>commit(context(cutoff),{type:'expansion-claim',grant:'fs'},cutoff),/periodo/);
const original=structuredClone(s),fs=profile.fs,total=profile.album.length+(profile.actionAlbum||[]).length;
for(const grant of Gift.grants){const n=commit(s,{type:'expansion-claim',grant:grant.key});s=n.state;if(grant.fs)a.equal(n.result.fs,10000);else{a.equal(n.result.packs.length,3);a.ok(n.result.packs.every(ids=>ids.length===5&&ids.every(id=>E.catalog.some(c=>c.id===id))));}a.throws(()=>commit(s,{type:'expansion-claim',grant:grant.key}),/ya se ha reclamado/);}
profile=s.accounts[actor].payload.profile;a.equal(profile.fs,fs+10000);a.equal(profile.album.length+profile.actionAlbum.length,total+60);a.equal(Gift.pending(profile,november).length,0);
// A restored payload cannot clear the durable account ledger, even after the
// ordinary 100-entry market history has been pruned.
s.accounts[actor].payload=structuredClone(original.accounts[actor].payload);s.market.receipts=[];
for(const g of Gift.grants)a.throws(()=>commit(s,{type:'expansion-claim',grant:g.key}),/ya se ha reclamado/);
s=commit(s,{type:'maintenance'}).state;a.equal(Gift.pending(s.accounts[actor].payload.profile,november).length,0);
a.equal(Object.keys(s.market.expansionClaims).length,5);
s=commit(s,{type:'expansion-notice'}).state;s.accounts[actor].payload.profile.expansionEvent={id:Gift.id,announced:false,claimed:[]};s=commit(s,{type:'maintenance'}).state;a.equal(Gift.state(s.accounts[actor].payload.profile).announced,true);
// A guest receipt imported on initial account linking is copied into the ledger.
let imported=context(november);Gift.claim(imported.accounts[actor].payload.profile,'fs',november);imported=commit(imported,{type:'maintenance'}).state;a.ok(Object.hasOwn(imported.market.expansionClaims,Gift.id+'/'+actor+'/fs'));
a.throws(()=>commit(original,{type:'expansion-claim',grant:'__proto__'}),/no está disponible/);
a.equal(Appearance.cutoff,cutoff);
console.log('PASS expansion event: Madrid cutoff, 5 independent deliveries, 10,000 FS, 12 packs/60 cards, eligibility after November, repeated claims denied, old backups/history pruning cannot reset account receipts, guest import receipts and notice retained.');
