const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const root=__dirname;
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const report={viewports:[],errors:[],networkRequests:[],decoded:0};
 try{
  for(const viewport of [{width:320,height:568},{width:393,height:851},{width:1280,height:900}]){
   const context=await browser.newContext({viewport,offline:true,acceptDownloads:true});
   const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))report.networkRequests.push(r.url());});
   await page.setContent(fs.readFileSync(path.join(root,'escuchar.html'),'utf8'));
   assert.equal(await page.locator('[data-sample]').count(),54);
   assert.equal(await page.evaluate(()=>current),null);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   await page.locator('[data-sample=a-menu]').click();await page.waitForTimeout(250);
   assert.equal(await page.evaluate(()=>!!current&&!current.paused&&current.currentTime>0),true);
   await page.evaluate(()=>window.previousAudio=current);
   await page.locator('[data-sample=b-normal]').click();await page.waitForTimeout(70);
   assert.equal(await page.evaluate(()=>previousAudio.paused&&!previousAudio.hasAttribute('src')),true);
   assert.equal(await page.locator('.playing').count(),1);
   await page.locator('#volume').fill('20');await page.locator('#volume').dispatchEvent('input');
   assert.equal(await page.evaluate(()=>current.volume),.2);
   await page.keyboard.press('Escape');assert.equal(await page.locator('.playing').count(),0);
   await page.locator('[data-sample=c-battle]').click();await page.locator('#stop').click();assert.equal(await page.evaluate(()=>current),null);
   await page.locator('[data-sample=a-ui]').click();await page.waitForTimeout(600);assert.equal(await page.locator('.playing').count(),0);
   if(viewport.width===393){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(root,'comparador-movil.png'),fullPage:false});}
   if(viewport.width===1280){
    report.decoded=await page.evaluate(async()=>{
     const ctx=new AudioContext();let count=0;
     try{for(const source of Object.values(sources)){const b64=source.split(',')[1],bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));const buffer=await ctx.decodeAudioData(bytes.buffer);if(buffer.numberOfChannels!==2||buffer.duration<=.1)throw Error('Invalid audio buffer');let peak=0;const data=buffer.getChannelData(0);for(const value of data)peak=Math.max(peak,Math.abs(value));if(!Number.isFinite(peak)||peak<=.001||peak>=.9)throw Error('Invalid audio level '+peak);count++;}return count;}finally{await ctx.close();}
    });
    await page.locator('summary').click();await page.locator('#notes').fill('Menú A, ataques B; curación C más corta.');
    const downloadPromise=page.waitForEvent('download');await page.locator('#save').click();const download=await downloadPromise;
    assert.equal(download.suggestedFilename(),'hemicycle-preferencias-sonido.txt');assert.match(fs.readFileSync(await download.path(),'utf8'),/Menú A, ataques B/);
   }
   report.viewports.push({...viewport,offline:true,noAutoplay:true,singleSound:true,volume:true,stop:true,keyboard:true,noHorizontalOverflow:true});
   await context.close();
  }
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.networkRequests,[]);assert.equal(report.decoded,54);
  fs.writeFileSync(path.join(root,'verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
