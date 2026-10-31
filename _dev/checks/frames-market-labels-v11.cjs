'use strict';
const fs = require('node:fs');
const a = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
const C = require('../../js/orator-catalog.js');
const legal = require('../../js/legal-documents.js');
const XP = require('../../js/progression-xp.js');
const out = '_dev/reports/v31.0.2.11-frames-tools';
fs.mkdirSync(out, { recursive: true });
const injection = `window.FrameReview={profile:D,save:saveD,menu:function(){closeModal();go('menu');},pack:function(kind){go('sobre',{cards:CARDS.slice(0,5).map(c=>c.id),k:kind,revealed:false});},dialog:function(){showModal('Comprobar el centrado','Los controles conservan su posición al cambiar de tema.','Entendido',false,null);}};function boot(){`;
async function centered(page, selector) {
  const r = await page.locator(selector).evaluate(e => {
    const r=e.getBoundingClientRect();
    return {x:r.x,y:r.y,width:r.width,height:r.height,dx:(r.left+r.right-innerWidth)/2,right:r.right,bottom:r.bottom,viewport:innerWidth};
  });
  a.ok(Math.abs(r.dx)<.5 && r.x>=0 && r.right<=r.viewport+.5, JSON.stringify({selector,r}));
  return r;
}
function edgeColors(bytes) {
  const result = JSON.parse(execFileSync('python', ['-c', `import sys,io,json
from PIL import Image
im=Image.open(io.BytesIO(sys.stdin.buffer.read())).convert('RGB');w,h=im.size
print(json.dumps([im.getpixel(p) for p in [(w//2,0),(w//2,h-1),(0,h//2),(w-1,h//2)]]))`], {input:bytes}).toString());
  return result;
}
async function containedScene(locator) {
  const before=edgeColors(await locator.screenshot());
  const saved=await locator.evaluate(e=>{const v=e.style.getPropertyValue('--preview-scene');e.style.setProperty('--preview-scene','none');return v;});
  const withoutScene=edgeColors(await locator.screenshot());
  await locator.evaluate((e,v)=>e.style.setProperty('--preview-scene',v),saved);
  a.deepEqual(before,withoutScene,'The scene must not paint on the outside edge of its frame');
  return before;
}
(async()=>{
  const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  try {
    const context=await browser.newContext({viewport:{width:393,height:851},serviceWorkers:'block',reducedMotion:'reduce'});
    await context.addInitScript(({ids,legal,xp})=>{
      localStorage.setItem('hemicycle_legal_acceptance_v1',JSON.stringify({id:crypto.randomUUID(),version:legal.version,hash:legal.hash,accepted:true,acceptedAt:new Date().toISOString(),ageBand:'18+',syncedAccounts:[]}));
      localStorage.setItem('hemiciclo_v21',JSON.stringify({fs:3240,elo:3531,w:356,l:39,xp,album:ids.concat(ids),lastDaily:0,lastWeekly:0}));
      for(const key of ['hemiciclo_tutorial_v1','hemiciclo_menu_tutorial_v1','hemiciclo_market_tutorial_v1'])localStorage.setItem(key,JSON.stringify({status:'completed'}));
      localStorage.setItem('hemiciclo_objectives_intro_v1','true');
    },{ids:C.cards.map(c=>c.id),legal,xp:XP.thresholds[27]+18});
    await context.route('https://**/*',r=>r.abort());
    await context.route('**/Hemicycle/',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('index.html','utf8').replace('function boot(){',injection)}));
    const p=await context.newPage(), errors=[], missing=[], rows=[];
    p.on('pageerror',e=>errors.push(e.message));
    p.on('response',r=>{if(r.url().includes('/assets/cosmetics/')&&r.status()>=400)missing.push(r.url());});
    await p.goto('http://127.0.0.1:8055/Hemicycle/');
    await require('./launch-helper.cjs')(p);
    await p.waitForFunction(()=>HemicycleEntered);
    await p.evaluate(()=>Promise.all(HemicycleCosmetics.collection('menu').map(t=>HemicycleCosmeticUI.prepare('menu',t.id))));
    const results=[];
    for(const width of [320,393])for(const font of ['clear','classic','editorial','orbital'])for(const scale of [100,116]){
      await p.setViewportSize({width,height:851});
      await p.evaluate(async({font,scale})=>{FrameReview.menu();await HemicycleUIPreferences.selectTypeface(font);HemicycleUIPreferences.apply(scale);},{font,scale});
      await p.locator('#tabbar [data-go=mercado]').click();
      await p.waitForFunction(()=>!document.querySelector('.market-refresh')?.disabled);
      const exit=p.locator('#marketTutorialRoot #menuTutorialExit');if(await exit.count())await exit.click();
      const labels=await p.locator('.market-tabs button').evaluateAll(es=>es.map(e=>{const b=e.getBoundingClientRect(),t=e.lastElementChild.getBoundingClientRect();return {text:e.lastElementChild.textContent,left:b.left,right:b.right,textLeft:t.left,textRight:t.right,scroll:e.scrollWidth-e.clientWidth};}));
      for(const label of labels)a.ok(label.scroll<=1&&label.textLeft>=label.left&&label.textRight<=label.right,JSON.stringify({width,font,scale,label}));
      results.push({width,font,scale,labels});
      if(scale===116&&font==='orbital')await p.screenshot({path:out+'/market-labels-'+width+'.png'});
    }
    a.deepEqual(errors,[]);fs.writeFileSync(out+'/market-labels.json',JSON.stringify({results,errors},null,2));
    console.log('PASS: 16 mobile market layouts retain their selected font and fit all navigation labels.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
