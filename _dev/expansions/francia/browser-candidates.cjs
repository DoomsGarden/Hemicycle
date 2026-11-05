'use strict';
const {chromium}=require('playwright'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.setContent(fs.readFileSync(path.join(__dirname,'revision.html'),'utf8'));
  a.equal(await p.locator('article').count(),100);a.equal(await p.locator('blockquote').count(),54);
  for(const width of [320,393,768,1200]){await p.setViewportSize({width,height:900});a.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  await p.selectOption('#tier','legendario');a.equal(await p.locator('article:visible').count(),10);await p.selectOption('#tier','');
  await p.locator('#search').fill('Bardella');a.equal(await p.locator('article:visible').count(),1);
  const card=p.locator('article:visible');a.equal(await card.locator('blockquote').count(),3);a.ok((await card.textContent()).includes('El Gobierno del primer ministro ya es historia'));
  await card.locator('details').nth(1).evaluate(e=>e.open=true);await p.setViewportSize({width:393,height:900});await card.scrollIntoViewIfNeeded();await p.screenshot({path:path.join(__dirname,'qa/candidates-393.png'),fullPage:true});
  await p.locator('#search').fill('');a.deepEqual(errors,[]);
  fs.writeFileSync(path.join(__dirname,'qa/candidates-browser.json'),JSON.stringify({candidates:100,spanishPhraseCandidates:54,widths:[320,393,768,1200],tierFilter:true,search:true,documentedSubstitutionVisible:true,errors},null,2)+'\n');
  console.log('PASS:100 perfiles,54 candidatas, fuentes, sustitución y revisión adaptable.');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
