'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),{create}=require('../_dev/online/economy-service.cjs');
const id='11111111-1111-4111-8111-111111111111',actor='22222222-2222-4222-8222-222222222222';
const result={mode:'normal',win:false,fs:0,xp:50,votes:40,enemyVotes:100};
function fixture(ticket,unavailable=false){const reads=[],service=create({url:'https://example.supabase.co',key:'public',secret:'private',fetcher:async(url,options)=>{
 if(url.endsWith('/auth/v1/user'))return {ok:true,json:async()=>({id:actor})};
 const args=JSON.parse(options.body);reads.push(args);
 if(args.p_operation_id)return {ok:false,status:400,json:async()=>({code:'P0001',message:'Operación reutilizada con otros datos.'})};
 return unavailable?{ok:false,status:503,json:async()=>({code:'08006',message:'private details'})}:{ok:true,json:async()=>({ticket})};
 }});return {reads,call:()=>service('Bearer test','/offline/settle','POST',{operationId:id,ticketId:id,record:{commands:[]}})};}
test('receipt recovery is read-only and pinned to the authenticated actor and ticket',async()=>{
 const f=fixture({id,result});a.deepEqual(await f.call(),result);a.equal(f.reads.length,2);a.deepEqual(f.reads[1],{p_actor:actor,p_request:{type:'offline-settle',ticketId:id}});
});
test('missing, foreign or malformed receipts cannot confirm a result or grant resources',async()=>{
 for(const ticket of [null,{id,result:null},{id:actor,result},{id,result:[]},{id,result:{...result,fs:'100'}},{id,result:{...result,fs:-1}},{id,result:{...result,win:'true'}},{id,result:{...result,mode:'unknown'}}])await a.rejects(fixture(ticket).call(),e=>e.status===409&&e.code==='OFFLINE_RECEIPT_CONFLICT'&&e.message.includes('conserva'));
});
test('a failed receipt lookup remains retryable and is never marked as an unconfirmed conflict',async()=>{
 await a.rejects(fixture({id,result},true).call(),e=>e.status===503&&e.code==='ECONOMY_UNAVAILABLE'&&!e.message.includes('private'));
});
