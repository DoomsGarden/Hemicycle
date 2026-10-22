// Gestos nativos de dos dedos: la prueba de control debe ampliar antes del ajuste.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {execFileSync}=require('node:child_process'),{chromium}=require('playwright');
const {createMarketServer}=require('../market/server.cjs'),{root,cards}=require('../market/catalog.cjs');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const previousHtml=execFileSync('git',['show','fd7afe2:index.html'],{cwd:root,encoding:'utf8'});
const previousGestures=execFileSync('git',['show','fd7afe2:js/app-interaction.js'],{cwd:root,encoding:'utf8'});
const profile={fs:4321,elo:321,w:18,l:12,album:cards.map(c=>c.id),lastDaily:1,lastWeekly:2,dtWins:0,dtGoldUnlocked:false,dtGoldActive:false};
const report={baseline:null,checks:[],errors:[],published:false};
async function pinch(cdp,page,x,y){
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-35,y,id:1},{x:x+35,y,id:2}]});
 for(let i=1;i<=8;i++){
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-35-i*9,y,id:1},{x:x+35+i*9,y,id:2}]});
  await page.waitForTimeout(20);
 }
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(70);
}
async function drag(cdp,page,x,y,dx,dy){
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});
 for(let i=1;i<=10;i++){
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/10,y:y+dy*i/10,id:1}]});await page.waitForTimeout(16);
 }
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(100);
}
(async()=>{
 const app=createMarketServer();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+app.server.address().port+'/Hemicycle/';
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  async function open(viewport,content,old=false){
   const context=await browser.newContext({viewport,isMobile:true,hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});
   await context.addInitScript(profile=>{localStorage.setItem('hemiciclo_v21',JSON.stringify(profile));for(const k of ['hemiciclo_tutorial_v1','hemiciclo_menu_tutorial_v1'])localStorage.setItem(k,JSON.stringify({status:'completed'}));},profile);
   await context.route('**/Hemicycle/',r=>r.fulfill({contentType:'text/html',body:content}));
   if(old)await context.route('**/js/app-interaction.js*',r=>r.fulfill({contentType:'text/javascript',body:previousGestures}));
   const page=await context.newPage();page.setDefaultTimeout(8000);page.on('pageerror',e=>report.errors.push(e.message));await page.goto(base);
   return {context,page,cdp:await context.newCDPSession(page)};
  }
  // Simula que el navegador no aplica la restricción de la etiqueta viewport.
  const control=await open({width:393,height:851},previousHtml.replace(', maximum-scale=1, user-scalable=no',''),true);
  await pinch(control.cdp,control.page,196,410);report.baseline=await control.page.evaluate(()=>visualViewport.scale);
  assert.ok(report.baseline>1.1,'El control debe demostrar que estos gestos sí producen zoom');await control.context.close();
  for(const viewport of [{width:393,height:851},{width:320,height:568},{width:851,height:393}].filter(v=>!process.env.ONLY_WIDTH||v.width===Number(process.env.ONLY_WIDTH))){
   const {context,page,cdp}=await open(viewport,html.replace(', maximum-scale=1, user-scalable=no',''));
   async function noZoom(label,selector='#content',doubleTap=true){
    const rect=await page.locator(selector).boundingBox();assert.ok(rect,label);
    const x=Math.max(115,Math.min(viewport.width-115,rect.x+rect.width/2));
    const y=Math.max(20,Math.min(viewport.height-20,rect.y+rect.height/2));
    await pinch(cdp,page,x,y);
    assert.equal(await page.evaluate(()=>visualViewport.scale),1,label+': pellizco');
    assert.equal(await page.evaluate(()=>scrollY),0,label+': desplazamiento de página');
    const neutral=page.locator('#launchTitle:visible,#profileTitle:visible,#cloudTitle:visible,.brand:visible').first();
    const box=doubleTap&&await neutral.count()?await neutral.boundingBox():null;if(box){await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);await page.waitForTimeout(60);await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);await page.waitForTimeout(100);}
    assert.equal(await page.evaluate(()=>visualViewport.scale),1,label+': doble toque');
    report.checks.push(viewport.width+'x'+viewport.height+' '+label);
   }
   await noZoom('inicio','#launchScreen');
   await page.locator('.launch-start').click();await page.waitForSelector('#launchScreen',{state:'detached'});
   await noZoom('acceso','#profileRoot .player-profile');
   await page.locator('[data-profile=email]').click();await page.locator('#accountEmail').fill('prueba@example.test');
   assert.equal(await page.evaluate(()=>visualViewport.scale),1,'Enfoque de correo');
   assert.equal(await page.locator('#accountEmail').evaluate(el=>{const e=new Event('selectstart',{bubbles:true,cancelable:true});el.dispatchEvent(e);return e.defaultPrevented;}),false);
   await noZoom('formulario de correo','#profileRoot .player-profile');await page.locator('[data-profile=guest]').click();
   const saved=await page.evaluate(()=>localStorage.getItem('hemiciclo_v21'));
   await noZoom('menú');await page.locator('[data-act=profile]').click();await noZoom('perfil','.player-profile');await page.locator('[data-profile=close]').click();
   // Renderiza la interfaz de nube real con un servicio aislado, sin acceder a cuentas.
   await page.evaluate(profile=>{window.__viewportCloud=HemicycleCloudUI.create({service:{state:()=>({phase:'empty',connected:true,enabled:false}),recovery:()=>null,remoteRecovery:()=>null,refresh:()=>{}},snapshot:()=>({profile}),canOpen:()=>true});window.__viewportCloud.open();},profile);
   await noZoom('nube','.cloud-panel');await page.locator('[data-cloud=close]').first().click();
   for(const menu of ['tienda','coleccion','mercado','liga']){
    await page.locator('#tabbar [data-go="'+menu+'"]').click();await noZoom(menu);
   }
   await page.locator('#appbar [data-go=novedades]').click();await noZoom('cambios');
   await page.locator('#appbar [data-go=ayuda]').click();await noZoom('ayuda');
   await page.locator('#tabbar [data-go=coleccion]').click();
   const collectionRect=await page.locator('#content').boundingBox();
   await drag(cdp,page,collectionRect.x+collectionRect.width/2,collectionRect.y+collectionRect.height*.8,0,-Math.min(150,collectionRect.height*.6));
   assert.ok(await page.locator('#content').evaluate(el=>el.scrollTop)>0,'El desplazamiento de colección debe funcionar');
   await page.locator('#content').evaluate(el=>el.scrollTop=0);await page.locator('#fq').fill('Donald Trump');
   assert.equal(await page.locator('#gridBox [data-card]').count(),1,'El filtro sigue funcionando');await page.locator('#fq').fill('');
   await page.locator('#gridBox [data-card=donald-trump]').click();await noZoom('ficha');
   await page.locator('[data-act=zoomcard]').click();const name=await page.locator('#zoomCardWrap .nm').innerText();
   await noZoom('ampliación del cromo','#zoomBg',false);assert.equal(await page.locator('#zoomCardWrap .nm').innerText(),name,'El pellizco no debe cambiar de cromo');
   await drag(cdp,page,viewport.width*.72,viewport.height*.45,-viewport.width*.45,0);
   assert.notEqual(await page.locator('#zoomCardWrap .nm').innerText(),name,'Deslizar entre cromos sigue funcionando');await page.waitForTimeout(350);await page.keyboard.press('Escape');
   await page.locator('#tabbar [data-go=menu]').click();assert.equal(await page.evaluate(()=>localStorage.getItem('hemiciclo_v21')),saved,'Progreso intacto');
   await page.locator('[data-act=play-menu]').click();await page.locator('[data-act=play-mode][data-mode=rapida]').click();await page.locator('[data-act=play]').click();
   // Rápida entra directamente en combate con el lanzamiento de moneda.
   await noZoom('moneda','#coinRoot [role=dialog]');await page.locator('[data-act=begin]').click();await noZoom('combate','.battle-wrap');
   console.log(viewport.width+'x'+viewport.height+': menús, ventanas, gestos y progreso comprobados');await context.close();
  }
  assert.deepEqual(report.errors,[]);report.passed=true;
  const output=path.join(root,'_dev/reviews/frases-breves/zoom-verificacion.json');fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({baselineScale:report.baseline,checks:report.checks.length,passed:true,published:false}));
 }finally{await browser.close();await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
