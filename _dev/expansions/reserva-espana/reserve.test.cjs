'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const reserve=require('./prepare.cjs'),preview=reserve.preview(),active=require('../../../js/orator-catalog.js'),batch=require('../espana-83-06/propuesta.json'),phrases=require('../espana-83-06/frases.json'),baseline=require('./revision-global/antes.json'),{loadBattle}=require('../../../tests/helpers/battle.cjs');
const root=path.resolve(__dirname,'../../..'),normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
test('339 reserved cards use a single global tier distribution and preserve public definitions and previous mechanics',()=>{
 a.equal(reserve.policy.enabled,false);a.equal(reserve.policy.pendingPortraits,0);a.equal(reserve.policy.reservedCount,339);a.equal(active.cards.length,120);a.equal(preview.catalog.cards.length,459);preview.catalog.validate(preview.catalog);
 for(const c of active.cards)a.equal(JSON.stringify(preview.catalog.cards.find(v=>v.id===c.id)),JSON.stringify(c));
 for(const c of baseline.cards){const next=reserve.sourceCards.find(v=>v.id===c.id);a.ok(next);a.deepEqual(next.q,c.q);a.equal(next.ability,c.ability);a.equal(next.doctrine,c.doctrine);}
 for(const [tier,added,total]of [['comun',135,183],['raro',102,138],['especial',69,93],['legendario',33,45]]){a.equal(reserve.sourceCards.filter(c=>c.rarity===tier).length,added);a.equal(preview.catalog.cards.filter(c=>c.r===tier).length,total);}
 for(const c of reserve.sourceCards){a.equal(preview.mastery.eligible(c.id),c.rarity==='legendario');a.equal(c.globalTierReview.scope,343);a.ok(!/cupo.*tanda/.test(c.tierReason.split('. ').slice(1).join('. ')));}
});
test('237 new phrases distinguish official journals and attributed press; all 1377 phrases remain distinct',()=>{
 const registry=JSON.parse(preview.files['docs/fuentes-frases-actuales.json']),all=registry.cromos.flatMap(c=>c.frases);a.equal(registry.cromos.length,459);a.equal(all.length,1377);a.equal(new Set(all.map(q=>normalize(q.frase))).size,1377);a.equal(phrases.cromos.length,79);
 let pdf=0,html=0;for(const c of phrases.cromos){a.equal(c.frases.length,3);for(const q of c.frases){a.ok(q.frase.length<=47);a.equal(normalize(q.frase),normalize(q.original));a.ok(normalize(q.contexto).includes(normalize(q.original)));a.ok(q.fechaIntervencion>='2010-01-01'&&q.fechaIntervencion<='2026-11-05');a.ok(q.cabeceraOrador);if(q.sourceFormat==='html'){html++;a.match(q.htmlSha256,/^[a-f0-9]{64}$/);a.match(q.fuente,/^https:\/\/www\.europapress\.es\//);a.equal(q.comprobado_en,'declaracion_atribuida_en_prensa');}else{pdf++;a.match(q.pdfSha256,/^[a-f0-9]{64}$/);a.match(q.fuente,/^https:\/\/www\.(?:senado|congreso)\.es\/.+\.PDF#page=\d+$/);}}}a.equal(pdf,210);a.equal(html,27);
});
test('portraits and wardrobe atlases retain original PNG hashes and blocked portraits stay explicit',()=>{
 for(const folder of ['../espana-83-06','./revision-global']){const manifest=require(folder+'/art/manifest.json');for(const item of manifest.files){const file=path.join(__dirname,folder,item.file),bytes=fs.readFileSync(file);a.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);a.equal(bytes.readUInt32BE(16)*4,bytes.readUInt32BE(20)*3);}}
 a.equal(batch.cards.filter(c=>c.art.status==='pending').length,0);a.equal(reserve.sourceCards.filter(c=>c.art.status==='pending').length,0);for(const file of Object.values(reserve.artAssets))a.ok(fs.existsSync(file));
 const pending=batch.cards.filter(c=>c.art.status==='pending').map(c=>c.name);a.deepEqual(pending,[]);const omitted=require('../espana-83-06/descartados.json');a.equal(omitted.cards.length,4);for(const c of omitted.cards)a.ok(!reserve.sourceCards.some(v=>v.id===c.id));
 for(const c of reserve.sourceCards.filter(c=>c.wardrobeReview?.status==='generated')){a.ok(c.artBeforeGlobalReview);a.ok(c.art.sheet.includes('revision-global'));a.equal(c.gaze,'off_camera');}
});
test('public installation, client, economy and backend exclude all reserved IDs; activation is gated',()=>{
 const economy=require('../../online/economy.cjs'),rules=require('../../../js/market-rules.js').create(economy.catalog,active.packs);
 const files=['index.html','sw.js','manifest.json','Readme.html','README.md','fuentes/index.html','docs/fuentes-frases-actuales.json',...fs.readdirSync(path.join(root,'js')).filter(f=>f.endsWith('.js')).map(f=>'js/'+f)];
 for(const c of reserve.sourceCards){a.ok(!economy.catalog.some(x=>x.id===c.id));a.throws(()=>rules.card(c.id));for(const f of files)a.ok(!fs.readFileSync(path.join(root,f),'utf8').includes(c.id),f+' exposes '+c.id);}
 a.match(fs.readFileSync(path.join(root,'_config.yml'),'utf8'),/exclude:\s*\n\s*- _dev/);a.throws(()=>reserve.emit(root));const dir=fs.mkdtempSync('/tmp/hemicycle-reserve-test-');try{reserve.emit(dir);const manifest=JSON.parse(fs.readFileSync(path.join(dir,'RESERVED.json')));a.equal(manifest.pendingPortraits,0);a.equal(manifest.releaseReady,false);a.ok(!manifest.requiredBeforeActivation.some(s=>s.includes('retratos pendientes')));}finally{fs.rmSync(dir,{recursive:true,force:true});}
});
function duel(item,side){
 const c=loadBattle('normal',.25,{HemicycleCatalog:preview.catalog,HemicycleBasicEffects:preview.effects});c.G.side=side;c.G.n=1;c.G.turnDeadline=null;c.G.leader={p:{uid:'absent-p'},e:{uid:'absent-e'}};
 const actor=c.mk(c.CARDS.find(x=>x.id===item.id),false,side),target=c.mk(c.CARDS.find(x=>x.id==='donald-trump'),false,side==='p'?'e':'p');Object.assign(target,{h:100,hm:100});actor.enteredTurn=1;actor.strongUsedTurn=null;c.G.turns={p:3,e:3};c.G.field[side]=[actor];c.G.field[side==='p'?'e':'p']=[target];c.G.hand={p:[],e:[]};c.G.deck={p:[],e:[]};
 return {c,actor,target};
}
for(const item of reserve.sourceCards)for(const side of ['p','e']){
 for(const action of ['normal','strong','guard','heal'])test(item.id+' '+side+' '+action+': quote and actual gameplay binding',()=>{
  const {c,actor,target}=duel(item,side);let index;
  if(action==='normal'||action==='strong'){
   index=action==='normal'?0:1;if(item.ability==='summon')c.G.deck[side]=[c.mk(c.CARDS.find(c=>c.r==='comun'),false,side)];if(item.ability==='fasttrack')c.G.deck[side]=[{k:'receso',action:true,availableTurn:6}];
   a.equal(c.attack(actor,target,side,action),true);a.ok(target.h<100);
   if(action==='normal'){const owner=preview.effects.definition(item.ability).target==='self'?actor:target;a.equal(owner.basicStatus?.id,item.ability);}else{a.equal(actor.basicStatus,undefined);a.equal(target.basicStatus,undefined);}
  }else{index=2;if(action==='heal')actor.h=1;a.equal(c.useSupport(actor,action,side),true);if(action==='heal')a.ok(actor.h>1);else a.equal(actor.guard,true);}
  a.ok(c.G.log.join('').includes(item.q[index]));a.equal(actor.ready,false);
 });
 test(item.id+' '+side+': passive requires leader presence and respects the opposing counter',()=>{
  const {c,actor,target}=duel(item,side),other=side==='p'?'e':'p';a.equal(c.activeDoc(side),null);c.G.leader[side]=actor;a.equal(c.activeDoc(side),item.doctrine);c.G.field[side]=[];a.equal(c.activeDoc(side),null);c.G.field[side]=[actor];target.pa=active.docs.find(d=>d.beats===item.doctrine).k;c.G.leader[other]=target;a.equal(c.activeDoc(side),null);
 });
}


test('census has 339 reserved identities and no unresearched profiles in the covered source lists',()=>{
 const {build}=require('../espana/build-census.cjs'),c=build();a.equal(c.totales.personas,440);a.equal(c.totales.activos,97);a.equal(c.totales.reservaTotal,339);a.equal(c.totales.pendientes,0);a.equal(c.totales.reservadosPendientesArte,0);a.equal(c.totales.descartados,4);a.equal(c.completo,false);a.equal(new Set(c.personas.map(p=>p.id)).size,440);for(const item of batch.cards){const p=c.personas.find(p=>p.id===item.id);a.equal(p.catalogo,'reserva83-06');a.equal(p.referencias.filter(r=>r.tipo==='senado_XV').length,1);a.equal(p.pendientesReserva?.includes('arte')||false,item.art.status==='pending');}
});
