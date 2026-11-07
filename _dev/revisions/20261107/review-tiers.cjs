'use strict';
const fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'../../..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8')),before=read('_dev/revisions/20261107/catalog-before.json'),art=read('_dev/revisions/20261107/art-before.json'),context=require('../../../js/orator-context.js');
const spanish=require('../../expansions/reserva-espana/batches.cjs').flatMap(b=>read(path.relative(root,path.resolve(root,'_dev/expansions/reserva-espana',b.proposal))).cards),es=new Map(spanish.map(c=>[c.id,c])),senate=new Map(read('_dev/expansions/espana-20/senado/censo.json').personas.map(p=>[p.catalogo?.id,p]));
const french=read('_dev/expansions/francia/ampliacion-340/revision-global/preparacion-cargos.json').profiles,fr=new Map(french.map(c=>[c.id,c])),frFirst=new Map(read('_dev/expansions/francia/censo.json').cards.map(c=>[c.id,c]));
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const nationalHeads=new Set(('adolfo-suarez leopoldo-calvo-sotelo jose-luis-rodriguez-zapatero jose-maria-aznar felipe-gonzalez joe-biden justin-trudeau nicolas-maduro andres-manuel-lopez-obrador cristina-fernandez-de-kirchner giorgia-meloni recep-tayyip-erdogan viktor-orban javier-milei donald-trump barack-obama boris-johnson angela-merkel emmanuel-macron vladimir-putin pedro-sanchez mariano-rajoy').split(' '));
const chamberHeads=new Set(('meritxell-batet ana-pastor patxi-lopez francina-armengol jose-bono manuel-marin jose-posada jesus-posada luisa-fernanda-rudi felix-pons ander-gil-garcia manuel-cruz-rodriguez pedro-manuel-rollan-ojeda pio-garcia-escudero-marquez javier-rojo juan-jose-laborda antonio-fontan').split(' '));
const europeanHeads=new Set(['christine-lagarde','ursula-von-der-leyen']);
const coreMinisters=new Set(('margarita-robles felix-bolanos cristobal-montoro dolores-de-cospedal fernando-grande-marlaska jorge-fernandez-diaz jose-manuel-garcia-margallo jose-manuel-albares-bueno rafael-catala pilar-llop').split(' '));
const majorParties=new Set(('pablo-casado albert-rivera ines-arrimadas julio-anguita santiago-abascal teodoro-garcia-egea cuca-gamarra').split(' '));
const regionalChambers=new Set(('carme-forcadell laura-borras roger-torrent josep-rull enric-xavier-morera-catala').split(' '));
const originalMinister=new Set(('margarita-robles felix-bolanos jose-blanco magdalena-alvarez rosa-aguilar cristina-narbona dolors-montserrat alfonso-alonso alvaro-nadal carmen-calvo celia-villalobos fatima-banez fernando-grande-marlaska inigo-mendez-de-vigo isabel-garcia-tejerina jose-luis-abalos miguel-arias-canete oscar-puente pilar-llop rafael-catala raquel-sanchez reyes-maroto cristobal-montoro dolores-de-cospedal irene-montero isabel-cela jose-manuel-garcia-margallo jorge-fernandez-diaz miquel-iceta pilar-alegria monica-garcia alberto-garzon').split(' '));
const deputyHeads=new Set(['yolanda-diaz','alfredo-perez-rubalcaba','elena-salgado','pedro-solbes','francisco-javier-arenas-bocanegra','carmen-calvo','pablo-iglesias','matteo-salvini','soraya-saenz-de-santamaria','maria-jesus-montero','nadia-calvino','luis-de-guindos']);
const regionalHeads=new Set(('alberto-nunez-feijoo carles-puigdemont isabel-diaz-ayuso juanma-moreno joaquin-francisco-puig-ferrer manuel-fraga guillermo-fernandez-vara jose-antonio-monago-terraza miren-uxue-barcos-berruezo concepcion-andreu-rodriguez esperanza-aguirre cristina-cifuentes quim-torra pere-aragones emiliano-garcia-page susana-diaz juan-vicente-herrera salvador-illa').split(' '));
function decision(score,category,evidence){return {score,category,evidence};}
function classifyFrench(role){let t=normalize(role.roleFR),years=Math.max(0,(Date.parse(role.end)-Date.parse(role.start))/31557600000)||0;
 if(/^president(?:e)? de la republique/.test(t)||/^premier(?:e)? ministre(?:\s|$)/.test(t))return decision(1000,'Jefatura nacional de Estado o Gobierno',role.roleFR);
 if(/^president(?:e)? (?:du senat|de l[’']assemblee nationale|du conseil constitutionnel|du parlement europeen)/.test(t))return decision(880,'Presidencia legislativa o constitucional nacional/europea',role.roleFR);
 if((/banque centrale europeenne|commission europeenne/.test(t)&&/^president/.test(t))||(/fonds monetaire international/.test(t)&&/^direct/.test(t)))return decision(930,'Dirección ejecutiva supranacional',role.roleFR);
 if(/^vice-president.*commission europeenne|^commissaire europe/.test(t))return decision(770,'Ejecutivo de la Unión Europea',role.roleFR);
 if(/gouverneur de la banque de france|premier president de la cour des comptes/.test(t))return decision(820,'Dirección monetaria o fiscalizadora nacional',role.roleFR);
 if(/^direct.*unesco|^secretaire executif.*(?:nations|unies)/.test(t))return decision(800,'Dirección de organismo internacional',role.roleFR);
 if(/^secretaire d[’']etat|^haut-commissaire/.test(t))return decision(560,'Secretaría de Estado o alta comisaría',role.roleFR);
 if(/^ministre|^garde des sceaux/.test(t)){if(/delegue|aupres/.test(t.split('charg')[0]))return decision(590,'Ministerio delegado',role.roleFR);var core=/affaires etrangeres|interieur|justice|defense|armees|economie|finances/.test(t);return decision(years<.12?665:(core?780:750),'Ministerio nacional',role.roleFR);}
 if(/^vice-president(?:e)? (?:du senat|de l[’']assemblee nationale)/.test(t))return decision(670,'Vicepresidencia de cámara nacional',role.roleFR);
 if(/^president.*(?:conseil regional|conseil executif|gouvernement de|polynesie|assemblee de corse|collectivite territoriale|metropole)/.test(t))return decision(720,'Gobierno territorial de primer nivel',role.roleFR);
 if(/^president.*conseil departemental|^president.*conseil general/.test(t))return decision(620,'Gobierno departamental',role.roleFR);
 if(/^maire de (?:paris|marseille|lyon)(?:\s|$)/.test(t))return decision(670,'Alcaldía de gran capital',role.roleFR);
 if(/^maire\b/.test(t))return decision(470,'Alcaldía',role.roleFR);
 if(/^president.*(?:groupe|commission)/.test(t))return decision(590,'Dirección de grupo o comisión parlamentaria',role.roleFR);
 if(!/federation|departement|jeunesse|jeunes|adjoint|delegue/.test(t)&&/^(?:president|premier secretaire|secretaire national|secretaire general|coordinateur).*?(?:parti|republicains|national|ecolog|insoumise|communiste|modem|udf|rpr|ump)/.test(t))return decision(/parti socialiste|les republicains|republicains|front national|rassemblement national|france insoumise|europe ecologie|les ecologistes|parti communiste francais|\budf\b|\brpr\b|\bump\b|modem|mouvement democrate/.test(t)?760:610,'Dirección partidista de alcance documentado',role.roleFR);
 if(/^president.*conseil economique/.test(t))return decision(700,'Presidencia consultiva nacional',role.roleFR);
 if(/^vice-president|^premier adjoint/.test(t))return decision(440,'Responsabilidad territorial delegada',role.roleFR);
 if(/^depute|^senateur|^senatrice/.test(t))return decision(years>=8?360:300,'Representación parlamentaria',role.roleFR);
 if(/^conseiller|^conseillere/.test(t))return decision(220,'Representación territorial',role.roleFR);
 return decision(0,'Cargo no clasificado como responsabilidad política principal',role.roleFR);
}
const rows=before.map(c=>{let m=es.get(c.id),s=senate.get(c.id),f=fr.get(c.id),original=!art[c.id],d=decision(260,'Representación parlamentaria','Ficha parlamentaria documentada'),sources=[context[c.id]?.source].filter(Boolean),evidence=[];
 if(f){const options=f.datedCareerOffices.map(classifyFrench).sort((a,b)=>b.score-a.score);d=options[0]||d;sources=[f.source];evidence=f.datedCareerOffices.filter(r=>r.roleFR===d.evidence);}
 else if(m){const reason=m.globalTierReview?.criterion||m.tierReason||'',note=s?.notaRareza?.split('Selección editorial')[0]||'',label=m.affiliation?.referenceGroup||m.affiliation?.label||'',text=normalize([reason,note,label,m.depictedPeriod,m.institution].join('. '));sources=[m.reference?.profile||context[c.id]?.source].filter(Boolean);evidence=[reason,note,label].filter(Boolean);
  if(/\bpresidencia del (?:senado|congreso)|\bpresidente del (?:senado|congreso)/.test(text))d=decision(880,'Presidencia de cámara nacional',note||reason);
  else if(/\bvicepresidente (?:primero|segundo|tercero)|\bvicepresidenta (?:primera|segunda|tercera)/.test(normalize(label))&&!/senado/.test(normalize(label)))d=decision(790,'Vicepresidencia del Gobierno nacional',label);
  else if(/\bministr[oa]\b/.test(normalize(label)))d=decision(/asuntos exteriores|justicia|defensa|interior|economia|hacienda/.test(normalize(label))?780:750,'Ministerio nacional',label);
  else if(/presidencia del gobierno de |presidencia de la (?:junta|xunta|generalitat|comunidad)|presidente del gobierno de |presidenta del gobierno de |lehendakari/.test(text))d=decision(720,'Gobierno autonómico',note||reason);
  else if(/presidencia del parlamento|president[ea] del parlamento|presidencia de (?:la junta general|las cortes|la asamblea)/.test(text))d=decision(670,'Presidencia parlamentaria autonómica',note||reason);
  else if(/vicepresidencia (?:primera|segunda|tercera|del senado)|vicepresident[ea] del senado/.test(text))d=decision(670,'Vicepresidencia de cámara nacional',note||reason);
  else if(/secretari[oa] de estado|consejer[oa] de |consejeri[ao] de |presidencia de diputacion|alcaldia de (?:madrid|barcelona|valencia|sevilla)/.test(text))d=decision(610,'Ejecutivo territorial o Secretaría de Estado',note||reason);
  else if(s){const roles=s.cargosFuente||[];if(roles.some(r=>/^PRESIDENT[EA]?(?:\s|$)/.test(r.cargoNombre)&&r.cargoOrganoTipo==='COMIS'))d=decision(500,'Presidencia de comisión',roles.filter(r=>/^PRESIDENT[EA]?(?:\s|$)/.test(r.cargoNombre)).map(r=>r.cargoNombre+' '+r.cargoOrganoNombre).join('; '));else if(roles.some(r=>/PORTAVOZ/.test(r.cargoNombre)&&r.cargoOrganoTipo!=='COMIS'))d=decision(570,'Portavocía de grupo parlamentario',roles.filter(r=>/PORTAVOZ/.test(r.cargoNombre)).map(r=>r.cargoNombre+' '+r.cargoOrganoNombre).join('; '));else if(/alcald|concejal|vicepresiden|portavocia|direccion.*diputacion|consejer/.test(text))d=decision(430,'Responsabilidad territorial o parlamentaria especializada',note||reason);else d=decision(300,'Representación parlamentaria',label);}
 }
 if(nationalHeads.has(c.id)||/^leopoldo-calvo-sotelo/.test(c.id))d=decision(1000,'Jefatura nacional de Estado o Gobierno',context[c.id]?.extract||evidence.join('; '));
 else if(chamberHeads.has(c.id)||['luisa fernanda rudi','felix pons','jesus posada','jose bono','manuel marin'].includes(normalize(c.n))||/presidencia del parlamento europeo/.test(normalize(m?.globalTierReview?.criterion||'')))d=decision(880,'Presidencia de cámara nacional',context[c.id]?.extract||evidence.join('; '));
 else if(europeanHeads.has(c.id))d=decision(930,'Dirección ejecutiva supranacional',context[c.id]?.extract);
 else if(['marine-le-pen','jean-luc-melenchon','jean-marie-le-pen'].includes(c.id))d=decision(850,'Liderazgo nacional sostenido y candidaturas presidenciales reiteradas',context[c.id]?.extract||f?.source);
 else if(c.id==='hillary-clinton')d=decision(820,'Secretaría de Estado y candidatura presidencial nacional',context[c.id]?.extract);
 else if(c.id==='kamala-harris')d=decision(795,'Vicepresidencia de Estados Unidos',context[c.id]?.extract);
 else if(originalMinister.has(c.id))d=decision(coreMinisters.has(c.id)?780:750,'Ministerio nacional',context[c.id]?.extract||m?.globalTierReview?.criterion);
 else if(deputyHeads.has(c.id))d=decision(790,'Vicepresidencia gubernamental o dirección económica europea',context[c.id]?.extract||m?.globalTierReview?.criterion||evidence.join('; '));
 else if(regionalHeads.has(c.id))d=decision(720,'Gobierno autonómico',context[c.id]?.extract||m?.globalTierReview?.criterion);
 else if(majorParties.has(c.id))d=decision(760,'Dirección nacional de partido',context[c.id]?.extract);
 else if(regionalChambers.has(c.id))d=decision(670,'Presidencia parlamentaria autonómica',context[c.id]?.extract||m?.globalTierReview?.criterion);
 else if(c.id==='jose-antonio-labordeta')d=decision(360,'Representación parlamentaria y alcance cultural público',m?.globalTierReview?.criterion||m?.tierReason);
 else if(c.id==='maria-australia-navarro-de-paz')d=decision(610,'Dirección partidista autonómica',m?.globalTierReview?.criterion||m?.tierReason);
 else if(c.id==='javier-remirez-apesteguia')d=decision(610,'Vicepresidencia del Gobierno autonómico',m?.globalTierReview?.criterion||m?.tierReason);
 var detail=0;
 if(f){var political=f.datedCareerOffices.filter(r=>classifyFrench(r).score>0),periods=political.filter(r=>r.roleFR===d.evidence||d.category==='Ministerio nacional'&&classifyFrench(r).category==='Ministerio nacional').map(r=>[Date.parse(r.start),Date.parse(r.end)]).filter(r=>r.every(Number.isFinite)).sort((a,b)=>a[0]-b[0]),merged=[];for(var period of periods){var last=merged.at(-1);if(last&&period[0]<=last[1])last[1]=Math.max(last[1],period[1]);else merged.push(period.slice());}var duration=merged.reduce((n,r)=>n+Math.max(0,r[1]-r[0])/31557600000,0);detail=Math.min(24,duration*1.5)+Math.min(9,new Set(political.map(r=>classifyFrench(r).category)).size);}
 else if(s){var roles=s.cargosFuente||[];detail=Math.min(12,roles.filter(r=>/^PRESIDENT[EA]?(?:\s|$)/.test(r.cargoNombre)).length*3)+Math.min(8,roles.length);}
 d.score+=detail;
 let rarity=d.score>=850?'legendario':d.score>=650?'especial':d.score>=400?'raro':'comun',cost=rarity==='legendario'?(d.score>=980?5:4):rarity==='especial'?(d.score>=710?4:3):rarity==='raro'?(d.score>=500?3:2):(d.score>=300?2:1);
 const rank={comun:0,raro:1,especial:2,legendario:3};let protection=null;
 if(original&&rank[rarity]<=rank[c.r]){rarity=c.r;cost=c.c;protection=c.r==='legendario'?'Legendario original conservado por instrucción del creador':'Original conservado: revisión de ascensos, sin descensos';}
 return {id:c.id,name:c.n,country:c.country,original,score:d.score,category:d.category,evidence:d.evidence,sources,protection,before:{r:c.r,c:c.c,a:c.a,h:c.h,v:c.v},after:{r:rarity,c:cost,v:rank[rarity]+1},metadata:m||frFirst.get(c.id)||null};
});
// Una sola distribución para la colección, nunca un cupo por país o tanda.
const targets={legendario:90,especial:180,raro:270,comun:359},order={comun:0,raro:1,especial:2,legendario:3},chosen=new Set();
for(const rarity of ['legendario','especial','raro']){
 const fixed=rows.filter(r=>!chosen.has(r.id)&&r.original&&order[r.before.r]>=order[rarity]);
 const rest=rows.filter(r=>!chosen.has(r.id)&&!fixed.includes(r)).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,'es'));
 for(const r of fixed.concat(rest.slice(0,targets[rarity]-fixed.length))){chosen.add(r.id);r.after.r=rarity;}
}
for(const r of rows){if(!chosen.has(r.id))r.after.r='comun';var t=r.after.r;r.after.v=order[t]+1;
 if(r.original&&t===r.before.r){r.after.c=r.before.c;r.protection=t==='legendario'?'Legendario original conservado por instrucción del creador':'Original conservado en su tier';}
 else {r.protection=null;r.after.c=t==='legendario'?(r.score>=980?5:4):t==='especial'?(r.score>=710?4:3):t==='raro'?(r.score>=500?3:2):(r.score>=300?2:1);}
 r.selectionBasis='Comparación global de los 899: responsabilidad, duración y amplitud documentadas. Distribución conjunta 40/30/20/10 aproximada; sin reservas de legendarios por tanda. Los tiers previos de los originales son mínimos conservados.';
}
const distribution=rows.reduce((a,r)=>(a[r.after.r]=(a[r.after.r]||0)+1,a),{});fs.writeFileSync(path.join(__dirname,'tier-review.json'),JSON.stringify({date:'2026-11-07',scope:899,method:'Criterios compartidos de responsabilidad institucional; distribución conjunta 40/30/20/10, sin cupos por tanda ni métricas de viralidad inventadas. Legendarios originales conservados; resto de originales solo asciende con evidencia. Fuentes capturadas en la investigación previa y citadas por ficha. Revisión editorial de juego, no valoración personal.',distribution,cards:rows},null,2)+'\n');
console.log(distribution,'original changes',rows.filter(r=>r.original&&r.before.r!==r.after.r).length,'new changes',rows.filter(r=>!r.original&&r.before.r!==r.after.r).length);console.log(rows.filter(r=>r.after.r==='legendario').map(r=>r.name).join(' · '));
