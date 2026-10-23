const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const report={viewports:[],errors:[],networkRequests:[],layerPairs:[]};
 try{
  for(const viewport of [{width:320,height:568},{width:393,height:851},{width:1280,height:900}]){
   const ctx=await browser.newContext({viewport,offline:true});const page=await ctx.newPage();
   page.on('pageerror',e=>report.errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))report.networkRequests.push(r.url());});
   await page.setContent(fs.readFileSync(path.join(__dirname,'escuchar.html'),'utf8'));
   assert.equal(await page.evaluate(()=>playing),false);assert.equal(await page.evaluate(()=>context),null);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   await page.locator('#play').click();await page.waitForFunction(()=>playing);
   assert.equal(await page.evaluate(()=>context.state),'running');assert.equal(await page.evaluate(()=>players.length),2);
   await page.evaluate(()=>window.initialPlayers=players.slice());
   async function votes(own,rival){await page.evaluate(({own,rival})=>{$('own').value=own;$('rival').value=rival;update();},{own,rival});}
   for(const [own,rival,expected] of [[50,49,false],[51,49,true],[49,51,true],[50,50,false],[100,0,true],[0,51,true],[0,0,false]]){
    await votes(own,rival);assert.equal(await page.locator('#state').evaluate(el=>el.classList.contains('glorious')),expected);
    assert.equal(await page.evaluate(()=>players.every((p,i)=>p===initialPlayers[i])),true);
   }
   await votes(51,49);await page.waitForTimeout(1600);assert.ok(await page.evaluate(()=>layerGain.gain.value>.99));
   await votes(50,50);await page.waitForTimeout(1600);assert.ok(await page.evaluate(()=>layerGain.gain.value<.01));
   assert.equal(await page.evaluate(()=>players.every(p=>p.loop)),true);
   await page.locator('#volume').fill('23');await page.locator('#volume').dispatchEvent('input');await page.waitForTimeout(200);assert.ok(await page.evaluate(()=>Math.abs(master.gain.value-.23)<.005));
   if(viewport.width===393){await page.locator('[data-votes="51,49"]').click();await page.screenshot({path:path.join(__dirname,'comparador-movil.png'),fullPage:true});}
   if(viewport.width===1280){
    for(const id of ['a','b','c']){
     const lengths=await page.evaluate(async id=>{const pair=await decode(id);return pair.map(b=>({length:b.length,duration:b.duration,sampleRate:b.sampleRate,channels:b.numberOfChannels}));},id);
     assert.equal(lengths[0].length,lengths[1].length);assert.ok(lengths[0].duration>30&&lengths[0].duration<36);assert.equal(lengths[0].channels,2);report.layerPairs.push({id,...lengths[0]});
    }
   }
   await page.locator('[data-piece=b]').click();assert.equal(await page.evaluate(()=>players.length),0);assert.equal(await page.evaluate(()=>playing),false);
   await page.locator('#play').click();await page.waitForFunction(()=>playing);assert.equal(await page.evaluate(()=>selected),'b');
   await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>players.length),0);
   await page.locator('#play').click();await page.waitForFunction(()=>playing);await page.locator('#stop').click();assert.equal(await page.evaluate(()=>playing),false);
   await page.locator('#play').click();await page.waitForFunction(()=>playing);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{get:()=>true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await page.evaluate(()=>playing),false);
   report.viewports.push({...viewport,offline:true,noAutoplay:true,exactThreshold:true,eitherPlayer:true,noRestartOnThresholdChange:true,rampUpAndDown:true,volume:true,stop:true,escape:true,backgroundStops:true,noHorizontalOverflow:true});
   await ctx.close();
  }
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.networkRequests,[]);
  fs.writeFileSync(path.join(__dirname,'verification-browser.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
