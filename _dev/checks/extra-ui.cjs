const assert=require('node:assert/strict'),{chromium}=require('playwright');
const {cards,packs}=require('../market/catalog.cjs');
const profile={fs:99999,elo:685,w:18,l:12,album:cards.map(c=>c.id),lastDaily:0,lastWeekly:0,dtWins:0,dtGoldUnlocked:false,dtGoldActive:false};
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const context=await browser.newContext({viewport:{width:360,height:640},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  await context.addInitScript(profile=>localStorage.setItem('hemiciclo_v21',JSON.stringify(profile)),profile);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8022/Hemicycle/');
  await page.locator('#tabbar [data-go="tienda"]').click();
  for(const free of ['diario','semanal']){
   await page.locator('[data-act="free"][data-k="'+free+'"]').click();assert.equal(await page.locator('.reveal .cromo').count(),5);
   await page.locator('#tabbar [data-go="tienda"]').click();assert.equal(await page.locator('[data-act="free"][data-k="'+free+'"]').isDisabled(),true);
  }
  let balance=profile.fs;
  for(const pack of packs){
   await page.locator('[data-act="buy"][data-k="'+pack.k+'"]').click();assert.equal(await page.locator('.reveal .cromo').count(),5);
   balance-=pack.p;assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('hemiciclo_v21')).fs),balance);
   await page.locator('[data-act="again"]').click();balance-=pack.p;assert.equal(await page.locator('.reveal .cromo').count(),5);
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('hemiciclo_v21')).fs),balance);
   await page.locator('#tabbar [data-go="tienda"]').click();
  }
  await page.locator('#tabbar [data-go="coleccion"]').click();
  for(const rare of ['comun','raro','especial','legendario']){await page.locator('[data-fr="'+rare+'"]').click();assert.ok(await page.locator('#gridBox .cromo').count()>0);}
  await page.locator('[data-fr=""]').click();
  for(const doctrine of ['verborrea','guardia','aforado','giro','foco','viperina']){await page.locator('[data-fd="'+doctrine+'"]').click();assert.equal(await page.locator('#gridBox .cromo').count(),20);}
  await page.locator('[data-fd=""]').click();
  await page.locator('#fq').fill('sin resultados imposibles');assert.equal(await page.locator('#gridBox .cromo').count(),0);await page.locator('[data-act="clearfil"]').click();assert.equal(await page.locator('#gridBox .cromo').count(),120);
  await page.locator('#gridBox .cromo').first().click();const original=await page.locator('#content h2').innerText();
  await page.locator('[data-act="nextcard"]').click();assert.notEqual(await page.locator('#content h2').innerText(),original);
  await page.locator('[data-act="prevcard"]').click();assert.equal(await page.locator('#content h2').innerText(),original);
  await page.locator('[data-act="zoomcard"]').click();assert.equal(await page.locator('#zoomBg').count(),1);
  await page.keyboard.press('ArrowRight');assert.notEqual(await page.locator('#content h2').innerText(),original);
  await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#content h2').innerText(),original);
  await page.keyboard.press('Escape');assert.equal(await page.locator('#zoomBg').count(),0);
  await page.locator('[data-act="zoomcard"]').click();await page.locator('#zoomCardWrap').click();assert.equal(await page.locator('#zoomBg').count(),0);
  await page.locator('#tabbar [data-go="menu"]').click();await page.locator('[data-act="play"]').click();
  assert.equal(await page.locator('[data-act="start"]').isDisabled(),true);await page.locator('[data-act="auto"]').click();assert.equal(await page.locator('[data-act="start"]').isDisabled(),false);
  await page.locator('[data-act="clear"]').click();assert.equal(await page.locator('[data-act="start"]').isDisabled(),true);
  const picks=await page.locator('[data-pick]').evaluateAll(es=>es.slice(0,5).map(e=>e.dataset.pick));
  for(const id of picks)await page.locator('[data-pick="'+id+'"]').click();
  await page.locator('[data-lead="'+picks[2]+'"]').click();assert.equal(await page.locator('.star.on').getAttribute('data-lead'),picks[2]);
  await page.locator('[data-pick="'+picks[2]+'"]').click();assert.equal(await page.locator('[data-act="start"]').isDisabled(),true);await page.locator('[data-pick="'+picks[2]+'"]').click();
  await page.locator('[data-act="start"]').click();await page.locator('#coinRoot [data-act="begin"]').click();
  await page.locator('[data-act="abandon"]').click();await page.locator('#modalRoot [data-modal="cancel"]').click();assert.equal(await page.locator('.battle-wrap').count(),1);
  await page.locator('[data-act="abandon"]').click();await page.locator('#modalRoot [data-modal="confirm"]').click();
  await page.locator('[data-act="rev"]').click();assert.equal(await page.locator('#builderScroll').count(),1);
  await page.locator('#tabbar [data-go="liga"]').click();await page.locator('[data-act="liganew"]').click();assert.equal(await page.locator('#content tbody tr').count(),30);
  await page.locator('[data-act="ligabandon"]').click();await page.locator('#modalRoot [data-modal="cancel"]').click();assert.equal(await page.locator('#content tbody tr').count(),30);
  await page.locator('[data-act="ligajugar"]').click();assert.equal(await page.locator('#tabbar .on').getAttribute('data-go'),'liga');
  await page.locator('#tabbar [data-go="liga"]').click();await page.locator('[data-act="ligabandon"]').click();await page.locator('#modalRoot [data-modal="confirm"]').click();assert.equal(await page.locator('[data-act="liganew"]').count(),1);
  await page.locator('#appbar [data-go="ayuda"]').click();await page.locator('[data-act="reset"]').click();await page.locator('#modalRoot [data-modal="cancel"]').click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('hemiciclo_v21')).album.length)>120,true);
  await page.locator('[data-act="reset"]').click();await page.locator('#modalRoot [data-modal="confirm"]').click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('hemiciclo_v21')).fs),1500);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('hemiciclo_v21')).album.length),30);
  assert.deepEqual(errors,[]);await context.close();
  require('node:child_process').execFileSync(process.execPath,['_dev/checks/gold-bonus.cjs'],{cwd:require('node:path').resolve(__dirname,'../..'),stdio:'inherit'});
  console.log('All packs, free cooldowns, re-opening, 10 collection filters, search, detail navigation, zoom, builder controls, surrender, rematch, league controls and reset passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
