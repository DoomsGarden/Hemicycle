const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const {cards,root}=require('../market/catalog.cjs');
const profile={fs:4321,elo:321,w:5,l:3,album:cards.slice(0,9).flatMap(c=>[c.id,c.id]),lastDaily:1,lastWeekly:2};
const version=fs.readFileSync(root+'/index.html','utf8').match(/var VERSION='([^']+)'/)[1],folder=path.join(root,'_dev/previews',version);fs.mkdirSync(folder,{recursive:true});
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});const errors=[];
try{for(const width of [320,360,393,1280]){
const context=await browser.newContext({viewport:{width,height:851},serviceWorkers:'block'});await context.addInitScript(d=>localStorage.setItem('hemiciclo_v21',JSON.stringify(d)),profile);
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8022/Hemicycle/');const save=await page.evaluate(()=>localStorage.getItem('hemiciclo_v21'));
const height=await page.locator('.hud-strip').evaluate(e=>e.getBoundingClientRect().height);assert.ok(height<43);
for(const section of ['tienda','coleccion','menu','liga','mercado']){
await page.locator('#tabbar [data-go="'+section+'"]').click();await page.waitForTimeout(230);
assert.equal(await page.locator('#tabbar .tab.on').count(),1);assert.equal(await page.locator('#tabbar .tab.on').getAttribute('data-go'),section);
const measures=await page.locator('#tabbar .tab').evaluateAll(es=>es.map(e=>{const i=e.querySelector('.nav-icon'),c=getComputedStyle(i);return{active:e.classList.contains('on'),h:e.getBoundingClientRect().height,ih:i.getBoundingClientRect().height,shadow:c.boxShadow,background:c.backgroundImage}}));
assert.ok(measures.every(m=>m.shadow!=='none'&&m.background.includes('linear-gradient')));assert.ok(measures.find(m=>m.active).h>Math.max(...measures.filter(m=>!m.active).map(m=>m.h)));
assert.ok(await page.locator('#tabbar').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
}
const button=page.locator('#tabbar .tab.on');await button.hover();await page.mouse.down();await page.waitForTimeout(180);assert.match(await button.locator('.nav-icon').evaluate(e=>getComputedStyle(e).transform),/matrix\(1, 0, 0, 1, 0, 3\)/);await page.mouse.up();
assert.equal(await page.evaluate(()=>localStorage.getItem('hemiciclo_v21')),save);
await page.screenshot({path:path.join(folder,'mercado-insignias-'+width+'.png')});
await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await button.locator('.nav-icon').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
console.log(width+'px: all five sections, active elevation, metallic relief, press, reduced motion, compact statistics and unchanged save passed');await context.close();
}assert.deepEqual(errors,[]);}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
