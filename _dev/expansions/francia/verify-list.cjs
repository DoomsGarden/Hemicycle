'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),catalog=require('../../../js/orator-catalog.js'),effects=require('../../../js/basic-effects.js'),reserve=require('../reserva-espana/prepare.cjs'),data=require('./censo.json');
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const existing=new Set([...catalog.cards.map(c=>norm(c.n)),...reserve.sourceCards.map(c=>norm(c.name))]),ids=new Set,names=new Set;
assert.equal(data.enabled,false);assert.equal(data.cards.length,100);
for(const c of data.cards){
 assert.ok(!existing.has(norm(c.name)));assert.ok(!ids.has(c.id));assert.ok(!names.has(norm(c.name)));ids.add(c.id);names.add(norm(c.name));
 assert.deepEqual(catalog.statsFor(c.rarityProposal,c.cost),{a:c.zasca,h:c.aguante,v:c.escanos});
 assert.ok(effects.definition(c.basicEffectProposal.id));assert.ok(catalog.docs.some(d=>d.k===c.passiveProposal.id));assert.deepEqual(Object.values(c.phrases),[null,null,null]);
 assert.equal(c.referenceStatus,'enlace_de_investigacion_no_consultado_no_cuenta_como_evidencia');assert.ok(!catalog.cards.some(x=>x.id===c.id));assert.ok(!reserve.sourceCards.some(x=>x.id===c.id));
}
const distribution=Object.fromEntries(['comun','raro','especial','legendario'].map(t=>[t,data.cards.filter(c=>c.rarityProposal===t).length]));assert.deepEqual(distribution,{comun:40,raro:30,especial:20,legendario:10});
const result={candidates:100,distinctIds:ids.size,existingExcluded:data.existingExcluded.length,distribution,statistics:true,proposedEffects:true,proposedPassives:true,unverifiedPhrases:300,integratedIntoGame:false};
fs.writeFileSync(require('node:path').join(__dirname,'qa/list-verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
