'use strict';
const fs=require('node:fs'),a=require('node:assert/strict'),{chromium}=require('playwright');
const C=require('../../js/orator-catalog.js'),legal=require('../../js/legal-documents.js');
const out='_dev/reports/v31.0.2.11-home-edges';fs.mkdirSync(out,{recursive:true});
async function geometry(p){return p.locator('.home-action-stack').evaluate(e=>{
  const r=e.getBoundingClientRect(),s=getComputedStyle(e,'::after'),frame={left:r.left+parseFloat(s.left),right:r.right-parseFloat(s.right),top:r.top+parseFloat(s.top),bottom:r.bottom-parseFloat(s.bottom)},clips=[];
  for(let n=e.parentElement;n;n=n.parentElement){const style=getComputedStyle(n);if(['hidden','clip','scroll','auto'].includes(style.overflowX)||['hidden','clip','scroll','auto'].includes(style.overflowY)){const b=n.getBoundingClientRect();clips.push({cls:n.className,left:b.left+parseFloat(style.borderLeftWidth),right:b.right-parseFloat(style.borderRightWidth),top:b.top+parseFloat(style.borderTopWidth),bottom:b.bottom-parseFloat(style.borderBottomWidth),x:style.overflowX,y:style.overflowY});}}
  return {frame,clips,fillOpacity:getComputedStyle(e,'::before').opacity,frameOpacity:s.opacity,buttons:[...e.querySelectorAll('button')].filter(b=>getComputedStyle(b).visibility!=='hidden').map(b=>{const q=b.getBoundingClientRect();return {label:b.getAttribute('aria-label'),x:(q.left+q.right)/2,top:q.top,bottom:q.bottom,hit:document.elementFromPoint(q.x+q.width/2,q.y+q.height/2)?.closest('button')===b};})};
});}
function contained(r,id){for(const clip of r.clips){if(clip.x!=='visible')a.ok(r.frame.left>=clip.left-.5&&r.frame.right<=clip.right+.5,JSON.stringify({id,r,clip}));if(clip.y!=='visible')a.ok(r.frame.top>=clip.top-.5&&r.frame.bottom<=clip.bottom+.5,JSON.stringify({id,r,clip}));}a.equal(r.fillOpacity,'0.7');a.equal(r.frameOpacity,'1');for(const b of r.buttons)a.ok(b.hit&&Math.abs(b.x-r.buttons[0].x)<.5,JSON.stringify({id,b}));}
async function playStyle(p){return p.locator('.play-main,.play-toggle').evaluateAll(es=>es.map(e=>{const s=getComputedStyle(e);return {kind:e.className,outline:s.outlineStyle,outlineWidth:parseFloat(s.outlineWidth),borders:[s.borderTopWidth,s.borderRightWidth,s.borderBottomWidth,s.borderLeftWidth].map(parseFloat),shadow:s.boxShadow,focused:document.activeElement===e,visible:e.matches(':focus-visible')};}));}
function cleanPlay(rows,id){for(const row of rows){a.equal(row.outline,'none',JSON.stringify({id,row}));a.equal(row.outlineWidth,0);a.ok(row.borders.every(v=>v===0));a.equal(row.shadow,'none');}}
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
  const rows=[],errors=[];
  for(const [width,height]of [[320,568],[393,851],[768,1024],[844,390],[568,320]])for(const skin of ['classic','senate','parchment','book','orbital','hologram'])for(const input of ['mouse','touch','keyboard']){
    const id={width,height,skin,input},c=await b.newContext({viewport:{width,height},hasTouch:input==='touch',isMobile:input==='touch',deviceScaleFactor:input==='touch'?1.5:1,serviceWorkers:'block',reducedMotion:'reduce'});
    await c.addInitScript(({legal,ids,skin,input})=>{localStorage.setItem('hemicycle_legal_acceptance_v1',JSON.stringify({id:crypto.randomUUID(),version:legal.version,hash:legal.hash,accepted:true,acceptedAt:new Date().toISOString(),ageBand:'18+',syncedAccounts:[]}));localStorage.setItem('hemiciclo_v21',JSON.stringify({fs:3240,elo:3531,w:356,l:39,album:ids,lastDaily:0,lastWeekly:0,cosmetics:{menu:skin,mat:'cats',back:'orbital',coin:'imperial'}}));localStorage.setItem('hemicycle_ui_v1',JSON.stringify({textSize:input==='mouse'?100:116,iconSize:116,typeface:input==='touch'?'orbital':'auto'}));for(const k of ['hemiciclo_tutorial_v1','hemiciclo_menu_tutorial_v1'])localStorage.setItem(k,JSON.stringify({status:'completed'}));},{legal,ids:C.cards.map(c=>c.id),skin,input});
    await c.route('https://**/*',r=>r.abort());const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8055/Hemicycle/');
    const launch=p.locator('.launch-start');await launch.waitFor();if(input==='keyboard')await launch.press('Enter');else if(input==='touch')await launch.tap();else await launch.click();
    await p.waitForSelector('#launchScreen',{state:'detached'});if(await p.locator('[data-profile=guest]').count())await p.locator('[data-profile=guest]').click();await p.waitForFunction(()=>HemicycleEntered);
    const initial=await geometry(p),initialPlay=await playStyle(p);contained(initial,id);cleanPlay(initialPlay,id);
    await p.evaluate(async skin=>{await HemicycleCosmeticUI.prepare('menu',skin);await document.fonts.ready;},skin);
    const settled=await geometry(p);contained(settled,id);
    if(width===393&&input==='touch')await p.screenshot({path:out+'/startup-'+skin+'.png'});
    if(input==='keyboard'){
      a.equal(await p.evaluate(()=>document.activeElement.matches('.play-main')),true);await p.keyboard.press('Tab');a.equal(await p.evaluate(()=>document.activeElement.matches('.play-toggle')),true);
      cleanPlay(await playStyle(p),id);a.notEqual(await p.locator('.play-split').evaluate(e=>getComputedStyle(e).filter),'none');await p.keyboard.press('Enter');
    }else if(input==='touch')await p.locator('.play-toggle').tap();else await p.locator('.play-toggle').click();
    await p.waitForSelector('.play-options');cleanPlay(await playStyle(p),id);await p.keyboard.press('Escape');
    if(input==='touch')await p.locator('[data-act=home-tools]').tap();else await p.locator('[data-act=home-tools]').click();
    const open=await geometry(p);contained(open,id);a.equal(open.buttons.length,5);a.ok(await p.locator('[data-act=play]').evaluate(e=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('button')===e;}));
    if(width===393&&input==='touch')await p.screenshot({path:out+'/expanded-'+skin+'.png'});
    await p.locator('[data-act=home-tools]').click();await p.locator('#tabbar [data-go=coleccion]').click();await p.locator('#tabbar [data-go=menu]').click();const returned=await geometry(p);contained(returned,id);cleanPlay(await playStyle(p),id);
    rows.push({id,initial,initialPlay,settled,open,returned});await c.close();
    if(input==='keyboard')console.log('Checked '+width+' '+skin);
  }
  a.deepEqual(errors,[]);fs.writeFileSync(out+'/browser.json',JSON.stringify({rows,errors},null,2));console.log('PASS: '+rows.length+' cold starts, full frame containment, no extra Play outline, touch/mouse/keyboard focus and navigation.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
