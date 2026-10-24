const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
function between(a,b){return html.slice(html.indexOf(a),html.indexOf(b,html.indexOf(a)));}
const c=vm.createContext({HemicycleObjectives:require('../js/objectives.js'),});vm.runInContext(between('function packCountdown(','function startTick('),c);
test('countdown uses the largest two adjacent units and changes cleanly at boundaries',()=>{
 for(const [ms,label] of [[7*864e5,'7d 0h'],[864e5,'1d 0h'],[86399000,'23h 59m'],[(22*3600+35*60+20)*1000,'22h 35m'],[3600000,'1h 0m'],[3599000,'59m 59s'],[60000,'1m 0s'],[59000,'59s'],[1,'1s'],[0,'0s'],[-10,'0s']])assert.equal(c.packCountdown(ms),label);
});
test('reward detail and zoom use only the pack receipt, ignoring collection filters and ownership',()=>{
 const ctx=vm.createContext({HemicycleObjectives:require('../js/objectives.js'),SO:{id:'a',pack:{cards:['a','a','b','invalid']}},BYID:{a:{},b:{}},colList:()=>{throw Error('must not use collection')},D:()=>{throw Error('must not use profile')}});
 vm.runInContext(between('function getSwipeDeckIds(){','function renderZoomOverlay(){'),ctx);
 assert.deepEqual(Array.from(ctx.getSwipeDeckIds()),['a','b']);ctx.SO.id='b';assert.deepEqual(Array.from(ctx.getSwipeDeckIds()),['a','b']);
});
test('collection navigation remains filter-aware outside a reward receipt',()=>{
 const ctx=vm.createContext({HemicycleObjectives:require('../js/objectives.js'),SO:{id:'b'},colList:()=>[{id:'a'},{id:'b'}]});vm.runInContext(between('function getSwipeDeckIds(){','function renderZoomOverlay(){'),ctx);assert.deepEqual(Array.from(ctx.getSwipeDeckIds()),['a','b']);
});
test('a free pack cannot be reclaimed while cooling down, and rewards are stored before presentation',()=>{
 let profile={fs:1000,album:[],lastDaily:0,lastWeekly:0},saves=0,goes=[];
 const ctx=vm.createContext({HemicycleObjectives:require('../js/objectives.js'),D:()=>profile,PACKS:[{k:'comun',p:400}],DAY:864e5,WEEK:7*864e5,Date:{now:()=>10*864e5},LS:'profile',CARDS:[],HemicyclePacks:require('../js/pack-presentation.js'),atomicLocal:values=>{saves++;profile=values.profile;},packContents:()=>[{id:'a'},{id:'a'},{id:'b'}],go:(...args)=>{assert.equal(saves,1);assert.equal(profile.album.length,3);goes.push(args)},gameSound:()=>{}});
 vm.runInContext(between('function openPack(k,free,count){','SCREENS.sobre=function(){'),ctx);
 ctx.openPack('diario',true);ctx.openPack('diario',true);assert.equal(saves,1);assert.equal(goes.length,1);assert.equal(profile.fs,1000);assert.deepEqual(Array.from(profile.album),['a','a','b']);assert.equal(goes[0][1].free,true);
});
test('pack art and styles referenced by the page are precached',()=>{
 const root=require('node:path').join(__dirname,'..'),sw=fs.readFileSync(root+'/sw.js','utf8');
 for(const k of ['diario','semanal','comun','raro','legendario','mitico']){assert.ok(fs.existsSync(root+'/assets/packs/'+k+'.svg'));assert.ok(sw.includes('./assets/packs/'+k+'.svg'));}
 const style=html.match(/href="(css\/packs\.css\?[^\"]+)"/)[1];assert.ok(sw.includes(style));
});
function revealFixture(reduced){
 const events=[],timers=[],buttons=[{disabled:false},{disabled:false}],receipt={cards:['a','a','b']};
 const ctx=vm.createContext({HemicycleObjectives:require('../js/objectives.js'),SCREEN:'sobre',SO:receipt,gameSound:n=>events.push(n),paint:()=>events.push('paint'),window:{matchMedia:()=>({matches:reduced})},setTimeout:fn=>timers.push(fn),document:{querySelector:s=>s==='.pack-opening'?{classList:{add:()=>{}},querySelectorAll:()=>buttons}:{focus:()=>events.push('focus')}}});
 vm.runInContext(between('function revealPack(done){','SCREENS.sobre=function(){'),ctx);return {ctx,events,timers,buttons,receipt};
}
test('reduced motion reveals once, sounds once and focuses the first reward',()=>{
 const {ctx,events,receipt,timers}=revealFixture(true);assert.equal(ctx.revealPack(),true);assert.equal(receipt.revealed,true);assert.deepEqual(events,['pack','paint','focus']);assert.equal(timers.length,0);assert.equal(ctx.revealPack(),false);assert.deepEqual(events,['pack','paint','focus']);
});
test('animated reveal rejects double activation while pending and finishes once',()=>{
 const {ctx,events,receipt,timers,buttons}=revealFixture(false);assert.equal(ctx.revealPack(),true);assert.equal(receipt.opening,true);assert.equal(ctx.revealPack(),false);assert.ok(buttons.every(b=>b.disabled));assert.equal(timers.length,1);assert.deepEqual(events,['pack']);timers[0]();assert.equal(receipt.revealed,true);assert.equal(receipt.opening,false);assert.deepEqual(events,['pack','paint','focus']);
});
test('an old reveal callback cannot repaint a different receipt or another screen',()=>{
 for(const leave of [true,false]){const {ctx,events,receipt,timers}=revealFixture(false);ctx.revealPack();ctx.SCREEN=leave?'tienda':'sobre';ctx.SO={cards:['c'],revealed:false};timers[0]();assert.equal(receipt.revealed,true);assert.equal(ctx.SO.revealed,false);assert.deepEqual(events,['pack']);}
});
