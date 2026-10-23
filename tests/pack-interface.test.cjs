const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
function between(a,b){return html.slice(html.indexOf(a),html.indexOf(b,html.indexOf(a)));}
const c=vm.createContext({});vm.runInContext(between('function packCountdown(','function startTick('),c);
test('countdown uses the largest two adjacent units and changes cleanly at boundaries',()=>{
 for(const [ms,label] of [[7*864e5,'7d 0h'],[864e5,'1d 0h'],[86399000,'23h 59m'],[(22*3600+35*60+20)*1000,'22h 35m'],[3600000,'1h 0m'],[3599000,'59m 59s'],[60000,'1m 0s'],[59000,'59s'],[1,'1s'],[0,'0s'],[-10,'0s']])assert.equal(c.packCountdown(ms),label);
});
test('reward detail and zoom use only the pack receipt, ignoring collection filters and ownership',()=>{
 const ctx=vm.createContext({SO:{id:'a',pack:{cards:['a','a','b','invalid']}},BYID:{a:{},b:{}},colList:()=>{throw Error('must not use collection')},D:()=>{throw Error('must not use profile')}});
 vm.runInContext(between('function getSwipeDeckIds(){','function renderZoomOverlay(){'),ctx);
 assert.deepEqual(Array.from(ctx.getSwipeDeckIds()),['a','b']);ctx.SO.id='b';assert.deepEqual(Array.from(ctx.getSwipeDeckIds()),['a','b']);
});
test('collection navigation remains filter-aware outside a reward receipt',()=>{
 const ctx=vm.createContext({SO:{id:'b'},colList:()=>[{id:'a'},{id:'b'}]});vm.runInContext(between('function getSwipeDeckIds(){','function renderZoomOverlay(){'),ctx);assert.deepEqual(Array.from(ctx.getSwipeDeckIds()),['a','b']);
});
test('a free pack cannot be reclaimed while cooling down, and rewards are stored before presentation',()=>{
 let profile={fs:1000,album:[],lastDaily:0,lastWeekly:0},saves=0,goes=[];
 const ctx=vm.createContext({D:()=>profile,PACKS:[{k:'comun',p:400}],DAY:864e5,WEEK:7*864e5,Date:{now:()=>10*864e5},saveD:()=>saves++,packContents:()=>[{id:'a'},{id:'a'},{id:'b'}],go:(...args)=>{assert.equal(saves,1);assert.equal(profile.album.length,3);goes.push(args)},gameSound:()=>{}});
 vm.runInContext(between('function openPack(k,free){','SCREENS.sobre=function(){'),ctx);
 ctx.openPack('diario',true);ctx.openPack('diario',true);assert.equal(saves,1);assert.equal(goes.length,1);assert.equal(profile.fs,1000);assert.deepEqual(profile.album,['a','a','b']);assert.equal(goes[0][1].free,true);
});
test('pack art and styles referenced by the page are precached',()=>{
 const root=require('node:path').join(__dirname,'..'),sw=fs.readFileSync(root+'/sw.js','utf8');
 for(const k of ['diario','semanal','comun','raro','legendario','mitico']){assert.ok(fs.existsSync(root+'/assets/packs/'+k+'.svg'));assert.ok(sw.includes('./assets/packs/'+k+'.svg'));}
 assert.ok(sw.includes('css/packs.css?v=31.0.0.5-collection1'));
});
