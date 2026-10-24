'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),{chromium}=require('playwright');
const {cards}=require('../market/catalog.cjs'),dismiss=require('./launch-helper.cjs');
const report={version:'v31.0.1.4',build:'audio-continuity',testBrowserProxyCertificateBypass:true,url:'https://doomsgarden.github.io/Hemicycle/',errors:[],accountRequests:[]};
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--ignore-certificate-errors']});
 try{
  const context=await browser.newContext({viewport:{width:393,height:851},reducedMotion:'reduce',ignoreHTTPSErrors:true});
  await context.addInitScript(ids=>{
   if(localStorage.getItem('hemiciclo_v21'))return;
   localStorage.setItem('hemiciclo_v21',JSON.stringify({fs:8000,elo:2270,w:12,l:3,album:ids,actionAlbum:['replica','receso'],cabinets:{selected:0,slots:Array.from({length:5},(_,i)=>i?{ids:[],leader:null}:{ids,leader:ids[0],actions:['replica','receso']})},lastDaily:0,lastWeekly:0,dtWins:0,dtGoldUnlocked:false,dtGoldActive:false}));
   for(const key of ['hemiciclo_tutorial_v1','hemiciclo_menu_tutorial_v1'])localStorage.setItem(key,JSON.stringify({status:'completed'}));
   localStorage.setItem('hemiciclo_objectives_intro_v1','true');
  },cards.filter(c=>c.r==='comun').slice(0,5).map(c=>c.id));
  await context.route('https://*.supabase.co/**',r=>{report.accountRequests.push(r.request().url());return r.abort();});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(report.url+'?review=actions1-'+Date.now());await dismiss(page);console.log('Published launch and menu loaded');
  assert.match(await page.locator('#appbar').innerText(),/v31\.0\.1\.4/);
  assert.equal(await page.evaluate(()=>HemicycleActions.cards.length),12);
  await page.locator('#appbar [data-go=novedades]').click();

const noteSections={'v31.0.1.4':'Correcciones acumuladas de preparación y recuperación','v31.0.1.3':'Correcciones y compatibilidad incorporadas','v31.0.1.2':'Correcciones de navegación y lectura','v31.0.1.1':'Apertura y progreso protegidos'};
for(const [version,title]of Object.entries(noteSections)){const entry=page.locator('.release-entry[data-version="'+version+'"]');if(await entry.getAttribute('open')===null)await entry.locator('summary').click();assert.match(await entry.innerText(),new RegExp(title));assert.ok(await entry.locator('li').count()>=8);}
await page.locator('#tabbar [data-go=menu]').click();
await page.locator('#tabbar [data-go=coleccion]').click();await page.locator('[data-act=collection-type]').click();
  assert.equal(await page.locator('#gridBox .action-card').count(),2);assert.equal(await page.locator('.cabinet-action-member').count(),2);
  await page.locator('[data-card=replica]').click();assert.match(await page.locator('.action-rules').innerText(),/1 TdP/);
  await page.evaluate(()=>new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=reject;image.src='assets/actions/art-atlas.png';}));
  await page.locator('[data-act=zoomcard]').click();await page.waitForTimeout(200);const cardFits=await page.locator('#zoomRoot .action-card-copy').evaluate(e=>[...e.children].every(x=>{const r=x.getBoundingClientRect(),p=e.getBoundingClientRect();return r.left>=p.left-1&&r.right<=p.right+1&&r.top>=p.top-1&&r.bottom<=p.bottom+1&&x.scrollWidth<=x.clientWidth+1;}));assert.ok(cardFits,'published card text fits inside its frame');await page.screenshot({path:'_dev/reports/v31.0.1.4-audio1/live-card-zoom.png'});await page.locator('#zoomBg').click({position:{x:4,y:4}});console.log('Published action collection, complete card text, rules and atlas loaded');await page.screenshot({path:'_dev/reports/v31.0.1.4-audio1/live-action-detail.png'});
  await page.locator('#tabbar [data-go=menu]').click();await page.locator('[data-act=play]').click();assert.equal(await page.locator('.cabinet-tab').count(),5);assert.equal(await page.locator('.cabinet-battle-actions .cabinet-action-member').count(),2);assert.equal(await page.locator('#content select').count(),0);await page.screenshot({path:'_dev/reports/v31.0.1.4-audio1/live-preparation.png'});await page.locator('[data-act=start]').click();
  await page.locator('#coinRoot [data-act=begin]').click();await page.waitForSelector('.battle-wrap[data-turn=p]',{timeout:20000});
  await page.waitForFunction(()=>HemicycleAudio.status().scene==='battle'&&HemicycleAudio.status().musicSources===2);const musicBefore=await page.evaluate(()=>HemicycleAudio.status().musicStarts);await page.locator('[data-tutorial=hand] [data-buid]').first().click();await page.waitForFunction(()=>document.querySelectorAll('[data-tutorial=player] [data-buid]').length===1);
  await page.locator('[data-act=end]').click();await page.waitForSelector('.battle-wrap[data-turn=p]',{timeout:20000});
  assert.ok(await page.locator('[data-tutorial=enemy] [data-buid]').count());assert.equal(await page.evaluate(()=>HemicycleAudio.status().musicStarts),musicBefore,'local AI turns preserve the running music');
  console.log('Published AI battle started and responded');await page.waitForFunction(async()=>!!(await navigator.serviceWorker.getRegistration())?.active,null,{timeout:60000});await page.waitForFunction(()=>navigator.serviceWorker.controller);
  await page.waitForFunction(async()=>!!await caches.match(new URL('assets/actions/art-atlas.png',location.href)),null,{timeout:60000});
  report.caches=await page.evaluate(()=>caches.keys());assert.ok(report.caches.includes('hemiciclo-v31.0.1.4-audio1'));
  const before=await page.evaluate(()=>localStorage.getItem('hemiciclo_v21'));await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded'});await dismiss(page);
  assert.equal(await page.evaluate(()=>localStorage.getItem('hemiciclo_v21')),before);
  await page.locator('#tabbar [data-go=coleccion]').click();await page.locator('[data-act=collection-type]').click();assert.equal(await page.locator('#gridBox .action-card').count(),2);
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.accountRequests,[]);
  Object.assign(report,{cumulativeChangelogVersions:['v31.0.1.1','v31.0.1.2','v31.0.1.3','v31.0.1.4'],localMusicContinuous:true,sharedFavoriteSelector:true,actionPreview:true,publishedCatalog:true,collectionToggle:true,actionRulesAndArt:true,twoOptionalSlots:true,visibleAIStartAndResponse:true,newPWACache:true,offlineInventoryPreserved:true,verifiedAt:new Date().toISOString()});
  fs.writeFileSync('_dev/reports/v31.0.1.4-audio1/live-browser.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
