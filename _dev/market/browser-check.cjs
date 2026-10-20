const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),{createMarketServer}=require('./server.cjs'),{cards,root}=require('./catalog.cjs');
const out=path.join(root,'_dev/previews/v30.2.56'),errors=[];
const id=(r,n=0)=>cards.filter(c=>c.r===r)[n].id;
const byId=Object.fromEntries(cards.map(c=>[c.id,c]));
const profile={fs:24500,elo:685,w:18,l:12,album:cards.flatMap(c=>[c.id,c.id,c.id]),lastDaily:1,lastWeekly:2,dtWins:0,dtGoldUnlocked:false,dtGoldActive:false};
async function get(page,route){return page.evaluate(async route=>{const r=await fetch('/api/market'+route,{cache:'no-store'});if(!r.ok)throw new Error(await r.text());return r.json()},route);}
async function idle(page){await page.waitForFunction(()=>!document.querySelector('[data-market="refresh"]')?.disabled);}
async function tab(page,value){await page.locator('[data-market="tab"][data-value="'+value+'"]').click();}
async function refresh(page){await page.locator('[data-market="refresh"]').click();await idle(page);}
async function finalConfirm(page){
 const review=page.locator('#modalRoot [data-modal="review"]'),confirm=page.locator('#modalRoot [data-modal="confirm"]');
 if(await review.count()){
  assert.equal(await confirm.isDisabled(),true);
  assert.deepEqual(await page.locator('#modalRoot .market-confirm-actions button').evaluateAll(es=>es.map(e=>e.dataset.modal)),['cancel','review','confirm']);
  assert.equal(await review.getAttribute('aria-pressed'),'false');
  assert.equal(await review.evaluate(e=>getComputedStyle(e).backgroundColor),await page.locator('#modalRoot [data-modal="cancel"]').evaluate(e=>getComputedStyle(e).backgroundColor));
  await review.click();assert.equal(await confirm.isEnabled(),true);
  assert.equal(await review.getAttribute('aria-pressed'),'true');
  assert.equal(await review.evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(35, 134, 83)');
  assert.equal(await page.locator('#modalRoot [role="dialog"]').count(),1);
  await review.click();assert.equal(await confirm.isDisabled(),true);
  await review.focus();await page.keyboard.press('Space');assert.equal(await confirm.isEnabled(),true);
 }
 await confirm.click();await page.waitForFunction(()=>!document.getElementById('modalRoot').firstChild);await idle(page);assert.equal(await page.locator('.market-error').count(),0,await page.locator('#content').innerText());
 assert.equal(await page.locator('#modalRoot [role="dialog"]').count(),0);
}
async function confirmReviewed(page){
 assert.equal(await page.locator('#modalRoot [data-modal="review"]').count(),1);
 assert.doesNotMatch(await page.locator('#modalRoot').innerText(),/Paso [12] de 2/);
 await finalConfirm(page);
}
async function selectSale(page,card,quantity,target='machine'){
 await tab(page,'sell');await page.locator('[data-market="select"][data-id="'+card+'"]').click();
 await page.locator('[data-market="target"][data-value="'+target+'"]').click();
 await page.locator('#marketQuantity').fill(String(quantity));await page.locator('[data-market="sell"]').click();
}
async function tradeAction(page,action){await page.locator('[data-market="'+action+'"]').first().click();await finalConfirm(page);}
const count=(me,card)=>me.inventory.find(c=>c.id===card)?.quantity||0;
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const app=createMarketServer();await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+app.server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 async function pageFor(viewport={width:393,height:851},offlineMarket=false){
  const context=await browser.newContext({viewport,isMobile:true,hasTouch:true,locale:'es-ES',serviceWorkers:'block'});
  await context.addInitScript(profile=>{if(!localStorage.getItem('hemiciclo_v21'))localStorage.setItem('hemiciclo_v21',JSON.stringify(profile))},profile);
  if(offlineMarket)await context.route('**/api/market/**',r=>r.fulfill({status:404,contentType:'application/json',body:'{}'}));
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/Hemicycle/');return {page,context};
 }
 async function market(page){await page.locator('#tabbar [data-go="mercado"]').click();await page.waitForFunction(()=>!document.querySelector('.market-account').textContent.includes('Comprobando'));await idle(page);}
 try{
  for(const viewport of (process.env.SKIP_NAV?[]:[{width:393,height:851},{width:360,height:640},{width:320,height:568}])){
   const {page,context}=await pageFor(viewport);
   for(const screen of ['tienda','coleccion','menu','liga','mercado']){
    if(screen==='mercado')await market(page);else await page.locator('#tabbar [data-go="'+screen+'"]').click();
    assert.equal(await page.locator('#tabbar .tab.on').getAttribute('data-go'),screen);
    assert.equal(await page.locator('#tabbar [aria-current="page"]').count(),1);
    for(const icon of ['liga','mercado'])assert.equal(await page.locator('#tabbar [data-go="'+icon+'"] .nav-icon svg').getAttribute('stroke-width'),'1.6');
    const sizes=await page.locator('#tabbar .tab').evaluateAll(els=>els.map(e=>({active:e.classList.contains('on'),height:e.getBoundingClientRect().height,icon:e.querySelector('.nav-icon').getBoundingClientRect().width})));
    assert.ok(sizes.find(e=>e.active).height>Math.max(...sizes.filter(e=>!e.active).map(e=>e.height)));
    assert.ok(sizes.find(e=>e.active).icon>Math.max(...sizes.filter(e=>!e.active).map(e=>e.icon)));
    for(const selector of ['#appbar','#content','#tabbar'])assert.ok(await page.locator(selector).evaluate(e=>e.scrollWidth<=e.clientWidth+1),screen+' horizontal overflow '+viewport.width);
    if(screen==='tienda'){
     for(const button of await page.locator('#content [data-act="buy"]').all()){await button.scrollIntoViewIfNeeded();assert.ok(await button.evaluate(e=>e.getBoundingClientRect().bottom<=document.getElementById('content').getBoundingClientRect().bottom+1),'pack button clipped '+viewport.width);}
    }
    await page.screenshot({path:path.join(out,screen+'-'+viewport.width+'.png')});
    if(screen==='mercado'){
     const before=await get(page,'/me');await selectSale(page,id('comun'),1);
     const buttons=page.locator('#modalRoot .market-confirm-actions button');
     const rects=await buttons.evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,bottom:r.bottom,top:r.top}}));
     assert.ok(rects.every(r=>r.left>=0&&r.right<=viewport.width&&r.top>=0&&r.bottom<=viewport.height));
     assert.ok(rects[0].right<=rects[1].left&&rects[1].right<=rects[2].left);
     assert.equal(await page.locator('#modalRoot [data-modal="confirm"]').isDisabled(),true);
     await page.screenshot({path:path.join(out,'confirmacion-'+viewport.width+'-sin-marcar.png')});
     await page.locator('#modalRoot [data-modal="review"]').click();assert.equal(await page.locator('#modalRoot [data-modal="confirm"]').isEnabled(),true);
     await page.screenshot({path:path.join(out,'confirmacion-'+viewport.width+'-marcada.png')});
     await page.locator('#modalRoot [data-modal="cancel"]').click();assert.deepEqual(await get(page,'/me'),before);
    }

   }
   await page.locator('#tabbar [data-go="menu"]').click();
   await page.locator('[data-act="play-menu"]').click();assert.equal(await page.locator('.play-option').count(),4);
   assert.ok(await page.locator('.play-options').evaluate(e=>e.getBoundingClientRect().top>=0));
   await page.keyboard.press('ArrowDown');await page.keyboard.press('Escape');assert.equal(await page.locator('.play-options').count(),0);
   for(const mode of ['normal','ranked']){
    await page.locator('[data-act="play-menu"]').click();await page.locator('[data-act="play-mode"][data-mode="'+mode+'"]').click();
    await page.locator('[data-act="play"]').click();assert.match(await page.locator('#content h2').innerText(),mode==='normal'?/Partida normal/:/Clasificatoria/);
    await page.locator('[data-act="auto"]').click();await page.locator('[data-act="start"]').click();
    assert.equal(await page.locator('#coinRoot [role="dialog"]').count(),1);
    assert.ok(await page.locator('#content .battle-wrap').count());assert.equal(await page.locator('#tabbar').isVisible(),false);
    await page.locator('#coinRoot [data-act="begin"]').click();
    await page.locator('[data-act="abandon"]').click();await page.locator('#modalRoot [data-modal="confirm"]').click();
    await page.locator('#tabbar [data-go="menu"]').click();
   }
   await page.locator('#appbar [data-go="novedades"]').click();
   await page.locator('.release-entry').evaluateAll(es=>es.forEach(e=>e.open=true));
   assert.doesNotMatch(await page.locator('#content').innerText(),/Trump|logros?|desbloque|Zasca base|Aguante base/i);
   await page.locator('#appbar [data-go="ayuda"]').click();
   assert.ok(await page.locator('#content [data-go="menu"]').evaluate(e=>e.getBoundingClientRect().bottom<=document.getElementById('content').getBoundingClientRect().bottom+1));
   console.log('Responsive navigation, modes, help and public notes passed:',viewport.width+'x'+viewport.height);
   await context.close();
  }
  const a=await pageFor(),b=await pageFor();await market(a.page);await market(b.page);await refresh(a.page);
  const ma=await get(a.page,'/me'),mb=await get(b.page,'/me');assert.notEqual(ma.id,mb.id);
  const realBefore=await a.page.evaluate(()=>localStorage.getItem('hemiciclo_v21'));
  const missing=ma.inventory.find(c=>c.quantity>1&&!mb.inventory.some(other=>other.id===c.id));assert.ok(missing,'demo players need different collections');
  await selectSale(a.page,missing.id,1,'player');await confirmReviewed(a.page);
  await refresh(b.page);await tab(b.page,'buy');await b.page.locator('[data-market="missing"]').click();
  await b.page.locator('#marketBuySearch').fill(byId[missing.id].n.normalize('NFD').replace(/[\u0300-\u036f]/g,''));
  assert.equal(await b.page.locator('[data-market="buy"]').count(),1);assert.match(await b.page.locator('.missing-label').innerText(),/Te falta/);
  await b.page.locator('#marketBuyRarity').selectOption(byId[missing.id].r);
  assert.equal(await b.page.locator('[data-market="buy"]').count(),1);
  await b.page.screenshot({path:path.join(out,'comprar-v30.2.56.png')});
  await b.page.locator('#marketBuySearch').fill('sin resultados imposibles');assert.equal(await b.page.locator('[data-market="buy"]').count(),0);
  await b.page.locator('#marketBuySearch').fill('');await b.page.locator('#marketBuyRarity').selectOption('');await b.page.locator('[data-market="missing"]').click();
  await tab(a.page,'activity');await a.page.locator('[data-market="cancel-listing"]').click();await finalConfirm(a.page);
  const common=id('comun'),rare=id('raro');
  await selectSale(a.page,common,2);
  assert.equal((await get(a.page,'/me')).fs,6000);
  await a.page.locator('#modalRoot [data-modal="review"]').click();assert.equal((await get(a.page,'/me')).fs,6000);
  await a.page.locator('#modalRoot [data-modal="cancel"]').click();assert.equal(count(await get(a.page,'/me'),common),3);
  await a.page.locator('[data-market="sell"]').click();await confirmReviewed(a.page);assert.equal(count(await get(a.page,'/me'),common),1);assert.equal((await get(a.page,'/me')).fs,6030);
  await selectSale(a.page,rare,2,'player');await confirmReviewed(a.page);
  assert.equal(count(await get(a.page,'/me'),rare),1);assert.equal((await get(a.page,'/me')).fs,6030);
  await refresh(b.page);await tab(b.page,'buy');
  const offer=(await get(b.page,'/listings')).find(l=>l.seller===ma.id&&l.card===rare);
  await b.page.locator('[data-market="buy"][data-id="'+offer.id+'"]').click();await b.page.locator('#purchaseQuantity').fill('3');await b.page.locator('#modalRoot [data-modal="review"]').click();assert.equal(await b.page.locator('#modalRoot [data-modal="confirm"]').isDisabled(),true);
  await b.page.locator('#purchaseQuantity').fill('1');assert.equal(await b.page.locator('#modalRoot [data-modal="review"]').getAttribute('aria-pressed'),'false');
  await b.page.locator('#modalRoot [data-modal="review"]').click();await b.page.locator('#purchaseQuantity').fill('2');assert.equal(await b.page.locator('#modalRoot [data-modal="confirm"]').isDisabled(),true);await confirmReviewed(b.page);
  assert.equal(count(await get(b.page,'/me'),rare),5);assert.equal((await get(b.page,'/me')).fs,5928);
  await refresh(a.page);assert.equal((await get(a.page,'/me')).fs,6102);
  await selectSale(a.page,id('especial'),2,'player');await confirmReviewed(a.page);await tab(a.page,'activity');
  await a.page.locator('[data-market="cancel-listing"]').click();await finalConfirm(a.page);assert.equal(count(await get(a.page,'/me'),id('especial')),3);
  const low=id('comun',1),high=id('raro',1);
  await tab(a.page,'trade');await a.page.locator('#tradePlayer').selectOption(mb.id);await idle(a.page);
  await a.page.locator('#tradeGive').selectOption(low);await a.page.locator('#tradeReceive').selectOption(id('especial'));
  assert.equal(await a.page.locator('[data-market="propose"]').isDisabled(),true);assert.match(await a.page.locator('.market-error').innerText(),/consecutivas/);
  await a.page.locator('#tradeReceive').selectOption(high);assert.match(await a.page.locator('.trade-quote').innerText(),/18 FS/);
  await a.page.screenshot({path:path.join(out,'intercambio-v30.2.56.png')});
  await a.page.locator('[data-market="propose"]').click();await finalConfirm(a.page);
  assert.equal((await get(a.page,'/me')).fs,6084);assert.equal(count(await get(a.page,'/me'),low),2);
  assert.equal((await get(a.page,'/me')).fs,6084);assert.equal(await a.page.locator('[data-market="confirm"]').count(),0);
  await refresh(b.page);await tab(b.page,'activity');await tradeAction(b.page,'accept');
  assert.equal(count(await get(a.page,'/me'),high),4);assert.equal(count(await get(b.page,'/me'),low),4);
  assert.equal((await get(b.page,'/me')).fs,5946);assert.equal((await get(a.page,'/me')).fs,6084);
  await refresh(a.page);await a.page.screenshot({path:path.join(out,'intercambio-completado-v30.2.56.png')});
  await tab(a.page,'trade');await a.page.locator('#tradeGive').selectOption(high);await a.page.locator('#tradeReceive').selectOption(low);await a.page.locator('#tradeMethod').selectOption('two');
  assert.equal(await a.page.locator('[data-market="propose"]').isDisabled(),true);
  await a.page.locator('#tradeExtra').selectOption(low);assert.match(await a.page.locator('.trade-quote').innerText(),/sin suplemento/);
  await a.page.locator('[data-market="propose"]').click();await finalConfirm(a.page);
  await refresh(b.page);await tradeAction(b.page,'accept');
  assert.equal((await get(a.page,'/me')).fs,6084);assert.equal((await get(b.page,'/me')).fs,5946);
  assert.equal(await a.page.evaluate(()=>localStorage.getItem('hemiciclo_v21')),realBefore);
  console.log('Two-player UI passed: cancellation, machine sale, listing, purchase, withdrawal, FS trade, 2-for-1, single-window review tick and final confirmation and save isolation.');
  await a.context.close();await b.context.close();
  const local=await pageFor({width:360,height:640},true);await market(local.page);
  assert.match(await local.page.locator('.market-account').innerText(),/guardado local/);
  await selectSale(local.page,common,2);await confirmReviewed(local.page);
  const saved=await local.page.evaluate(()=>JSON.parse(localStorage.getItem('hemiciclo_v21')));
  assert.equal(saved.fs,profile.fs+30);assert.equal(saved.album.filter(c=>c===common).length,1);assert.equal(saved.elo,profile.elo);assert.equal(saved.w,profile.w);
  await tab(local.page,'buy');assert.match(await local.page.locator('#content').innerText(),/necesita un servidor/);
  await local.page.reload();await market(local.page);assert.equal(await local.page.locator('[data-market="select"][data-id="'+common+'"]').count(),0);
  await local.context.close();assert.deepEqual(errors,[]);
  console.log('Local-only sales and reload passed; browser errors: 0.');
  const pwa=await browser.newContext({viewport:{width:393,height:851}}),pwaPage=await pwa.newPage();
  pwaPage.on('pageerror',e=>errors.push(e.message));await pwaPage.goto(base+'/Hemicycle/');
  await pwaPage.evaluate(()=>navigator.serviceWorker.ready);await pwaPage.waitForFunction(()=>navigator.serviceWorker.controller);
  await market(pwaPage);const first=await get(pwaPage,'/me');
  await pwa.clearCookies();
  const second=await pwaPage.evaluate(async()=>{await fetch('/api/market/session',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});return (await fetch('/api/market/me')).json()});
  assert.notEqual(first.id,second.id);
  assert.equal(await pwaPage.evaluate(async()=>{for(const name of await caches.keys())for(const req of await(await caches.open(name)).keys())if(new URL(req.url).pathname.startsWith('/api/market/'))return false;return true}),true);
  assert.deepEqual(errors,[]);await pwa.close();
  console.log('PWA market privacy passed: API bypasses the cache and never reuses another account response.');
 }finally{await browser.close();await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
