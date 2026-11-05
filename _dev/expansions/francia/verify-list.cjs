'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),catalog=require('../../../js/orator-catalog.js'),effects=require('../../../js/basic-effects.js'),reserve=require('../reserva-espana/prepare.cjs'),data=require('./censo.json');
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const existing=new Set([...catalog.cards.map(c=>norm(c.n)),...reserve.sourceCards.map(c=>norm(c.name))]),ids=new Set,names=new Set;
assert.equal(data.enabled,false);assert.equal(data.cards.length,100);
for(const c of data.cards){
 assert.ok(!existing.has(norm(c.name)));assert.ok(!ids.has(c.id));assert.ok(!names.has(norm(c.name)));ids.add(c.id);names.add(norm(c.name));
 assert.deepEqual(catalog.statsFor(c.rarityProposal,c.cost),{a:c.zasca,h:c.aguante,v:c.escanos});
 assert.ok(effects.definition(c.basicEffectProposal.id));assert.ok(catalog.docs.some(d=>d.k===c.passiveProposal.id));assert.deepEqual(Object.values(c.phrases),[null,null,null]);
 assert.equal(c.referenceStatus,'perfil_consultado_contraste_integral_de_trayectoria_pendiente');assert.ok(!catalog.cards.some(x=>x.id===c.id));assert.ok(!reserve.sourceCards.some(x=>x.id===c.id));
}
const distribution=Object.fromEntries(['comun','raro','especial','legendario'].map(t=>[t,data.cards.filter(c=>c.rarityProposal===t).length]));assert.deepEqual(distribution,{comun:40,raro:30,especial:20,legendario:10});
const profiles=require('./perfiles-consultados.json').profiles,art=require('./primera-100/arte-generacion.json').sheets,originals=require('./frases-originales.json');
assert.equal(profiles.length,100);assert.equal(new Set(profiles.map(p=>p.id)).size,100);
for(const p of profiles){assert.equal(data.cards.find(c=>c.id===p.id).referenceToCheck,p.url);assert.match(p.htmlSha256,/^[a-f0-9]{64}$/);}
const generated=new Set;
for(const sheet of art){
 assert.equal(sheet.ids.length,4);assert.equal(sheet.references.length,4);
 const bytes=fs.readFileSync(require('node:path').join(__dirname,'primera-100',sheet.sheet));
 assert.equal(require('node:crypto').createHash('sha256').update(bytes).digest('hex'),sheet.sha256);
 assert.equal(bytes.toString('hex',0,8),'89504e470d0a1a0a');
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);assert.equal(width*4,height*3);assert.equal(width%2,0);assert.equal(height%2,0);
 sheet.ids.forEach((id,i)=>{assert.ok(ids.has(id));assert.ok(!generated.has(id));generated.add(id);assert.equal(sheet.references[i].id,id);assert.match(sheet.references[i].photoSha256,/^[a-f0-9]{64}$/);assert.equal(data.cards.find(c=>c.id===id).art.sheet,'primera-100/'+sheet.sheet);});
}
const bilingualCount=originals.cards.reduce((n,c)=>n+c.candidates.length,0);
assert.equal(data.researchProgress.generatedPortraits,generated.size);assert.equal(data.researchProgress.bilingualCandidates,bilingualCount);
assert.equal(data.researchProgress.finishedNewCards,0);assert.equal(data.researchProgress.integratedNewCards,0);
const result={candidates:100,distinctIds:ids.size,existingExcluded:data.existingExcluded.length,distribution,statistics:true,proposedEffects:true,proposedPassives:true,consultedProfiles:profiles.length,generatedProvisionalPortraits:generated.size,bilingualCandidates:bilingualCount,pendingFinalGamePhrases:300,integratedIntoGame:false};
fs.writeFileSync(require('node:path').join(__dirname,'qa/list-verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
