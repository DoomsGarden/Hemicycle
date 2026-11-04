'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {createServer}=require('./preview-server.cjs'),{sourceCards}=require('./prepare.cjs'),root=path.resolve(__dirname,'../../..'),out=path.join(__dirname,'qa');
async function main(){
 fs.mkdirSync(out,{recursive:true});const game=createServer();
 const review=http.createServer((req,res)=>{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+name);if(!file.startsWith(path.join(root,'_dev')+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.png')?'image/png':'text/plain; charset=utf-8'});res.end(fs.readFileSync(file));});
 await Promise.all([new Promise(r=>game.listen(0,'127.0.0.1',r)),new Promise(r=>review.listen(0,'127.0.0.1',r))]);
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:1600}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+game.address().port+'/');await page.waitForFunction(()=>window.ReservePreview);
  await page.evaluate(ids=>{
   document.documentElement.style.cssText='height:auto;overflow:visible';document.body.style.cssText='height:auto;overflow:visible;position:static;display:block;';
   document.body.innerHTML='<main style="max-width:1150px;margin:auto;padding:25px"><h1>Reserva interna · render real de los cromos</h1><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:18px">'+ids.map(id=>'<div>'+ReservePreview.render(id)+'</div>').join('')+'</div></main>';
  },sourceCards.map(c=>c.id));
  const images=await page.evaluate(async()=>{const portraits=[...document.querySelectorAll('.reserved-portrait')],urls=[...new Set(portraits.map(e=>getComputedStyle(e).backgroundImage.slice(5,-2)))];await Promise.all(urls.map(u=>new Promise((resolve,reject)=>{const i=new Image;i.onload=resolve;i.onerror=reject;i.src=u;})));return {portraits:portraits.length,atlases:urls.length,cards:HemicycleCatalog.cards.length,visible:portraits.every(p=>p.getBoundingClientRect().bottom<=document.documentElement.scrollHeight)};});
  assert.equal(images.portraits,20);assert.equal(images.atlases,5);assert.equal(images.cards,140);assert.equal(images.visible,true);assert.deepEqual(errors,[]);
  await page.screenshot({path:path.join(out,'render-20.png'),fullPage:true});
  await page.goto('http://127.0.0.1:'+review.address().port+'/_dev/expansions/espana-20/revision.html');
  for(const width of [393,768]){await page.setViewportSize({width,height:950});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.locator('article').first().scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'frases-'+width+'.png')});}
  await page.locator('#search').fill('Armengol');assert.equal(await page.locator('article:visible').count(),1);
  fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({images,reviewWidths:[393,768],filter:true,errors},null,2)+'\n');console.log('PASS: 20 retratos en el render real y revisión de frases adaptable.');
 }finally{await browser.close();await Promise.all([new Promise(r=>game.close(r)),new Promise(r=>review.close(r))]);}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
