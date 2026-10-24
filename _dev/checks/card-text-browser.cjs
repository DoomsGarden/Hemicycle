'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),{chromium}=require('playwright');
const dismiss=require('./launch-helper.cjs');
const {cards}=require('../market/catalog.cjs'),actions=require('../../js/action-cards.js').cards;
const output='_dev/reports/v31.0.1.4-audio1';
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
try{const page=await browser.newPage({serviceWorkers:'block',reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(({ids,actionIds})=>{localStorage.setItem('hemiciclo_v21',JSON.stringify({fs:8000,elo:2270,w:12,l:3,album:ids,actionAlbum:actionIds,dtGoldUnlocked:false,dtGoldActive:false}));for(const key of ['hemiciclo_tutorial_v1','hemiciclo_menu_tutorial_v1'])localStorage.setItem(key,JSON.stringify({status:'completed'}));localStorage.setItem('hemiciclo_objectives_intro_v1','true');},{ids:cards.map(c=>c.id),actionIds:actions.map(c=>c.id)});
await page.route('**/index.html',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('index.html','utf8').replace('function cromoHTML(c,o){','window.renderCardQA=(id)=>cromoHTML(BYID[id],{noCardAttr:true});function cromoHTML(c,o){')}));
await page.goto('http://127.0.0.1:8025/index.html');await dismiss(page);await page.evaluate(()=>document.fonts.ready);await page.locator('#tabbar [data-go=coleccion]').click();
const report={cards:cards.length+actions.length,cases:[],errors};
for(const viewport of [{width:320,height:568},{width:393,height:851},{width:851,height:393},{width:1280,height:800}]){
 await page.setViewportSize(viewport);
 const collectionWidth=await page.locator('#gridBox .cromo').first().evaluate(e=>e.getBoundingClientRect().width);
 for(const mode of ['collection','detail','zoom']){
 const result=await page.evaluate(({cards,actions,mode,collectionWidth})=>{
 let audit=document.getElementById('card-text-audit');if(audit)audit.remove();audit=document.createElement('div');audit.id='card-text-audit';audit.style='position:fixed;inset:0;z-index:99999;background:#090f1b;display:grid;place-items:center;overflow:hidden';document.body.append(audit);
 const failures=[];let count=0;
 for(const c of cards.concat(actions)){
  audit.innerHTML='<div class="'+(mode==='zoom'?'zoom-card-wrap':'audit-card')+'" style="'+(mode==='zoom'?'':'width:'+(mode==='detail'?(c.action?140:96):collectionWidth)+'px;')+'">'+renderCardQA(c.id)+'</div>';
  const card=audit.querySelector('.cromo'),bounds=card.getBoundingClientRect(),copy=audit.querySelector('.action-card-copy');
  for(const e of audit.querySelectorAll('.action-card-copy>*,.nm,.card-stat,.cost')){
   const rect=e.getBoundingClientRect(),limit=copy&&e.parentElement===copy?copy.getBoundingClientRect():bounds;
   const range=document.createRange();range.selectNodeContents(e);const text=range.getBoundingClientRect();
   if(rect.top<limit.top-1||rect.bottom>limit.bottom+1||rect.left<limit.left-1||rect.right>limit.right+1||e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+2||text.right>bounds.right-4||text.left<bounds.left+4)
    failures.push({id:c.id,element:e.className||e.tagName,text:e.textContent,bounds:bounds.toJSON(),rect:rect.toJSON(),limit:limit.toJSON(),scroll:[e.scrollWidth,e.scrollHeight],client:[e.clientWidth,e.clientHeight]});
  }
  if(bounds.top<0||bounds.bottom>innerHeight+1)failures.push({id:c.id,cardOutsideViewport:true});count++;
 }
 return {count,failures};
 },{cards,actions,mode,collectionWidth});report.cases.push({viewport,mode,...result});console.log(viewport.width+'x'+viewport.height,mode,result.count,'cards',result.failures.length,'failures');
 }
}
fs.writeFileSync(output+'/card-text.json',JSON.stringify(report,null,2)+'\n');
for(const id of ['replica','mocion-de-censura','alberto-nunez-feijoo']){await page.setViewportSize({width:393,height:851});await page.evaluate(id=>document.getElementById('card-text-audit').innerHTML='<div class="zoom-card-wrap">'+renderCardQA(id)+'</div>',id);await page.screenshot({path:output+'/card-'+id+'.png'});}
await page.evaluate(()=>document.getElementById('card-text-audit').remove());await page.locator('[data-act=collection-type]').click();await page.locator('#gridBox [data-card=replica]').click();await page.locator('[data-act=zoomcard]').click();assert.equal(await page.locator('#zoomRoot .action-card-copy>span').textContent(),actions.find(c=>c.id==='replica').text);await page.waitForTimeout(200);await page.screenshot({path:output+'/card-actual-zoom.png'});await page.locator('#zoomBg').click({position:{x:4,y:4}});assert.equal(await page.locator('#zoomRoot .cromo').count(),0);
assert.deepEqual(errors,[]);assert.equal(report.cases.reduce((n,c)=>n+c.failures.length,0),0,'Every printed label must fit without clipping');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
