'use strict';
// Herramienta de desarrollo: nunca es importada por el cliente ni el servidor publicado.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../../..');
function createReserve(config){
const proposal={cards:config.cards},phrases=config.phrases;
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const currentCatalog=require('../../../js/orator-catalog.js'),currentEffects=require('../../../js/basic-effects.js');
const sourceCards=proposal.cards.map(c=>{const d=currentCatalog.docs.find(d=>d.k===c.doctrine),b=currentEffects.definition(c.ability);return {...c,abilityName:b.name,basicEffect:{id:c.ability,name:b.name,description:b.description,target:b.target,polarity:b.polarity},passive:{id:d.k,name:d.n,description:d.d,activation:'Doctrina del líder, con los requisitos y contrarrestos actuales.'},q:phrases.cromos.find(q=>q.id===c.id).frases.map(q=>q.frase)};});
const policy=Object.freeze({id:config.id,state:'reserved',enabled:false,publicCatalogSize:120,reservedCount:sourceCards.length,previewCatalogSize:120+sourceCards.length,pendingWardrobeVariants:sourceCards.filter(c=>c.wardrobeReview?.status==='pending').length,pendingPortraits:sourceCards.filter(c=>c.art.status==='pending').length});
const artAssets=Object.fromEntries(sourceCards.filter(c=>c.art.status!=='pending').map(c=>[(c.bundleId||config.id)+'-'+path.basename(c.art.sheet),path.resolve(c.artRoot,c.art.sheet)]));
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
 for(const c of sourceCards)context[c.id]={id:c.id,name:c.name,extract:'La ilustración representa su etapa '+c.depictedPeriod+' en '+c.affiliation.referenceGroup+'. Las frases proceden de intervenciones parlamentarias o declaraciones propias atribuidas por la fuente indicada y pueden corresponder a otra etapa, indicada en cada referencia.',source:c.reference.profile,consulted:config.consulted,attribution:(c.institution||'Congreso de los Diputados')+' · síntesis editorial propia',license:'Hechos sintetizados; texto propio'};
 const contextJS='(function(root,data){if(typeof module==="object"&&module.exports)module.exports=data;else root.HemicycleOratorContext=data;})(typeof globalThis!=="undefined"?globalThis:this,'+JSON.stringify(context)+');\n';
 const current=require('../../../docs/fuentes-frases-actuales.json');
 const registry={...current,reservaConsultado:phrases.consultado,alcance:'Vista interna: catálogo activo más reserva. No publicado. Las referencias anteriores conservan su fecha de consulta; las nuevas indican comprobado_el.',cromos:[...current.cromos,...phrases.cromos]};
 return {policy,files:{'js/orator-catalog.js':catalog,'js/basic-effects.js':effects,'js/legendary-mastery.js':mastery,'js/orator-context.js':contextJS,'docs/fuentes-frases-actuales.json':JSON.stringify(registry,null,2)+'\n'},cards:entries};
}
function evaluate(source,relative){const sandbox={module:{exports:{}},require:id=>require(path.resolve(root,'js',id))};vm.runInNewContext(source,sandbox,{filename:relative,timeout:2000});return sandbox.module.exports;}
function preview(){const compiled=compile();return {...compiled,catalog:evaluate(compiled.files['js/orator-catalog.js'],'catalog-preview'),effects:evaluate(compiled.files['js/basic-effects.js'],'effects-preview'),mastery:evaluate(compiled.files['js/legendary-mastery.js'],'mastery-preview')};}
function previewIndex(){
 const art=Object.fromEntries(sourceCards.map(c=>[c.id,c.art.status==='pending'?{pending:true}:{url:'__reserve/'+(c.bundleId||config.id)+'-'+path.basename(c.art.sheet),position:c.art.position}]));
 let html=read('index.html');
 const marker='function artTag(id,nm,allowGold,allowConfetti,edition){';
 const replacement=marker+'\n var reservedArt='+JSON.stringify(art)+'[id];if(reservedArt&&reservedArt.pending)return \'<span class="reserved-art-pending" style="position:absolute;inset:0;display:grid;place-items:center;background:#182238;color:#e7cf89;font-size:14px;padding:20px;text-align:center">Arte pendiente</span>\';if(reservedArt)return \'<span class="reserved-portrait" style="position:absolute;inset:0;display:block;background-size:200% 200%;background-image:url(\'+reservedArt.url+\');background-position:\'+reservedArt.position+\'"></span>\';';
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
 fs.writeFileSync(path.join(out,'RESERVED.json'),JSON.stringify({...policy,releaseReady:false,requiredBeforeActivation:[...(policy.pendingWardrobeVariants?['Revisar los '+policy.pendingWardrobeVariants+' cambios de vestuario pendientes']:[]),...(policy.pendingPortraits?['Completar y revisar los '+policy.pendingPortraits+' retratos pendientes']:[]),'Nueva versión de reglas y preservación de reproducciones offline históricas','Publicación coordinada de cliente, backend, fuentes y arte','Pruebas completas de progresión, economía, sobres, maestría y PWA sobre la versión activada']},null,2));
 return out;
}
return {policy,compile,preview,previewIndex,emit,sourceCards,artAssets};
}
module.exports={createReserve};
