'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createServer}=require('./preview-server.cjs'),reserve=require('./prepare.cjs');
(async()=>{
 const server=createServer();let browser;
 try{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
  for(const file of ['__proto__','constructor','sw.js','_dev/private'])assert.equal((await fetch(origin+'/'+file)).status,404);
  browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1300,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
  await page.goto(origin);await page.waitForFunction(()=>window.ReservePreview);
  await page.evaluate(ids=>{
   document.documentElement.style.cssText='height:auto;overflow:visible';document.body.style.cssText='height:auto;overflow:visible;position:static;display:block';
   document.body.innerHTML='<main style="max-width:1250px;margin:auto;padding:25px"><h1>Reserva interna · Francia</h1><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:18px">'+ids.map(id=>'<div data-reserved-id="'+id+'">'+ReservePreview.render(id)+'</div>').join('')+'</div></main>';
  },reserve.sourceCards.map(c=>c.id));
  const rendered=await page.evaluate(async()=>{
   const portraits=[...document.querySelectorAll('.reserved-portrait')],urls=[...new Set(portraits.map(e=>getComputedStyle(e).backgroundImage.slice(5,-2)))];
   await Promise.all(urls.map(async url=>{const image=new Image();image.src=url;await image.decode();}));
   return {portraits:portraits.length,pending:document.querySelectorAll('.reserved-art-pending').length,atlases:urls.length,catalog:HemicycleCatalog.cards.length,french:HemicycleCatalog.cards.filter(c=>c.country==='FR').length};
  });
  assert.deepEqual(rendered,{portraits:440,pending:0,atlases:Object.keys(reserve.artAssets).length,catalog:560,french:443});
  const missing=await page.locator('body').innerText();assert.ok(!missing.includes('undefined'));
  assert.equal((await page.evaluate(()=>navigator.serviceWorker.getRegistrations())).length,0);assert.deepEqual(errors,[]);
  const qa=path.join(__dirname,'cloture-frases/qa');
  await page.screenshot({path:path.join(qa,'reserve-render-1300.png')});
  const report={status:'passed',enabled:false,...rendered,actualGameCardRenderer:true,allAtlasImagesDecoded:true,serviceWorkers:0,remoteRequestsAllowed:false,errors};
  fs.writeFileSync(path.join(qa,'reserve-browser.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 }finally{if(browser)await browser.close();if(server.listening)await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1;});
