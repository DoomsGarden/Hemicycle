'use strict';
const fs=require('node:fs'),a=require('node:assert/strict'),{chromium}=require('playwright');
const C=require('../../js/orator-catalog.js'),legal=require('../../js/legal-documents.js');
const out='_dev/reports/v31.0.2.11-uniform-frames';fs.mkdirSync(out,{recursive:true});
const injection=`window.UniformReview={profile:D,save:saveD,menu:function(){clearAI();clearBattleClock();closeModal();G=null;go('menu');},screen:function(name){closeModal();go(name);},close:closeModal,league:function(){closeModal();lsSet(LS2,ligaNew(1));go('liga');},goals:function(){var d=D();d.objectives=HemicycleObjectives.sync(d);var p=d.objectives.periods.daily,qs=HemicycleObjectives.quests('daily',p.key,p.limits);p.totals[qs[0].metric]=qs[0].target;p.totals[qs[1].metric]=qs[1].target;p.claimed=[qs[0].id];saveD(d);openObjectives('challenges','daily');},achievements:function(){closeModal();openObjectives('achievements','General');},battle:function(){closeModal();autoBuild();newBattle('normal');clearAI();clearBattleClock();HemicycleCoinToss.cancel();G.n=5;BATTLE_LOG_OPEN=false;G.turns={p:3,e:3};G.side='p';G.field={p:[mk(BYID['hillary-clinton'],false,'p')],e:[mk(BYID['toni-canto'],false,'e')]};go('battle');clearAI();clearBattleClock();},popup:function(){G.sel=G.field.p[0].uid;G.move=null;G.support=false;go('battle');},result:function(){this.battle();G.over=true;G.done=true;G.sceneShown=true;G.votes={p:105,e:63};go('result',{who:'p',votes:105,enemyVotes:63,mode:'normal',fs:40,xp:40});},pack:function(){closeModal();go('sobre',{cards:CARDS.slice(0,5).map(c=>c.id),k:'comun',revealed:false});},modal:function(){showModal('Marco compartido','El marco conserva su grosor al cambiar de ventana.','Entendido',false,null);}};function boot(){`;
async function scan(page,id,view){
  const frames=await page.evaluate(()=>{
    const rows=[];
    function four(value){const x=value.split(' ').map(parseFloat);return x.length===1?[x[0],x[0],x[0],x[0]]:x.length===2?[x[0],x[1],x[0],x[1]]:x.length===3?[x[0],x[1],x[2],x[1]]:x;}
    for(const el of document.querySelectorAll('body *')){
      if(!el.getClientRects().length)continue;
      for(const pseudo of [null,'::before','::after']){
        const s=getComputedStyle(el,pseudo);if(!s.borderImageSource.includes('/assets/cosmetics/frames/')||s.visibility==='hidden'||s.display==='none'||pseudo&&s.content==='none')continue;
        const compact=el.matches('.home-action-stack,.home-options-button,.appbar .profile-button,.appbar .mini.news,.appbar [data-go=ayuda],.senate-home .online-entry');
        const expected=compact?10:20,widths=four(s.borderImageWidth),outsets=four(s.borderImageOutset);
        let w=el.offsetWidth,h=el.offsetHeight;
        if(pseudo){w=parseFloat(s.width);h=parseFloat(s.height);if(s.boxSizing!=='border-box'){w+=parseFloat(s.paddingLeft)+parseFloat(s.paddingRight)+parseFloat(s.borderLeftWidth)+parseFloat(s.borderRightWidth);h+=parseFloat(s.paddingTop)+parseFloat(s.paddingBottom)+parseFloat(s.borderTopWidth)+parseFloat(s.borderBottomWidth);}}
        const factor=Math.min(1,(w+outsets[1]+outsets[3])/(widths[1]+widths[3]),(h+outsets[0]+outsets[2])/(widths[0]+widths[2]));
        rows.push({tag:el.tagName,cls:String(el.className),id:el.id,pseudo,expected,widths,w,h,factor});
      }
    }return rows;
  });
  a.ok(frames.length>0||view==='combat-log',JSON.stringify({id,view}));
  for(const frame of frames){a.ok(frame.widths.every(w=>w===frame.expected),JSON.stringify({id,view,frame}));a.ok(frame.factor>=.999,JSON.stringify({id,view,frame,reason:'Browser would shrink border image'}));}
  return {view,count:frames.length,roles:[...new Set(frames.map(f=>f.cls+(f.pseudo||'')))],minFactor:frames.length?Math.min(...frames.map(f=>f.factor)):null};
}
async function toolbar(page,id){
  await page.locator('[data-act=home-tools]').click();
  const state=await page.locator('.home-action-stack').evaluate(e=>{
    const r=e.getBoundingClientRect(),s=getComputedStyle(e),before=getComputedStyle(e,'::before'),after=getComputedStyle(e,'::after');
    const buttons=[...e.querySelectorAll('button')].map(b=>{const q=b.getBoundingClientRect(),svg=b.querySelector('svg'),v=svg.getBoundingClientRect();return {label:b.getAttribute('aria-label'),x:(q.left+q.right)/2,y:q.top,bottom:q.bottom,right:q.right,height:q.height,frame:getComputedStyle(b).borderImageSource,opacity:getComputedStyle(b).opacity,svg:{w:v.width,h:v.height,opacity:getComputedStyle(svg).opacity},hit:document.elementFromPoint(q.x+q.width/2,q.y+q.height/2)?.closest('button')===b};});
    return {x:r.x,right:r.right,bottom:r.bottom,opacity:s.opacity,fillOpacity:before.opacity,frameOpacity:after.opacity,buttons};
  });
  a.equal(state.opacity,'1');a.equal(state.fillOpacity,'0.7');a.equal(state.frameOpacity,'1');a.equal(state.buttons.length,5);
  for(const b of state.buttons){a.equal(b.frame,'none',JSON.stringify({id,b}));a.equal(b.opacity,'1');a.equal(b.svg.opacity,'1');a.ok(b.svg.w>=14&&b.svg.h>=14&&b.height>=24&&b.bottom<=id.height&&b.hit,JSON.stringify({id,b}));a.ok(Math.abs(b.x-state.buttons[0].x)<.5,'Toolbar must remain one column');}
  for(let i=1;i<state.buttons.length;i++)a.ok(state.buttons[i].y>=state.buttons[i-1].bottom-.5,JSON.stringify({id,state}));
  a.ok(await page.locator('[data-act=play]').evaluate(e=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===e;}),'Jugar stays accessible');
  await page.locator('[data-act=home-tools]').click();return state;
}
(async()=>{
  const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  try{
    const c=await b.newContext({viewport:{width:393,height:851},serviceWorkers:'block',reducedMotion:'reduce'});
    await c.addInitScript(({legal,ids})=>{localStorage.setItem('hemicycle_legal_acceptance_v1',JSON.stringify({id:crypto.randomUUID(),version:legal.version,hash:legal.hash,accepted:true,acceptedAt:new Date().toISOString(),ageBand:'18+',syncedAccounts:[]}));localStorage.setItem('hemiciclo_v21',JSON.stringify({fs:3240,elo:3531,w:356,l:39,album:ids.concat(ids),actionAlbum:['replica','receso'],lastDaily:0,lastWeekly:0}));for(const k of ['hemiciclo_tutorial_v1','hemiciclo_menu_tutorial_v1'])localStorage.setItem(k,JSON.stringify({status:'completed'}));localStorage.setItem('hemiciclo_objectives_intro_v1','true');},{legal,ids:C.cards.map(c=>c.id)});
    await c.route('https://**/*',r=>r.abort());await c.route('**/Hemicycle/',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('index.html','utf8').replace('function boot(){',injection)}));
    const p=await c.newPage(),errors=[],results=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8055/Hemicycle/');await require('./launch-helper.cjs')(p);await p.waitForFunction(()=>HemicycleEntered);
    await p.evaluate(()=>Promise.all(HemicycleCosmetics.collection('menu').map(t=>HemicycleCosmeticUI.prepare('menu',t.id))));
    const sizes=process.env.HEMICYCLE_SHORT?[[568,320],[667,375]]:[[320,568],[393,851],[768,1024],[844,390]];
    for(const [width,height]of sizes)for(const skin of ['classic','senate','parchment','book','orbital','hologram'])for(const scale of [100,116]){
      const id={width,height,skin,scale};await p.setViewportSize({width,height});
      await p.evaluate(async({skin,scale})=>{UniformReview.menu();const d=UniformReview.profile();d.cosmetics={menu:skin,mat:'cats',back:'orbital',coin:'imperial'};UniformReview.save(d);HemicycleCosmeticUI.apply(d);HemicycleUIPreferences.apply(scale);HemicycleUIPreferences.applyIcons(116);await HemicycleUIPreferences.selectTypeface('orbital');},id);
      const checks=[await scan(p,id,'menu')],tools=await toolbar(p,id);
      const elo=await p.locator('[data-player-elo]').evaluate(e=>{const range=document.createRange();range.selectNodeContents(e);return range.getClientRects().length;});a.equal(elo,1,'Elo must stay on one line');
      if(width===393&&scale===116){await p.locator('[data-act=home-tools]').click();await p.screenshot({path:out+'/toolbar-'+skin+'.png'});await p.locator('[data-act=home-tools]').click();}
      await p.locator('[data-audio-open]').click();checks.push(await scan(p,id,'options'));a.ok(await p.locator('.audio-options').evaluate(e=>e.scrollHeight<=e.clientHeight+1));await p.locator('.audio-done').click();
      await p.locator('[data-act=profile]').click();checks.push(await scan(p,id,'profile'));await p.locator('[data-profile=edit]').click();checks.push(await scan(p,id,'editor'));
      const previews=await p.locator('.cosmetic-frame-preview,.cosmetic-mini-frame').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect(),i=e.querySelector('img').getBoundingClientRect();return {w:r.width,h:r.height,left:i.left-r.left,top:i.top-r.top,right:r.right-i.right,bottom:r.bottom-i.bottom};}));for(const v of previews)a.ok(v.left>=11&&v.right>=11&&v.top>=11&&v.bottom>=11,JSON.stringify({id,v}));
      if(width===393&&scale===116&&skin==='book')await p.screenshot({path:out+'/editor-book.png'});await p.locator('[data-profile=close]').click();
      await p.evaluate(()=>UniformReview.goals());checks.push(await scan(p,id,'challenges'));
      const rewards=await p.locator('.objective-row').evaluateAll(es=>es.map(e=>{const b=e.querySelector('.objective-reward'),r=b.getBoundingClientRect(),t=b.querySelector('.objective-dual')?.getBoundingClientRect(),bar=e.querySelector('progress').getBoundingClientRect();return {state:b.className,text:t?{l:t.left-r.left,r:r.right-t.right,t:t.top-r.top,b:r.bottom-t.bottom}:null,aligned:Math.abs(r.bottom-bar.bottom)};}));for(const r of rewards){a.ok(r.aligned<1,JSON.stringify({id,r}));if(r.text)a.ok(r.text.l>=11&&r.text.r>=11&&r.text.t>=11&&r.text.b>=11,JSON.stringify({id,r}));}
      a.equal(new Set(rewards.map(r=>r.state.match(/is-(claimed|ready|locked)/)?.[1])).size,3);
      if(width===393&&scale===116&&skin==='hologram'){await p.locator('.objective-modal').evaluate(e=>Promise.all(e.getAnimations().map(a=>a.finished)));await p.screenshot({path:out+'/challenges.png'});}await p.evaluate(()=>UniformReview.achievements());checks.push(await scan(p,id,'achievements'));await p.evaluate(()=>UniformReview.close());
      await p.evaluate(()=>UniformReview.screen('tienda'));checks.push(await scan(p,id,'store'));await p.evaluate(()=>UniformReview.league());checks.push(await scan(p,id,'league'));
      await p.evaluate(()=>UniformReview.result());checks.push(await scan(p,id,'result'));await p.evaluate(()=>UniformReview.pack());checks.push(await scan(p,id,'pack'));a.ok(await p.locator('.completion-actions').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight));
      await p.evaluate(()=>UniformReview.modal());checks.push(await scan(p,id,'modal'));await p.locator('[data-modal=cancel]').click();
      await p.evaluate(()=>{UniformReview.battle();UniformReview.popup();});await p.waitForSelector('#battleActionRoot:not([hidden])',{timeout:3000});checks.push(await scan(p,id,'combat-phrases'));a.match(await p.locator('.battle-phrase').first().evaluate(e=>getComputedStyle(e).fontFamily),/Senate Dialogue/);
      const pop=await p.locator('#battleActionRoot').boundingBox();a.ok(pop.x>=0&&pop.y>=0&&pop.x+pop.width<=width+1&&pop.y+pop.height<=height+1,JSON.stringify({id,pop}));await p.locator('[data-baction=cancel]').click();if(!process.env.HEMICYCLE_SHORT){await p.locator('[data-act=battle-log]').click();checks.push(await scan(p,id,'combat-log'));}
      results.push({id,tools,previews,rewards,checks});if(scale===116)console.log('Checked '+width+' '+skin);
    }
    a.deepEqual(errors,[]);fs.writeFileSync(out+(process.env.HEMICYCLE_SHORT?'/short.json':'/browser.json'),JSON.stringify({results,errors},null,2));console.log('PASS: '+results.length+' configurations, common panel frames, compact icon exceptions, single-column toolbar and isolated background opacity.');
  }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
