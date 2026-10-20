const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const root='/workspace/Hemicycle',html=fs.readFileSync(root+'/index.html','utf8');
const instrumented=html.replace(/\}\)\(\);\s*<\/script>/,'window.__goldBonus={get game(){return G},get card(){return BYID["donald-trump"]},draw:draw,paint:paint,clearAI:clearAI};})();</script>');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  for(const leader of [false,true]){
   const context=await browser.newContext({viewport:{width:360,height:640},serviceWorkers:'block'});
   await context.addInitScript(()=>{
    localStorage.setItem('hemiciclo_v21',JSON.stringify({fs:1500,elo:300,w:0,l:0,album:['donald-trump','isabel-cela','adriana-lastra','pilar-alegria','gabriel-rufian'],lastDaily:0,lastWeekly:0,dtWins:10,dtGoldUnlocked:true,dtGoldActive:true}));Math.random=()=>.25;
   });
   await context.route('**/Hemicycle/',r=>r.fulfill({contentType:'text/html',body:instrumented}));
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:8022/Hemicycle/');
   const base=await page.evaluate(()=>window.__goldBonus.card);
   await page.locator('#tabbar [data-go="coleccion"]').click();
   await page.locator('#fq').fill('Donald Trump');await page.locator('#gridBox [data-card="donald-trump"]').click();
   for(const [skin,bonus]of [['normal',0],['golden',2]]){
    await page.locator('[data-act="dtskin"][data-val="'+skin+'"]').click();
    assert.deepEqual(await page.locator('.stat b').allTextContents(),[base.c,base.a+bonus,base.h+bonus,base.v].map(String));
    assert.equal(await page.locator('#detalleSwipe .gold-slot').count(),bonus?1:0);
   }
   await page.locator('#tabbar [data-go="menu"]').click();
   await page.locator('[data-act="play"]').click();
   await page.locator('[data-act="auto"]').click();
   await page.locator('[data-lead="'+(leader?'donald-trump':'isabel-cela')+'"]').click();
   await page.locator('[data-act="start"]').click();await page.locator('#coinRoot [data-act="begin"]').click();
   const expected={a:base.a+2+(leader?1:0),h:base.h+2+(leader?3:0)};
   await page.evaluate(()=>{const t=window.__goldBonus,g=t.game;t.clearAI();g.side='p';g.tdp.p=8;for(let i=0;i<3;i++)t.draw('p');t.paint()});
   const trump=await page.evaluate(()=>window.__goldBonus.game.hand.p.find(c=>c.k==='donald-trump'));
   assert.equal(trump.a,expected.a);assert.equal(trump.hm,expected.h);
   const selector='[data-buid="'+trump.uid+'"]';
   assert.match(await page.locator('.row '+selector+' .st').innerText(),new RegExp('Z'+expected.a+' · A'+expected.h+'/'+expected.h));
   await page.locator('.row '+selector).click();
   assert.equal(await page.locator('.tribuna '+selector+' .gold-slot').count(),1);
   assert.match(await page.locator('.tribuna '+selector+' .st').innerText(),new RegExp('Z'+expected.a+' · A'+expected.h+'/'+expected.h));
   assert.deepEqual(errors,[]);console.log('Golden bonus UI passed:',leader?'leader':'member',expected);
   await context.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
