'use strict';
function busy(){return Object.assign(Error('El servicio está ocupado. Tu operación se conserva para reintentar.'),{status:503,code:'ECONOMY_BUSY'});}
// Serialize the global-market revision on this instance; SQL remains the authority
// across instances. Queue length and wait are bounded, never hold a database lock.
function create({limit=64,waitMs=8000,onReject=()=>{}}={}){
 let active=false;const pending=[];
 function next(){if(active||!pending.length)return;const item=pending.shift();clearTimeout(item.timer);active=true;Promise.resolve().then(item.work).then(item.resolve,item.reject).finally(()=>{active=false;next();});}
 function run(work){if(active&&pending.length>=limit){onReject();return Promise.reject(busy());}return new Promise((resolve,reject)=>{const item={work,resolve,reject};item.timer=setTimeout(()=>{const i=pending.indexOf(item);if(i<0)return;pending.splice(i,1);onReject();reject(busy());},waitMs);pending.push(item);next();});}
 return {run};
}
module.exports={create,busy};
