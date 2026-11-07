'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'../../..'),P=require(root+'/js/portrait-layout.js'),preview=process.argv.includes('--individual-preview'),art=preview?require('./build-individual-art.cjs').apply(JSON.parse(fs.readFileSync(path.join(__dirname,'art-before.json'),'utf8')),{preview:true}):require(root+'/js/orator-art.js'),catalog=require(root+'/js/orator-catalog.js'),actions=require(root+'/js/action-cards.js'),legal=require(root+'/js/legal-documents.js'),tiers=require('../20261107/tier-review.json');
const qa=path.join(__dirname,'qa');fs.mkdirSync(qa,{recursive:true});
const unreviewed=process.argv.includes('--unreviewed'),reviewPrefix='review-'+Date.now().toString(36)+'-',jobs=preview?['individual-portraits.json','original-individual-portraits.json'].flatMap(file=>JSON.parse(fs.readFileSync(path.join(__dirname,file),'utf8')).jobs):[],pendingReview=new Set(jobs.filter(j=>j.status==='generated_pending_review').map(j=>j.id));
const ids=tiers.cards.filter(c=>(!c.original||unreviewed&&pendingReview.has(c.id))&&(!preview||art[c.id]&&art[c.id].columns===1)&&(!unreviewed||pendingReview.has(c.id))).map(c=>c.id).sort();if(!preview)assert.equal(ids.length,779);
const html=fs.readFileSync(root+'/index.html','utf8').replace('function boot(){','window.Repair={go:go,profile:D,paint:paint,notice:maybeExpansionNotice,stopTutorial:function(){if(TUTORIAL)TUTORIAL.active=false;},render:function(ids){go("coleccion");document.getElementById("content").innerHTML="<div class=hotfix-audit>"+ids.map(id=>"<div>"+cromoHTML(BYID[id],{count:1})+"<p>"+esc(id)+"</p></div>").join("")+"</div>";},zoom:function(id){go("detalle",{id:id});ZOOM_OPEN=true;renderZoomOverlay();}};function boot(){');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1440},deviceScaleFactor:1,serviceWorkers:'block',reducedMotion:'reduce'});
  await context.route('https://**/*',r=>r.abort());await context.route('http://127.0.0.1:8025/',r=>r.fulfill({contentType:'text/html',body:html}));
  await context.addInitScript(({legal,cards,actions})=>{
   localStorage.setItem('hemicycle_legal_acceptance_v1',JSON.stringify({id:crypto.randomUUID(),version:legal.version,hash:legal.hash,accepted:true,acceptedAt:new Date().toISOString(),ageBand:'18+',syncedAccounts:[]}));
   localStorage.setItem('hemiciclo_v21',JSON.stringify({fs:10000,w:392,l:51,elo:3667,album:cards.map(c=>c.id),actionAlbum:actions.map(c=>c.id),expansionEvent:{id:'expansion-2026-11',announced:true,mailVisited:true,claimed:['fs','comun','raro','legendario','mitico']},revisionEvent:{id:'revision-gabinetes-2026-11',announced:true,mailVisited:true,claimed:['fs','comun','raro','legendario','mitico']}}));
   for(const k of ['hemiciclo_tutorial_v1','hemiciclo_menu_tutorial_v1'])localStorage.setItem(k,JSON.stringify({status:'completed'}));
  },{legal,cards:catalog.cards,actions:actions.cards});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8025/');await page.locator('.launch-start').click();await page.waitForSelector('#launchScreen',{state:'hidden'});if(await page.locator('[data-profile=guest]').count())await page.locator('[data-profile=guest]').click();await page.waitForFunction(()=>window.HemicycleEntered);
  if(preview)await page.evaluate(art=>Object.assign(HemicycleOratorArt,art),art);
  await page.addStyleTag({content:'#app,#screen{max-width:none!important;width:100%!important}#appbar,#tabbar{display:none!important}#content{padding:10px!important;max-height:none!important;height:auto!important;overflow:visible!important}.hotfix-audit{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:14px}.hotfix-audit .cromo{width:100%;aspect-ratio:3/4}.hotfix-audit p{font:12px system-ui;color:white;margin:4px 0;overflow-wrap:anywhere}.hotfix-audit .cromo .nm{font-size:12px}.hotfix-audit .cromo .st{font-size:12px}'});
  const sheets=[];
  for(let offset=0;!process.argv.includes('--isolation-only')&&offset<ids.length;offset+=24){
   const batch=ids.slice(offset,offset+24);await page.evaluate(batch=>Repair.render(batch),batch);
   await page.evaluate(async()=>{for(const src of new Set(Array.from(document.querySelectorAll('.hotfix-audit svg image'),el=>el.getAttribute('href')))){const i=new Image();i.src=src;await i.decode();}});
   const file=(unreviewed?reviewPrefix:preview?'individual-preview-':'all-new-')+String(offset/24).padStart(2,'0')+'.jpg';await page.locator('.hotfix-audit').screenshot({path:path.join(qa,file),type:'jpeg',quality:90});sheets.push({file,ids:batch});
  }
  // For every actual framing, alter ONLY the neighbouring cells. The target's
  // rendered pixels must remain identical, in collection, enlarged and pack sizes.
  const cases=Object.entries(art).filter(([id,a])=>(!preview||a.columns===1)&&(!unreviewed||ids.includes(id))).map(([id,a])=>({id,art:a}));let checked=0;
  for(const item of cases){
   const variants=await page.evaluate(a=>{
    const cols=a.columns||2,rows=a.rows||2,p=(a.position||'0% 0%').split(/\s+/),col=Number.isInteger(a.column)?a.column:Math.round(parseFloat(p[0])/100*(cols-1)),row=Number.isInteger(a.row)?a.row:Math.round(parseFloat(p[1])/100*(rows-1));
    return ['#ff00ff','#00ff00'].map(fill=>{const c=document.createElement('canvas');c.width=1086;c.height=1448;const g=c.getContext('2d');g.fillStyle=fill;g.fillRect(0,0,c.width,c.height);g.fillStyle='#2878dc';g.fillRect(col*c.width/cols,row*c.height/rows,c.width/cols,c.height/rows);return c.toDataURL();});
   },item.art);
   const svgs=variants.map(url=>P.html({...item.art,url}).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '));
   const differences=await page.evaluate(async svgs=>{
    const result=[];for(const [w,h]of [[120,160],[300,410],[74,100]]){const rendered=[];for(const text of svgs){const i=new Image();i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(text);await i.decode();const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(i,0,0,w,h);rendered.push(g.getImageData(0,0,w,h).data);}let changed=0;for(let n=0;n<rendered[0].length;n++)if(rendered[0][n]!==rendered[1][n])changed++;result.push({w,h,changed});}return result;
   },svgs);
   assert.equal(differences.some(d=>d.changed>0),false,item.id+': neighbour pixels leaked '+JSON.stringify(differences));checked++;
  }
  assert.deepEqual(errors,[]);const result={newCards:ids.length,allPortraitsChecked:checked,renderSizes:3,neighbourLeakFailures:0,sheets,portraits:jobs.filter(j=>ids.includes(j.id)).map(j=>({id:j.id,sha256:j.sha256})),errors},report=unreviewed?reviewPrefix+'audit.json':preview?'individual-preview.json':'portrait-audit.json';fs.writeFileSync(path.join(qa,report),JSON.stringify(result,null,2)+'\n');if(unreviewed)fs.writeFileSync(path.join(qa,'latest-review.json'),JSON.stringify({report}));console.log('PASS',ids.length,'new-card renders and',checked,'portrait isolation checks × 3 sizes.',report);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
