'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),Sync=require('../js/account-sync.js');
function fixture(){
 const timers=new Map(),calls=[],states=[];let n=0,time=100000,actor='one',online=true,visible=true,ready=true,pending=1,problem=null,phase='synced',gate=null,fs=0;
 const api={account:()=>actor?{userId:actor}:null,online:()=>online,visible:()=>visible,ready:()=>ready,hasPending:()=>pending>0,now:()=>time,
  setTimeout:(fn,ms)=>{timers.set(++n,{fn,ms});return n;},clearTimeout:id=>timers.delete(id),changed:s=>states.push({...s}),
  offline:{refresh:async()=>{calls.push('refresh:'+actor);},flush:async()=>{calls.push('flush:'+actor);if(pending){fs+=15;pending=0;}}},
  cloud:{state:()=>({phase,enabled:true,error:'Conflicto de guardado'}),reconnect:async()=>{calls.push('reconnect:'+actor);if(gate)await gate;},save:async()=>{calls.push('save:'+actor);}},
  economy:{resume:async()=>{calls.push('resume:'+actor);if(problem)throw problem;}}
 };
 const sync=Sync.create(api);
 return {sync,api,calls,timers,states,pending:()=>pending,fs:()=>fs,set:v=>{if('actor'in v)actor=v.actor;if('online'in v)online=v.online;if('visible'in v)visible=v.visible;if('ready'in v)ready=v.ready;if('pending'in v)pending=v.pending;if('problem'in v)problem=v.problem;if('phase'in v)phase=v.phase;if('gate'in v)gate=v.gate;if('time'in v)time=v.time;},tick:async()=>{const [id,item]=timers.entries().next().value;timers.delete(id);time+=item.ms;await item.fn();await sync.wake();return item.ms;}};
}
test('entry sync resumes pending operations before results and saves once across simultaneous triggers',async()=>{
 const f=fixture();let release;f.set({gate:new Promise(r=>release=r)});
 const first=f.sync.wake(),second=f.sync.wake();a.equal(first,second);a.equal(f.sync.state().running,true);
 await new Promise(r=>setImmediate(r));release();await first;
 a.deepEqual(f.calls,['refresh:one','reconnect:one','resume:one','flush:one','save:one']);a.equal(f.pending(),0);a.equal(f.fs(),15);a.equal(f.sync.state().error,'');a.equal(f.timers.size,1);f.sync.dispose();
});
test('transient failures back off, retain queued results and recover automatically without double rewards',async()=>{
 const f=fixture();f.set({problem:Object.assign(Error('Servicio ocupado'),{status:503,code:'ECONOMY_BUSY'})});
 await f.sync.wake();a.equal(f.pending(),1);a.equal(f.fs(),0);a.equal(f.sync.state().phase,'error');
 const calls=f.calls.length;for(let i=0;i<10;i++)await f.sync.wake();a.equal(f.calls.length,calls,'background notifications respect retry backoff');
 for(let i=0;i<6;i++){const ms=await f.tick();a.ok(ms>=15000&&ms<=240000);a.equal(f.pending(),1);}
 f.set({problem:null});await f.tick();a.equal(f.pending(),0);a.equal(f.fs(),15);await f.sync.wake(true);a.equal(f.fs(),15);f.sync.dispose();
});
test('permanent receipt or binding failures stop automatic retries and keep pending results intact',async()=>{
 for(const code of ['ECONOMY_OPERATION_CONFLICT','ECONOMY_IDENTITY_CONFLICT','OFFLINE_SCHEMA_REQUIRED']){
  const f=fixture();f.set({problem:Object.assign(Error('Revisión necesaria'),{code})});await f.sync.wake();
  const count=f.calls.length;a.equal(f.sync.state().blocked,true);a.equal(f.timers.size,0);await f.sync.wake();a.equal(f.calls.length,count);a.equal(f.pending(),1);a.equal(f.fs(),0);
  f.set({problem:null});await f.sync.wake(true);a.equal(f.pending(),0);a.equal(f.fs(),15);f.sync.dispose();
 }
});
test('switching accounts during a request prevents the old task from settling the new account',async()=>{
 const f=fixture();let release;f.set({gate:new Promise(r=>release=r)});const old=f.sync.wake();await new Promise(r=>setImmediate(r));
 f.set({actor:'two'});f.sync.wake();release();await old;a.ok(!f.calls.some(c=>c.startsWith('resume:')));a.equal(f.pending(),1);a.equal(f.fs(),0);
 f.set({gate:null});await f.tick();a.ok(f.calls.includes('resume:two'));a.equal(f.fs(),15);f.sync.dispose();
});
test('offline, hidden and active-game entry defer work and resume without a manual click',async()=>{
 for(const key of ['online','visible','ready']){const f=fixture();f.set({[key]:false});await f.sync.wake();a.equal(f.calls.length,0);a.equal(f.pending(),1);f.set({[key]:true});await f.tick();a.equal(f.pending(),0);f.sync.dispose();}
});
test('a conflicting cloud never saves or settles automatically over the other copy',async()=>{
 const f=fixture();f.set({phase:'conflict',pending:0});await f.sync.wake();a.equal(f.sync.state().blocked,true);a.deepEqual(f.calls,['refresh:one','reconnect:one']);a.equal(f.fs(),0);a.equal(f.timers.size,0);f.sync.dispose();
});
test('a committed pending receipt can reconcile its newer server revision before any preference upload',async()=>{
 const f=fixture();f.set({phase:'conflict'});f.api.economy.resume=async()=>{f.calls.push('receipt:one');f.set({phase:'synced'});};await f.sync.wake();a.equal(f.sync.state().error,'');a.equal(f.pending(),0);a.ok(f.calls.indexOf('receipt:one')<f.calls.indexOf('save:one'));f.sync.dispose();
});
test('healthy navigation avoids repeated network calls but newly pending results sync immediately',async()=>{
 const f=fixture();await f.sync.wake();const count=f.calls.length;for(let i=0;i<20;i++)await f.sync.wake();a.equal(f.calls.length,count);
 f.set({pending:1});await f.sync.wake();a.equal(f.pending(),0);a.equal(f.fs(),30);f.sync.dispose();a.equal(f.timers.size,0);
});
test('signing out clears an old diagnostic and never syncs without an account',async()=>{
 const f=fixture();f.set({problem:Object.assign(Error('Cuenta anterior'),{code:'ECONOMY_IDENTITY_CONFLICT'})});await f.sync.wake();const count=f.calls.length;
 f.set({actor:null});await f.sync.wake();a.equal(f.sync.state().error,'');a.equal(f.calls.length,count);a.equal(f.pending(),1);f.sync.dispose();
});
