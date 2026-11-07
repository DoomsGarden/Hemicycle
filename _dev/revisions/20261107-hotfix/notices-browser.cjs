'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..'),legal=require(root+'/js/legal-documents.js'),catalog=require(root+'/js/orator-catalog.js'),actions=require(root+'/js/action-cards.js'),qa=path.join(__dirname,'qa');
fs.mkdirSync(qa,{recursive:true});
const html=fs.readFileSync(root+'/index.html','utf8').replace('function boot(){','window.Repair={profile:D,go:go,notice:maybeExpansionNotice};function boot(){');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});try{
 for(const mode of ['button','outside','timeout','interrupted']){
  const context=await b.newContext({viewport:{width:mode==='timeout'?393:412,height:mode==='timeout'?851:915},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  await context.route('https://**/*',r=>r.abort());await context.route('http://127.0.0.1:8025/',r=>r.fulfill({contentType:'text/html',body:html}));
  await context.addInitScript(({legal,cards,actions})=>{
   localStorage.setItem('hemicycle_legal_acceptance_v1',JSON.stringify({id:crypto.randomUUID(),version:legal.version,hash:legal.hash,accepted:true,acceptedAt:new Date().toISOString(),ageBand:'18+',syncedAccounts:[]}));
   localStorage.setItem('hemiciclo_v21',JSON.stringify({fs:815,w:392,l:51,elo:3667,album:cards.slice(0,8).map(c=>c.id),actionAlbum:actions.slice(0,4).map(c=>c.id),expansionEvent:{id:'expansion-2026-11',announced:true,mailVisited:true,claimed:['fs','comun','raro','legendario','mitico']},revisionEvent:{id:'revision-gabinetes-2026-11',announced:true,mailVisited:true,claimed:['fs','comun']}}));
   for(const k of ['hemiciclo_tutorial_v1','hemiciclo_menu_tutorial_v1'])localStorage.setItem(k,JSON.stringify({status:'completed'}));
  },{legal,cards:catalog.cards,actions:actions.cards});
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:8025/');await p.locator('.launch-start').click();await p.waitForSelector('#launchScreen',{state:'hidden'});if(await p.locator('[data-profile=guest]').count())await p.locator('[data-profile=guest]').click();await p.waitForFunction(()=>window.HemicycleEntered);
  await p.evaluate(()=>{localStorage.removeItem('hemiciclo_tutorial_v1');Repair.notice();});
  if(mode==='timeout')await p.addStyleTag({content:':root{--ui-text-scale:1.16!important}'});
  await p.waitForSelector('.expansion-notice');assert.equal(await p.locator('.expansion-notice').getAttribute('data-event-id'),'revision-gabinetes-2026-11');
  await p.locator('.event-gift img').evaluate(i=>i.decode());
  if(mode==='interrupted'){
   const previous=await p.locator('.expansion-notice').getAttribute('data-event-started-at');
   await p.evaluate(()=>document.getElementById('modalRoot').replaceChildren());
   await p.waitForFunction(previous=>{const n=document.querySelector('.expansion-notice');return n&&n.dataset.eventStartedAt!==previous;},previous);
   assert.equal(await p.evaluate(()=>Object.keys(localStorage).some(k=>k.startsWith('hemicycle_event_presentations_v2:'))),false);
  }
  if(mode==='button')await p.screenshot({path:path.join(qa,'recovered-event.png')});
  if(mode==='button'||mode==='interrupted')await p.locator('.expansion-notice [data-modal=confirm]').click();
  else if(mode==='outside')await p.locator('.modal-bg').click({position:{x:2,y:2}});
  else await p.waitForSelector('.expansion-notice',{state:'hidden',timeout:18000});
  await p.waitForSelector('.mail-comment-hint',{state:'visible'});const hint=await p.locator('.mail-comment-hint').boundingBox();assert.ok(hint.x>=0&&hint.x+hint.width<= (mode==='timeout'?393:412));
  const after=await p.evaluate(()=>({fs:Repair.profile().fs,claimed:Repair.profile().revisionEvent.claimed,album:Repair.profile().album}));assert.equal(after.fs,815);assert.deepEqual(after.claimed,['fs','comun']);assert.equal(after.album.length,8);
  if(mode==='button'){
   await p.screenshot({path:path.join(qa,'recovered-reminder.png')});
   await p.locator('[data-act=home-tools]').click();await p.waitForSelector('.mail-comment-hint',{state:'hidden'});assert.equal(await p.locator('.home-action-toggle>svg').evaluate(e=>getComputedStyle(e).animationName),'mail-tools-indicator');
   await p.locator('[data-act=home-tools]').click();await p.waitForSelector('.mail-comment-hint',{state:'visible'});
   await p.locator('[data-go=buzon]').first().click();assert.equal(await p.locator('.mail-comment-hint').count(),0);await p.evaluate(()=>Repair.go('menu'));await p.waitForTimeout(900);assert.equal(await p.locator('.expansion-notice').count(),0);assert.equal(await p.locator('.mail-comment-hint').count(),0);
  }
  assert.deepEqual(errors,[]);console.log('PASS recovered event, '+mode+' dismiss, reminder, unchanged claims/resources');await context.close();
 }
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
