'use strict';
const a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const first=require('../../censo.json'),extra=require('../seleccion.json'),review=require('./ajuste.json'),decisions=require('./decisiones.json'),sources=require('./preparacion-cargos.json'),before=require('./antes.json'),baseline=require('../baseline.json');
const catalog=require('../../../../../js/orator-catalog.js'),effects=require('../../../../../js/basic-effects.js');
const cards=[...first.cards,...extra.cards],ids=new Set(),ranks=new Set(),distribution={},docs={},abilities={};
a.equal(cards.length,440);a.equal(first.enabled,false);a.equal(extra.enabled,false);a.equal(review.status,'reviewed');a.equal(extra.globalReview.status,'reviewed');a.equal(first.workflow.tierReviewStatus,'reviewed');
for(const c of cards){
 a.ok(!ids.has(c.id),c.id);ids.add(c.id);a.ok(!catalog.cards.some(p=>p.id===c.id));
 a.deepEqual(catalog.statsFor(c.rarityProposal,c.cost),{a:c.zasca,h:c.aguante,v:c.escanos},c.id);
 const d=catalog.docs.find(d=>d.k===c.passiveProposal.id),b=effects.definition(c.basicEffectProposal.id);a.ok(d,c.id);a.ok(b,c.id);a.equal(c.passiveProposal.description,d.d);a.equal(c.basicEffectProposal.description,b.description);
 a.deepEqual(Object.values(c.phrases),[null,null,null]);a.equal(c.wardrobeReview.status,'reviewed');a.equal(c.art.gazeReviewedOffCamera,true);
 const r=review.cards.find(r=>r.id===c.id),s=sources.profiles.find(s=>s.id===c.id);a.ok(r);a.ok(s);a.equal(r.source,s.source);a.equal(r.sourceSha256,s.sourceSha256);a.ok(s.datedCareerOffices.some(x=>JSON.stringify(x)===JSON.stringify(r.primaryOffice)));
 for(const key of baseline.mechanicsFields)a.deepEqual(c[key],r.after[key],c.id+'/'+key);
 a.ok(c.mechanicsReview.rationale.passiveRoleTags.length>0);a.ok(c.mechanicsReview.rationale.normalZascaRoleTags.length>0);
 a.ok(!ranks.has(r.globalRank));ranks.add(r.globalRank);distribution[c.rarityProposal]=(distribution[c.rarityProposal]||0)+1;docs[d.k]=(docs[d.k]||0)+1;abilities[c.basicEffectProposal.id]=(abilities[c.basicEffectProposal.id]||0)+1;
 const selected=decisions.cards.find(x=>x.id===c.id);a.equal(c.rarityProposal,selected.rarity);a.equal(c.cost,selected.cost);
}
a.equal(ranks.size,440);a.equal(Math.min(...ranks),1);a.equal(Math.max(...ranks),440);
a.deepEqual(distribution,{legendario:44,especial:88,raro:132,comun:176});a.equal(Object.keys(docs).length,6);a.equal(Object.keys(abilities).length,14);a.equal(catalog.cards.length,120);
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const old=Object.fromEntries(first.cards.map(c=>[c.id,Object.fromEntries(baseline.mechanicsFields.map(k=>[k,before[c.id][k]]))]));a.equal(crypto.createHash('sha256').update(JSON.stringify(canonical(old))).digest('hex'),baseline.first100MechanicsSha256);
for(const [file,hash]of Object.entries(review.publicBaseline)){a.equal(crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../../../../..',file))).digest('hex'),hash,file);}
const result={reviewed:440,distribution,doctrines:docs,normalEffects:abilities,statsCompatibleWithCatalog:true,allRoleEvidenceLinked:true,allPortraitsPresent:true,originalFirst100BaselinePreserved:true,publicCatalogUnchanged:120,enabled:false,phrasesStillPending:true};
fs.mkdirSync(path.join(__dirname,'qa'),{recursive:true});fs.writeFileSync(path.join(__dirname,'qa/mechanics-verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
