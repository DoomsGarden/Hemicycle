'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const {create}=require('../_dev/online/economy-service.cjs');
function service(detail,status=400){return create({url:'https://example.supabase.co',key:'public',secret:'private',fetcher:async url=>url.endsWith('/auth/v1/user')?{ok:true,json:async()=>({id:'actor'})}:{ok:false,status,json:async()=>detail}});}
for(const code of ['PGRST202','42883','42P01'])test('missing onboarding SQL '+code+' is distinguished without exposing database details',async()=>{
 await assert.rejects(service({code,message:'secret database detail'})('Bearer user','/economy/initialize','POST',{identityId:'HC-11111111-1111-4111-8111-111111111111'}),e=>e.code==='ECONOMY_SCHEMA_REQUIRED'&&e.status===503&&e.message.includes('ACTIVACION-'+code)&&/Supabase/.test(e.message)&&!e.message.includes('secret'));
});
test('a missing cloud save sends a new account to activation rather than a migration error',async()=>{
 await assert.rejects(service({code:'P0001',message:'Activa primero la nube.'})('Bearer user','/offline/tickets','POST',{}),e=>e.code==='CLOUD_REQUIRED'&&e.status===409&&/Perfil → Nube/.test(e.message));
});
test('permission failures and unknown SQL failures remain distinct and do not expose arbitrary details',async()=>{
 await assert.rejects(service({code:'42501',message:'private role data'})('Bearer user','/offline/tickets','POST',{}),e=>e.code==='ECONOMY_PERMISSION_REQUIRED'&&!e.message.includes('private'));
 await assert.rejects(service({code:'23505',message:'private user data'})('Bearer user','/offline/tickets','POST',{}),e=>e.code==='ECONOMY_UNAVAILABLE'&&e.status===503&&!e.message.includes('private'));
});
function client(fetcher,profile){const c=vm.createContext({window:{},fetch:fetcher,AbortSignal,localStorage:{getItem:()=>null},crypto:require('node:crypto')});vm.runInContext(fs.readFileSync('js/economy-client.js','utf8'),c);return c.window.HemicycleEconomyClient.create({base:'http://local',account:()=>({userId:'actor',accessToken:'token'}),snapshot:()=>({identity:{id:'local'},profile}),reconcile(){}});}
test('one guest match requests migration and never initializes a replacement collection',async()=>{
 const paths=[],p={w:1,l:0,album:['one'],fs:1500,elo:0};const c=client(async path=>{paths.push(path);return {ok:true,json:async()=>({status:'pending'})};},p);
 await assert.rejects(c.initialize(),e=>e.code==='LEGACY_IMPORT_PENDING');assert.deepEqual(paths,['http://local/economy/import-request']);assert.equal(p.w,1);
});
test('a failed migration request preserves its diagnostic and is never marked as submitted',async()=>{
 const c=client(async()=>({ok:false,status:503,json:async()=>({error:'Falta función',code:'ECONOMY_SCHEMA_REQUIRED'})}),{w:1,l:0,album:['one'],fs:1500,elo:0});
 await assert.rejects(c.initialize(),e=>e.code==='ECONOMY_SCHEMA_REQUIRED'&&!e.definitive);
});
test('temporary saturation or network loss preserves the same pending operation until canonical recovery',async()=>{
 const store=new Map(),sent=[];let unavailable=true;
 const context=vm.createContext({window:{},AbortSignal,crypto:require('node:crypto'),localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},fetch:async(path,o)=>{sent.push(JSON.parse(o.body));return unavailable?{ok:false,status:503,json:async()=>({error:'Servicio ocupado',code:'ECONOMY_BUSY',requestId:'11111111-1111-4111-8111-111111111111'})}:{ok:true,json:async()=>({total:15})};}});
 vm.runInContext(fs.readFileSync('js/economy-client.js','utf8'),context);let reconciles=0;
 const c=context.window.HemicycleEconomyClient.create({base:'http://local',account:()=>({userId:'actor',accessToken:'secret'}),reconcile:async()=>reconciles++});
 await assert.rejects(c.execute({type:'machine',id:'replica',quantity:1}),e=>!e.definitive&&e.code==='ECONOMY_BUSY'&&e.message.includes('Consulta: 11111111'));
 assert.equal(store.size,1);unavailable=false;await c.resume();assert.deepEqual(sent[0],sent[1]);assert.equal(store.size,0);assert.equal(reconciles,1);
});
test('authentication outage and truncated RPC responses remain temporary',async()=>{
 for(const brokenAuth of [true,false]){const service=create({url:'https://example.supabase.co',key:'public',secret:'server',fetcher:async url=>url.endsWith('/auth/v1/user')?brokenAuth?{ok:false,status:503}:{ok:true,json:async()=>({id:'actor'})}:{ok:true,json:async()=>{throw SyntaxError('private response');}}});await assert.rejects(service('Bearer user','/offline/tickets','POST',{}),e=>e.status===503&&e.code==='ECONOMY_UNAVAILABLE'&&!e.message.includes('private'));}
});
