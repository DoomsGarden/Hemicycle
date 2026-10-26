'use strict';
const {AsyncLocalStorage}=require('node:async_hooks'),{randomUUID}=require('node:crypto');
// Bounded operational totals. Never record bodies, tokens, account IDs or raw URLs.
function create({logger=()=>{},now=()=>performance.now(),slowMs=1500}={}){
 const scope=new AsyncLocalStorage(),routes={},instanceId=randomUUID();let totals={requests:0,errors:0,clientErrors:0,aborted:0,slow:0,rpc:0,rpcErrors:0,conflicts:0,rejected:0,inFlight:0,peak:0,durationMs:0,rpcDurationMs:0};
 function emit(value){try{logger(JSON.stringify({event:'hemicycle.operations',instanceId,...value}));}catch{}}
 function route(path){if(/^\/combats\/[0-9a-f-]{36}$/i.test(path))return '/combats/:id';if(/^\/rooms\/[0-9a-f-]{36}$/i.test(path))return '/rooms/:id';if(/^\/api\/market\/trades\/[0-9a-f-]{36}\/(accept|cancel)$/.test(path))return '/api/market/trades/:id/action';if(/^\/api\/market\/listings\/[0-9a-f-]{36}\/cancel$/.test(path))return '/api/market/listings/:id/cancel';return /^\/(health|economy(?:\/initialize|\/import-request)?|offline\/(tickets|settle)|api\/market\/(status|me|listings|players|activity|trades|visibility|sales\/machine|quotes\/purchase|purchases)|ai|queue(?:\/cancel)?|players(?:\/presence)?|rooms(?:\/join|\/invite|\/accept)?)$/.test(path)?path:'/other';}
 function track(req,res,path,work){const state={requestId:randomUUID(),route:route(path),started:now(),conflicts:0};res.setHeader('X-Request-ID',state.requestId);totals.inFlight++;totals.peak=Math.max(totals.peak,totals.inFlight);let done=false;
  function finish(aborted){if(done)return;done=true;const durationMs=Math.round(now()-state.started),status=aborted?499:res.statusCode;const counts=routes[state.route]||(routes[state.route]={requests:0,errors:0,durationMs:0});counts.requests++;counts.durationMs+=durationMs;if(status>=400)counts.errors++;totals.inFlight--;totals.requests++;totals.durationMs+=durationMs;if(status>=500)totals.errors++;if(status>=400&&status<500)totals.clientErrors++;if(aborted)totals.aborted++;if(durationMs>=slowMs)totals.slow++;if(status>=400||aborted||durationMs>=slowMs||state.conflicts)emit({kind:'request',requestId:state.requestId,route:state.route,status,durationMs,conflicts:state.conflicts,...(state.code?{code:state.code}:{})});}
  res.once('finish',()=>finish(false));res.once('close',()=>finish(!res.writableFinished));return scope.run(state,work);
 }
 function conflict(){totals.conflicts++;const s=scope.getStore();if(s)s.conflicts++;}
 function code(value){const s=scope.getStore();if(s&&/^[A-Z_]{1,48}$/.test(value||''))s.code=value;}
 async function rpc(work){const at=now();totals.rpc++;try{const r=await work();if(!r.ok)totals.rpcErrors++;return r;}catch(e){totals.rpcErrors++;throw e;}finally{totals.rpcDurationMs+=Math.round(now()-at);}}
 function rejected(){totals.rejected++;}
 function snapshot(){return {...totals,routes:structuredClone(routes)};}
 return {requestId:()=>scope.getStore()?.requestId,track,conflict,code,rpc,rejected,snapshot,summary:()=>emit({kind:'summary',...snapshot()})};
}
module.exports={create};
