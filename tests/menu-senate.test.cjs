'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function api(cards){const context=vm.createContext({window:{HemicycleCatalog:cards?{cards}:undefined,matchMedia:()=>({matches:false,addEventListener(){}}),addEventListener(){}},document:{addEventListener(){},documentElement:{}},MutationObserver:class{observe(){}},console});vm.runInContext(fs.readFileSync('js/menu-senate.js','utf8'),context);return context.window.HemicycleMenuSenate;}
test('the Senate cycles twelve speakers and all three phrases, with alternating entry sides',()=>{const scene=api();assert.equal(scene.ids.length,12);for(let turn=0;turn<36;turn++){const s=scene.stateAt(turn*12000+4500);assert.equal(s.id,scene.ids[turn%12]);assert.equal(s.quote,Math.floor(turn/12));assert.equal(s.side,turn%2);assert.equal(s.speaking,true);assert.equal(scene.stateAt(turn*12000+2000).speaking,false);assert.equal(scene.stateAt(turn*12000+9000).speaking,false);}});
test('the shared walking cycle alternates support and bent knees instead of repeating one leg',()=>{const scene=api(),cycle=2*Math.PI/8;for(let i=0;i<=48;i++){const time=i*cycle/48,[left,right]=scene.walkPose(time);assert.ok(Math.abs(left.hip+right.hip)<1e-10);assert.ok(left.knee>=0&&left.knee<=.72&&right.knee>=0&&right.knee<=.72);assert.ok(Math.min(left.knee,right.knee)<1e-10);}const first=scene.walkPose(cycle/4),second=scene.walkPose(3*cycle/4);assert.ok(first[0].knee>.7&&first[1].knee<.01);assert.ok(second[1].knee>.7&&second[0].knee<.01);});

test('each speaker leaves immediately after its own complete typed phrase, including the quotation marks',()=>{
 const cards=Array.from({length:12},(_,i)=>({id:api().ids[i],q:['Sí','Una frase de longitud media.','Esta frase es deliberadamente larga y no debe dejar al orador esperando después de terminar su intervención.']})),scene=api(cards);
 for(let turn=0;turn<36;turn++){
  const start=turn*12000,s=scene.stateAt(start),text='«'+cards[s.index].q[s.quote]+'»',duration=Math.min(3.1,Math.max(1.2,Array.from(text).length*.055));
  assert.ok(Math.abs(s.speechEnd-(3.12+duration))<1e-10);
  assert.ok(Math.abs(s.departAt-s.speechEnd-.18)<1e-10);
  assert.equal(scene.stateAt(start+(s.departAt-.01)*1000).speaking,true);
  assert.equal(scene.stateAt(start+(s.departAt+.01)*1000).speaking,false);
  assert.ok(Math.abs(s.exitAt-s.departAt-3.3)<1e-10);
  assert.ok(s.exitAt<12);
 }
});
