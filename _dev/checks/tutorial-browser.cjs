const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const {cards,root}=require('../market/catalog.cjs');
const out=root+'/_dev/previews/v30.2.59';fs.mkdirSync(out,{recursive:true});
const old={fs:9421,elo:777,w:12,l:4,album:cards.slice(0,9).map(c=>c.id),dtWins:9,dtGoldUnlocked:false,dtGoldActive:false,lastDaily:1,lastWeekly:2};
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});const errors=[];
try{for(const width of [320,360,393,851,1280]){
const context=await browser.newContext({viewport:{width,height:width===320?568:width===360?640:width===851?393:851},isMobile:width<500,hasTouch:true,serviceWorkers:'block'});
await context.addInitScript(d=>{localStorage.setItem('hemiciclo_v21',JSON.stringify(d));localStorage.setItem('hemiciclo_liga_v9',JSON.stringify({sentinel:'untouched'}))},old);
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8022/Hemicycle/');
const saved=await page.evaluate(()=>localStorage.getItem('hemiciclo_v21'));
await page.locator('[data-act="play"]').click();
for(let i=0;i<19;i++){
 await page.waitForSelector('.tutorial-focus');
 const geometry=await page.evaluate(()=>{const t=document.querySelector('.tutorial-focus').getBoundingClientRect(),c=document.querySelector('.tutorial-coach').getBoundingClientRect();return{overlap:Math.min(t.right,c.right)>Math.max(t.left,c.left)&&Math.min(t.bottom,c.bottom)>Math.max(t.top,c.top),height:c.height,top:c.top,bottom:c.bottom,targetTop:t.top,targetBottom:t.bottom,scroll:document.documentElement.scrollTop,abandon:document.querySelector('[data-act="abandon"]').classList.contains('tutorial-focus')}});
 assert.equal(geometry.overlap,false,JSON.stringify({width,i,geometry}));assert.ok(geometry.height<300,JSON.stringify({width,i,geometry}));assert.equal(geometry.abandon,false);assert.ok(geometry.top>=0);assert.ok(geometry.bottom<=(width===320?568:width===360?640:width===851?393:851));assert.equal(geometry.scroll,0);
 if(width===393&&[0,4,7,9,15,18].includes(i))await page.screenshot({path:out+'/tutorial-'+i+'.png'});
 await page.locator('.tutorial-focus').click();
 if(i===4)assert.equal(await page.locator('[data-tutorial=player] .lead').count(),1);
 if(i===7||i===13)assert.equal(await page.locator('[data-tutorial=enemy] .cromo').count(),0);
 if(i===9)assert.ok(await page.locator('[data-act=end]').isDisabled());
 if(i===10)assert.equal(await page.locator('[data-act=end]').isDisabled(),false);
 if(i===11)assert.equal(await page.locator('[data-tutorial=player] .cromo').count(),2);
 if(i===15)assert.match(await page.locator('.vbar.me').innerText(),/98\/100/);
}
await page.waitForSelector('[data-act="play"]');assert.match(await page.locator('#content').innerText(),/Tutorial completado/);
assert.equal(await page.evaluate(()=>localStorage.getItem('hemiciclo_v21')),saved);
assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('hemiciclo_tutorial_v1')).status),'completed');
assert.equal(await page.evaluate(()=>localStorage.getItem('hemiciclo_liga_v9')),JSON.stringify({sentinel:'untouched'}));
await page.reload();await page.locator('[data-act="play"]').click();assert.equal(await page.locator('.tutorial-focus').count(),0);assert.ok(await page.locator('[data-act="start"]').count());
await page.locator('#tabbar [data-go="menu"]').click();await page.locator('#appbar [data-go="ayuda"]').click();await page.locator('[data-act="tutorial"]').click();assert.equal(await page.locator('.tutorial-focus').count(),1);
await page.locator('[data-act="abandon"]').click();assert.match(await page.locator('#modalRoot').innerText(),/No perderás cromos/);await page.locator('[data-modal="cancel"]').click();assert.equal(await page.locator('.tutorial-focus').count(),1);
await page.locator('[data-act="abandon"]').click();await page.locator('[data-modal="confirm"]').click();assert.match(await page.locator('#content').innerText(),/Práctica terminada/);assert.equal(await page.evaluate(()=>localStorage.getItem('hemiciclo_v21')),saved);
console.log(width+'px: 19 actions, coach does not overlap target, tutorial completion, skip/cancel, replay, reload, no repeated auto-start and no profile/league changes');await context.close();
}
const context=await browser.newContext({viewport:{width:393,height:851},serviceWorkers:'block',reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8022/Hemicycle/');
const fresh=await page.evaluate(()=>localStorage.getItem('hemiciclo_v21'));await page.locator('[data-act=play]').click();
assert.equal(await page.locator('.tutorial-focus').evaluate(e=>getComputedStyle(e).animationName),'none');
await page.goBack();assert.equal(await page.locator('.tutorial-focus').count(),0);await page.locator('[data-act=play]').click();assert.equal(await page.locator('.tutorial-focus').count(),1);
await page.reload();await page.locator('[data-act=play]').click();assert.match(await page.locator('.tutorial-coach small').innerText(),/1 \/ 19/);
await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('data-act')),'abandon');await page.keyboard.press('Tab');
const before=await page.locator('.tutorial-coach small').innerText();await page.locator('[data-tutorial=enemy] .cromo').click();assert.equal(await page.locator('.tutorial-coach small').innerText(),before,'an unrelated card cannot skip the lesson');
await page.locator('.tutorial-focus').focus();for(let i=0;i<19;i++)await page.keyboard.press('Enter');
assert.match(await page.locator('#content').innerText(),/Tutorial completado/);assert.equal(await page.evaluate(()=>localStorage.getItem('hemiciclo_v21')),fresh);
await page.locator('[data-act=play]').click();await page.locator('[data-act=auto]').click();await page.locator('[data-act=start]').click();assert.ok(await page.locator('#coinRoot [role=dialog]').isVisible());assert.equal(await page.locator('.tutorial-focus').count(),0);
console.log('Fresh profile, keyboard-only completion, reduced motion, background action blocking, history/reload interruption and return to normal random coin combat passed');await context.close();
assert.deepEqual(errors,[]);}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
