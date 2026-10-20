const dismissLaunch=require('./launch-helper.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process'),{chromium}=require('playwright');
const {createMarketServer}=require('../market/server.cjs'),{cards,root}=require('../market/catalog.cjs');
const profile={fs:4321,elo:321,w:18,l:12,album:cards.map(c=>c.id).concat(cards[0].id),lastDaily:1,lastWeekly:2,dtWins:0,dtGoldUnlocked:false,dtGoldActive:false};
const oldHtml=execFileSync('git',['show','da2dc6a:index.html'],{cwd:root}).toString(),oldCss=execFileSync('git',['show','da2dc6a:css/interface.css'],{cwd:root}).toString();
const folder=path.join(root,'_dev/previews/v30.2.60');fs.mkdirSync(folder,{recursive:true});
async function dimensions(page){return page.evaluate(()=>{const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,height:r.height,width:r.width}};return {brand:rect('.brand'),buttons:rect('.abR'),stats:rect('.hud-strip'),header:rect('#appbar')}})}
async function touchDrag(context,page,x,y,dx,dy){
 const cdp=await context.newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 for(let n=1;n<=10;n++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*n/10,y:y+dy*n/10}]});await new Promise(resolve=>setTimeout(resolve,16));}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();await page.waitForTimeout(150);
}
(async()=>{
 const app=createMarketServer();await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+app.server.address().port+'/Hemicycle/';
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});const errors=[];
 try{
  for(const viewport of [{width:393,height:851},{width:360,height:640},{width:320,height:568},{width:1280,height:900}]){
   const before=await browser.newContext({viewport,serviceWorkers:'block'});await before.addInitScript(profile=>localStorage.setItem('hemiciclo_v21',JSON.stringify(profile)),profile);
   await before.route('**/Hemicycle/',r=>r.fulfill({status:200,contentType:'text/html',body:oldHtml}));
   await before.route('**/css/interface.css*',r=>r.fulfill({status:200,contentType:'text/css',body:oldCss}));
   const oldPage=await before.newPage();await oldPage.goto(base);const old=await dimensions(oldPage);await before.close();
   const context=await browser.newContext({viewport,isMobile:viewport.width<800,hasTouch:true,serviceWorkers:'block'});await context.addInitScript(profile=>localStorage.setItem('hemiciclo_v21',JSON.stringify(profile)),profile);
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await dismissLaunch(page);
   const now=await dimensions(page);
   for(const part of ['brand','buttons'])for(const key of ['height','top','width'])assert.ok(Math.abs(old[part][key]-now[part][key])<0.5,part+' '+key+' changed');
   assert.ok(old.stats.height-now.stats.height>=10,'statistics must be at least 10 px shorter');
   for(const selector of ['#appbar','#content','#tabbar'])assert.ok(await page.locator(selector).evaluate(e=>e.scrollWidth<=e.clientWidth+1));
   const saved=await page.evaluate(()=>localStorage.getItem('hemiciclo_v21'));
   const checks=await page.locator('.hero-fan .cromo').first().evaluate(el=>{
    const test=type=>{const e=new Event(type,{bubbles:true,cancelable:true});el.dispatchEvent(e);return e.defaultPrevented};
    return {context:test('contextmenu'),drag:test('dragstart'),selection:test('selectstart')};
   });assert.deepEqual(checks,{context:true,drag:true,selection:true});
   await page.evaluate(()=>document.addEventListener('contextmenu',event=>window.__contextBlocked=event.defaultPrevented,{once:true}));
   await page.mouse.click(viewport.width/2,viewport.height*0.5,{button:'right'});await page.waitForFunction(()=>window.__contextBlocked===true);
   if(viewport.width>800){
    await page.evaluate(()=>{window.__contextBlocked=false;document.addEventListener('contextmenu',event=>window.__contextBlocked=event.defaultPrevented,{once:true})});
    await page.mouse.click(10,100,{button:'right'});await page.waitForFunction(()=>window.__contextBlocked===true);
   }


   await page.mouse.move(viewport.width/2,viewport.height/2);await page.mouse.wheel(0,500);
   await touchDrag(context,page,viewport.width/2,viewport.height*0.65,0,-150);
   assert.deepEqual(await page.evaluate(()=>({window:scrollY,body:document.body.scrollTop,root:document.documentElement.scrollTop,content:document.getElementById('content').scrollTop})),{window:0,body:0,root:0,content:0});
   await page.screenshot({path:path.join(folder,'inicio-'+viewport.width+'.png')});
   await page.locator('#tabbar [data-go="coleccion"]').click();const collection=page.locator('#content');
   await page.mouse.move(viewport.width/2,viewport.height*0.6);await page.mouse.wheel(0,300);await page.waitForFunction(()=>document.getElementById('content').scrollTop>0,{},{timeout:2500});
   assert.ok(await collection.evaluate(e=>e.scrollTop)>0,'collection wheel scroll blocked');
   await collection.evaluate(e=>e.scrollTop=0);await touchDrag(context,page,viewport.width/2,viewport.height*0.7,0,-180);
   assert.ok(await collection.evaluate(e=>e.scrollTop)>0,'collection touch scroll blocked');
   await collection.evaluate(e=>e.scrollTop=0);await touchDrag(context,page,viewport.width/2,viewport.height*0.55,0,150);
   assert.equal(await collection.evaluate(e=>e.scrollTop),0);assert.equal(await page.evaluate(()=>scrollY),0);
   await page.locator('#fq').fill('Donald Trump');
   assert.equal(await page.locator('#fq').evaluate(e=>getComputedStyle(e).userSelect),'text');
   assert.equal(await page.locator('#fq').evaluate(el=>{const e=new Event('selectstart',{bubbles:true,cancelable:true});el.dispatchEvent(e);return e.defaultPrevented}),false);
   assert.equal(await page.locator('#fq').evaluate(el=>{const e=new Event('contextmenu',{bubbles:true,cancelable:true});el.dispatchEvent(e);return e.defaultPrevented}),true);
   await page.locator('#fq').fill('');await collection.evaluate(e=>e.scrollTop=0);
   await page.locator('#gridBox [data-card="donald-trump"]').click();await page.locator('[data-act="zoomcard"]').click();
   const initial=await page.locator('#zoomCardWrap .nm').innerText();
   await touchDrag(context,page,viewport.width*0.75,viewport.height*0.45,-viewport.width*0.5,0);
   assert.notEqual(await page.locator('#zoomCardWrap .nm').innerText(),initial,'horizontal card swipe blocked');
   await page.keyboard.press('Escape');await page.locator('#tabbar [data-go="tienda"]').click();
   const shop=page.locator('#content .view-body'),max=await shop.evaluate(e=>e.scrollHeight-e.clientHeight);
   if(max>2){await page.mouse.move(viewport.width/2,viewport.height*0.6);await page.mouse.wheel(0,300);await page.waitForTimeout(100);assert.ok(await shop.evaluate(e=>e.scrollTop)>0);}
   assert.equal(await page.evaluate(()=>scrollY),0);assert.equal(await page.evaluate(()=>localStorage.getItem('hemiciclo_v21')),saved);
   console.log(viewport.width+' px: brand row unchanged, statistics '+old.stats.height+' → '+now.stats.height+' px; context/drag blocked, background fixed, collection touch/wheel and card swipes work.');
   await context.close();
  }
  assert.deepEqual(errors,[]);console.log('Interaction browser errors: 0; save preserved.');
 }finally{await browser.close();await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
