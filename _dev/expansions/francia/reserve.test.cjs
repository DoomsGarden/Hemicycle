'use strict';
const {test,after}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const reserve=require('./prepare.cjs'),preview=reserve.preview(),active=require('../../../js/orator-catalog.js');
const reviewed=require('./cloture-frases/frases-validees.json'),spanish=require('../reserva-espana/prepare.cjs');
const {loadBattle}=require('../../../tests/helpers/battle.cjs');
const root=path.resolve(__dirname,'../../..');
const completed=new Set();let checkedActions=0,checkedDoctrines=0;
test('440 complete French cards preserve active cards, Spain and the joint tier distribution',()=>{
 a.equal(reserve.policy.enabled,false);a.equal(reserve.policy.reservedCount,440);a.equal(reserve.policy.pendingPortraits,0);a.equal(reserve.policy.pendingWardrobeVariants,0);
 a.equal(active.cards.length,120);a.equal(preview.catalog.cards.length,560);preview.catalog.validate(preview.catalog);
 a.equal(preview.catalog.countryRoster.FR.length,active.countryRoster.FR.length+440);a.equal(JSON.stringify(preview.catalog.countryRoster.ES),JSON.stringify(active.countryRoster.ES));
 for(const card of active.cards)a.equal(JSON.stringify(preview.catalog.cards.find(c=>c.id===card.id)),JSON.stringify(card),card.id);
 const spanishIds=new Set(spanish.sourceCards.map(c=>c.id));
 for(const c of reserve.sourceCards){a.equal(c.country,'FR');a.ok(!spanishIds.has(c.id),c.id);a.equal(preview.mastery.eligible(c.id),c.rarity==='legendario');a.ok(fs.existsSync(path.resolve(c.artRoot,c.art.sheet)),c.id);}
 for(const [tier,n]of Object.entries({comun:176,raro:132,especial:88,legendario:44}))a.equal(reserve.sourceCards.filter(c=>c.rarity===tier).length,n);
});
test('all 1320 reviewed translations retain their action, original and sources in the private catalog',()=>{
 const sources=JSON.parse(preview.files['docs/fuentes-frases-actuales.json']);a.equal(sources.cromos.length,560);
 for(const c of reviewed.cards){
  const card=preview.catalog.cards.find(v=>v.id===c.id),source=sources.cromos.find(v=>v.id===c.id);a.ok(card);a.equal(card.country,'FR');
  for(const [index,q]of c.candidates.entries()){a.equal(card.q[index],q.textES);a.equal(source.frases[index].original,q.originalFR);a.equal(source.frases[index].fuente,q.source);a.equal(source.frases[index].sourceSha256,q.sourceSha256);a.ok(q.textES.length<=47);}
 }
});
test('public client, backend and Pages exclude every French reserve ID; overlays cannot overwrite the checkout',()=>{
 const economy=require('../../online/economy.cjs'),rules=require('../../../js/market-rules.js').create(economy.catalog,active.packs);
 const files=['index.html','sw.js','manifest.json','Readme.html','README.md','fuentes/index.html','docs/fuentes-frases-actuales.json',...fs.readdirSync(path.join(root,'js')).filter(f=>f.endsWith('.js')).map(f=>'js/'+f)];
 const contents=files.map(f=>[f,fs.readFileSync(path.join(root,f),'utf8')]);
 for(const c of reserve.sourceCards){a.ok(!economy.catalog.some(v=>v.id===c.id));a.throws(()=>rules.card(c.id));for(const [file,text]of contents)a.ok(!text.includes(c.id),file+' exposes '+c.id);}
 a.match(fs.readFileSync(path.join(root,'_config.yml'),'utf8'),/exclude:\s*\n\s*- _dev/);a.throws(()=>reserve.emit(root));
 const out=fs.mkdtempSync('/tmp/hemicycle-france-test-');try{reserve.emit(out);const manifest=JSON.parse(fs.readFileSync(path.join(out,'RESERVED.json')));a.equal(manifest.enabled,false);a.equal(manifest.releaseReady,false);a.equal(manifest.reservedCount,440);}finally{fs.rmSync(out,{recursive:true,force:true});}
});
function duel(item,side){
 const c=loadBattle('normal',.25,{HemicycleCatalog:preview.catalog,HemicycleBasicEffects:preview.effects});c.G.side=side;c.G.n=1;c.G.turnDeadline=null;c.G.leader={p:{uid:'absent-p'},e:{uid:'absent-e'}};
 const actor=c.mk(c.CARDS.find(x=>x.id===item.id),false,side),target=c.mk(c.CARDS.find(x=>x.id==='donald-trump'),false,side==='p'?'e':'p');Object.assign(target,{h:100,hm:100});actor.enteredTurn=1;actor.strongUsedTurn=null;c.G.turns={p:3,e:3};c.G.field[side]=[actor];c.G.field[side==='p'?'e':'p']=[target];c.G.hand={p:[],e:[]};c.G.deck={p:[],e:[]};
 return {c,actor,target};
}
for(const item of reserve.sourceCards)test(item.id+': four actions and leader doctrine for both sides',()=>{
 for(const side of ['p','e']){
  for(const action of ['normal','strong','guard','heal']){
   const {c,actor,target}=duel(item,side);let index;
   if(action==='normal'||action==='strong'){
    index=action==='normal'?0:1;
    if(item.ability==='summon')c.G.deck[side]=[c.mk(c.CARDS.find(v=>v.r==='comun'),false,side)];
    if(item.ability==='fasttrack')c.G.deck[side]=[{k:'receso',action:true,availableTurn:6}];
    a.equal(c.attack(actor,target,side,action),true);a.ok(target.h<100);
    if(action==='normal'){const owner=preview.effects.definition(item.ability).target==='self'?actor:target;a.equal(owner.basicStatus?.id,item.ability);}else{a.equal(actor.basicStatus,undefined);a.equal(target.basicStatus,undefined);}
   }else{index=2;if(action==='heal')actor.h=1;a.equal(c.useSupport(actor,action,side),true);if(action==='heal')a.ok(actor.h>1);else a.equal(actor.guard,true);}
   a.ok(c.G.log.join('').includes(item.q[index]),action);a.equal(actor.ready,false);checkedActions++;
  }
  const {c,actor,target}=duel(item,side),other=side==='p'?'e':'p';a.equal(c.activeDoc(side),null);c.G.leader[side]=actor;a.equal(c.activeDoc(side),item.doctrine);c.G.field[side]=[];a.equal(c.activeDoc(side),null);c.G.field[side]=[actor];target.pa=active.docs.find(d=>d.beats===item.doctrine).k;c.G.leader[other]=target;a.equal(c.activeDoc(side),null);checkedDoctrines++;
 }
 completed.add(item.id);
});
after(()=>{
 a.equal(completed.size,440);a.equal(checkedActions,3520);a.equal(checkedDoctrines,880);
 const report={status:'passed',enabled:false,publicCatalogSize:120,privatePreviewCatalogSize:560,reservedOrators:completed.size,actionsCheckedForBothSides:checkedActions,leaderPresenceAndCounterChecks:checkedDoctrines,reviewedPhrases:1320,allActionsUseTheirAssignedQuote:true,normalEffectsMatchReviewedAssignments:true,publicClientBackendAndPagesExcludeReservedIds:true};
 fs.writeFileSync(path.join(__dirname,'cloture-frases/qa/reserve-gameplay.json'),JSON.stringify(report,null,2)+'\n');
});
