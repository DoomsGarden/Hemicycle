'use strict';
const fs=require('node:fs'),vm=require('node:vm'),text=fs.readFileSync(require('../market/catalog.cjs').root+'/index.html','utf8'),box=vm.createContext({});vm.runInContext(text.match(/var LNAMES=\[[^\n]+/)[0],box);const names=JSON.parse(vm.runInContext('JSON.stringify(LNAMES)',box));
function create(div=3,temp=1,rng=Math.random){const teams=names.map((n,i)=>({n:i?n:'Tu grupo',pts:0,w:0,d:0,l:0,you:i===0,str:i?30+Math.floor(rng()*51):60}));return {div,jor:1,temp,teams};}
function advance(league,win,rng){const lg=structuredClone(league),me=lg.teams.find(t=>t.you);if(win){me.w++;me.pts+=3;}else me.l++;
 const others=lg.teams.filter(t=>!t.you);for(let i=others.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
 for(let i=0;i<others.length-1;i+=2){const [a,b]=[others[i],others[i+1]],diff=a.str+Math.floor(rng()*31)-b.str-Math.floor(rng()*31);if(diff>0){a.w++;a.pts+=3;b.l++;}else if(diff<0){b.w++;b.pts+=3;a.l++;}else{a.pts++;b.pts++;a.d++;b.d++;}}
 lg.jor++;if(lg.jor<=12)return {league:lg,reward:0};const pos=lg.teams.slice().sort((a,b)=>b.pts-a.pts||b.w-a.w).indexOf(me)+1,div=pos<=5?Math.max(1,lg.div-1):pos>25?Math.min(3,lg.div+1):lg.div;return {league:create(div,lg.temp+1,rng),reward:700+Math.floor(rng()*401),position:pos};}
module.exports={create,advance};
