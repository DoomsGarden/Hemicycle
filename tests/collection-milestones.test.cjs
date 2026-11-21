'use strict';
const {test}=require('node:test'),a=require('node:assert/strict');
const O=require('../js/objectives.js'),M=require('../js/collection-milestones.js'),P=require('../js/cosmetic-entitlements.js'),C=require('../_dev/online/frozen-v11/orator-catalog.js'),A=require('../js/action-cards.js');
const expanded=require('../js/orator-catalog.js').cards;
function oldProfile(){const p={w:0,l:0,elo:0,fs:0,album:C.cards.map(c=>c.id),actionAlbum:A.cards.map(c=>c.id),appearance:P.fresh(P.cutoff)};p.objectives=O.snapshot(p,C.cards);delete p.objectives.collectionCatalog;delete p.objectives.earnedCollection;return p;}
test('earned old percentage milestones remain visible and claimable after the catalog grows',()=>{
 const p=oldProfile(),rows=O.achievements(p,expanded),collection=rows.find(x=>x.id==='collection'),legends=rows.find(x=>x.id==='legendary');
 for(const step of [248,496,744,991])a.ok(collection.steps.includes(step));for(const step of [51,101])a.ok(legends.steps.includes(step));
 for(const [id,step,visual]of [['collection',248,{kind:'font',id:'editorial'}],['collection',496,{kind:'menu',id:'book'}],['collection',991,{kind:'mat',id:'imperial'}],['legendary',51,{kind:'back',id:'imperial'}],['legendary',101,{kind:'coin',id:'imperial'}]]){
  const result=O.claimAchievement(p,expanded,id,step);a.deepEqual(result.reward.cosmetics,[visual]);a.equal(result.reward.fs,50+step);p.objectives=result.state;P.grant(p,result.reward.cosmetics,P.cutoff);a.deepEqual(O.validate(p.objectives),p.objectives);a.throws(()=>O.claimAchievement(p,expanded,id,step),/no disponible/);
 }
 a.equal(p.objectives.collectionCatalog.total,1859);a.equal(p.objectives.collectionCatalog.legendary,187);
});
test('already claimed milestones stay claimed and previously owned styles are not granted twice',()=>{
 const p=oldProfile();p.objectives.claimed.push('collection/991','legendary/101');P.grant(p,[{kind:'mat',id:'imperial'},{kind:'coin',id:'imperial'}],P.cutoff);p.objectives=O.snapshot(p,expanded);
 a.ok(!M.earned(p.objectives,'collection',991));a.ok(!M.earned(p.objectives,'legendary',101));a.throws(()=>O.claimAchievement(p,expanded,'collection',991),/no disponible/);a.ok(P.owns(p,'mat','imperial'));a.deepEqual(P.grant(p,[{kind:'mat',id:'imperial'}]),[]);
});
test('a new-edition profile receives the new thresholds and cannot claim historical rewards',()=>{
 const p={w:0,l:0,elo:0,fs:0,album:C.cards.map(c=>c.id),actionAlbum:A.cards.map(c=>c.id),appearance:P.fresh(P.cutoff)};p.objectives=O.snapshot(p,expanded);
 const collection=O.achievements(p,expanded).find(x=>x.id==='collection');a.ok(!collection.steps.includes(248));a.ok(!collection.steps.includes(991));a.throws(()=>O.claimAchievement(p,expanded,'collection',991),/no disponible/);a.throws(()=>O.claimAchievement(p,expanded,'legendary',101),/no disponible/);a.deepEqual(O.claimAchievement(p,expanded,'collection',465).reward.cosmetics,[{kind:'font',id:'editorial'}]);
});
test('crossing an old threshold with a new-edition purchase does not retroactively earn the retired reward',()=>{
 const p=oldProfile();p.album=C.cards.slice(0,247).map(c=>c.id);p.actionAlbum=[];p.objectives.totals.collection=247;p.objectives.totals.legendary=0;
 // The post-purchase inventory grows, but the trusted previous snapshot was 247.
 p.album.push(expanded.at(-1).id);p.objectives=O.snapshot(p,expanded);a.ok(!M.earned(p.objectives,'collection',248));a.throws(()=>O.claimAchievement(p,expanded,'collection',248),/no disponible/);
});
test('pending collection entitlement context survives repeated snapshots and backup validation',()=>{
 const p=oldProfile();p.objectives=O.snapshot(p,C.cards);const before=JSON.stringify(M.earned(p.objectives,'collection',991));p.objectives=O.snapshot(p,expanded);p.objectives=O.snapshot(p,expanded);a.equal(JSON.stringify(M.earned(p.objectives,'collection',991)),before);a.equal(M.earned(O.validate(p.objectives),'collection',991).catalog.total,991);
});
test('malformed, duplicate, unearned and already claimed pending milestone records are rejected',()=>{
 const p=oldProfile();p.objectives=O.snapshot(p,C.cards);for(const change of [s=>s.collectionCatalog.total=-1,s=>s.earnedCollection.push(s.earnedCollection[0]),s=>s.earnedCollection[0].id='wins',s=>s.earnedCollection[0].catalog.legendary=999999,s=>s.earnedCollection[0].step=123456,s=>s.totals.collection=0,s=>s.claimed.push(s.earnedCollection[0].id+'/'+s.earnedCollection[0].step)]){const state=structuredClone(p.objectives);change(state);a.throws(()=>O.validate(state),/hito|Hito|Catálogo/);}
});
