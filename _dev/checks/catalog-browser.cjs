const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{chromium}=require('playwright');
const root='/workspace/Hemicycle',html=fs.readFileSync(root+'/index.html','utf8'),out='/tmp/hemicycle-v30-2-55-checks';
const c=vm.createContext({HemicycleCatalog:require('../../js/orator-catalog.js')});vm.runInContext(html.match(/function slug\(s\)\{[^\n]+/)[0]+'\n'+html.slice(html.indexOf('var DOCS='),html.indexOf("var LS='")),c);
const cards=JSON.parse(vm.runInContext('JSON.stringify(CARDS)',c)),notes=require(root+'/js/changelog.js');
const matchups=JSON.parse(vm.runInContext('JSON.stringify(DOCS)',c));
const profile={fs:76543,elo:300,w:12,l:7,album:cards.map(c=>c.id),lastDaily:1770000000000,lastWeekly:1770000000010,dtWins:14,dtGoldUnlocked:true,dtGoldActive:true};
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const errors=[];
 try{
  for(const viewport of (process.env.SMALL_ONLY?[{width:320,height:568}]:[{width:393,height:851},{width:360,height:640},{width:320,height:568}])){
   const context=await browser.newContext({viewport,isMobile:true,hasTouch:true,timezoneId:'Europe/Madrid',locale:'es-ES',serviceWorkers:'block'});
   await context.addInitScript(profile=>{if(!localStorage.getItem('hemiciclo_v21'))localStorage.setItem('hemiciclo_v21',JSON.stringify(profile))},profile);
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8022/Hemicycle/');
   assert.match(await page.locator('#appbar').innerText(),/v30\.2\.55/);
   assert.ok(await page.locator('#appbar').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'appbar width '+viewport.width);
   assert.deepEqual(await page.locator('#appbar .abR button').evaluateAll(els=>els.map(el=>el.dataset.go)),['novedades','ayuda']);
   await page.locator('#appbar [data-go="novedades"]').click();
   assert.equal(await page.locator('.release-entry').count(),notes.length);
   assert.equal(await page.locator('.release-entry[open]').count(),0);
   assert.ok(await page.locator('#appbar').isVisible());assert.ok(await page.locator('#tabbar').isVisible());
   assert.match(await page.locator('#content').innerText(),/primera versión jugable conservada es la v19/);
   const latest=page.locator('.release-entry').first();
   await latest.locator('.release-chevron').click();
   await page.waitForFunction(()=>{const el=document.querySelector('.release-entry .release-chevron');return new DOMMatrix(getComputedStyle(el).transform).a<-.99});
   assert.ok(await latest.getAttribute('open')!==null);
   await page.screenshot({path:out+'/changelog-'+viewport.width+'.png'});
   await latest.locator('.release-chevron').click();
   await page.waitForFunction(()=>new DOMMatrix(getComputedStyle(document.querySelector('.release-entry .release-chevron')).transform).a>.99);
   assert.equal(await latest.getAttribute('open'),null);
   for(const note of notes){
    const entry=page.locator('.release-entry[data-version="'+note.version+'"]');
    await entry.locator('summary').click();
    assert.ok(await entry.getAttribute('open')!==null);
    assert.equal(await entry.locator('.release-content li').count(),note.sections.reduce((sum,s)=>sum+s.items.length,0));
    assert.ok(await entry.locator('.release-content').isVisible());
    await entry.locator('summary').click();
    assert.equal(await entry.getAttribute('open'),null);
   }
   await latest.locator('summary').focus();await page.keyboard.press('Enter');
   assert.ok(await latest.getAttribute('open')!==null);
   await page.keyboard.press('Space');assert.equal(await latest.getAttribute('open'),null);
   await page.emulateMedia({reducedMotion:'reduce'});
   assert.equal(await latest.locator('.release-chevron').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
   assert.ok(await page.locator('#content').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'changelog width');
   assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('hemiciclo_v21'))),profile);
   await page.locator('#tabbar [data-go="coleccion"]').click();
   const toCheck=viewport.width===393?cards:cards.filter(c=>['jose-luis-abalos','marta-rivera-de-la-cruz','donald-trump'].includes(c.id));
   let checked=0;
   for(const card of toCheck){
    await page.locator('#fq').fill(card.n);
    await page.locator('#gridBox [data-card="'+card.id+'"]').click();
    assert.deepEqual(await page.locator('#content .quote').allTextContents(),card.q,card.id);
    assert.equal(await page.locator('#content .stat>div').first().locator('b').innerText(),String(card.c),card.id);
    const doctrine=matchups.find(d=>d.k===card.pa),weak=matchups.find(d=>d.beats===card.pa);
    const text=await page.locator('#content').innerText();
    assert.ok(text.includes('Contrarresta: '+matchups.find(d=>d.k===doctrine.beats).n));
    assert.ok(text.includes('Debilidad: '+weak.n));
    const layout=await page.locator('#detalleSwipe>.panel:not(.gold-box)').evaluate(panel=>{
     const q=panel.querySelector('.quote:last-child'),p=panel.getBoundingClientRect(),b=q?.getBoundingClientRect();
     return{overflow:getComputedStyle(panel).overflowY,clipped:b&&b.bottom>p.bottom+1,scrollHeight:panel.scrollHeight,clientHeight:panel.clientHeight};
    });
    if(layout.clipped&&layout.overflow!=='auto'){
     await page.screenshot({path:out+'/clipped-'+viewport.width+'-'+card.id+'.png'});
     throw new Error('Clipped detail '+viewport.width+' '+card.id+' '+JSON.stringify(layout));
    }
    assert.ok(await page.locator('#content').evaluate(el=>el.scrollWidth<=el.clientWidth+1),card.id+' width');
    const back=page.locator('#content [data-go="coleccion"]');
    assert.ok(await back.evaluate(el=>el.getBoundingClientRect().bottom<=document.getElementById('content').getBoundingClientRect().bottom+1),'back button clipped');
    await back.click();
    if(++checked%30===0)console.log('Details checked:',checked);
   }
   await page.locator('#appbar [data-go="ayuda"]').click();
   assert.match(await page.locator('#content').innerText(),/Debilidades circulares/);
   const back=page.locator('#content [data-go="menu"]');
   assert.ok(await back.evaluate(el=>el.getBoundingClientRect().bottom<=document.getElementById('content').getBoundingClientRect().bottom+1));
   await page.screenshot({path:out+'/help-'+viewport.width+'.png'});
   assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('hemiciclo_v21'))),profile);
   console.log('UI passed:',viewport.width+'x'+viewport.height,notes.length+' release accordions',checked+' card details');
   await context.close();
  }
  assert.deepEqual(errors,[]);
  console.log('UI checks passed with no browser errors');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
