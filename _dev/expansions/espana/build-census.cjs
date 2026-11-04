'use strict';
const fs=require('node:fs'),path=require('node:path');
const catalog=require('../../../js/orator-catalog.js'),proposal=require('../../proposals/espana-1986-2026/propuesta.json'),senate=require('../espana-20/senado/censo.json'),government=require('./gobierno-fuente.json'),scope=require('./cobertura.json');
const speeches=require('../espana-20/frases.json');
const nextBatch=require('../espana-60-02/propuesta.json');
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(),slug=s=>norm(s).replaceAll(' ','-');
const reordered=s=>s.includes(',')?s.split(',').reverse().map(v=>v.trim()).join(' '):s;
// Full aliases verified against the institutional records; shared short names never auto-merge people.
const aliases={
 'pedro-sanchez':['Pedro Sánchez Pérez-Castejón'],'yolanda-diaz':['Yolanda Díaz Pérez'],
 'fernando-grande-marlaska':['Fernando Grande-Marlaska Gómez'],'monica-garcia':['Mónica García Gómez'],
 'javier-maroto':['Javier Ignacio Maroto Aranzábal'],'juan-espadas':['Juan Espadas Cejas'],
 'susana-diaz':['Susana Díaz Pacheco'],'maria-jesus-montero':['María Jesús Montero Cuadrado']
};
function build(){
 const people=new Map(),names=new Map();
 function remember(p,variants){for(const v of variants.filter(Boolean)){const key=norm(v);if(names.has(key)&&names.get(key)!==p.id)throw Error('Alias ambiguo: '+v);names.set(key,p.id);if(!p.alias.includes(v))p.alias.push(v);}}
 function seed(id,name,state,variants){if(people.has(id))throw Error('ID duplicado: '+id);const p={id,nombre:name,pais:'ES',catalogo:state,alias:[],ambitos:[],referencias:[],estadoTrabajo:state==='pendiente'?'pendiente_de_investigacion':'ya_catalogado_no_duplicar',rarezaPropuesta:null};people.set(id,p);remember(p,[name,...variants]);return p;}
 function area(p,id){if(!p.ambitos.includes(id))p.ambitos.push(id);}
 for(const c of catalog.cards.filter(c=>c.country==='ES')){const p=seed(c.id,c.n,'activo',aliases[c.id]||[]);p.rarezaPropuesta=c.r;p.referencias.push({tipo:'catalogo_activo',archivo:'js/orator-catalog.js',id:c.id});}
 for(const c of proposal.cards){const p=seed(c.id,c.name,'reserva20',[reordered(c.canonicalName),...c.aliases]);p.rarezaPropuesta=c.rarity;area(p,'congreso');p.referencias.push({tipo:'ficha_congreso',fuente:c.reference.profile,etapaRetrato:c.depictedPeriod,grupoDeLaEtapa:c.affiliation.referenceGroup});}
 for(const c of speeches.cromos){const p=people.get(c.id),seen=new Set();for(const q of c.frases){if(!/MINISTR[OA]|SECRETARI[OA] DE ESTADO/.test(q.cabeceraOrador))continue;const key=q.cabeceraOrador+q.fechaIntervencion;if(seen.has(key))continue;seen.add(key);area(p,'gobierno_estatal');p.referencias.push({tipo:'cargo_en_intervencion_oficial',fuente:q.fuente,cargo:q.cabeceraOrador.replace(/\s+/g,' ').trim(),fecha:q.fechaIntervencion,estadoTemporal:'cargo_en_la_fecha_de_la_intervencion_no_inferir_vigencia_actual'});}}
 for(const s of senate.personas){
  let p;
  if(s.catalogo){p=people.get(s.catalogo.id);if(!p&&s.catalogo.estado==='reserva60')p=seed(s.catalogo.id,s.nombre,'pendiente',[]);if(!p)throw Error('Falta persona ya catalogada: '+s.nombre);}
  else if(names.has(norm(s.nombre)))p=people.get(names.get(norm(s.nombre)));
  else p=seed(slug(s.nombre),s.nombre,'pendiente',[]);
  remember(p,[s.nombre]);area(p,'senado');p.referencias.push({tipo:'senado_XV',senadorId:s.senadorId,fuente:s.ficha,estadoTemporal:s.estadoTemporal,grupoParlamentario:s.grupoNombre,prioridadDentroDelSenado:s.prioridad,nota:'La prioridad de esta fuente no ordena la selección general de todas las instituciones.'});
 }
 for(const g of government.personas){
  const p=names.has(norm(g.nombre))?people.get(names.get(norm(g.nombre))):seed(slug(g.nombre),g.nombre,'pendiente',[]);
  remember(p,[g.nombre]);area(p,'gobierno_estatal');p.referencias.push({tipo:'composicion_gobierno',fuente:government.fuente,ficha:g.ficha,cargo:g.cargo,consultado:government.consultado,estadoTemporal:'figura_en_la_pagina_consultada',partido:null,nota:'El cargo no implica militancia. No deducir permanencia posterior ni fechas de nombramiento de esta instantánea.'});
 }
 for(const c of nextBatch.cards){const p=people.get(c.id);if(!p||p.catalogo!=='pendiente')throw Error('La siguiente tanda duplica o no corresponde a una identidad del censo: '+c.id);p.catalogo='reserva60';p.estadoTrabajo='ya_catalogado_no_duplicar';p.rarezaPropuesta=c.rarity;remember(p,[c.name,c.canonicalName,...c.aliases]);p.referencias.push({tipo:'reserva_preparada',archivo:'_dev/expansions/espana-60-02/propuesta.json',id:c.id,estado:'oculto_no_jugable'});}
 const persons=[...people.values()].sort((a,b)=>a.nombre.localeCompare(b.nombre,'es'));
 const result={consultado:scope.revisado,pais:'ES',alcance:scope.criterio,periodo:scope.periodo,completo:false,
  fuentesCubiertas:['catalogo_es_activo','reserva20','historial_senado_XV','composicion_gobierno_consultada'],
  ampliacionPendiente:['resto_congreso','direcciones_y_portavocias_partidos','gobiernos_y_parlamentos_autonomicos','ambito_local_insular_provincial','representacion_europea','gobiernos_historicos_en_el_intervalo'],
  criterioIdentidad:scope.identidad.unidad,criterioSeleccion:scope.seleccion.prioridad,
  totales:{personas:persons.length,activos:persons.filter(p=>p.catalogo==='activo').length,reserva20:persons.filter(p=>p.catalogo==='reserva20').length,reserva60:persons.filter(p=>p.catalogo==='reserva60').length,reservaTotal:persons.filter(p=>p.catalogo.startsWith('reserva')).length,pendientes:persons.filter(p=>p.catalogo==='pendiente').length,registrosSenado:senate.personas.length,registrosGobierno:government.personas.length},personas:persons};
 return result;
}
function emit(){const data=build();fs.writeFileSync(path.join(__dirname,'censo.json'),JSON.stringify(data,null,2)+'\n');const csv=v=>'"'+String(v??'').replaceAll('"','""')+'"';const rows=[['id','nombre','catalogo','ambitos_documentados','estado_trabajo','cargos_gobierno','fuentes']];for(const p of data.personas)rows.push([p.id,p.nombre,p.catalogo,p.ambitos.join('; '),p.estadoTrabajo,p.referencias.filter(r=>r.tipo==='composicion_gobierno').map(r=>r.cargo).join('; '),[...new Set(p.referencias.map(r=>r.ficha||r.fuente||r.archivo))].join('; ')]);fs.writeFileSync(path.join(__dirname,'censo.csv'),rows.map(row=>row.map(csv).join(',')).join('\n')+'\n');return data.totales;}
module.exports={build,emit};if(require.main===module)console.log(JSON.stringify(emit(),null,2));
