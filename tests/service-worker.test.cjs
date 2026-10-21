const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.resolve(__dirname,'../sw.js'),'utf8'),cacheName=source.match(/const CACHE = '([^']+)'/)[1];
function worker({saved,rootSaved,fetcher=async()=>new Response('online')}={}){
 const events={},timers=new Map(),puts=[],waiting=[];
 const cache={match:async key=>key==='./index.html'?saved:key==='./'?rootSaved:undefined,put:async(key,response)=>puts.push([key,await response.text()])};
 const context=vm.createContext({AbortController,Response,URL,Promise,Error,clearTimeout:id=>timers.delete(id),setTimeout:(fn,ms)=>{timers.set(1,{fn,ms});return 1;},fetch:fetcher,caches:{open:async name=>{assert.equal(name,cacheName);return cache;},match:async()=>{throw new Error('Navigation must not read another application cache');}},self:{location:{origin:'https://example.test'},addEventListener:(name,fn)=>events[name]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}}});
 vm.runInContext(source,context);
 function request(extra={}){let response;const e={request:{url:'https://example.test/Hemicycle/',method:'GET',mode:'navigate',...extra},respondWith:p=>response=p,waitUntil:p=>waiting.push(p)};events.fetch(e);return response;}
 return {request,timers,puts,waiting};
}
test('a successful navigation saves the new document and ties its cache write to the event',async()=>{
 const w=worker(),response=await w.request();assert.equal(await response.text(),'online');await Promise.all(w.waiting);
 assert.deepEqual(w.puts,[['./index.html','online']]);assert.equal(w.waiting.length,1);assert.equal(w.timers.size,0);
});
test('offline navigation recovers the current version document without consulting other caches',async()=>{
 const w=worker({saved:new Response('saved'),fetcher:async()=>{throw new TypeError('offline')}});
 assert.equal(await(await w.request()).text(),'saved');assert.equal(w.timers.size,0);
});
test('the root document fallback is awaited when index.html is missing',async()=>{
 const w=worker({rootSaved:new Response('root saved'),fetcher:async()=>{throw new TypeError('offline')}});
 assert.equal(await(await w.request()).text(),'root saved');
});
test('a network request that never responds is aborted after 3500 ms and uses the saved document',async()=>{
 let signal;const w=worker({saved:new Response('saved'),fetcher:async(req,options)=>{signal=options.signal;return new Promise(()=>{})}});
 const response=w.request();await new Promise(resolve=>setImmediate(resolve));
 const timer=w.timers.get(1);assert.equal(timer.ms,3500);timer.fn();
 assert.equal(await(await response).text(),'saved');assert.equal(signal.aborted,true);
});
test('an unavailable network response falls back to the saved page',async()=>{
 const w=worker({saved:new Response('saved'),fetcher:async()=>new Response('unavailable',{status:503})});
 assert.equal(await(await w.request()).text(),'saved');
});
test('first offline launch without a saved copy has a clear response',async()=>{
 const w=worker({fetcher:async()=>{throw new TypeError('offline')}}),response=await w.request();
 assert.equal(response.status,503);assert.match(await response.text(),/Conéctate una vez/);
});
test('private market requests and mutations bypass the service worker entirely',()=>{
 const w=worker();assert.equal(w.request({url:'https://example.test/api/market/me',mode:'cors'}),undefined);
 assert.equal(w.request({url:'https://example.test/api/market/session',method:'POST',mode:'cors'}),undefined);
});

test('external authentication and profile GET requests bypass the cache',()=>{
 const w=worker();
 for(const path of ['/auth/v1/user','/auth/v1/authorize?provider=google','/rest/v1/hemicycle_account_profiles'])assert.equal(w.request({url:'https://project.supabase.co'+path,mode:'cors'}),undefined);
});
