const dismiss=require('./launch-helper.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {chromium} = require('playwright');
const root = '/workspace/Hemicycle';
const html = fs.readFileSync(root+'/index.html','utf8');
const data = vm.createContext({});
vm.runInContext(html.match(/function slug\(s\)\{[^\n]+/)[0]+'\n'+html.slice(html.indexOf('var DOCS='),html.indexOf("var LS='")),data);
const cards = JSON.parse(vm.runInContext('JSON.stringify(CARDS)',data));
const profile = {fs:76543,elo:855,w:12,l:7,album:cards.map(c=>c.id).concat(['isabel-cela','donald-trump']),lastDaily:1770000000000,lastWeekly:1770000000010,dtWins:14,dtGoldUnlocked:true,dtGoldActive:false};
const output='/workspace/Hemicycle/_dev/previews/v31.0.0.4/matches';
fs.mkdirSync(output,{recursive:true});
const errors=[], results=[], onlyHelp=process.env.HELP_ONLY==='1';
const instrumented = html.replace(/\}\)\(\);\s*<\/script>/, [
'window.__battle={get game(){return G;},get result(){return SO;},',
'cards:CARDS,mk:mk,startTurn:startTurn,aiStep:aiStep,clearAI:clearAI,paint:paint,',
'get profile(){return D();},get league(){return ligaLoad();}};',
'})();</script>'
].join(''));
async function newPage(browser, first, instrument = false, viewport = {width:393,height:851}) {
 const context = await browser.newContext({viewport,isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(({profile,first})=>{
  localStorage.setItem('hemiciclo_v21',JSON.stringify(profile));
  for(const k of ['hemiciclo_tutorial_v1','hemiciclo_menu_tutorial_v1'])localStorage.setItem(k,JSON.stringify({status:'completed'}));
  Math.random=()=>first==='p'?0.25:0.75;
 },{profile,first});
 if(instrument)await context.route('**/Hemicycle/',route=>route.fulfill({status:200,contentType:'text/html',body:instrumented}));
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install();
 await page.goto('http://127.0.0.1:8022/Hemicycle/');await dismiss(page);
 return {context,page};
}
async function startMode(page,mode,first) {
 if(mode==='rapida'){await page.locator('[data-act="play-menu"]').click();await page.locator('[data-act="play-mode"][data-mode="rapida"]').click();await page.locator('[data-act="play"]').click();}
 else {
  if(mode==='liga'){
   await page.locator('#tabbar [data-go="liga"]').click();
   await page.locator('[data-act="liganew"]').click();
   await page.locator('[data-act="ligajugar"]').click();
  } else {await page.locator('[data-act="play-menu"]').click();await page.locator('[data-act="play-mode"][data-mode="'+mode+'"]').click();await page.locator('[data-act="play"]').click();}
  await page.locator('[data-act="auto"]').click();
  await page.locator('[data-act="start"]').click();
 }
 assert.match(await page.locator('#coinRoot h3').innerText(),/Cara o cruz/);
 assert.equal(await page.locator('#content .battle-wrap').count(),1);
 assert.equal(await page.locator('#content').evaluate(el=>el.inert),true);
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('#coinRoot [role="dialog"]').count(),1);
 await page.keyboard.press('Tab');
 assert.equal(await page.evaluate(()=>document.activeElement?.dataset.act),'begin');
 assert.equal(await page.locator('.coin-face').innerText(),first==='p'?'CARA':'CRUZ');
 assert.equal(await page.locator('[data-act="end"]').isDisabled(),true);
 await page.screenshot({path:output+'/coin-'+mode+'-'+first+'.png'});
 await page.locator('#coinRoot [data-act="begin"]').click();
 assert.equal(await page.locator('#coinRoot [role="dialog"]').count(),0);
 assert.equal(await page.locator('#content').evaluate(el=>el.inert),false);
 assert.equal(await page.locator('[data-act="end"]').isDisabled(),first==='e');
 const voteTexts=await page.locator('.vbar.me b, .vbar.foe b').evaluateAll(nodes=>[nodes.find(n=>n.parentElement.classList.contains('me')).textContent,nodes.find(n=>n.parentElement.classList.contains('foe')).textContent]);
 assert.deepEqual(voteTexts,first==='p'?['3/100','0/100']:['0/100','3/100']);
 if(first==='e')await page.clock.runFor(8000);
}
async function completeGame(page) {
 let turns=0;
 while(await page.locator('[data-act="end"]').count()){
  assert.ok(turns++<100,'match must reach 100 votes without a round limit');
  assert.equal(await page.locator('[data-act="end"]').isDisabled(),false);
  for(const uid of await page.locator('.row [data-buid]').evaluateAll(els=>els.map(e=>e.dataset.buid))){
   const card=page.locator('.row [data-buid="'+uid+'"]');
   if(await card.count())await card.click({force:true});
  }
  for(const uid of await page.locator('.tribuna [data-side="p"]:not(.busy)').evaluateAll(els=>els.map(e=>e.dataset.buid))){
   if(!await page.locator('[data-act="end"]').count())break;
   const attacker=page.locator('.tribuna [data-buid="'+uid+'"]');
   if(!await attacker.count())continue;
   await attacker.click({force:true});
   const strong=page.locator('[data-baction=strong]');
   await page.locator('[data-baction="'+(await strong.isDisabled()?'normal':'strong')+'"]').click();
   await page.locator('.tribuna [data-side="e"]').first().click({force:true});
  }
  if(await page.locator('[data-act="end"]').count())await page.locator('[data-act="end"]').click();
  await page.clock.runFor(8000);
 }
 return {playerTurns:turns,title:await page.locator('#content h2').first().innerText(),text:await page.locator('#content').innerText()};
}
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try {
  // Complete real matches through the production UI, without injected hooks.
  for(const mode of (onlyHelp||process.env.DEADLINE_ONLY?[]:process.env.RANKED_ONLY?['ranked']:['normal','ranked','liga','rapida'])){
   for(const first of ['p','e']){
    const {context,page}=await newPage(browser,first);
    await startMode(page,mode,first);
    const result=await completeGame(page);
    assert.match(result.title,/Victoria|Derrota|Empate/);
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('hemiciclo_v21')));
    assert.equal(saved.w+saved.l,profile.w+profile.l+(result.title==='Empate'?0:1));
    if(mode==='normal'||mode==='rapida'){
     assert.equal(saved.elo,profile.elo);
     assert.deepEqual(saved.album,profile.album);
    }
    if(mode==='liga'){
     const league=await page.evaluate(()=>JSON.parse(localStorage.getItem('hemiciclo_liga_v9')));
     assert.equal(league.jor,2);
     assert.equal(league.teams.find(t=>t.you).pts,result.title==='¡Victoria!'?3:result.title==='Empate'?1:0);
    }
    await page.screenshot({path:output+'/result-'+mode+'-'+first+'.png'});
    results.push({kind:'full-match',mode,first,...result});
    console.log('Full match passed:',mode,first,result.title);
    await context.close();
   }
  }
  // Controlled state is injected only in the served test copy, never in app files.
  for(const mode of (onlyHelp||process.env.DEADLINE_ONLY?[]:process.env.RANKED_ONLY?['ranked']:['normal','ranked','liga'])){
   for(const side of ['p','e']){
    for(const gain of ['passive','expulsion','foco']){
     const {context,page}=await newPage(browser,'p',true);
     await startMode(page,mode,'p');
     const setup=await page.evaluate(({side,gain})=>{
      const t=window.__battle,g=t.game,foe=side==='p'?'e':'p';
      t.clearAI();g.n=side==='p'?13:12;g.side=side;g.votes={p:25,e:25};g.votes[side]=99;
      g.field={p:[],e:[]};g.hand={p:[],e:[]};g.deck={p:[],e:[]};g.pas={p:[],e:[]};
      if(gain==='passive'){
       g.votes[side]=97;t.startTurn(side);
       return {n:g.n,foeHand:0};
      }
      const atk=t.mk(t.cards.find(c=>gain==='foco'?c.pa==='foco':c.pa==='viperina'),false);
      const target=t.mk(t.cards.find(c=>c.pa==='guardia'),false);
      atk.a=100;target.h=1;g.field[side]=[atk];g.field[foe]=[target];
      if(gain==='foco')g.leader[side]=atk;else g.votes[side]=100-target.v;
      t.paint();
      if(side==='e')t.aiStep();
      return {atk:atk.uid,target:target.uid,n:g.n,foeHand:0};
     },{side,gain});
     if(gain!=='passive'&&side==='p'){
      await page.locator('.tribuna [data-buid="'+setup.atk+'"]').click();
      await page.locator('[data-baction=normal]').click();
      await page.locator('.tribuna [data-buid="'+setup.target+'"]').click();
     }
     assert.equal(await page.locator('#content h2').first().innerText(),side==='p'?'¡Victoria!':'Derrota');
     const state=await page.evaluate(()=>({g:window.__battle.game,profile:window.__battle.profile,league:window.__battle.league,result:window.__battle.result}));
     assert.equal(state.g.votes[side],100);
     assert.equal(state.g.n,setup.n);
     assert.equal(state.result.who,side);
     assert.ok(state.g.done);
     if(mode==='ranked'){
      assert.equal(state.result.eloDelta,side==='p'?25:-14);
      assert.equal(state.profile.elo,profile.elo+(side==='p'?25:-14));
      assert.match(await page.locator('#content').innerText(),side==='p'?/\+25 Elo/:/-14 Elo/);
     }
     await page.clock.runFor(15000);
     const later=await page.evaluate(()=>({g:window.__battle.game,profile:window.__battle.profile,league:window.__battle.league,result:window.__battle.result}));
     assert.deepEqual(later,state,'no delayed actions or duplicate rewards after 100');
     results.push({kind:'immediate-100',mode,side,gain,votes:state.g.votes,eloDelta:state.result.eloDelta});
     console.log('Immediate 100 passed:',mode,side,gain);
     await context.close();
    }
   }
  }
  // Deadlines use elapsed time, including when another menu is open.
  if(!onlyHelp)for(const side of ['p','e']){
   const {context,page}=await newPage(browser,'p',true);await startMode(page,'ranked','p');
   await page.evaluate(side=>{const t=window.__battle;t.clearAI();t.game.side=side;t.game.turnDeadline=Date.now()+60000;t.paint();},side);
   assert.match(await page.locator('#turnClock').innerText(),/60/);
   const hand=await page.locator('.hand-zone .cromo').count();assert.ok(hand<=2);
   await page.clock.runFor(1000);assert.equal(await page.locator('.battle-wrap').count(),1);
   await page.goBack();await page.clock.runFor(60000);
   assert.equal(await page.locator('#content h2').first().innerText(),side==='p'?'Abandono por inactividad':'¡Victoria!',JSON.stringify(await page.evaluate(()=>({now:Date.now(),g:window.__battle.game}))));
   assert.match(await page.locator('#content').innerText(),/inactividad/);
   const settled=await page.evaluate(()=>window.__battle.profile);await page.clock.runFor(65000);
   assert.deepEqual(await page.evaluate(()=>window.__battle.profile),settled);
   results.push({kind:'inactivity',side});await context.close();console.log('Absolute 60-second deadline, menu navigation and single settlement passed:',side);
  }
  if(!process.env.DEADLINE_ONLY)
  // Help and coin remain usable on a small mobile display.
  {
   const {context,page}=await newPage(browser,'e',false,{width:360,height:640});
   await page.locator('#appbar [data-go="ayuda"]').click();
   assert.ok(await page.locator('#content').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
   const helpButton=page.locator('#content [data-go="menu"]');
   await helpButton.scrollIntoViewIfNeeded();assert.ok(await helpButton.isVisible());
   assert.ok(await helpButton.evaluate(el=>{const b=el.getBoundingClientRect(),p=document.getElementById('content').getBoundingClientRect();return b.bottom<=p.bottom&&b.top>=p.top;}),'help button not clipped');
   await helpButton.click();
   await startMode(page,'rapida','e');
   await context.close();
  }
  assert.deepEqual(errors,[]);
  fs.writeFileSync(output+(process.env.DEADLINE_ONLY?'/deadline-results.json':onlyHelp?'/help-results.json':process.env.RANKED_ONLY?'/ranked-results.json':'/results.json'),JSON.stringify({results,browserErrors:errors},null,2));
  console.log(JSON.stringify({completedMatches:results.filter(r=>r.kind==='full-match').length,immediate100Scenarios:results.filter(r=>r.kind==='immediate-100').length,browserErrors:errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
