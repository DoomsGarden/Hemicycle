'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),C=require('../js/cosmetic-catalog.js');
test('all seven mats choose a centered-cover source suited to each half instead of changing their proportions',()=>{
 for(const item of C.collection('mat')){
  a.equal(C.matAsset(item.id,.72),item.portrait);a.equal(C.matAsset(item.id,.95),item.portrait);
  a.equal(C.matAsset(item.id,1.3),item.asset);a.equal(C.matAsset(item.id,4),item.asset);
  a.equal(C.matAsset(item.id,0),item.asset);a.equal(C.matAsset(item.id,NaN),item.asset);
  a.equal(C.selection({cosmetics:{mat:item.id}}).mat,item.id);
 }
 a.equal(C.collection('mat').length,7);a.equal(C.matAsset('unknown',.75),C.collection('mat')[0].portrait);
});
