const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),{loadBattle}=require('./helpers/battle.cjs');

for(const who of ['p','e','draw'])test('result presents both votes and static rewards without the duplicate panel: '+who,()=>{
 const c=loadBattle('ranked');c.G.votes={p:who==='e'?22:102,e:who==='p'?22:102};
 c.SO={who,mode:'ranked',fs:80,eloBefore:3506,eloAfter:3531,eloDelta:25,msg:'Repeated result message'};
 const before=JSON.stringify(c.D()),html=c.SCREENS.result();
 assert.match(html,new RegExp('result-'+(who==='p'?'victory':who==='e'?'defeat':'neutral')));
 assert.match(html,/Tú \d+, rival \d+/);assert.match(html,/class="result-versus"[^>]*>vs<\/span>/);
 assert.match(html,/Elo: 3506 → <b>3531<\/b>/);assert.match(html,/FS: <b>\+80<\/b>/);
 assert.doesNotMatch(html,/Repeated result message|panel win|panel lose|data-result-gain|\/ 100 votos/);
 assert.match(html,/result-own"><span>Tú<\/span><b>\d+<\/b>/);assert.match(html,/result-enemy"><span>Rival<\/span><b>\d+<\/b>/);assert.doesNotMatch(html,/<small>votos<\/small>/);assert.equal(JSON.stringify(c.D()),before);
});
test('verified receipt votes take precedence over stale game display',()=>{
 const c=loadBattle(),receipt={win:true,mode:'ranked',votes:105,enemyVotes:63,fs:88,eloBefore:10,eloAfter:30,eloDelta:20};
 const source=fs.readFileSync('index.html','utf8');vm.runInContext(source.slice(source.indexOf('function verifiedResult('),source.indexOf('async function finishDownloaded(')),c);c.G.votes={p:1,e:2};c.SO=c.verifiedResult(receipt,'ticket');
 assert.match(c.SCREENS.result(),/Tú 105, rival 63/);
 assert.match(c.SCREENS.result(),/Mayoría alcanzada/);
});
test('season closure retains standings, reward and division message',()=>{
 const c=loadBattle('liga'),lg=c.ligaLoad();lg.jor=12;c.lsSet(c.LS2,lg);c.G.votes={p:102,e:30};c.finish('p');
 const html=c.SCREENS.result();assert.match(html,/result-victory/);assert.match(html,/Temporada cerrada/);assert.match(html,/Terminas .*º de 30/);assert.match(html,/Recompensa de fin de temporada/);assert.match(html,/Cromo conseguido/);
});

function preferences(stored){const store=new Map(stored),listeners={},root={style:{setProperty(){},removeProperty(){}},dataset:{}};
 const context=vm.createContext({localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{documentElement:root,querySelectorAll:()=>[],addEventListener:(k,f)=>listeners[k]=f}});
 vm.runInContext(fs.readFileSync('js/ui-preferences.js','utf8'),context);return {api:context.HemicycleUIPreferences,store,listeners};}
test('risk warning defaults on, persists independently from text settings and can be reset in Options',()=>{
 const f=preferences();assert.equal(f.api.riskWarningEnabled,true);f.api.setRiskWarning(false);
 f.listeners.input({target:{matches:q=>q==='[data-ui-text-size]',value:116}});
 const restored=preferences(f.store);assert.equal(restored.api.riskWarningEnabled,false);assert.match(restored.api.riskControl(),/Reactivar aviso/);
 const button={disabled:false,textContent:''};restored.listeners.click({target:{closest:()=>button}});
 assert.equal(restored.api.riskWarningEnabled,true);assert.equal(button.disabled,true);assert.equal(preferences(restored.store).api.riskWarningEnabled,true);
});
test('invalid stored risk preferences keep the warning visible',()=>{for(const value of ['null','true','{}','"false"','bad-json'])assert.equal(preferences([['hemicycle_risk_warning_v1',value]]).api.riskWarningEnabled,true);});
test('independent typeface persists with reading sizes and tolerates unknown older preferences',async()=>{const f=preferences([['hemicycle_ui_v1',JSON.stringify({textSize:112,iconSize:108,typeface:'editorial'})]]);assert.equal(f.api.typeface,'editorial');await f.api.selectTypeface('orbital');f.listeners.input({target:{matches:q=>q==='[data-ui-text-size]',value:116}});const restored=preferences(f.store);assert.equal(restored.api.typeface,'orbital');assert.equal(restored.api.value,116);assert.match(restored.api.fontControl(),/data-ui-typeface="orbital" aria-pressed="true"/);assert.equal(preferences([['hemicycle_ui_v1','{"typeface":"missing"}']]).api.typeface,'auto');});
