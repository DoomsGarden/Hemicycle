const assert=require('node:assert/strict'),fs=require('node:fs'),{chromium}=require('playwright'),{cards}=require('../market/catalog.cjs');
const base='http://127.0.0.1:8022/Hemicycle/',project='https://fdotndyenfreqbmzqdzd.supabase.co';
const out='/workspace/Hemicycle/_dev/previews/v31.0.0.1';fs.mkdirSync(out,{recursive:true});
const user={id:'11111111-1111-4111-8111-111111111111',aud:'authenticated',role:'authenticated',email:'player@example.test',app_metadata:{provider:'google',providers:['google']},user_metadata:{},created_at:new Date().toISOString()};
const player={fs:76543,elo:5588,w:12,l:7,album:cards.map(c=>c.id).concat(cards.slice(0,8).map(c=>c.id)),lastDaily:0,lastWeekly:0,dtWins:12,dtGoldUnlocked:true,dtGoldActive:true};
let saved={user_id:user.id,nickname:null,nickname_changed_at:null,next_nickname_change_at:null,can_rename:true},oauth=0,pkce=false;
function token(){const now=Math.floor(Date.now()/1000);return [Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub:user.id,role:'authenticated',aud:'authenticated',exp:now+3600,iat:now})).toString('base64url'),'mock-signature'].join('.');}
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});const errors=[];
try{
async function context(viewport={width:393,height:851},guides=true){const c=await browser.newContext({viewport,serviceWorkers:'block',reducedMotion:'reduce'});
await c.addInitScript(({p,guides})=>{if(!localStorage.getItem('hemiciclo_v21'))localStorage.setItem('hemiciclo_v21',JSON.stringify(p));if(guides)for(const k of ['hemiciclo_tutorial_v1','hemiciclo_menu_tutorial_v1'])localStorage.setItem(k,JSON.stringify({status:'completed'}));},{p:player,guides});
await c.route(project+'/**',async route=>{const req=route.request(),url=new URL(req.url()),headers={'access-control-allow-origin':'*','access-control-allow-headers':'apikey,authorization,content-type,x-client-info','access-control-allow-methods':'POST,GET,OPTIONS'};
if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});
if(url.pathname==='/auth/v1/authorize'){oauth++;pkce=url.searchParams.get('code_challenge_method')==='s256'&&!!url.searchParams.get('code_challenge');assert.equal(url.searchParams.get('provider'),'google');assert.equal(url.searchParams.get('redirect_to'),'https://doomsgarden.github.io/Hemicycle/');return route.fulfill({status:302,headers:{location:base+'?code=mock-google-code'}});}
let data,status=200;
if(url.pathname==='/auth/v1/token'){const body=req.postDataJSON();assert.ok(body.code_verifier,'PKCE verifier sent on callback');data={access_token:token(),token_type:'bearer',expires_in:3600,refresh_token:'mock-refresh-token',user};}
else if(url.pathname==='/auth/v1/user')data=user;
else if(url.pathname==='/auth/v1/logout')return route.fulfill({status:204,headers});
else if(url.pathname==='/rest/v1/rpc/hemicycle_get_profile')data=saved;
else if(url.pathname==='/rest/v1/rpc/hemicycle_set_nickname'){if(!saved.can_rename){status=400;data={code:'P0001',message:'Ya has utilizado el cambio gratuito.'};}else{let now=new Date(),next=new Date(now);next.setFullYear(next.getFullYear()+1);saved={...saved,nickname:req.postDataJSON().p_nickname,nickname_changed_at:now.toISOString(),next_nickname_change_at:next.toISOString(),can_rename:false};data=saved;}}
else return route.fulfill({status:404,headers,body:'{}'});
return route.fulfill({status,headers,contentType:'application/json',body:JSON.stringify(data)});
});return c;}
async function start(page){await page.locator('.launch-start').click();await page.waitForSelector('#launchScreen',{state:'detached'});}
const c=await context(),page=await c.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await start(page);await page.waitForSelector('.account-entry');assert.equal(await page.locator('#app').evaluate(e=>e.inert),true);assert.equal(await page.locator('#tutorialRoot .tutorial-coach').count(),0);
await page.keyboard.press('Escape');assert.equal(await page.locator('.account-entry').count(),1);await page.screenshot({path:out+'/acceso.png'});
const before=await page.evaluate(()=>localStorage.getItem('hemiciclo_v21'));
await page.locator('[data-profile=google]').click();await page.waitForURL(base+'**');await page.waitForSelector('.launch-start');await start(page);await page.waitForSelector('[data-act=profile]');assert.equal(await page.locator('.account-entry').count(),0);assert.ok(pkce);assert.equal(oauth,1);
await page.locator('[data-act=profile]').click();await page.waitForSelector('#profileNickname:not(:disabled)');assert.equal(await page.locator('.player-profile [role=dialog]').count(),0);assert.equal(await page.locator('.player-profile[role=dialog]').count(),1);assert.equal(await page.locator('.profile-stats>div').count(),12);assert.equal(await page.locator('#app').evaluate(e=>e.inert),true);
await page.locator('#profileNickname').fill('Señor Águila');await page.locator('#nicknameForm button').click();await page.waitForFunction(()=>document.querySelector('#profileTitle').textContent==='Señor Águila');assert.equal(await page.locator('#profileNickname').isDisabled(),true);assert.match(await page.locator('.profile-hint').innerText(),/Próximo cambio gratuito/);assert.equal(await page.evaluate(()=>localStorage.getItem('hemiciclo_v21')),before);await page.screenshot({path:out+'/perfil-393.png'});
await page.keyboard.press('Escape');assert.equal(await page.locator('.player-profile').count(),0);assert.equal(await page.evaluate(()=>document.activeElement.dataset.act),'profile');assert.equal(await page.locator('#app').evaluate(e=>e.inert),false);
await page.reload();await start(page);await page.waitForSelector('[data-act=profile]');assert.equal(await page.locator('.account-entry').count(),0,'saved session bypasses login');assert.equal(oauth,1);
await page.locator('[data-act=profile]').click();await page.waitForFunction(()=>document.querySelector('#profileTitle').textContent==='Señor Águila');
for(const viewport of [{width:320,height:480},{width:320,height:568},{width:393,height:350},{width:360,height:640},{width:393,height:851},{width:851,height:393},{width:1280,height:851}]){await page.setViewportSize(viewport);const geometry=await page.locator('.player-profile').evaluate(e=>{const b=e.getBoundingClientRect();return {top:b.top,bottom:b.bottom,height:innerHeight,scroll:e.scrollHeight,client:e.clientHeight,width:e.scrollWidth,viewport:innerWidth};});assert.ok(geometry.top>=0&&geometry.bottom<=geometry.height+1,JSON.stringify({viewport,geometry}));assert.ok(geometry.scroll<=geometry.client+1,JSON.stringify({viewport,geometry}));assert.ok(geometry.width<=geometry.viewport);await page.screenshot({path:out+'/perfil-'+viewport.width+'.png'});}
await page.locator('[data-profile=close]').click();await page.setViewportSize({width:393,height:851});await page.locator('#appbar [data-go=ayuda]').click();await page.locator('[data-act=menu-tutorial]').click();
for(let i=0;i<3;i++)await page.locator('.tutorial-focus').click();
assert.equal(await page.locator('#profileRoot').getAttribute('data-tutorial'),'true');const beforeNick=JSON.stringify(saved),beforeOAuth=oauth;
await page.evaluate(()=>document.querySelector('[data-profile=logout]').click());assert.equal(JSON.stringify(saved),beforeNick);assert.equal(oauth,beforeOAuth);assert.equal(await page.locator('.player-profile').count(),1);
await page.locator('#menuTutorialExit').click();assert.equal(await page.locator('.player-profile').count(),0);assert.equal(await page.locator('#app').evaluate(e=>e.inert),false);assert.equal(JSON.stringify(saved),beforeNick);
await page.locator('[data-act=profile]').click();await page.locator('[data-profile=logout]').click();await page.waitForSelector('[data-profile=google]');assert.equal(await page.evaluate(()=>localStorage.getItem('hemiciclo_v21')),before);await page.keyboard.press('Escape');await page.reload();await start(page);assert.equal(await page.locator('.account-entry').count(),1);await page.locator('[data-profile=guest]').click();assert.equal(await page.locator('.account-entry').count(),0);assert.equal(await page.evaluate(()=>localStorage.getItem('hemiciclo_v21')),before);
console.log('Real Supabase SDK with simulated endpoints: PKCE Google round-trip, persisted session, account nickname, annual lock, logout, guest, focus and preserved progress passed; profile fits seven viewports without scrolling');
await c.close();
// First-time guests still receive combat and menu onboarding after choosing guest, never before.
const fresh=await context({width:393,height:851},false),p=await fresh.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(base);await start(p);assert.equal(await p.locator('.tutorial-focus').count(),0);await p.locator('[data-profile=guest]').click();await p.waitForSelector('#tutorialRoot .tutorial-coach');for(let i=0;i<19;i++)await p.locator('.tutorial-focus').click();for(let i=0;i<24;i++)await p.locator('.tutorial-focus').click();assert.equal(await p.locator('.tutorial-focus').count(),0);assert.equal(await p.evaluate(()=>localStorage.getItem('hemiciclo_v21')),JSON.stringify(player));await fresh.close();
for(const mode of ['sdk-unavailable','profile-unavailable']){
 const edge=await context(),ep=await edge.newPage();ep.on('pageerror',e=>errors.push(e.message));
 if(mode==='sdk-unavailable')await edge.route('**/js/supabase-sdk.js*',r=>r.abort());
 else await edge.route(project+'/rest/v1/rpc/**',r=>r.fulfill({status:r.request().method()==='OPTIONS'?204:404,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'apikey,authorization,content-type,x-client-info','access-control-allow-methods':'POST,OPTIONS'},contentType:'application/json',body:JSON.stringify({code:'PGRST202',message:'missing RPC'})}));
 await ep.goto(base);await start(ep);
 if(mode==='profile-unavailable'){await ep.locator('[data-profile=google]').click();await ep.waitForURL(base+'**');await ep.waitForSelector('.launch-start');await start(ep);await ep.locator('[data-act=profile]').click();await ep.waitForFunction(()=>document.querySelector('.profile-message').textContent.includes('Falta activar'));assert.equal(await ep.locator('#profileNickname').isDisabled(),true);assert.equal(await ep.locator('.profile-stats>div').count(),12);}
 else{await ep.locator('[data-profile=guest]').click();await ep.locator('[data-act=profile]').click();assert.equal(await ep.locator('[data-profile=google]').isDisabled(),true);}
 assert.equal(await ep.evaluate(()=>localStorage.getItem('hemiciclo_v21')),JSON.stringify(player));await edge.close();
}
assert.deepEqual(errors,[]);console.log('INICIAR → account gate → guest → 19 combat steps → 24 menu steps; no save changes or browser errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
