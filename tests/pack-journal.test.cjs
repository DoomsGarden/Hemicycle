'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const J=require('../js/pack-journal.js'),E=require('../_dev/online/economy.cjs');
const receipt={id:'paid-operation',k:'comun',packs:[['a','a','b'],['c','d','e'],['f','g','h']],opened:[false,false,false],free:false};
test('a reload and a replay preserve every pack and all revealed flags without adding another receipt',()=>{
 let saved=J.merge([],receipt);saved=J.seen(saved,receipt.id,0);saved=JSON.parse(JSON.stringify(saved));saved=J.merge(saved,receipt);
 a.equal(saved.length,1);a.deepEqual(saved[0].opened,[true,false,false]);a.equal(J.pending(saved).length,1);a.equal(J.presentation(saved[0]).packIndex,1);a.deepEqual(J.presentation(saved[0]).cards,['c','d','e']);
 for(const i of [1,2])saved=J.seen(saved,receipt.id,i);a.equal(J.pending(saved).length,0);a.deepEqual(J.presentation(saved[0],0).cards,['a','a','b']);a.equal(J.presentation(saved[0],0).revealed,true);
});
test('receipt contents cannot change on retry and stale acknowledgements cannot clear viewed packs',()=>{
 let saved=J.seen(J.merge([],receipt),receipt.id,1);saved=J.merge(saved,{...receipt,opened:[true,false,false]});a.deepEqual(saved[0].opened,[true,true,false]);a.throws(()=>J.merge(saved,{...receipt,packs:[['forged']]}),/no coincide/);
});
test('older receipts are reviewable history, not newly owed grants',()=>{const saved=J.merge([],{...receipt,legacy:true});a.equal(J.pending(saved).length,0);a.equal(J.presentation(saved[0]).quantity,3);});
test('authoritative purchase and event store all rewards once, while pack-seen changes only presentation',()=>{
 const now=Date.parse('2026-11-06T12:00:00Z'),actor=crypto.randomUUID(),other=crypto.randomUUID(),payload=E.starter('HC-'+crypto.randomUUID(),now,()=>.25);
 const state={accounts:{[actor]:{revision:0,payload},[other]:{revision:0,payload:structuredClone(payload)}},market:{players:[],listings:[],trades:[],quotes:[],receipts:[]}};
 const purchase=E.operate(state,actor,{type:'pack',kind:'comun',quantity:1,free:false},now,()=>.25),r=purchase.market.packOpenings[0];
 a.equal(purchase.updates[0].payload.profile.fs,payload.profile.fs-400);a.equal(purchase.updates[0].payload.profile.album.length+(purchase.updates[0].payload.profile.actionAlbum||[]).length,payload.profile.album.length+payload.profile.actionAlbum.length+5);a.equal(purchase.result.presentationId,r.id);
 const paid=structuredClone(state);paid.market=purchase.market;paid.accounts[actor].payload=purchase.updates[0].payload;const before=JSON.stringify(paid.accounts);
 const acknowledged=E.operate(paid,actor,{type:'pack-seen',receipts:[{id:r.id,opened:[true]}]},now,()=>.25);a.deepEqual(acknowledged.updates,[]);a.equal(JSON.stringify(paid.accounts),before);a.equal(acknowledged.market.packOpenings[0].opened[0],true);
 a.throws(()=>E.operate(paid,other,{type:'pack-seen',receipts:[{id:r.id,opened:[true]}]},now),/esta cuenta/);a.equal(E.view(paid,other,'/pack-openings').length,0);
 const event=E.operate(paid,actor,{type:'expansion-claim',grant:'comun'},now,()=>.25);a.equal(event.result.packs.length,3);a.equal(event.market.packOpenings.at(-1).packs.flat().length,15);a.equal(event.market.packOpenings.at(-1).from,'buzon');
});
test('reconciliation failure keeps the same operation and recoverable presentation before another attempt',async()=>{
 const saved=new Map(),requests=[],recorded=[];let fail=true;
 const context=vm.createContext({window:{},crypto,AbortSignal,localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)},fetch:async(u,o)=>{const body=JSON.parse(o.body);requests.push(body);return {ok:true,json:async()=>({packs:[['a','b']],kind:'comun'})};}});
 vm.runInContext(fs.readFileSync('js/economy-client.js','utf8'),context);
 const api=context.window.HemicycleEconomyClient.create({base:'https://test',account:()=>({userId:'one',accessToken:'test'}),onResult:(r,info)=>recorded.push([r.presentationId,info.operationId]),reconcile:async()=>{if(fail)throw Error('Network interrupted');}});
 await a.rejects(api.execute({type:'pack',kind:'comun',quantity:1}),e=>e.committed===true&&/Network interrupted/.test(e.message));a.ok(api.pending());a.equal(recorded.length,1);fail=false;await api.resume();a.equal(api.pending(),null);a.equal(requests[0].operationId,requests[1].operationId);a.equal(recorded[0][0],recorded[1][0]);
});
