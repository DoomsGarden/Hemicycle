const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root='/workspace/Hemicycle',html=fs.readFileSync(root+'/index.html','utf8'),out='/tmp/hemicycle-v30-2-56-checks';
fs.mkdirSync(out,{recursive:true});
const catalog=vm.createContext({});vm.runInContext(html.match(/function slug\(s\)\{[^\n]+/)[0]+'\n'+html.slice(html.indexOf('var DOCS='),html.indexOf("var LS='")),catalog);
const ids=JSON.parse(vm.runInContext('JSON.stringify(CARDS.map(c=>c.id))',catalog));
const profile={fs:76543,elo:855,w:12,l:7,album:ids,lastDaily:1,lastWeekly:2,dtWins:15,dtGoldUnlocked:true,dtGoldActive:true};
const instrumented=html.replace(/\}\)\(\);\s*<\/script>/,'window.__game={get gold(){return GOLD_LOOP},draw:drawCurrentGoldFrame,get game(){return G},mk:mk,byid:BYID,paint:paint,clearAI:clearAI};})();</script>');
const errors=[];
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  for(const variant of ['bitmap','image-fallback','animation-failure']){
   const context=await browser.newContext({viewport:{width:393,height:851},isMobile:true,hasTouch:true,serviceWorkers:'block'});
   await context.addInitScript(({profile,variant})=>{
    localStorage.setItem('hemiciclo_v21',JSON.stringify(profile));Math.random=()=>0.25;
    if(variant==='image-fallback')window.createImageBitmap=undefined;
   },{profile,variant});
   await context.route('**/Hemicycle/',r=>r.fulfill({status:200,contentType:'text/html',body:instrumented}));
   if(variant==='animation-failure')await context.route('**/cards/donald-trump-golden.webp?*',r=>r.abort('failed'));
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8022/Hemicycle/');
   await page.locator('#tabbar [data-go="coleccion"]').click();
   await page.locator('#fq').fill('Donald Trump');
   await page.locator('#gridBox [data-card="donald-trump"]').click();
   if(variant==='animation-failure'){
    await page.waitForFunction(()=>window.__game.gold.state==='fallback');
    await page.waitForFunction(()=>{const im=document.querySelector('.gold-static-fb');return im&&im.complete&&im.naturalWidth>0&&im.src.endsWith('/donald-trump.webp')});
    assert.equal(await page.locator('canvas.gold-canvas').count(),0);
    console.log('Golden animation download failure: static classic fallback passed');
    await context.close();continue;
   }
   await page.waitForFunction(()=>window.__game.gold.state==='ready');
   await page.waitForSelector('canvas.gold-canvas');
   const result=await page.evaluate(()=>{
    const t=window.__game,g=t.gold;cancelAnimationFrame(g.rafId);g.rafId=null;
    const times=[0,1100,2350,3500,4700,4939,4941,5000,7350,9760];
    const frames=times.map(time=>{
     t.draw(g.startedAt+time);
     const data=g.surface.getContext('2d').getImageData(0,0,420,560).data;
     let sum=0,minAlpha=255;for(let i=0;i<data.length;i+=4){sum+=data[i]+data[i+1]+data[i+2];minAlpha=Math.min(minAlpha,data[i+3])}
     return{time,png:g.surface.toDataURL('image/png'),average:sum/(420*560*3),minAlpha};
    });
    const checkCanvas=document.createElement('canvas');checkCanvas.width=420;checkCanvas.height=560;
    const expected=checkCanvas.getContext('2d',{willReadFrequently:true});let exactFrames=0;
    for(const time of [120,500,1100,1800,2350,2700,3500,4700]){
     t.draw(g.startedAt+time);
     expected.drawImage(g.frames[g.sequence[g.ends.findIndex(end=>time<end)]].bmp,0,0);
     const a=expected.getImageData(0,0,420,560).data,b=g.surface.getContext('2d').getImageData(0,0,420,560).data;
     if(a.every((v,i)=>v===b[i]))exactFrames++;
    }
    const start=performance.now();for(let i=0;i<60;i++)t.draw(g.startedAt+10000+i*34);
    return{frames,exactFrames,faceFrames:g.frames.length,faceWidth:g.frames[0].bmp.width,msPerDraw:(performance.now()-start)/60,started:g.startedAt};
   });
   assert.equal(result.exactFrames,8);assert.equal(result.faceFrames,46);assert.equal(result.faceWidth,420);
   for(const f of result.frames){assert.equal(f.minAlpha,255);assert.ok(f.average>10);fs.writeFileSync(out+'/gold-'+variant+'-'+f.time+'.png',Buffer.from(f.png.split(',')[1],'base64'));delete f.png}
   if(variant==='bitmap'){
    const saved=await page.evaluate(()=>localStorage.getItem('hemiciclo_v21'));
    await page.locator('[data-act="zoomcard"]').click();await page.locator('#zoomCardWrap canvas.gold-canvas').waitFor();
    assert.equal(await page.locator('#zoomCardWrap canvas.gold-canvas').evaluate(e=>e.width),420);
    await page.screenshot({path:root+'/_dev/previews/trump-restaurado-v30.2.56.png'});
    await page.keyboard.press('Escape');
    const stats=await page.locator('.stat').innerText();
    await page.locator('[data-act="dtskin"][data-val="normal"]').click();assert.equal(await page.locator('canvas.gold-canvas').count(),0);
    await page.locator('[data-act="dtskin"][data-val="golden"]').click();await page.locator('canvas.gold-canvas').waitFor();
    assert.equal(await page.locator('.stat').innerText(),stats);
    assert.equal(await page.evaluate(()=>localStorage.getItem('hemiciclo_v21')),saved);
    await page.locator('#tabbar [data-go="menu"]').click();await page.locator('[data-act="play-menu"]').click();await page.locator('[data-act="play-mode"][data-mode="rapida"]').click();await page.locator('[data-act="play"]').click();
    assert.ok(await page.locator('#coinRoot [role="dialog"]').isVisible());
    assert.ok(await page.locator('#content .battle-wrap').count());
    await page.locator('#coinRoot [data-act="begin"]').click();
    await page.evaluate(()=>{
     const t=window.__game,g=t.game;t.clearAI();g.side='p';g.n=4;g.tdp.p=8;g.field={p:[],e:[]};
     const own=t.mk(t.byid['donald-trump'],true,'p'),enemy=t.mk(t.byid['donald-trump'],true,'e');
     g.leader={p:own,e:enemy};g.hand.p=[own];g.field.e=[enemy];t.paint();
    });
    assert.equal(await page.locator('.row .gold-slot').count(),1);
    assert.equal(await page.locator('.tribuna [data-side="e"] .gold-slot').count(),0);
    assert.match(await page.locator('.tribuna [data-side="e"] .art img').getAttribute('src'),/donald-trump\.webp$/);
    await page.locator('.row [data-buid]').click();
    assert.equal(await page.locator('.tribuna [data-side="p"] .gold-slot').count(),1);
    assert.equal(await page.locator('.tribuna [data-side="e"] .gold-slot').count(),0);
    assert.equal(await page.evaluate(()=>window.__game.gold.startedAt),result.started);
    await page.screenshot({path:out+'/gold-own-and-rival.png'});
   }
   fs.writeFileSync(out+'/gold-'+variant+'.json',JSON.stringify(result,null,2));
   console.log(variant+': 46 original full frames, pixel-exact original renders, opaque loop boundaries, '+result.msPerDraw.toFixed(2)+' ms/draw');
   await context.close();
  }
  assert.deepEqual(errors,[]);
  console.log('Golden animation browser errors: 0');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
