const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {test}=require('node:test');
const Confetti=require('../js/card-confetti.js');
const root=path.resolve(__dirname,'..');

test('the shared Trump preset matches the supplied particle generator after calibration',()=>{
 const original=fs.readFileSync(path.join(root,'_dev/confetti/original.txt'),'utf8');
 const core=original.slice(original.indexOf('const GOLD='),original.indexOf('function rr(')).replace('spd=2','spd=1');
 const ref=vm.createContext({});
 vm.runInContext('const VW=420,VH=560,LOOP=6,MARG=34,TRAVEL=628;\n'+core+'\nbuild();',ref);
 const expected=JSON.parse(vm.runInContext('JSON.stringify(P)',ref)),actual=Confetti.create(Confetti.TRUMP);
 assert.equal(actual.particles.length,95);
 for(let i=0;i<95;i++){
  const a=actual.particles[i],b=expected[i];
  for(const [newKey,oldKey]of [['x0','x0'],['y0','y0'],['width','w'],['height','s'],['vy','vy'],['amp','amp'],['m','m'],['phase','ph'],['rot0','rot0'],['nr','nr'],['spin','sp'],['alpha','a'],['depth','depth']]){
   assert.ok(Math.abs(a[newKey]-b[oldKey])<1e-9,newKey+' particle '+i);
  }
  assert.deepEqual(a.colors,b.g);
 }
});

test('particles always descend; their wrap happens outside the visible card',()=>{
 const fx=Confetti.create(Confetti.TRUMP);
 for(let i=0;i<fx.particles.length;i++){
  let previous=fx.at(i,0);
  for(let time=10;time<=20000;time+=10){
   const current=fx.at(i,time);
   assert.ok(current.distance>previous.distance);
   if(current.cycle===previous.cycle)assert.ok(current.y>previous.y);
   previous=current;
  }
  const p=fx.particles[i],wrap=(fx.travel-p.y0)/p.vy*1000;
  const before=fx.at(i,wrap-0.001),after=fx.at(i,wrap+0.001);
  assert.ok(before.y>fx.settings.height);
  assert.ok(after.y<0);
  const radius=Math.hypot(p.width,p.height)/2;
  assert.ok(fx.margin>radius,'the entire particle exits before wrapping');
 }
});

test('a fixed seed reproduces the effect without using game randomness',()=>{
 const math=Object.create(Math);math.random=()=>{throw new Error('Must not consume game RNG')};
 const c=vm.createContext({Math:math});
 vm.runInContext(fs.readFileSync(path.join(root,'js/card-confetti.js'),'utf8'),c);
 const a=c.CardConfetti.create(),b=c.CardConfetti.create();
 for(const time of [0,2520,4939,4940,4941,6000,9880,1e9]){
  assert.equal(JSON.stringify(a.at(4,time)),JSON.stringify(b.at(4,time)));
 }
 const different=c.CardConfetti.create({seed:12345});
 assert.notEqual(JSON.stringify(a.at(4,0)),JSON.stringify(different.at(4,0)));
});

test('configuration is bounded, invalid time stays finite, and future cards can use another palette',()=>{
 const fx=Confetti.create({count:100000,size:100,speed:-1,drift:Infinity,loopSeconds:0,width:0,height:NaN});
 assert.equal(fx.settings.count,220);assert.equal(fx.settings.size,3);assert.ok(fx.settings.speed>0);
 for(const time of [NaN,Infinity,-Infinity,-100]){
  const p=fx.at(0,time);assert.ok(Number.isFinite(p.x));assert.ok(Number.isFinite(p.y));
 }
 const custom=Confetti.create({palette:[['#ffffff','#aa33ff','#220055']]});
 assert.deepEqual(custom.particles[0].colors,['#ffffff','#aa33ff','#220055']);
 assert.equal(Confetti.create({count:0}).at(0,0),null);
});

test('the renderer supports canvases without roundRect and restores the drawing context',()=>{
 let saves=0,restores=0,paths=0;
 const ctx={save(){saves++},restore(){restores++},translate(){},rotate(){},beginPath(){paths++},
  moveTo(){},arcTo(){},closePath(){},fill(){},fillRect(){},createLinearGradient(){return{addColorStop(){}}}};
 Confetti.create().draw(ctx,4941);
 assert.equal(saves,95);assert.equal(restores,95);assert.ok(paths>=95);
});
