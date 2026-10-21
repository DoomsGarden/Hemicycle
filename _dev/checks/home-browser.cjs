const dismissLaunch=require('./launch-helper.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const {createMarketServer}=require('../market/server.cjs'),{cards,root}=require('../market/catalog.cjs');
const profile={fs:4321,elo:321,w:5,l:3,album:cards.slice(0,9).flatMap(c=>[c.id,c.id]),lastDaily:1,lastWeekly:2,dtWins:0,dtGoldUnlocked:false,dtGoldActive:false};
const version=fs.readFileSync(root+'/index.html','utf8').match(/var VERSION='([^']+)'/)[1];
const folder=path.join(root,'_dev/previews',version);fs.mkdirSync(folder,{recursive:true});
(async()=>{
 const app=createMarketServer();await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const errors=[];
 try{
  const base='http://127.0.0.1:'+app.server.address().port+'/Hemicycle/';
  for(const width of [393,360,320]){
   const context=await browser.newContext({viewport:{width,height:width===393?851:width===360?640:568},serviceWorkers:'block'});
   await context.addInitScript(profile=>{localStorage.setItem('hemiciclo_tutorial_v1',JSON.stringify({status:'completed'}));localStorage.setItem('hemiciclo_menu_tutorial_v1',JSON.stringify({status:'completed'}));localStorage.setItem('hemiciclo_v21',JSON.stringify(profile));Math.random=()=>0.25;},profile);
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await dismissLaunch(page);
   const selected=()=>page.locator('.hero-fan .art img').evaluateAll(es=>es.map(e=>e.getAttribute('src').match(/\/([^/]+)\.webp$/)[1]));
   const saved=await page.evaluate(()=>localStorage.getItem('hemiciclo_v21'));
   let last=await selected();assert.equal(last.length,3);assert.equal(new Set(last).size,3);assert.ok(last.every(id=>profile.album.includes(id)));
   await page.locator('[data-act="play-menu"]').click();assert.deepEqual(await selected(),last);await page.keyboard.press('Escape');assert.deepEqual(await selected(),last);
   for(let n=0;n<6;n++){
    if(n%2===0)await page.locator('#tabbar [data-go="coleccion"]').click();
    await page.locator('#tabbar [data-go="menu"]').click();const next=await selected();
    assert.equal(next.length,3);assert.equal(new Set(next).size,3);assert.ok(next.every(id=>profile.album.includes(id)));
    assert.notDeepEqual([...next].sort(),[...last].sort(),'clicking Inicio must renew the selection, even with the same random draw');last=next;
   }
   const motion=await page.locator('.hero-fan .cromo').first().evaluate(async el=>{
    const animation=el.getAnimations().find(a=>a.animationName==='heroBob');animation.pause();animation.effect.updateTiming({delay:0});animation.currentTime=0;
    await new Promise(requestAnimationFrame);const start={translate:getComputedStyle(el).translate,transform:getComputedStyle(el).transform};
    animation.currentTime=1800;await new Promise(requestAnimationFrame);const middle={translate:getComputedStyle(el).translate,transform:getComputedStyle(el).transform};return {start,middle};
   });
   const y=value=>Number(value.split(' ')[1].replace('px',''));
   assert.equal(Math.abs(y(motion.start.translate)-y(motion.middle.translate)),5);assert.equal(motion.start.transform,motion.middle.transform);
   for(const selector of ['#appbar','#content','#tabbar'])assert.ok(await page.locator(selector).evaluate(e=>e.scrollWidth<=e.clientWidth+1));
   assert.equal(await page.evaluate(()=>localStorage.getItem('hemiciclo_v21')),saved);
   await page.screenshot({path:path.join(folder,'inicio-aleatorio-'+width+'.png')});
   console.log(width+' px: owned, distinct random cards on six entries; stable on mode selector; 5 px vertical travel without changing rotation; save preserved.');
   await context.close();
  }
  for(const count of [1,2]){
   const d={...profile,album:cards.slice(0,count).map(c=>c.id)};
   const context=await browser.newContext({viewport:{width:393,height:851},serviceWorkers:'block',reducedMotion:'reduce'});
   await context.addInitScript(d=>{localStorage.setItem('hemiciclo_tutorial_v1',JSON.stringify({status:'completed'}));localStorage.setItem('hemiciclo_menu_tutorial_v1',JSON.stringify({status:'completed'}));localStorage.setItem('hemiciclo_v21',JSON.stringify(d));},d);const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await dismissLaunch(page);
   assert.equal(await page.locator('.hero-fan .cromo').count(),count);
   assert.ok(await page.locator('.hero-fan .cromo').evaluateAll(es=>es.every(e=>getComputedStyle(e).animationName==='none')));
   await context.close();
  }
  assert.deepEqual(errors,[]);console.log('Reduced motion and one/two-card collections passed; browser errors: 0.');
 }finally{await browser.close();await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
