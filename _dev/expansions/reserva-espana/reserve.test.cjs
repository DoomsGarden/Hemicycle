'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const reserve=require('./prepare.cjs'),preview=reserve.preview(),active=require('../../../js/orator-catalog.js'),batch=require('../espana-60-02/propuesta.json'),phrases=require('../espana-60-02/frases.json'),old=require('../espana-20/prepare.cjs'),{loadBattle}=require('../../../tests/helpers/battle.cjs');
const root=path.resolve(__dirname,'../../..'),normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
test('80 reserved cards extend only the internal overlay; the previous 140 definitions are preserved',()=>{
 a.equal(reserve.policy.enabled,false);a.equal(reserve.policy.reservedCount,80);a.equal(active.cards.length,120);a.equal(preview.catalog.cards.length,200);preview.catalog.validate(preview.catalog);
 for(const c of old.preview().catalog.cards)a.equal(JSON.stringify(preview.catalog.cards.find(v=>v.id===c.id)),JSON.stringify(c));
 for(const [rarity,total,added]of [['comun',80,24],['raro',60,18],['especial',40,12],['legendario',20,6]]){a.equal(preview.catalog.cards.filter(c=>c.r===rarity).length,total);a.equal(batch.cards.filter(c=>c.rarity===rarity).length,added);}
 for(const d of active.docs)a.equal(batch.cards.filter(c=>c.doctrine===d.k).length,10);a.equal(new Set(batch.cards.map(c=>c.ability)).size,14);
});
test('180 new phrases have attributable originals, context and official evidence; all 600 phrases remain distinct',()=>{
 const registry=JSON.parse(preview.files['docs/fuentes-frases-actuales.json']);a.equal(registry.cromos.length,200);const all=registry.cromos.flatMap(c=>c.frases);a.equal(all.length,600);a.equal(new Set(all.map(q=>normalize(q.frase))).size,600);a.equal(phrases.cromos.length,60);
 for(const c of phrases.cromos){a.equal(c.frases.length,3);for(const q of c.frases){a.ok(q.frase.length<=47);a.equal(normalize(q.frase),normalize(q.original));a.ok(normalize(q.contexto).includes(normalize(q.original)));a.match(q.pdfSha256,/^[a-f0-9]{64}$/);a.match(q.fuente,/^https:\/\/www\.(?:senado|congreso)\.es\/.+\.PDF#page=\d+$/);a.ok(q.fechaIntervencion>='2010-01-01'&&q.fechaIntervencion<='2026-11-04');a.ok(q.cabeceraOrador);}}
});
test('all portrait atlases exist at the documented 3:4 size, match hashes and have unique internal URLs',()=>{
 a.equal(Object.keys(reserve.artAssets).length,20);const sheets=require('../espana-60-02/art/manifest.json');a.equal(sheets.files.length,15);
 for(const item of sheets.files){const bytes=fs.readFileSync(path.join(__dirname,'../espana-60-02',item.file));a.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);a.equal(bytes.readUInt32BE(16)*4,bytes.readUInt32BE(20)*3);}
 for(const file of Object.values(reserve.artAssets))a.ok(fs.existsSync(file));
});
test('public installation, client modules, sources, economy and backend rules still exclude every reserved ID',()=>{
 const economy=require('../../online/economy.cjs'),rules=require('../../../js/market-rules.js').create(economy.catalog,active.packs);
 const files=['index.html','sw.js','manifest.json','Readme.html','README.md','fuentes/index.html','docs/fuentes-frases-actuales.json',...fs.readdirSync(path.join(root,'js')).filter(f=>f.endsWith('.js')).map(f=>'js/'+f)];
 for(const c of reserve.sourceCards){a.ok(!economy.catalog.some(x=>x.id===c.id));a.throws(()=>rules.card(c.id));for(const f of files)a.ok(!fs.readFileSync(path.join(root,f),'utf8').includes(c.id),f+' exposes '+c.id);}
 a.match(fs.readFileSync(path.join(root,'_config.yml'),'utf8'),/exclude:\s*\n\s*- _dev/);a.throws(()=>reserve.emit(root));
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
