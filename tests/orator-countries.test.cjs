'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{cards}=require('../_dev/market/catalog.cjs');
test('every current orator has a unique ID, an explicit country and a local flag asset',()=>{
 const catalog=require('../js/orator-catalog.js');
 assert.equal(cards.length,catalog.cards.length);
 const ids=new Set(cards.map(card=>card.id));
 assert.equal(ids.size,cards.length);
 assert.deepEqual(ids,new Set(catalog.cards.map(card=>card.id)));
 for(const card of cards){
  assert.match(card.country,/^[A-Z]{2}$/,card.id);
  assert.ok(fs.existsSync('assets/flags/'+card.country.toLowerCase()+'.svg'),card.id);
 }
 assert.equal(new Set(cards.map(card=>card.country)).size,13);
});
test('country groups describe political representation, including people born elsewhere and EU officials',()=>{const byId=Object.fromEntries(cards.map(c=>[c.id,c]));for(const [id,code]of Object.entries({'boris-johnson':'GB','pablo-echenique':'ES','cayetana-alvarez-de-toledo':'ES','ursula-von-der-leyen':'DE','christine-lagarde':'FR','javier-milei':'AR','vladimir-putin':'RU'}))assert.equal(byId[id].country,code);});
