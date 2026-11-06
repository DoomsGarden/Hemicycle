'use strict';
// Reserva interna. Ningún archivo publicado importa este preparador.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {createReserve}=require('../reserva-espana/create-reserve.cjs');
const registry=require('./cloture-frases/frases-validees.json'),qa=require('./cloture-frases/qa/verification.json');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,file))).digest('hex');
assert.equal(registry.enabled,false);assert.equal(qa.status,'passed');assert.equal(qa.profilesReviewed,440);assert.equal(qa.profilesPending,0);
for(const [field,file]of Object.entries({registrySha256:'frases-validees.json',validatorSha256:'verify-closure.py',attributionParserSha256:'attribution.py',publicationDateParserSha256:'publication.py',legacyAssemblyParserSha256:'legacy_assembly.py',blogSourceParserSha256:'blog_source.py',homonymSourcePolicySha256:'homonym-source-policy.json'}))assert.equal(qa[field],sha('cloture-frases/'+file),'Verificación pendiente de actualizar: '+file);
const reviewed=new Map(registry.cards.map(c=>[c.id,c]));
const cards=[...require('./censo.json').cards,...require('./ampliacion-340/seleccion.json').cards.map(c=>({...c,art:{...c.art,sheet:'ampliacion-340/'+c.art.sheet}}))].map(c=>{
 assert.ok(reviewed.has(c.id));assert.equal(c.art.gazeReviewedOffCamera,true);assert.equal(c.mechanicsStatus,'reviewed_jointly_440_reserved_not_activated');
 return {...c,country:'FR',rarity:c.rarityProposal,doctrine:c.passiveProposal.id,ability:c.basicEffectProposal.id,bundleId:'francia',artRoot:__dirname};
});
const types={normal:'ataque_normal',strong:'ataque_fuerte',support:'defensa_curacion'};
const phrases={consultado:registry.date,cromos:registry.cards.map(c=>({id:c.id,nombre:c.name,frases:c.candidates.map(q=>({tipo:types[q.action],frase:q.textES,original:q.originalFR,fuente:q.source,tituloFuente:q.sourceTitle,idiomaOriginal:'fr',idiomaTraduccion:'es',traduccionPropia:true,tratamiento:'traduccion_de_fragmento',comprobado_en:q.sourceCheck,comprobado_el:q.reviewedOn,fechaIntervencion:q.spokenOn||null,fechaPublicacion:q.publishedOn||null,sourceSha256:q.sourceSha256,contexto:c.contextSummaryES,nota:q.adaptation.note}))}))};
const reserve=createReserve({id:'reserva-francia',country:'FR',consulted:registry.date,cards,phrases,contextForCard(c){
 const p=c.mechanicsReview.primaryOffice;
 return {id:c.id,name:c.name,extract:'La revisión de mecánicas toma como referencia '+p.roleFR+' ('+p.start+'–'+p.end+'). El retrato es una interpretación artística. Los fragmentos y traducciones españolas conservan sus propias fuentes y fechas, incluidas publicaciones escritas, y pueden corresponder a otra etapa.',source:c.mechanicsReview.source,consulted:registry.date,attribution:'Reserva francesa · síntesis editorial propia',license:'Hechos sintetizados; texto propio'};
}});
module.exports=reserve;
if(require.main===module){const args=process.argv.slice(2);if(args.length!==2||args[0]!=='--preview')throw Error('Uso: node prepare.cjs --preview /tmp/hemicycle-reserva-francia');console.log('Reserva francesa interna generada en '+reserve.emit(args[1])+'. Continúa desactivada.');}
