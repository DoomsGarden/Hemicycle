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
for(const [message,code]of [
 ['Reglas no compatibles.','OFFLINE_SCHEMA_REQUIRED'],
 ['Operación reutilizada con otros datos.','ECONOMY_OPERATION_CONFLICT'],
 ['El ID vinculado no coincide.','ECONOMY_IDENTITY_CONFLICT'],
 ['Operación no válida.','ECONOMY_OPERATION_INVALID'],
 ['Cuenta no válida.','ECONOMY_ACCOUNT_REQUIRED']
])test('known SQL rejection '+code+' has a safe diagnosis without discarding a pending operation',async()=>{
 const path=code==='OFFLINE_SCHEMA_REQUIRED'?'/offline/tickets':'/economy';
 const body=path==='/economy'?{operationId:require('node:crypto').randomUUID(),command:{type:'format-upgrade'}}:{};
 await assert.rejects(service({code:'P0001',message})('Bearer user',path,'POST',body),e=>e.code===code&&e.status===503&&/conserva/.test(e.message)&&!/No se pudo contactar/.test(e.message));
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
test('a rejected financial operation keeps its exact request and ID for review, with no automatic retry under a new ID',async()=>{
 const store=new Map(),sent=[];let diagnostic='ECONOMY_OPERATION_CONFLICT',reconciles=0;
 const context=vm.createContext({window:{},AbortSignal,crypto:require('node:crypto'),localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},fetch:async(path,o)=>{sent.push(JSON.parse(o.body));return {ok:false,status:503,json:async()=>({error:'La operación se conserva para revisión.',code:diagnostic})};}});
 vm.runInContext(fs.readFileSync('js/economy-client.js','utf8'),context);
 const c=context.window.HemicycleEconomyClient.create({base:'http://local',account:()=>({userId:'actor',accessToken:'secret'}),reconcile:async()=>reconciles++});
 await assert.rejects(c.execute({type:'pack',kind:'comun',quantity:3}),e=>e.code===diagnostic&&!e.definitive);
 const pending=[...store.values()][0];diagnostic='ECONOMY_IDENTITY_CONFLICT';
 await assert.rejects(c.resume(),e=>e.code===diagnostic&&!e.definitive);
 assert.deepEqual(sent[0],sent[1]);assert.equal([...store.values()][0],pending);assert.equal(reconciles,0);
});
test('authentication outage and truncated RPC responses remain temporary',async()=>{
 for(const brokenAuth of [true,false]){const service=create({url:'https://example.supabase.co',key:'public',secret:'server',fetcher:async url=>url.endsWith('/auth/v1/user')?brokenAuth?{ok:false,status:503}:{ok:true,json:async()=>({id:'actor'})}:{ok:true,json:async()=>{throw SyntaxError('private response');}}});await assert.rejects(service('Bearer user','/offline/tickets','POST',{}),e=>e.status===503&&e.code==='ECONOMY_UNAVAILABLE'&&!e.message.includes('private'));}
});

test('automatic import succeeds without a manual pending state or a replacement starter collection',async()=>{
 const paths=[],p={w:1,l:0,album:['one'],fs:1530,elo:0};const c=client(async path=>{paths.push(path);return {ok:true,json:async()=>({status:'approved',alreadyApproved:false})};},p);
 assert.equal((await c.initialize()).status,'approved');assert.deepEqual(paths,['http://local/economy/import-request']);assert.equal(p.fs,1530);
});
test('an unknown import response never claims that migration is complete',async()=>{
 const c=client(async()=>({ok:true,json:async()=>({})}),{w:1,l:0,album:['one'],fs:1530,elo:0});await assert.rejects(c.initialize(),/confirmar la migración/);
});
test('switching accounts initializes a separate starter without sending the previous account inventory',async()=>{
 const requests=[],p={w:50,l:4,album:['private-card'],fs:876543,elo:4500},c=client(async(url,options)=>{requests.push({url,body:JSON.parse(options.body)});return {ok:true,json:async()=>({initialized:true})};},p);
 await c.initialize({fresh:true,identityId:'HC-11111111-1111-4111-8111-111111111111'});assert.deepEqual(requests,[{url:'http://local/economy/initialize',body:{identityId:'HC-11111111-1111-4111-8111-111111111111'}}]);
});
