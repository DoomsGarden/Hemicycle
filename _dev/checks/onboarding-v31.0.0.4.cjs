const assert=require('node:assert/strict'),fs=require('node:fs'),{chromium}=require('playwright');
const dismiss=require('./launch-helper.cjs'),{cards,root}=require('../market/catalog.cjs');
const out=root+'/_dev/previews/'+fs.readFileSync(root+'/index.html','utf8').match(/var VERSION='([^']+)'/)[1];fs.mkdirSync(out,{recursive:true});
const profile={fs:8000,elo:700,w:6,l:2,album:cards.slice(0,10).map(c=>c.id),lastDaily:Date.now(),lastWeekly:Date.now(),dtWins:2,dtGoldUnlocked:false,dtGoldActive:false};
async function walk(page,count,checkMenu=false,width=393){
 const order=[];
 for(let i=0;i<count;i++){
  await page.waitForSelector('.tutorial-focus');
  const selector=checkMenu?'#menuTutorialRoot':'#tutorialRoot';
  const title=await page.locator(selector+' h3').innerText();order.push(title);
  const geometry=await page.evaluate(()=>{const el=document.querySelector('.tutorial-focus'),t=el.getBoundingClientRect(),c=document.querySelector('.tutorial-coach').getBoundingClientRect();return{t:{top:t.top,bottom:t.bottom,left:t.left,right:t.right},c:{top:c.top,bottom:c.bottom,left:c.left,right:c.right},overlap:Math.min(t.right,c.right)>Math.max(t.left,c.left)&&Math.min(t.bottom,c.bottom)>Math.max(t.top,c.top),vh:innerHeight};});
  assert.equal(geometry.overlap,false,JSON.stringify({i,title,geometry}));assert.ok(geometry.c.top>=-1&&geometry.c.bottom<=geometry.vh+1,JSON.stringify({i,title,geometry}));
  if(checkMenu&&width===393&&[0,5,10,14,19].includes(i))await page.screenshot({path:out+'/guia-menu-'+i+'.png'});
  await page.locator('.tutorial-focus').click();
 }
 return order;
}
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});const errors=[];
try{
for(const width of [320,393,851,1280]){
 const context=await browser.newContext({viewport:{width,height:width===320?568:width===851?393:851},serviceWorkers:'block',reducedMotion:'reduce',isMobile:width<500,hasTouch:true});
 await context.addInitScript(d=>localStorage.setItem('hemiciclo_v21',JSON.stringify(d)),profile);
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8022/Hemicycle/');
 const saved=await page.evaluate(()=>localStorage.getItem('hemiciclo_v21'));await page.locator('.launch-start').click();assert.equal(await page.locator('.battle-wrap').count(),0,'the account gate precedes the tutorial');await page.waitForSelector('#launchScreen',{state:'detached'});await page.locator('[data-profile=guest]').click();
 assert.ok(await page.locator('#tutorialRoot .tutorial-coach').isVisible(),'INICIAR starts combat directly, without pressing Jugar');
 await walk(page,32);assert.ok(await page.locator('#menuTutorialRoot .tutorial-coach').isVisible());
 const titles=await walk(page,24,true,width);assert.equal(titles[0],'1. Tu menú principal');assert.ok(titles.indexOf('2. La tienda')<titles.indexOf('3. Tu colección'));assert.ok(titles.indexOf('3. Tu colección')<titles.indexOf('4. El mercado'));assert.equal(titles.at(-2),'5. La Liga');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('hemiciclo_menu_tutorial_v1')).status),'completed');
 assert.equal(await page.locator('.tutorial-focus').count(),0);assert.equal(await page.evaluate(()=>localStorage.getItem('hemiciclo_v21')),saved);assert.equal(await page.evaluate(()=>localStorage.getItem('hemiciclo_liga_v9')),null);
 await page.reload();await dismiss(page);assert.equal(await page.locator('.tutorial-focus').count(),0,'completed guides do not restart');
 await page.locator('#appbar [data-go=ayuda]').click();assert.equal(await page.locator('[data-act=tutorial]').count(),1);await page.locator('[data-act=menu-tutorial]').click();assert.ok(await page.locator('#menuTutorialRoot .tutorial-coach').isVisible());
 await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'menuTutorialExit');await page.keyboard.press('Enter');assert.equal(await page.locator('.tutorial-focus').count(),0);assert.equal(await page.evaluate(()=>localStorage.getItem('hemiciclo_v21')),saved);
 console.log(width+'px: first INICIAR → 32 combat steps → 24 menu steps in order; no overlap, no purchases/claims/sales/league, reload once only, independent replay and keyboard exit passed');await context.close();
}
// Existing players skip the already completed battle; reload/interruption can resume the missing menu guide.
const context=await browser.newContext({viewport:{width:393,height:851},serviceWorkers:'block',reducedMotion:'reduce'});await context.addInitScript(d=>{localStorage.setItem('hemiciclo_v21',JSON.stringify(d));localStorage.setItem('hemiciclo_tutorial_v1',JSON.stringify({status:'completed'}));},profile);
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8022/Hemicycle/');await dismiss(page);assert.ok(await page.locator('#menuTutorialRoot .tutorial-coach').isVisible());
await page.reload();await dismiss(page);assert.ok(await page.locator('#menuTutorialRoot .tutorial-coach').isVisible());
await page.locator('#menuTutorialExit').click();await page.reload();await dismiss(page);assert.equal(await page.locator('.tutorial-focus').count(),0);
await page.locator('#appbar [data-go=ayuda]').click();await page.locator('[data-act=tutorial]').click();await walk(page,32);assert.match(await page.locator('#content').innerText(),/Tutorial completado/);assert.equal(await page.locator('#menuTutorialRoot .tutorial-coach').count(),0);
console.log('Existing battle completion, interruption/reload, skip and independent battle replay passed');await context.close();
// Empty collections, unaffordable packs and existing seasons remain usable and unchanged.
const edge=await browser.newContext({viewport:{width:360,height:640},serviceWorkers:'block',reducedMotion:'reduce'});
const league={div:3,jor:4,temp:2,teams:Array.from({length:30},(_,i)=>({n:i?'Grupo '+i:'Tu grupo',pts:i,w:0,d:0,l:0,you:i===0,str:50}))};
await edge.addInitScript(({p,league})=>{localStorage.setItem('hemiciclo_v21',JSON.stringify({...p,album:[],fs:0}));localStorage.setItem('hemiciclo_liga_v9',JSON.stringify(league));localStorage.setItem('hemiciclo_tutorial_v1',JSON.stringify({status:'completed'}));},{p:profile,league});
const empty=await edge.newPage();empty.on('pageerror',e=>errors.push(e.message));await empty.goto('http://127.0.0.1:8022/Hemicycle/');await dismiss(empty);
const before=await empty.evaluate(()=>({p:localStorage.getItem('hemiciclo_v21'),l:localStorage.getItem('hemiciclo_liga_v9')}));await walk(empty,24,true,360);
assert.deepEqual(await empty.evaluate(()=>({p:localStorage.getItem('hemiciclo_v21'),l:localStorage.getItem('hemiciclo_liga_v9')})),before);
await empty.locator('#appbar [data-go=ayuda]').click();await empty.locator('[data-act=menu-tutorial]').click();for(let i=0;i<8;i++)await empty.locator('.tutorial-focus').click();
await empty.goBack();await empty.goBack();
assert.equal(await empty.locator('#menuTutorialExit').count()>0||await empty.locator('.tutorial-focus').count()===0,true,'history never leaves an active guide without a target and exit');
console.log('Empty collection, zero FS, disabled free packs, existing league and history exit safety passed');await edge.close();assert.deepEqual(errors,[]);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
