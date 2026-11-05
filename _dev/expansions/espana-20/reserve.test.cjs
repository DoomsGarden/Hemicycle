'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../..'),reserve=require('./prepare.cjs'),preview=reserve.preview(),active=require('../../../js/orator-catalog.js'),sources=require('./frases.json'),census=require('./senado/censo.json');
const {loadBattle}=require('../../../tests/helpers/battle.cjs'),norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
test('reservation preserves all active cards, validates tiers and maintains rarity proportions',()=>{
 a.equal(reserve.policy.enabled,false);a.equal(active.cards.length,120);a.equal(preview.catalog.cards.length,140);preview.catalog.validate(preview.catalog);
 for(const c of active.cards)a.equal(JSON.stringify(preview.catalog.cards.find(x=>x.id===c.id)),JSON.stringify(c));
 for(const [r,n]of [['comun',56],['raro',42],['especial',28],['legendario',14]])a.equal(preview.catalog.cards.filter(c=>c.r===r).length,n);
 for(const c of reserve.sourceCards){a.equal(preview.effects.ability(c.id),c.ability);a.equal(preview.mastery.eligible(c.id),c.rarity==='legendario');}
});
test('60 distinct supported phrases: source, author, context, page, date and explicit name substitutions',()=>{
 const seen=new Set(active.cards.flatMap(c=>c.q).map(norm));let adapted=0;
 a.equal(sources.cromos.length,20);a.equal(sources.acciones.defensa,sources.acciones.curacion);
 for(const c of sources.cromos){a.equal(c.frases.length,3);for(const f of c.frases){
  a.ok(f.frase.length<=47);a.ok(!seen.has(norm(f.frase)));seen.add(norm(f.frase));a.match(f.fuente,/^https:\/\/www.congreso.es\/public_oficiales\/.+#page=\d+$/);a.match(f.pdfSha256,/^[a-f0-9]{64}$/);a.ok(f.cabeceraOrador);a.ok(norm(f.contexto).includes(norm(f.original)));a.ok(f.fechaIntervencion>='1986-11-04'&&f.fechaIntervencion<='2026-11-04');
  if(f.sustitucion){adapted++;a.equal(norm(f.original.replace(f.sustitucion.de,f.sustitucion.a)),norm(f.frase));}else a.equal(norm(f.original),norm(f.frase));
 }}a.equal(adapted,2);
});
test('public catalog, economy, source page, worker and installation do not expose the reservation',()=>{
 const economy=require('../../online/economy.cjs'),rules=require('../../../js/market-rules.js').create([...active.cards,...require('../../../js/action-cards.js').cards],active.packs);
 const files=['index.html','sw.js','manifest.json','js/changelog.js','docs/fuentes-frases-actuales.json','fuentes/index.html',...fs.readdirSync(path.join(root,'js')).filter(x=>x.endsWith('.js')).map(x=>'js/'+x)];
 for(const c of reserve.sourceCards){a.ok(!active.cards.some(x=>x.id===c.id));a.ok(!economy.catalog.some(x=>x.id===c.id));a.throws(()=>rules.card(c.id));for(const file of files)a.ok(!fs.readFileSync(path.join(root,file),'utf8').includes(c.id),file+' leaks '+c.id);}
 a.match(fs.readFileSync(path.join(root,'_config.yml'),'utf8'),/exclude:\s*\n\s*- _dev/);a.throws(()=>reserve.emit(root));
 for(const kind of ['comun','raro','legendario','mitico'])for(const random of [0,.25,.5,.75,.999999])for(const id of economy.contents(kind,()=>random))a.ok(economy.catalog.some(c=>c.id===id));
});
test('Senate history and current permanent deputation are distinct and deduplicated',()=>{
 a.equal(census.personas.length,311);a.equal(new Set(census.personas.map(p=>p.senadorId)).size,311);a.equal(census.personas.filter(p=>p.diputacionPermanente).length,71);a.equal(census.personas.filter(p=>p.catalogo?.estado==='activo').length,4);a.equal(census.personas.filter(p=>p.catalogo?.estado==='reserva60').length,44);a.equal(census.totales.revisionIdentidad,0);
 for(const p of census.personas){a.ok(p.ficha.startsWith('https://www.senado.es/'));a.ok(!JSON.stringify(p).includes('profileText'));}
 const baltar=census.personas.find(p=>p.senadorId==='19966'),fernandez=census.personas.find(p=>p.nombreListado.startsWith('FERNÁNDEZ BLANCO,'));
 a.equal(baltar.catalogo.id,'jose-manuel-baltar-blanco');a.equal(baltar.catalogo.estado,'reserva60-04');a.equal(fernandez.catalogo,null);
 a.notEqual(baltar.catalogo.id,reserve.sourceCards.find(c=>c.name==='José Blanco').id);
});
for(const item of reserve.sourceCards)for(const side of ['p','e'])for(const action of ['normal','strong','guard','heal'])test(item.id+' '+side+' '+action+' uses its assigned phrase in the actual local engine',()=>{
 const c=loadBattle('normal',.25,{HemicycleCatalog:preview.catalog,HemicycleBasicEffects:preview.effects});
 c.G.side=side;c.G.n=1;c.G.turnDeadline=null;c.G.leader={p:{uid:'absent-p'},e:{uid:'absent-e'}};
 const actor=c.mk(c.CARDS.find(x=>x.id===item.id),false),target=c.mk(c.CARDS.find(x=>x.id==='donald-trump'),false);Object.assign(target,{h:100,hm:100});
 actor.enteredTurn=1;actor.strongUsedTurn=null;c.G.turns[side]=3;c.G.field[side]=[actor];c.G.field[side==='p'?'e':'p']=[target];c.G.hand={p:[],e:[]};c.G.deck={p:[],e:[]};
 let index;if(['normal','strong'].includes(action)){index=action==='normal'?0:1;a.equal(c.attack(actor,target,side,action),true);a.ok(target.h<100);}else{index=2;if(action==='heal')actor.h=1;a.equal(c.useSupport(actor,action,side),true);if(action==='heal')a.ok(actor.h>1);else a.equal(actor.guard,true);}
 a.ok(c.G.log.join('').includes(item.q[index]));a.equal(actor.ready,false);
});
