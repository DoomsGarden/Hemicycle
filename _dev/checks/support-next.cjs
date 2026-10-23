const assert=require('node:assert/strict'),fs=require('node:fs'),{chromium}=require('playwright');
const dismiss=require('./launch-helper.cjs'),{cards,root}=require('../market/catalog.cjs');
const base='http://127.0.0.1:8022/Hemicycle/',output=root+'/_dev/previews/next-combat';fs.mkdirSync(output,{recursive:true});
const html=fs.readFileSync(root+'/index.html','utf8'),instrumented=html.replace(/\}\)\(\);\s*<\/script>/,"window.__actions={get game(){return G;},get tutorial(){return TUTORIAL;},newBattle:newBattle,begin:beginDebate,play:playCard,paint:paint,startTurn:startTurn,attack:attack,heal:useSupport,go:go,choose:choosePlayerAction};})();</script>");
const profile={fs:9421,elo:777,w:12,l:4,album:cards.map(c=>c.id),lastDaily:1,lastWeekly:2};
const report={ui:[],tutorials:[],errors:[]};
async function pinch(cdp,page,x,y){
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-35,y,id:1},{x:x+35,y,id:2}]});
 for(let i=1;i<=8;i++){
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-35-i*9,y,id:1},{x:x+35+i*9,y,id:2}]});
  await page.waitForTimeout(20);
 }
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(70);
}

(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
async function open(viewport,{tutorial=false,reduced=false,instrument=true}={}){
 const context=await browser.newContext({viewport,isMobile:viewport.width<600,hasTouch:true,serviceWorkers:'block',reducedMotion:reduced?'reduce':'no-preference'});
 await context.addInitScript(({profile,tutorial})=>{localStorage.setItem('hemiciclo_v21',JSON.stringify(profile));localStorage.setItem('hemiciclo_menu_tutorial_v1',JSON.stringify({status:'completed'}));if(!tutorial)localStorage.setItem('hemiciclo_tutorial_v1',JSON.stringify({status:'completed'}));}, {profile,tutorial});
 if(instrument)await context.route('**/Hemicycle/',r=>r.fulfill({contentType:'text/html',body:instrumented}));
 const page=await context.newPage();page.setDefaultTimeout(8000);page.on('pageerror',e=>report.errors.push(e.message));await page.goto(base);await dismiss(page);return {page,context};
}
async function setup(page){return page.evaluate(()=>{
 const t=window.__actions;t.newBattle('normal',null,true);t.begin();const g=t.game,a=g.leader.p;t.play('p',a.uid);g.tutorial=false;g.turnDeadline=Date.now()+90000;g.leader.p={uid:'not-in-field'};g.leader.e={uid:'also-not-in-field'};a.a=5;a.h=5;a.hm=11;a.buff=0;g.hand.p=[];g.field.e[0].h=g.field.e[0].hm=100;g.field.e[0].a=5;t.paint();window.__testActor=a;window.__testEnemy=g.field.e[0];return {uid:a.uid,quotes:a.q};
});}
async function clickAction(page,kind){await page.locator('[data-baction="'+kind+'"]').click();await page.waitForTimeout(350);}
function geometry(){const root=document.getElementById('battleActionRoot'),r=root.getBoundingClientRect(),card=document.querySelector('[data-tutorial=player] .sel').getBoundingClientRect();return {popup:r.toJSON(),card:card.toJSON(),width:innerWidth,height:innerHeight,scrollHeight:root.firstElementChild.scrollHeight,clientHeight:root.firstElementChild.clientHeight,scrollWidth:root.firstElementChild.scrollWidth,clientWidth:root.firstElementChild.clientWidth,buttons:[...root.querySelectorAll('.battle-option')].map(b=>({height:b.getBoundingClientRect().height,font:getComputedStyle(b.querySelector('.battle-option-copy>span')).fontSize,overflow:b.scrollWidth>b.clientWidth}))};}
function checkGeometry(g,label){assert.ok(g.popup.top>=0,label+': '+JSON.stringify(g));assert.ok(g.popup.left>=0&&g.popup.right<=g.width+.5,label);assert.ok(g.popup.bottom<=g.card.top+.5,label);assert.ok(g.popup.height<g.height*.75,label);assert.ok(g.scrollHeight<=g.clientHeight+1,label+' vertical overflow '+JSON.stringify(g));assert.ok(g.scrollWidth<=g.clientWidth+1,label+' horizontal overflow');for(const b of g.buttons){assert.ok(b.height>=44,label);assert.ok(parseFloat(b.font)>=13,label);assert.equal(b.overflow,false,label);}}
try{
for(const viewport of [{width:320,height:568},{width:393,height:851},{width:851,height:393}]){
 const {page,context}=await open(viewport);const data=await setup(page);
 const actor=()=>page.locator('[data-tutorial=player] [data-buid="'+data.uid+'"]');
 await actor().click();await clickAction(page,'support');await clickAction(page,'heal');assert.equal(await page.evaluate(()=>__testActor.h),8);
 // Use the real turn transition, while suppressing the unrelated scheduled AI.
 await page.evaluate(()=>{const t=__actions,g=t.game;g.tutorial=true;t.startTurn('e');t.startTurn('p');g.tutorial=false;g.turnDeadline=Date.now()+90000;});
 await actor().click();await clickAction(page,'support');assert.equal(await page.locator('[data-baction=heal]').isDisabled(),true);assert.match(await page.locator('[data-baction=heal]').innerText(),/Descansa este turno/);checkGeometry(await page.evaluate(geometry),viewport.width+' healing rest');assert.equal(await page.evaluate(()=>__testActor.ready),true);
 await clickAction(page,'guard');assert.equal(await page.locator('.battle-guard').count(),1);
 await page.evaluate(()=>{const t=__actions,g=t.game;g.tutorial=true;t.startTurn('e');});assert.equal(await page.locator('.battle-guard').count(),1);
 await page.evaluate(()=>{const t=__actions,g=t.game;t.startTurn('p');g.tutorial=false;g.turnDeadline=Date.now()+90000;});assert.equal(await page.locator('.battle-guard').count(),0);
 await actor().click();await clickAction(page,'support');assert.equal(await page.locator('[data-baction=heal]').isDisabled(),false);await clickAction(page,'heal');assert.equal(await page.evaluate(()=>__testActor.h),11);assert.equal(await page.evaluate(()=>__testActor.ready),false);
 report.ui.push({...viewport,healRestDisabled:true,healAvailableAfterRest:true,guardExpiresAtNextOwnTurn:true});await context.close();console.log(viewport.width+'px support restrictions passed');
}
assert.deepEqual(report.errors,[]);fs.writeFileSync(root+'/_dev/reports/next-combat/support-ui.json',JSON.stringify(report,null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
