'use strict';
// Isolated local demo account. Never signs in, writes production, or edits game code.
const fs=require('node:fs'),a=require('node:assert/strict'),{chromium}=require('playwright'),legal=require('../../js/legal-documents.js'),catalog=require('../../js/orator-catalog.js'),actions=require('../../js/action-cards.js').cards;
const base='http://127.0.0.1:8055/Hemicycle/';
const injection=`window.PromoScenes={render:function(scene){
 clearAI();clearBattleClock();closeModal();G=null;
 if(scene==='inicio'){MENU_FEATURED=['barack-obama','yolanda-diaz','alberto-nunez-feijoo'];go('menu');}
 if(scene==='coleccion'){COL_MODE='oradores';CABINET_EDIT=null;COL_FILTER_OPEN=false;FIL={q:'',r:'',d:'',country:''};go('coleccion');}
 if(scene==='gabinete'){loadSelectedCabinet();go('builder',{mode:'normal'});}
 if(scene==='sobres'){go('sobre',{k:'legendario',coverId:'angela-merkel',cards:['angela-merkel','yolanda-diaz','ana-pastor','barack-obama','replica'],revealed:false,quantity:1});}
 if(scene==='liga')go('liga');
 if(scene==='mercado'){lsSet('hemiciclo_market_tutorial_v1:'+backupSnapshot().identity.id,{status:'completed'});go('mercado');}
 if(scene==='combate'){
  loadSelectedCabinet();newBattle('normal');clearAI();clearBattleClock();if(HemicycleCoinToss.cancel)HemicycleCoinToss.cancel();
  var p=mk(BYID['alberto-nunez-feijoo'],true,'p'),p2=mk(BYID['yolanda-diaz'],false,'p'),e=mk(BYID['pedro-sanchez'],true,'e'),e2=mk(BYID['santiago-abascal'],false,'e');
  p.enteredTurn=2;p2.enteredTurn=1;p2.guard=true;p2.ready=false;e.enteredTurn=1;e2.enteredTurn=2;e2.guard=true;e2.ready=false;
  G.leader={p:p,e:e};G.field={p:[p,p2],e:[e,e2]};G.n=7;G.turns={p:4,e:3};G.first='p';G.side='p';G.votes={p:52,e:41};G.tdp={p:4,e:2};G.tdpMax={p:6,e:5};G.rival='Coalición Improbable';G.sel=null;G.move=null;G.turnDeadline=Date.now()+80000;
  G.hand.p=[mk(BYID['angela-merkel'],false,'p'),mk(BYID['gabriel-rufian'],false,'p'),{uid:'promo-action',k:'receso',n:BYID.receso.n,r:BYID.receso.r,c:BYID.receso.cost,action:true,a:0,h:0,hm:0,v:0,ready:false}];
  G.deck.p=[mk(BYID['barack-obama'],false,'p')];G.log=[];BATTLE_LOG_OPEN=false;go('battle');clearAI();clearBattleClock();
 }
 return scene;
}};function boot(){`;
const names=['inicio','combate','coleccion','gabinete','sobres','liga','mercado'];
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const c=await b.newContext({viewport:{width:440,height:800},deviceScaleFactor:2,reducedMotion:'reduce',serviceWorkers:'block'});
 await c.addInitScript(({legal,cards,actions})=>{
  const ids=['alberto-nunez-feijoo','yolanda-diaz','angela-merkel','gabriel-rufian','barack-obama'];
  localStorage.setItem('hemicycle_legal_acceptance_v1',JSON.stringify({id:crypto.randomUUID(),version:legal.version,hash:legal.hash,accepted:true,acceptedAt:new Date().toISOString(),ageBand:'18+',syncedAccounts:[]}));
  for(const key of ['hemiciclo_tutorial_v1','hemiciclo_menu_tutorial_v1','hemiciclo_market_tutorial_v1'])localStorage.setItem(key,JSON.stringify({status:'completed'}));
  localStorage.setItem('hemiciclo_objectives_intro_v1','true');localStorage.setItem('hemicycle_battle_tips_v1',JSON.stringify({action:true,heal:true,strong:true}));localStorage.setItem('hemicycle_audio_v1',JSON.stringify({muted:true,musicEnabled:false,effectsEnabled:false}));
  localStorage.setItem('hemiciclo_v21',JSON.stringify({fs:1500,elo:2750,w:48,l:12,album:cards.map(c=>c.id).concat(cards.filter(c=>c.r==='legendario').map(c=>c.id)),actionAlbum:actions.map(c=>c.id),cabinets:{selected:0,slots:Array.from({length:5},(_,i)=>({ids:i<2?ids:[],leader:i<2?ids[0]:null,actions:i<2?['replica','receso']:[]}))},lastDaily:0,lastWeekly:0,dtWins:0,dtGoldUnlocked:false,dtGoldActive:false}));
  const teams=Array.from({length:30},(_,i)=>{const w=i===0?4:i===1?5:i===2?4:i%4,d=i===2?1:i<3?0:(i%3),loss=5-w-d;return {n:i===0?'Tu grupo':['Grupo Nacional','Bancada Popular','Unión Cívica','Frente Común','Alianza Soberana','Grupo Liberal','Coalición Verde','Bloque Regional','Partido del Centro','Unión Patriótica','Frente Amplio','Grupo Federal','Nueva Bancada','Coalición Cívica','Bloque Obrero','Grupo Democrático','Unión Progresista','Frente Nacional','Grupo Social','Alianza Popular','Bloque Ciudadano','Grupo Reformista','Frente Cívico','Grupo del Norte','Bancada del Sur','Alianza Federal','Grupo Radical','Frente del Centro','Mesa Cívica'][i-1],pts:w*3+d,w,d,l:loss,you:i===0,str:60};});localStorage.setItem('hemiciclo_liga_v9',JSON.stringify({div:3,jor:6,temp:1,teams}));
 },{legal,cards:catalog.cards,actions});
 await c.route('https://**/*',r=>r.abort());await c.route('**/api/market/**',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({enabled:false})}));
 await c.route('**/Hemicycle/',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('index.html','utf8').replace('function boot(){',injection)}));
 const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base);await require('../checks/launch-helper.cjs')(p);await p.waitForFunction(()=>window.HemicycleEntered);
 const manifest=[];
 for(const [index,name]of names.entries()){
  await p.evaluate(name=>PromoScenes.render(name),name);await p.waitForTimeout(180);
  if(name!=='combate'){await p.waitForFunction(()=>HemicycleMenuSenate.inspect().ready);await p.evaluate(()=>{HemicycleMenuSenate.seek(1000);HemicycleMenuSenate.pause(true);});}
  await p.evaluate(()=>document.fonts.ready);await p.evaluate(async()=>{await Promise.all(Array.from(document.querySelectorAll('#screen img')).filter(im=>{const r=im.getBoundingClientRect();return r.width>0&&r.bottom>0&&r.top<innerHeight;}).map(im=>im.decode().catch(()=>{})));});
  if(name==='mercado')a.equal(await p.locator('#marketTutorialRoot .tutorial-coach:visible').count(),0);
  a.equal(await p.locator('.legal-panel,.account-entry,#launchScreen').count(),0,name);a.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,name);
  const file='docs/media/screenshots/'+String(index+1).padStart(2,'0')+'-'+name+'.png';await p.screenshot({path:file});manifest.push({name,path:file,width:880,height:1600,source:'Interfaz real, estado de demostración local aislado',view:await p.locator('#screen').getAttribute('data-view')});
 }
 a.deepEqual(errors,[]);fs.writeFileSync('_dev/marketing/captures.json',JSON.stringify({viewport:{width:440,height:800,scale:2},network:'Sin cuentas reales ni llamadas a servicios de producción',manifest,errors},null,2));console.log('PASS: seven real game captures, local demo state, no legal overlays, no page errors.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
