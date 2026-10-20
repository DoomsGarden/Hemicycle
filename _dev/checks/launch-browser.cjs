const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const {cards,root}=require('../market/catalog.cjs');
const out=root+'/_dev/previews/v30.2.60';fs.mkdirSync(out,{recursive:true});
const profile={fs:7654,elo:888,w:8,l:3,album:cards.slice(0,10).map(c=>c.id),lastDaily:1,lastWeekly:2,dtWins:0,dtGoldUnlocked:false,dtGoldActive:false};
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});const errors=[];
try{for(const width of [320,360,393,851,1280]){
 const context=await browser.newContext({viewport:{width,height:width===320?568:width===360?640:width===851?393:851},serviceWorkers:'block',isMobile:width<500,hasTouch:true});
 await context.addInitScript(p=>localStorage.setItem('hemiciclo_v21',JSON.stringify(p)),profile);const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8022/Hemicycle/');
 const saved=await page.evaluate(()=>localStorage.getItem('hemiciclo_v21'));
 assert.ok(await page.locator('#app').evaluate(e=>e.inert));assert.equal(await page.locator('#app').getAttribute('aria-hidden'),'true');
 const sequence=await page.evaluate(()=>['.launch-logo','.launch-name','.launch-start'].map(s=>parseFloat(getComputedStyle(document.querySelector(s)).animationDelay)));assert.ok(sequence[0]<sequence[1]&&sequence[1]<sequence[2]);
 await page.waitForFunction(()=>!document.querySelector('.launch-start').disabled&&Number(getComputedStyle(document.querySelector('.launch-start')).opacity)>.99);
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.className),'launch-start');
 assert.ok(await page.evaluate(async()=>{await document.fonts.load('23px Anton');return document.fonts.check('23px Anton')}));
 assert.ok(await page.locator('#launchScreen').evaluate(e=>e.scrollWidth<=e.clientWidth&&e.scrollHeight<=e.clientHeight));
 await page.screenshot({path:out+'/entrada-'+width+'.png'});
 const initialY=await page.locator('.launch-logo').evaluate(e=>e.getBoundingClientRect().top);
 await page.locator('.launch-start').click();await page.waitForTimeout(350);
 const moving=await page.evaluate(()=>({opacity:Number(getComputedStyle(document.querySelector('#launchScreen')).opacity),top:document.querySelector('.launch-logo').getBoundingClientRect().top,scale:getComputedStyle(document.querySelector('.launch-name')).transform,buttonOpacity:Number(getComputedStyle(document.querySelector('.launch-start')).opacity)}));
 assert.ok(moving.top<initialY-10);assert.ok(moving.opacity<1);assert.notEqual(moving.scale,'none');assert.equal(moving.buttonOpacity,0);
 if(width===393)await page.screenshot({path:out+'/entrada-transicion.png'});
 await page.waitForSelector('#launchScreen',{state:'detached'});assert.equal(await page.locator('#app').evaluate(e=>e.inert),false);assert.equal(await page.locator('#app').getAttribute('aria-hidden'),null);
 assert.equal(await page.evaluate(()=>localStorage.getItem('hemiciclo_v21')),saved);assert.ok(await page.locator('.hud-strip').evaluate(e=>e.getBoundingClientRect().height<43));
 await page.locator('#tabbar [data-go=coleccion]').click();await page.locator('#tabbar [data-go=menu]').click();assert.equal(await page.locator('#launchScreen').count(),0);
 await page.reload();assert.equal(await page.locator('#launchScreen').count(),1);console.log(width+'px: sequential entrance, font, bounds, upward logo, shrinking name, button disappearance, smooth fade, focus/inert, once per opening and unchanged save passed');await context.close();
}
for(const reduced of [true,false]){
 const context=await browser.newContext({viewport:{width:393,height:851},serviceWorkers:'block',reducedMotion:reduced?'reduce':'no-preference'});
 if(!reduced)await context.route('**/js/launch-screen.js*',r=>r.abort('failed'));
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8022/Hemicycle/');
 if(reduced){assert.equal(await page.locator('.launch-logo').evaluate(e=>getComputedStyle(e).animationName),'none');assert.equal(await page.locator('.launch-start').isDisabled(),false);await page.locator('.launch-start').click();await page.waitForSelector('#launchScreen',{state:'detached',timeout:1000});}
 else {assert.equal(await page.locator('#launchScreen').count(),0);assert.equal(await page.locator('#app').evaluate(e=>e.inert),false);}
 await context.close();
}assert.deepEqual(errors,[]);console.log('Reduced motion and unavailable entrance-script fallback passed; browser errors: 0');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
