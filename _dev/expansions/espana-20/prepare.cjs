'use strict';
// Herramienta de desarrollo: nunca es importada por el cliente ni el servidor publicado.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../../..'),proposal=require('../../proposals/espana-1986-2026/propuesta.json'),phrases=require('./frases.json');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const sourceCards=proposal.cards.map(c=>({...c,q:phrases.cromos.find(q=>q.id===c.id).frases.map(q=>q.frase)}));
const policy=Object.freeze({id:'espana-20',state:'reserved',enabled:false,publicCatalogSize:120,previewCatalogSize:140});
function insert(source,marker,text){if(source.split(marker).length!==2)throw Error('Ha cambiado el punto de integración: '+marker);return source.replace(marker,text+'\n'+marker);}
function compile(){
 const active=require('../../../js/orator-catalog.js'),abilities=require('../../../js/basic-effects.js');
 const ids=new Set(active.cards.map(c=>c.id));
 for(const c of sourceCards){
  if(ids.has(c.id))throw Error('Persona duplicada: '+c.id);ids.add(c.id);
  const stats=active.statsFor(c.rarity,c.cost);
  if(stats.a!==c.zasca||stats.h!==c.aguante||stats.v!==c.escanos||!abilities.definition(c.ability))throw Error('Estadísticas o habilidad incompatibles: '+c.id);
 }
 const entries=sourceCards.map(c=>({id:c.id,n:c.name,r:c.rarity,pa:c.doctrine,country:'ES',c:c.cost,a:c.zasca,h:c.aguante,v:c.escanos,q:c.q}));
 const add=JSON.stringify(entries)+'.forEach(function(c){CARDS.push(c);BYID[c.id]=c;ROSTER[c.pa][c.r].push(c.n);QBESP[c.id]=c.q.slice();CARD_COUNTRIES[c.id]=c.country;COUNTRY_ROSTER.ES.push(c.id);});';
 const catalog=insert(read('js/orator-catalog.js'),'CARDS.sort(',add);
 const effects=insert(read('js/basic-effects.js'),'var assignments={};',JSON.stringify(sourceCards.map(c=>({id:c.id,ability:c.ability})))+'.forEach(function(c){groups[c.ability].push(c.id);});');
 const legends=JSON.stringify(sourceCards.filter(c=>c.rarity==='legendario').map(c=>c.id));
 // Append eligible IDs before freezing the list; historic runtime files stay untouched.
 const mastery=read('js/legendary-mastery.js').replace(']),FINAL=250;','].concat('+legends+')),FINAL=250;');
 if(mastery===read('js/legendary-mastery.js'))throw Error('Ha cambiado maestría');
 const context={...require('../../../js/orator-context.js')};
 for(const c of sourceCards)context[c.id]={id:c.id,name:c.name,extract:'La ilustración representa su etapa '+c.depictedPeriod+' en '+c.affiliation.referenceGroup+'. Las frases proceden de intervenciones parlamentarias oficiales y pueden corresponder a otra etapa, indicada en cada referencia.',source:c.reference.profile,consulted:'2026-11-04',attribution:'Congreso de los Diputados · síntesis editorial propia',license:'Hechos sintetizados; texto propio'};
 const contextJS='(function(root,data){if(typeof module==="object"&&module.exports)module.exports=data;else root.HemicycleOratorContext=data;})(typeof globalThis!=="undefined"?globalThis:this,'+JSON.stringify(context)+');\n';
 const current=require('../../../docs/fuentes-frases-actuales.json');
 const registry={...current,reservaConsultado:phrases.consultado,alcance:'Vista interna: catálogo activo más reserva. No publicado. Las referencias anteriores conservan su fecha de consulta; las nuevas indican comprobado_el.',cromos:[...current.cromos,...phrases.cromos]};
 return {policy,files:{'js/orator-catalog.js':catalog,'js/basic-effects.js':effects,'js/legendary-mastery.js':mastery,'js/orator-context.js':contextJS,'docs/fuentes-frases-actuales.json':JSON.stringify(registry,null,2)+'\n'},cards:entries};
}
function evaluate(source,relative){const sandbox={module:{exports:{}},require:id=>require(path.resolve(root,'js',id))};vm.runInNewContext(source,sandbox,{filename:relative,timeout:2000});return sandbox.module.exports;}
function preview(){const compiled=compile();return {...compiled,catalog:evaluate(compiled.files['js/orator-catalog.js'],'catalog-preview'),effects:evaluate(compiled.files['js/basic-effects.js'],'effects-preview'),mastery:evaluate(compiled.files['js/legendary-mastery.js'],'mastery-preview')};}
function previewIndex(){
 const art=Object.fromEntries(sourceCards.map(c=>[c.id,{url:'__reserve/'+path.basename(c.art.sheet),position:c.art.position}]));
 let html=read('index.html');
 const marker='function artTag(id,nm,allowGold,allowConfetti,edition){';
 const replacement=marker+'\n var reservedArt='+JSON.stringify(art)+'[id];if(reservedArt)return \'<span class="reserved-portrait" style="position:absolute;inset:0;display:block;background-size:200% 200%;background-image:url(\'+reservedArt.url+\');background-position:\'+reservedArt.position+\'"></span>\';';
 if(!html.includes(marker))throw Error('Ha cambiado el render del retrato');
 html=html.replace(marker,replacement).replace("if('serviceWorker' in navigator){navigator.serviceWorker.register", "if(false){navigator.serviceWorker.register");
 html=html.replace('function boot(){','window.ReservePreview={render:function(id){return cromoHTML(BYID[id],{owned:true});}};function boot(){');
 return html.replace('<title>', '<title>RESERVA INTERNA · ');
}
function emit(destination){
 const out=path.resolve(destination);
 // An internal overlay cannot overwrite a public checkout or masquerade as a production release.
 if(!out.startsWith('/tmp/')&&!out.startsWith(path.join(root,'_dev')+path.sep))throw Error('La reserva solo se materializa en /tmp o _dev.');
 const data=compile();
 for(const [file,source]of Object.entries(data.files)){const target=path.join(out,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,source);}
 fs.writeFileSync(path.join(out,'RESERVED.json'),JSON.stringify({...policy,releaseReady:false,requiredBeforeActivation:['Nueva versión de reglas y preservación de reproducciones offline históricas','Publicación coordinada de cliente, backend, fuentes y arte','Pruebas completas de progresión, economía, sobres, maestría y PWA sobre la versión activada']},null,2));
 return out;
}
module.exports={policy,compile,preview,previewIndex,emit,sourceCards};
if(require.main===module){const args=process.argv.slice(2);if(args.length!==2||args[0]!=='--preview')throw Error('Uso: node prepare.cjs --preview /tmp/hemicycle-es20');console.log('Overlay interno generado en '+emit(args[1])+'. No activa la ampliación.');}
