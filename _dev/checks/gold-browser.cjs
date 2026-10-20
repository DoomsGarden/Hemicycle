const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root='/workspace/Hemicycle',html=fs.readFileSync(root+'/index.html','utf8'),out='/tmp/hemicycle-v30-2-55-checks';
fs.mkdirSync(out,{recursive:true});
const catalog=vm.createContext({});vm.runInContext(html.match(/function slug\(s\)\{[^\n]+/)[0]+'\n'+html.slice(html.indexOf('var DOCS='),html.indexOf("var LS='")),catalog);
const ids=JSON.parse(vm.runInContext('JSON.stringify(CARDS.map(c=>c.id))',catalog));
const profile={fs:76543,elo:855,w:12,l:7,album:ids,lastDaily:1,lastWeekly:2,dtWins:15,dtGoldUnlocked:true,dtGoldActive:true};
const instrumented=html.replace(/\}\)\(\);\s*<\/script>/,'window.__game={get gold(){return GOLD_LOOP},draw:drawCurrentGoldFrame,get game(){return G},mk:mk,byid:BYID,paint:paint,clearAI:clearAI};})();</script>');
const errors=[];
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  for(const variant of ['bitmap','image-fallback','portrait-failure']){
   const context=await browser.newContext({viewport:{width:393,height:851},isMobile:true,hasTouch:true,serviceWorkers:'block'});
   await context.addInitScript(({profile,variant})=>{
    localStorage.setItem('hemiciclo_v21',JSON.stringify(profile));Math.random=()=>0.25;
    if(variant==='image-fallback')window.createImageBitmap=undefined;
   },{profile,variant});
   await context.route('**/Hemicycle/',r=>r.fulfill({status:200,contentType:'text/html',body:instrumented}));
   if(variant==='portrait-failure')await context.route('**/cards/donald-trump-golden-portrait.webp',r=>r.abort('failed'));
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8022/Hemicycle/');
   await page.locator('#tabbar [data-go="coleccion"]').click();
   await page.locator('#fq').fill('Donald Trump');
   await page.locator('#gridBox [data-card="donald-trump"]').click();
   if(variant==='portrait-failure'){
    await page.waitForFunction(()=>window.__game.gold.state==='fallback');
    await page.waitForFunction(()=>{const im=document.querySelector('.gold-static-fb');return im&&im.complete&&im.naturalWidth>0&&im.src.endsWith('/donald-trump.webp')});
    assert.equal(await page.locator('canvas.gold-canvas').count(),0);
    console.log('Golden portrait failure: static classic fallback passed');
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
    let upward=0;
    for(let i=0;i<95;i++)for(const boundary of [2520,4940,9880]){
     const a=g.confetti.at(i,boundary-1),b=g.confetti.at(i,boundary+1);
     if(a.cycle===b.cycle&&b.y<a.y)upward++;
    }
    const start=performance.now();for(let i=0;i<60;i++)t.draw(g.startedAt+10000+i*34);
    return{frames,upward,faceFrames:g.frames.length,faceWidth:g.frames[0].bmp.width,msPerDraw:(performance.now()-start)/60,started:g.startedAt};
   });
   assert.equal(result.upward,0);assert.equal(result.faceFrames,46);assert.equal(result.faceWidth,132);
   for(const f of result.frames){assert.equal(f.minAlpha,255);assert.ok(f.average>10);fs.writeFileSync(out+'/gold-'+variant+'-'+f.time+'.png',Buffer.from(f.png.split(',')[1],'base64'));delete f.png}
   if(variant==='bitmap'){
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
   console.log(variant+': 46 expression frames, downward confetti, opaque renders, '+result.msPerDraw.toFixed(2)+' ms/draw');
   await context.close();
  }
  assert.deepEqual(errors,[]);
  console.log('Golden animation browser errors: 0');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
