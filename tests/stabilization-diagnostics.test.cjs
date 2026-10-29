'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),{EventEmitter}=require('node:events'),vm=require('node:vm'),fs=require('node:fs');
test('route latency percentiles bound the observed ranks without retaining request identifiers',()=>{
 let now=0;const m=require('../_dev/online/observability.cjs').create({now:()=>now});
 const durations=[20,50,51,100,101,250,251,500,501,1000,1001,2500,2501,5000,5001,10000,10001,30000,30001,70000];
 for(const ms of durations){const res=new EventEmitter();res.statusCode=200;res.writableFinished=true;res.setHeader=()=>{};m.track({},res,'/combats/11111111-1111-4111-8111-111111111111',()=>{});now+=ms;res.emit('finish');res.emit('close');}
 const s=m.snapshot(),r=s.routes['/combats/:id'];a.equal(r.requests,20);a.equal(r.buckets.reduce((x,y)=>x+y,0),20);a.equal(r.p50UpperMs,1000);a.equal(r.p95UpperMs,65000);a.equal(r.maxMs,70000);a.equal(s.inFlight,0);a.equal(JSON.stringify(s).includes('11111111'),false);r.buckets[0]=999;a.notEqual(m.snapshot().routes['/combats/:id'].buckets[0],999);
});
test('local diagnostics distinguish interruption and failure, report slow work, and emit no requests or writes',()=>{
 let time=0;const timers=new Map();let id=0;const ctx=vm.createContext({window:{},performance:{now:()=>time},setTimeout:(f)=>{timers.set(++id,f);return id;},clearTimeout:i=>timers.delete(i)});vm.runInContext(fs.readFileSync('js/operation-status.js','utf8'),ctx);const api=ctx.window.HemicycleOperationStatus,node={isConnected:true,textContent:''};
 const op=api.start('Buscar rival',node);op.phase('Comprobando la cola…');timers.get(1)();a.match(node.textContent,/Puedes volver/);time=6000;op.finish('interrupted');op.finish(false);const retry=api.start('Buscar rival');time=6200;retry.finish(false);const r=api.snapshot().phases['Buscar rival'];a.equal(r.count,2);a.equal(r.errors,1);a.equal(r.interrupted,1);a.equal(r.totalMs,6200);a.equal(timers.size,0);a.match(api.snapshot().scope,/No se envían/);
});
