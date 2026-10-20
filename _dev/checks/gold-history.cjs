const fs=require('node:fs'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const {createMarketServer}=require('../market/server.cjs'),{cards,root}=require('../market/catalog.cjs');
const current=fs.readFileSync(root+'/index.html','utf8'),out=root+'/_dev/reports/v30.2.57';fs.mkdirSync(out,{recursive:true});
const profile={fs:4321,elo:321,w:5,l:3,album:cards.map(c=>c.id),lastDaily:1,lastWeekly:2,dtWins:15,dtGoldUnlocked:true,dtGoldActive:true};
const refs=['5a3a785','9dd06be','b28daf7','da2dc6a'];
(async()=>{
 const app=createMarketServer();await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});const results=[];
 try{
  for(const ref of refs){
   const html=execFileSync('git',['show',ref+':index.html'],{cwd:root}).toString();
   const engine=html.slice(html.indexOf('var GOLD_LOOP={'),html.indexOf('\nvar DOCS='));
   const pageHtml=(current.slice(0,current.indexOf('var GOLD_LOOP={'))+engine+current.slice(current.indexOf('\nvar DOCS='))).replace(/\}\)\(\);\s*<\/script>/,'window.__gold={state:GOLD_LOOP,draw:drawCurrentGoldFrame,playback:getGoldPlayback};})();</script>');
   const context=await browser.newContext({viewport:{width:393,height:851},serviceWorkers:'block'});
   await context.addInitScript(profile=>localStorage.setItem('hemiciclo_v21',JSON.stringify(profile)),profile);
   await context.route('**/Hemicycle/',r=>r.fulfill({status:200,contentType:'text/html',body:pageHtml}));
   const page=await context.newPage();await page.goto('http://127.0.0.1:'+app.server.address().port+'/Hemicycle/');
   await page.locator('#tabbar [data-go="coleccion"]').click();await page.locator('#fq').fill('Donald Trump');await page.locator('[data-card="donald-trump"]').click();
   await page.waitForFunction(()=>window.__gold.state.state==='ready');
   const result=await page.evaluate(()=>{
    const t=window.__gold,g=t.state;cancelAnimationFrame(g.rafId);g.rafId=null;
    t.draw(g.startedAt+2350);const drawing=g.surface.getContext('2d').getImageData(0,0,g.w,g.h).data;
    let opaque=true;for(let i=3;i<drawing.length;i+=4)if(drawing[i]!==255)opaque=false;
    let backwardParticles=null;
    if(g.confetti){backwardParticles=0;for(let i=0;i<g.confetti.particles.length;i++)for(const time of [2500,2600,3500,4939,4941,9880]){const a=g.confetti.at(i,time),b=g.confetti.at(i,time+1);if(a.cycle===b.cycle&&b.y<a.y)backwardParticles++;}}
    return {frames:g.frames.length,decodedWidth:g.frames[0].bmp.width,independentParticles:!!g.confetti,backwardParticles,opaque};
   });
   result.ref=ref;result.version=html.match(/var VERSION='([^']+)'/)[1];result.engineHash=crypto.createHash('sha256').update(engine).digest('hex');
   assert.equal(result.frames,46);assert.equal(result.opaque,true);
   assert.equal(result.independentParticles,['9dd06be','b28daf7'].includes(ref));
   if(result.independentParticles)assert.equal(result.backwardParticles,0);
   results.push(result);console.log(result.version+': '+(result.independentParticles?'independent downward particles':'baked particles reverse with the image sequence'));
   await context.close();
  }
  assert.equal(results[0].engineHash,results[3].engineHash);assert.equal(results[1].engineHash,results[2].engineHash);
  fs.writeFileSync(out+'/animation-history.json',JSON.stringify(results,null,2)+'\n');
 }finally{await browser.close();await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
