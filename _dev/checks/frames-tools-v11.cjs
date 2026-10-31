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
    for(const [width,height] of [[320,568],[393,851],[768,1024],[844,390]]) {
      for(const skin of ['classic','senate','parchment','book','orbital','hologram']) {
        await p.setViewportSize({width,height});
        await p.evaluate(async skin=>{
          FrameReview.menu();const d=FrameReview.profile();d.cosmetics={menu:skin,mat:'cats',back:'orbital',coin:'imperial'};FrameReview.save(d);HemicycleCosmeticUI.apply(d);
          HemicycleUIPreferences.apply(116);HemicycleUIPreferences.applyIcons(116);await HemicycleUIPreferences.selectTypeface('orbital');
        },skin);
        const id={width,height,skin};
        const closed=await p.locator('.home-action-stack').boundingBox();
        const closedLeft=await p.locator('.home-action-stack').evaluate(e=>parseFloat(getComputedStyle(e,'::before').left));
        const controls=await p.locator('.home-action-stack button,.appbar .profile-button,.appbar .mini.news,.appbar [data-go=ayuda],.appbar .objective-access').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({name:e.getAttribute('aria-label'),frame:getComputedStyle(e).borderImageSource,fill:getComputedStyle(e).backgroundImage,color:getComputedStyle(e).color})));
        for(const control of controls)a.ok(control.frame.includes('/frames/'+skin+'.webp'),JSON.stringify({id,control}));
        a.ok(await p.locator('#content').evaluate(e=>e.scrollHeight<=e.clientHeight+1),JSON.stringify(id));
        const nav=await p.locator('.tab.on .nav-icon').evaluate(e=>({shadow:getComputedStyle(e).boxShadow,background:getComputedStyle(e).backgroundImage}));
        a.notEqual(nav.shadow,'none');
        await p.locator('[data-act=home-tools]').click({force:true});
        a.equal(await p.locator('#homeActionExtra').evaluate(e=>e.inert),false);
        const open=await p.locator('.home-action-stack').boundingBox();
        const openLeft=await p.locator('.home-action-stack').evaluate(e=>parseFloat(getComputedStyle(e,'::before').left));
        a.ok(open.height>closed.height+60||openLeft<closedLeft-40,JSON.stringify({id,closed,open,closedLeft,openLeft}));
        const buttons=await p.locator('.home-action-stack button').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {text:e.getAttribute('aria-label'),bottom:r.bottom,top:r.top,covered:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')!==e};}));
        for(const button of buttons)a.ok(button.top>=0&&button.bottom<=height&&!button.covered,JSON.stringify({id,button}));
        if(width===393)await p.screenshot({path:out+'/tools-'+skin+'.png'});
        await p.locator('[data-act=home-tools]').click({force:true});
        a.equal(await p.locator('#homeActionExtra').evaluate(e=>e.inert),true);
        await p.locator('[data-audio-open]').click({force:true});
        const options=await centered(p,'.audio-options');
        a.ok(await p.locator('.audio-options').evaluate(e=>e.scrollHeight<=e.clientHeight+1),JSON.stringify(id));
        await p.locator('.audio-done').click({force:true});
        await p.locator('[data-act=profile]').click({force:true});
        const profile=await centered(p,'.player-profile');
        a.equal(await p.locator('.xp-level').innerText(),'28');
        a.equal(await p.locator('.xp-level').getAttribute('aria-label'),'Nivel 28');
        a.equal(await p.locator('.xp-caption,.xp-maximum').count(),0);
        a.doesNotMatch(await p.locator('.profile-experience').innerText(),/máximo|500/i);
        a.equal(await p.locator('.profile-experience progress').getAttribute('value'),'18');
        a.equal(await p.locator('.profile-experience progress').getAttribute('max'),'168');
        if(width===393)await p.screenshot({path:out+'/profile-'+skin+'.png'});
        await p.locator('[data-profile=edit]').click({force:true});
        const editor=await centered(p,'.player-profile');
        const layers=await p.locator('.cosmetic-frame-preview').evaluateAll(es=>es.map(e=>({skin:e.dataset.previewSkin,bg:getComputedStyle(e).backgroundImage,scene:getComputedStyle(e,'::before').backgroundImage,inset:getComputedStyle(e,'::before').top,frame:getComputedStyle(e,'::after').borderImageSource})));
        for(const layer of layers){a.equal(layer.bg,'none');a.ok(layer.scene.includes('/Hemicycle/assets/'));a.ok(layer.frame.includes('/frames/'+layer.skin+'.webp'));a.ok(parseFloat(layer.inset)>=4);}
        const book=p.locator('.cosmetic-frame-preview[data-preview-skin=book]');
        const edge=await containedScene(book);
        if(width===393)await p.screenshot({path:out+'/editor-'+skin+'.png'});
        const miniature=p.locator('.cosmetic-mini-frame');
        const miniEdge=await containedScene(miniature);
        await p.locator('[data-profile=close]').click({force:true});
        await p.evaluate(()=>FrameReview.dialog());
        const dialog=await centered(p,'.modal');
        await p.locator('[data-modal=cancel]').click({force:true});
        const packs=[];
        for(const kind of ['comun','raro','legendario','mitico','diario','semanal']){
          await p.evaluate(kind=>FrameReview.pack(kind),kind);
          const cover=await centered(p,'.sealed-pack .pack-cover');
          const action=await centered(p,'.completion-actions');
          const hit=await centered(p,'.sealed-pack');
          a.ok(Math.abs(cover.width-hit.width)<1&&Math.abs(cover.height-hit.height)<1,JSON.stringify({id,cover,hit}));
          packs.push({kind,cover,action});
          if(width===393&&kind==='comun'&&skin==='classic')await p.screenshot({path:out+'/pack-centered.png'});
        }
        await p.locator('.sealed-pack').click({force:true});
        a.equal(await p.locator('.pack-results .reward-card').count(),5);
        await p.locator('#tabbar [data-go=mercado]').click({force:true});
        const row=p.locator('.market-card-row').first();
        await row.waitFor();
        await p.waitForFunction(()=>!document.querySelector('.market-refresh')?.disabled);
        const tutorialExit=p.locator('#marketTutorialRoot #menuTutorialExit');if(await tutorialExit.count())await tutorialExit.click();
        const small=await row.evaluate(e=>({width:getComputedStyle(e).borderImageWidth,frame:getComputedStyle(e).borderImageSource}));
        await row.locator('[data-market=select]').click();
        const sheet=p.locator('.sell-sheet');
        const large=await sheet.evaluate(e=>({width:getComputedStyle(e).borderImageWidth,frame:getComputedStyle(e).borderImageSource}));
        a.deepEqual(large,small,JSON.stringify({id,small,large}));
        const overflow=await sheet.evaluate(e=>e.scrollWidth-e.clientWidth);
        a.ok(overflow<=1,JSON.stringify({id,overflow}));
        if(width===393)await p.screenshot({path:out+'/market-'+skin+'.png'});
        await p.locator('[data-market=unselect]').click({force:true});
        rows.push({id,closed,open,controls,profile,editor,options,dialog,layers,edge,miniEdge,packs,market:{small,large}});
      }
      console.log('Checked frames, controls and packs at '+width+'×'+height);
    }
    await p.setViewportSize({width:393,height:851});
    await p.evaluate(()=>{FrameReview.menu();const d=FrameReview.profile();d.xp=HemicycleXP.cap;FrameReview.save(d);});
    await p.locator('[data-act=profile]').click({force:true});
    a.equal(await p.locator('.xp-level').innerText(),'500');
    a.doesNotMatch(await p.locator('.profile-experience').innerText(),/máximo/i);
    a.equal(await p.locator('.profile-experience progress').getAttribute('value'),'1');
    a.deepEqual(errors,[]);a.deepEqual(missing,[]);
    fs.writeFileSync(out+'/browser.json',JSON.stringify({rows,levelCapUnchanged:true,errors,missing},null,2));
    console.log('PASS: 24 themed layouts, centered profile/editor/dialog/options, 144 pack covers, clean preview edges, constant market frame, controls and progress preserved.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
