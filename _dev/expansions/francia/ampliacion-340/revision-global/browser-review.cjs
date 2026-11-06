'use strict';
const {chromium}=require('playwright'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const review=require('./ajuste.json'),fr=path.resolve(__dirname,'../..');
(async()=>{
 const server=http.createServer((req,res)=>{
  const route=new URL(req.url,'http://localhost').pathname;
  if(route!=='/ampliacion-340/revision-global/revision.html'&&!/^\/(?:primera-100\/art\/fr01-\d{2}|ampliacion-340\/art\/fr02-\d{2})\.png$/.test(route)){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',route.endsWith('.png')?'image/png':'text/html; charset=utf-8');fs.createReadStream(path.join(fr,route)).on('error',()=>res.destroy()).pipe(res);
 });
 let browser;
 try{
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/ampliacion-340/revision-global/revision.html');
  await page.locator('img').evaluateAll(xs=>xs.forEach(x=>x.loading='eager'));await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
  a.equal(await page.locator('article').count(),440);a.equal(await page.locator('.portrait').count(),440);
  for(const [tier,n]of Object.entries(review.distribution)){await page.selectOption('#tier',tier);a.equal(await page.locator('article:visible').count(),n);}
  await page.selectOption('#tier','');
  for(const [id,n]of Object.entries(review.passiveDistribution)){await page.selectOption('#passive',id);a.equal(await page.locator('article:visible').count(),n);}
  await page.selectOption('#passive','');
  for(const [id,n]of Object.entries(review.normalEffectDistribution)){await page.selectOption('#effect',id);a.equal(await page.locator('article:visible').count(),n);}
  await page.selectOption('#effect','');
  for(const name of ['Josette Borel-Lincertin','Daniel Zaïdani','Bruno Le Maire']){
   await page.locator('#search').fill(name);a.equal(await page.locator('article:visible').count(),1);
   const card=page.locator('article:visible');await card.locator('details').evaluate(el=>el.open=true);
   a.ok((await card.textContent()).includes('Frases: selección y revisión editorial pendientes.'));
   for(const width of [320,393,768,1200]){await page.setViewportSize({width,height:900});a.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+'/'+width);}
   if(name==='Daniel Zaïdani'){await page.setViewportSize({width:393,height:900});await page.screenshot({path:path.join(__dirname,'qa/global-daniel-393.png'),fullPage:true});}
  }
  await page.locator('#search').fill('');a.equal(await page.locator('article:visible').count(),440);a.deepEqual(errors,[]);
  const result={orators:440,allImagesLoaded:true,rarityFilters:true,passiveFilters:6,normalEffectFilters:14,lastTwoOratorsPresent:true,widths:[320,393,768,1200],horizontalOverflow:false,errors};
  fs.writeFileSync(path.join(__dirname,'qa/browser-review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
 }finally{if(browser)await browser.close();if(server.listening)await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
