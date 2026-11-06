'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../../../..'),fr=path.resolve(__dirname,'../..'),extra=path.resolve(__dirname,'..');
const catalog=require(path.join(root,'js/orator-catalog.js')),effects=require(path.join(root,'js/basic-effects.js'));
const decisions=require('./decisiones.json'),first=JSON.parse(fs.readFileSync(path.join(fr,'censo.json'))),next=JSON.parse(fs.readFileSync(path.join(extra,'seleccion.json')));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const fields=['rarityProposal','cost','zasca','aguante','escanos','passiveProposal','basicEffectProposal'];
const save=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n');
const baselinePath=path.join(__dirname,'antes.json');
const current=[...first.cards,...next.cards];
const before=fs.existsSync(baselinePath)?JSON.parse(fs.readFileSync(baselinePath)):Object.fromEntries(current.map(c=>[c.id,Object.fromEntries(fields.map(k=>[k,c[k]??null]))]));
const protectedFiles=['js/orator-catalog.js','js/basic-effects.js','index.html','manifest.json','sw.js','docs/fuentes-frases-actuales.json','legal/documents.json'];
const passiveFits={
 representation:{verborrea:3,viperina:3,foco:2},finance:{verborrea:5,aforado:3},care:{foco:6,giro:3},justice:{aforado:6,guardia:3},security:{guardia:6,giro:4},
 parliament:{verborrea:3,viperina:4},culture:{foco:5,verborrea:3},territory:{giro:5,guardia:3},diplomacy:{aforado:4,verborrea:3,giro:2},executive:{guardia:3,verborrea:3,aforado:3,foco:2},continuity:{guardia:3}
};
const effectFits={
 representation:{surge:4,summon:4,tongue:3,acta:3,microphone:3},finance:{bank:6,fineprint:5,paperwork:4,fasttrack:3},care:{coffee:6,escort:5,shield:4},justice:{fineprint:6,acta:5,archive:4,shield:3,paperwork:3},security:{shield:6,escort:5,lane:4},
 parliament:{tongue:4,acta:4,lane:3,surge:3,summon:3},culture:{microphone:6,summon:4,surge:4,coffee:3},territory:{fasttrack:5,escort:4,coffee:3,summon:3},diplomacy:{fineprint:4,paperwork:4,fasttrack:4},executive:{surge:3,summon:4,bank:3,escort:3},continuity:{archive:4}
};
const passiveMeaning={verborrea:'Gestión de recursos y conducción del debate.',guardia:'Continuidad de la bancada y presión acumulada.',aforado:'Protección institucional y resistencia a la expulsión.',giro:'Respuesta defensiva y cobertura de la bancada.',foco:'Sostenimiento del líder y presencia en la votación.',viperina:'Control parlamentario y presión sobre el líder rival.'};
const effectMeaning={surge:'Impulso ofensivo tras una intervención.',coffee:'Recuperación y continuidad del orador.',archive:'Uso de antecedentes durante el debate.',tongue:'Reducir la respuesta del rival en la siguiente intervención.',shield:'Preparar una protección para el siguiente intercambio.',microphone:'Aumentar la exposición del rival en el siguiente intercambio.',acta:'Control del cómputo de votos del rival.',paperwork:'Introducir un coste procedimental al apoyo rival.',escort:'Cubrir a otro integrante de la bancada.',fineprint:'Revisar el detalle de una defensa.',bank:'Administrar el TdP sobrante entre turnos.',summon:'Reforzar la bancada con un orador del mazo.',fasttrack:'Agilizar la disponibilidad de apoyos.',lane:'Encauzar el siguiente objetivo del debate.'};
const doctrineIds=catalog.docs.map(d=>d.k),effectIds=Object.keys(effects.definitions),counts={passive:{},effect:{},pair:{},tierPassive:{},tierEffect:{}};
const target={legendario:44,especial:88,raro:132,comun:176};
function choose(ids,fits,tags,rarity,kind,passive){
 const options=ids.map((id,index)=>{
  const contributions=tags.map(tag=>({tag,weight:fits[tag]?.[id]||0})).filter(x=>x.weight);
  const fit=1+contributions.reduce((n,x)=>n+x.weight,0);
  const globalPenalty=4*(counts[kind][id]||0)/(440/ids.length);
  const tierMap=counts[kind==='passive'?'tierPassive':'tierEffect'];
  const tierPenalty=2*(tierMap[rarity+':'+id]||0)/(target[rarity]/ids.length);
  const pairPenalty=kind==='effect'?0.8*(counts.pair[passive+':'+id]||0):0;
  return {id,fit,score:fit-globalPenalty-tierPenalty-pairPenalty,index,contributions};
 }).filter(option=>option.contributions.length>0).sort((a,b)=>b.score-a.score||b.fit-a.fit||a.index-b.index);
 const best=options[0];counts[kind][best.id]=(counts[kind][best.id]||0)+1;
 const tierMap=counts[kind==='passive'?'tierPassive':'tierEffect'];tierMap[rarity+':'+best.id]=(tierMap[rarity+':'+best.id]||0)+1;
 return best;
}
assert.equal(decisions.cards.length,440);assert.equal(new Set(decisions.cards.map(c=>c.id)).size,440);
assert.equal(next.progress.generatedPortraits,340);assert.equal(first.researchProgress.generatedPortraits,100);
const wardrobe=require('./vestuario-revisado.json');assert.deepEqual(decisions.cards.filter(d=>d.rarity==='legendario').map(d=>d.id).sort(),wardrobe.maximumTier.map(d=>d.id).sort());for(const w of wardrobe.maximumTier)assert.equal(sha(path.join(fr,w.artFileRelativeToFrance)),w.sha256);
const changes=decisions.cards.map(d=>{
 const tags=d.tags.length?d.tags:['representation'];const p=choose(doctrineIds,passiveFits,tags,d.rarity,'passive'),e=choose(effectIds,effectFits,tags,d.rarity,'effect',p.id);
 counts.pair[p.id+':'+e.id]=(counts.pair[p.id+':'+e.id]||0)+1;
 const doc=catalog.docs.find(x=>x.k===p.id),ability=effects.definition(e.id),stats=catalog.statsFor(d.rarity,d.cost);
 return {id:d.id,name:d.name,globalRank:d.globalRank,criterion:d.criterion,legendaryCriterion:d.legendaryCriterion,source:d.source,sourceSha256:d.sourceSha256,primaryOffice:d.primaryOffice,bodyContextEvidence:d.bodyContextEvidence,
  before:before[d.id],after:{rarityProposal:d.rarity,cost:d.cost,zasca:stats.a,aguante:stats.h,escanos:stats.v,passiveProposal:{id:p.id,name:doc.n,description:doc.d,activation:'Doctrina del líder bajo los requisitos y contrarrestos existentes.'},basicEffectProposal:{id:e.id,name:ability.name,description:ability.description}},
  mechanicsRationale:{scope:'Decisión de diseño ficticia; no describe capacidades ni conductas reales.',passive:passiveMeaning[p.id],passiveRoleTags:p.contributions.map(x=>x.tag),normalZasca:effectMeaning[e.id],normalZascaRoleTags:e.contributions.map(x=>x.tag),diversity:'Preferencias por funciones documentadas, con penalización de concentraciones por tier y de combinaciones repetidas; sin asignación por tanda.'}};
});
const report={date:'2026-11-06',status:'reviewed',scope:440,enabled:false,distribution:target,method:decisions.method,costPolicy:'Variantes de coste del catálogo: curva de mazo dentro de cada rareza; no modifica las reglas públicas.',passiveDistribution:counts.passive,normalEffectDistribution:counts.effect,first100Changed:changes.filter(c=>before[c.id]?.rarityProposal!==null&&JSON.stringify(before[c.id])!==JSON.stringify(c.after)).length,publicCatalogSize:catalog.cards.length,publicBaseline:fs.existsSync(path.join(__dirname,'ajuste.json'))?require('./ajuste.json').publicBaseline:Object.fromEntries(protectedFiles.map(p=>[p,sha(path.join(root,p))])),cards:changes};
function applyCard(c){
 const row=changes.find(r=>r.id===c.id);assert.ok(row,c.id);Object.assign(c,row.after);
 c.mechanicsStatus='reviewed_jointly_440_reserved_not_activated';c.artStatus='generated_reviewed_reserved';
 c.mechanicsReview={date:report.date,scope:440,globalRank:row.globalRank,criterion:row.criterion,source:row.source,sourceSha256:row.sourceSha256,primaryOffice:row.primaryOffice,bodyContextEvidence:row.bodyContextEvidence,rationale:row.mechanicsRationale};
 c.wardrobeReview={status:'reviewed',date:report.date,criterion:c.rarityProposal==='legendario'?'Vestimenta formal institucional; revisión visual conjunta de los 44 máximos.':'Se conserva vestimenta profesional o informal compatible con la etapa y función representadas.'};
}
if(process.argv.includes('--apply')){
 if(!fs.existsSync(baselinePath))save(baselinePath,before);
 first.cards.forEach(applyCard);next.cards.forEach(applyCard);
 first.distribution=Object.fromEntries(Object.keys(target).map(t=>[t,first.cards.filter(c=>c.rarityProposal===t).length]));
 first.tierStatus='revisado_conjuntamente_440_reserva_sin_activar';first.workflow.tierReviewStatus='reviewed';first.workflow.tierReviewScope='440 nuevos franceses; tres activos conservados.';
 first.workflow.completedGlobalReview=first.workflow.laterGlobalReview||first.workflow.completedGlobalReview||['tiers','passives','normal_zasca_effects'];delete first.workflow.laterGlobalReview;first.workflow.tierReviewTrigger='Completado después de las 440 ilustraciones nuevas.';first.sourceBlocker='Arte de 440 nuevos franceses y mecánicas revisados. Pendiente el cierre editorial de las frases antes de integrar o activar la reserva.';
 first.workflow.nextStep='Cerrar la revisión de originales, traducciones y acciones de las frases antes de integrar y activar la reserva.';
 next.completedGlobalReview=next.laterGlobalReview||next.completedGlobalReview;delete next.laterGlobalReview;
 next.globalReview={status:'reviewed',date:report.date,scope:440,distribution:target,report:'revision-global/ajuste.json'};next.first100TiersChanged=true;next.status='artwork_complete_global_mechanics_reviewed_quotes_pending';
 next.cards.forEach(c=>{c.status='artwork_and_mechanics_reviewed_pending_quotes';});
 first.cards.find(c=>c.id==='sebastien-lecornu').historicalRoleSummary='Primer ministro nombrado en septiembre de 2025; ministerios de Ultramar y de las Fuerzas Armadas.';
 first.cards.find(c=>c.id==='richard-ferrand').historicalRoleSummary='Presidencia de la Asamblea Nacional, 2018–2022; nombramiento al frente del Consejo Constitucional en 2025.';
 decisions.status='reviewed';save(path.join(__dirname,'decisiones.json'),decisions);save(path.join(__dirname,'ajuste.json'),report);save(path.join(fr,'censo.json'),first);save(path.join(extra,'seleccion.json'),next);
}else if(process.argv.includes('--check')){
 const stored=require('./ajuste.json');assert.deepEqual(report,stored);for(const c of current)for(const k of fields)assert.deepEqual(c[k],changes.find(r=>r.id===c.id).after[k],c.id+'/'+k);
 for(const [file,digest]of Object.entries(stored.publicBaseline))assert.equal(sha(path.join(root,file)),digest,file);
}else if(!process.argv.includes('--preview'))throw Error('Uso: node review-mechanics.cjs --apply | --check | --preview');
console.log(JSON.stringify({scope:440,distribution:target,passives:counts.passive,effects:counts.effect,first100Changed:report.first100Changed,enabled:false}));
