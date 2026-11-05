'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const data=require('./seleccion.json');
(async()=>{
 const server=http.createServer((req,res)=>{
  const route=new URL(req.url,'http://localhost').pathname;
  if(route!=='/revision.html'&&!/^\/art\/fr02-\d{2}\.png$/.test(route)){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',route.endsWith('.png')?'image/png':'text/html; charset=utf-8');
  fs.createReadStream(path.join(__dirname,route)).on('error',()=>res.destroy()).pipe(res);
 });
 let browser;
 try{
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/revision.html');
  await page.locator('img').evaluateAll(xs=>xs.forEach(x=>x.loading='eager'));
  await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
  assert.equal(await page.locator('article').count(),340);
  assert.equal(await page.locator('.portrait').count(),data.progress.generatedPortraits);
  for(const state of ['true','false','']){
   await page.selectOption('#art',state);
   assert.equal(await page.locator('article:visible').count(),state==='true'?data.progress.generatedPortraits:state==='false'?data.progress.pendingPortraits:340);
  }
  await page.locator('#search').fill('Raymond Barre');assert.equal(await page.locator('article:visible').count(),0);
  await page.locator('#search').fill('Ayrault');assert.equal(await page.locator('article:visible').count(),1);
  const card=page.locator('article:visible');await card.locator('details').evaluate(el=>el.open=true);
  assert.equal(await card.locator('details a').first().getAttribute('href'),data.cards.find(c=>c.id==='jean-marc-ayrault').recentPeriodEvidence[0].source);
  for(const width of [320,393,768,1200]){
   await page.setViewportSize({width,height:900});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow at '+width);
  }
  await page.setViewportSize({width:393,height:900});
  await page.screenshot({path:path.join(__dirname,'qa/review-393.png'),fullPage:true});
  await page.locator('#search').fill('');assert.equal(await page.locator('article:visible').count(),340);assert.deepEqual(errors,[]);
  const report={selected:340,generatedPortraits:data.progress.generatedPortraits,allGeneratedImagesLoaded:true,search:true,artFilters:true,widths:[320,393,768,1200],noHorizontalOverflow:true,errors};
  fs.writeFileSync(path.join(__dirname,'qa/browser-review.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 }finally{if(browser)await browser.close();if(server.listening)await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
