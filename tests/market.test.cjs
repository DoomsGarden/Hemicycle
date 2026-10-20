const {test}=require('node:test'),assert=require('node:assert/strict');
const {cards,packs}=require('../_dev/market/catalog.cjs');
const {create,rarities}=require('../js/market-rules.js');
const rules=create(cards,packs),byR=r=>cards.filter(c=>c.r===r),id=r=>byR(r)[0].id;

test('market prices reflect pack values, cheap machine resale, and at least 20% more between players',()=>{
 assert.deepEqual(rules.prices,{comun:{base:75,machine:15,player:18},raro:{base:150,machine:30,player:36},especial:{base:350,machine:70,player:84},legendario:{base:580,machine:116,player:140}});
 for(const p of Object.values(rules.prices)){assert.ok(p.player>=Math.ceil(p.machine*1.2));assert.equal(p.machine,p.base*.2);assert.equal(p.player,Math.ceil(p.machine*1.2));}
 const base=r=>rules.prices[r].base,machine=r=>rules.prices[r].machine;
 assert.ok(4.8*base('comun')+.2*base('raro')<=400);
 assert.equal(4.75*base('raro')+.25*base('especial'),800);
 assert.ok(base('legendario')+base('especial')+3*base('raro')<=1500);
 assert.equal(5*base('legendario'),2900);
 assert.ok(4*machine('comun')+machine('raro')<400);
 assert.ok(4*machine('raro')+machine('especial')<800);
 assert.ok(machine('legendario')+machine('especial')+3*machine('raro')<1500);
 assert.ok(5*machine('legendario')<2900);
});

test('all 16 rarity pairings allow only equivalent or adjacent trades with the correct surcharge',()=>{
 for(const [a,ar]of rarities.entries())for(const [b,br]of rarities.entries()){
  const give=[{id:id(ar),quantity:1}],receive=[{id:id(br),quantity:1}];
  if(Math.abs(a-b)>1){assert.throws(()=>rules.trade(give,receive),/consecutivas/);continue;}
  const q=rules.trade(give,receive),fee=Math.ceil(Math.abs(rules.prices[ar].machine-rules.prices[br].machine)*1.2);
  assert.equal(q.giveFS,a<b?fee:0);assert.equal(q.receiveFS,b<a?fee:0);assert.equal(q.fee,fee);
  if(a!==b){
   const lower=a<b?give:receive;lower[0].quantity=2;
   const two=rules.trade(give,receive);assert.equal(two.kind,'two-for-one');assert.equal(two.giveFS+two.receiveFS,0);
  }
 }
});

test('trade bundles normalize repeated IDs, permit two distinct lower cards, and reject mixed or unequal bundles',()=>{
 const [c1,c2]=byR('comun'),r=byR('raro')[0];
 assert.equal(rules.trade([{id:c1.id,quantity:1},{id:c2.id,quantity:1}],[{id:r.id,quantity:1}]).kind,'two-for-one');
 assert.deepEqual(rules.trade([{id:c1.id,quantity:1},{id:c1.id,quantity:1}],[{id:r.id,quantity:1}]).give,[{id:c1.id,quantity:2}]);
 assert.equal(rules.trade([{id:c1.id,quantity:2}],[{id:c2.id,quantity:2}]).fee,0);
 assert.throws(()=>rules.trade([{id:c1.id,quantity:2}],[{id:c2.id,quantity:1}]),/equivalente/);
 assert.throws(()=>rules.trade([{id:c1.id,quantity:1},{id:r.id,quantity:1}],[{id:r.id,quantity:1}]),/misma rareza/);
 assert.throws(()=>rules.trade([{id:c1.id,quantity:3}],[{id:r.id,quantity:1}]),/dos inferiores/);
});

test('market rejects invalid quantities, IDs, targets and unsafe amounts',()=>{
 for(const q of [0,-1,1.5,NaN,Infinity,'1',null,1000000001])assert.throws(()=>rules.sale(id('comun'),q,'machine'));
 for(const badId of ['missing','__proto__','constructor'])assert.throws(()=>rules.sale(badId,1,'machine'),/Cromo/);
 assert.throws(()=>rules.sale(id('comun'),1,'free'));
 assert.throws(()=>rules.sale(id('legendario'),1000000000,'player'),/Importe/);
});

test('local machine sales preserve the last copy, other progress and idempotency without mutating the input',()=>{
 const card=id('comun'),other=id('raro'),profile={fs:200,elo:700,w:4,album:[card,card,card,other],dtWins:9,dtGoldUnlocked:false};
 const before=JSON.stringify(profile),after=rules.machineSale(profile,card,2,'operation-001');
 assert.equal(JSON.stringify(profile),before);assert.equal(after.fs,230);assert.equal(after.album.filter(c=>c===card).length,1);
 assert.equal(after.elo,700);assert.equal(after.dtWins,9);assert.equal(after.dtGoldUnlocked,false);
 assert.equal(rules.machineSale(after,card,2,'operation-001'),after);
 assert.throws(()=>rules.machineSale(after,card,1,'operation-001'),/otra venta/);
 assert.throws(()=>rules.machineSale(after,card,1,'operation-002'),/Conservas/);
 assert.throws(()=>rules.machineSale(profile,other,1,'operation-003'),/Conservas/);
 assert.equal(rules.duplicates(after.album,other),0);
});
