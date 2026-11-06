'use strict';
const {test}=require('node:test'),a=require('node:assert/strict');
const {create}=require('../_dev/online/economy-service.cjs');
function fixture(history){
 const calls=[],context={accounts:{one:{payload:{profile:{}}}},market:{trades:[],packOpenings:[{id:'current',player:'one',packs:[['a']],opened:[true]},{id:'private',player:'two',packs:[['secret']],opened:[false]}]}};
 const service=create({url:'https://example.supabase.co',key:'public',secret:'server-only',fetcher:async(url,options)=>{
  calls.push({url,options});
  if(url.endsWith('/auth/v1/user'))return {ok:true,json:async()=>({id:'one'})};
  if(url.endsWith('/rpc/hemicycle_economy_context')){a.equal(JSON.parse(options.body).p_actor,'one');return {ok:true,json:async()=>context};}
  return history();
 }});
 return {calls,load:()=>service('Bearer test','/api/market/pack-openings','GET')};
}
test('pack history uses the authenticated owner and merges old paid receipts without exposing another account',async()=>{
 const f=fixture(()=>({ok:true,json:async()=>[
  {operation_id:'current',result:{presentationId:'current',packs:[['a']]}},
  {operation_id:'old',request:{type:'pack',kind:'raro'},result:{packs:[['b'],['c']]},created_at:'2026-11-05T12:00:00Z'},
  {operation_id:'not-a-pack',result:{fs:10000}}
 ]}));
 const records=await f.load();a.deepEqual(records.map(r=>r.id),['current','old']);a.equal(records[0].player,undefined);a.equal(records[1].legacy,true);a.equal(records[1].free,false);a.deepEqual(records[1].opened,[false,false]);a.equal(records[1].k,'raro');
 const query=f.calls.at(-1);a.equal(new URL(query.url).searchParams.get('user_id'),'eq.one');a.equal(query.options.headers.Authorization,'Bearer server-only');
});
test('new saved pack receipts remain recoverable during an unavailable or truncated historical query',async()=>{
 for(const failure of [()=>({ok:false,status:503}),()=>{throw Error('Connection interrupted');},()=>({ok:true,json:async()=>{throw SyntaxError('Truncated response');}})]){
  const records=await fixture(failure).load();a.deepEqual(records.map(r=>r.id),['current']);a.deepEqual(records[0].opened,[true]);
 }
});
