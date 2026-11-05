'use strict';
const {chromium}=require('playwright'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const review=require('./review-content.cjs');
const http=require('node:http');
(async()=>{
 const server=http.createServer((req,res)=>{
  const route=new URL(req.url,'http://localhost').pathname;
  if(route!=='/revision.html'&&!/^\/primera-100\/art\/fr01-\d{2}\.png$/.test(route)){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',route.endsWith('.png')?'image/png':'text/html; charset=utf-8');
  fs.createReadStream(path.join(__dirname,route)).on('error',()=>res.destroy()).pipe(res);
 });
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:'+server.address().port+'/revision.html');
  await p.locator('img').evaluateAll(xs=>xs.forEach(x=>x.loading='eager'));
  await p.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0));
  a.equal(await p.locator('article').count(),100);a.equal(await p.locator('blockquote').count(),54+review.bilingualCandidates);
  a.equal(await p.locator('.portrait').count(),review.generatedPortraits);
  await p.selectOption('#art','true');a.equal(await p.locator('article:visible').count(),review.generatedPortraits);
  await p.selectOption('#art','false');a.equal(await p.locator('article:visible').count(),100-review.generatedPortraits);await p.selectOption('#art','');
  for(const width of [320,393,768,1200]){await p.setViewportSize({width,height:900});a.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  await p.selectOption('#tier','legendario');a.equal(await p.locator('article:visible').count(),10);await p.selectOption('#tier','');
  await p.locator('#search').fill('Bardella');a.equal(await p.locator('article:visible').count(),1);
  const card=p.locator('article:visible');a.equal(await card.locator('blockquote').count(),3);a.ok((await card.textContent()).includes('El Gobierno del primer ministro ya es historia'));
  await card.locator('details').nth(1).evaluate(e=>e.open=true);await p.setViewportSize({width:393,height:900});await card.scrollIntoViewIfNeeded();await p.screenshot({path:path.join(__dirname,'qa/candidates-393.png'),fullPage:true});
  await p.locator('#search').fill('Borne');a.equal(await p.locator('article:visible').count(),1);
  const bilingual=p.locator('article:visible .bilingual');await bilingual.evaluate(e=>e.open=true);
  a.equal(await bilingual.locator('blockquote').count(),3);a.equal(await bilingual.locator('[lang=fr]').count(),3);
  for(const width of [320,393,768,1200]){await p.setViewportSize({width,height:900});a.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  await p.setViewportSize({width:393,height:900});await p.screenshot({path:path.join(__dirname,'qa/bilingual-art-393.png'),fullPage:true});
  await p.locator('#search').fill('Bruno Bernard');a.equal(await p.locator('article:visible').count(),1);
  const bruno=p.locator('#bruno-bernard'),brunoQuotes=bruno.locator('.bilingual');
  a.equal(await bruno.locator('.portrait').count(),1);
  a.ok((await bruno.locator('.portrait img').getAttribute('style')).includes('left:-100%;top:-100%'));
  await brunoQuotes.evaluate(e=>e.open=true);a.equal(await brunoQuotes.locator('blockquote').count(),3);
  a.ok((await brunoQuotes.textContent()).includes('publicación 2020-03-12; fecha de declaración no precisada'));
  for(const width of [320,393,768,1200]){await p.setViewportSize({width,height:900});a.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  await p.setViewportSize({width:393,height:900});await bruno.scrollIntoViewIfNeeded();await p.screenshot({path:path.join(__dirname,'qa/bruno-bernard-393.png'),fullPage:true});
  await p.locator('#search').fill('');a.deepEqual(errors,[]);
  fs.writeFileSync(path.join(__dirname,'qa/candidates-browser.json'),JSON.stringify({candidates:100,spanishPressCandidates:54,bilingualCandidates:review.bilingualCandidates,generatedPortraits:review.generatedPortraits,allPortraitImagesLoaded:true,widths:[320,393,768,1200],tierFilter:true,artFilter:true,search:true,documentedSubstitutionVisible:true,bilingualSourcesVisible:true,errors},null,2)+'\n');
  console.log('PASS:100 perfiles,arte y originales bilingües, filtros,fuentes y revisión adaptable.');
 }finally{await b.close();if(server.listening)await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
