'use strict';
// Capture original transcripts for review; this script assigns no quotations.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const R=path.resolve(__dirname,'..'),D=process.argv[2];if(!D)throw Error('Usage: node collect-speeches.cjs CACHE');
for(const f of ['vie-search','speeches'])fs.mkdirSync(path.join(D,f),{recursive:true});
const remaining=process.argv.includes('--remaining'),sourceLimit=remaining?20:3;
const cards=[...require(path.join(R,'censo.json')).cards,...require(path.join(R,'ampliacion-340/seleccion.json')).cards],reviewed=new Set(require(path.join(R,remaining?'cloture-frases/frases-validees.json':'frases-originales.json')).cards.map(c=>c.id)),targets=cards.filter(c=>!reviewed.has(c.id));
const dest=path.join(D,'speech-index.json'),prior=fs.existsSync(dest)?JSON.parse(fs.readFileSync(dest)):[];
function persist(out){const merged=new Map(prior.map(x=>[x.id,x]));for(const row of out){const sources=new Map((merged.get(row.id)?.sources||[]).map(s=>[s.url,s]));for(const s of row.sources)if(!s.error||!sources.has(s.url))sources.set(s.url,s);merged.set(row.id,{...row,sources:[...sources.values()]});}fs.writeFileSync(dest,JSON.stringify([...merged.values()],null,2)+'\n');}
const digest=raw=>crypto.createHash('sha256').update(raw).digest('hex');
(async()=>{const network=JSON.parse(fs.readFileSync('/etc/codex/network-policy.json'));const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox'],...(network.http_proxy?{proxy:{server:network.http_proxy}}:{})});
try{const ctx=await browser.newContext(),warm=await ctx.newPage();await warm.goto('https://www.vie-publique.fr/',{waitUntil:'domcontentloaded',timeout:45000});await warm.waitForTimeout(1000);await warm.close();let cursor=0;const out=[];
async function worker(){const page=await ctx.newPage();while(cursor<targets.length){const c=targets[cursor++],row={id:c.id,name:c.name,sources:[]};try{
const query=new URLSearchParams({search_api_fulltext_discours:'',field_intervenant_title:c.name.replaceAll('’',"'"),sort_by:'field_date_prononciation_discour','field_date_prononciation_discour_interval[min]':'1986-11-05','field_date_prononciation_discour_interval[max]':'2026-11-05'}),url='https://www.vie-publique.fr/discours/recherche?'+query,file=path.join(D,'vie-search',c.id+'.html');
let raw;if(fs.existsSync(file)){raw=fs.readFileSync(file);await page.setContent(raw.toString());}else{await page.goto(url,{waitUntil:'domcontentloaded',timeout:35000});await page.waitForTimeout(150);raw=Buffer.from(await page.content());fs.writeFileSync(file,raw);}row.search={url,sha256:digest(raw)};
const links=await page.locator('a[href*="/discours/"]').evaluateAll(as=>as.filter(a=>/\/discours\/\d+/.test(a.getAttribute('href'))).map(a=>({url:new URL(a.getAttribute('href'),'https://www.vie-publique.fr').href,title:a.textContent.trim().replace(/\s+/g,' ')})));
row.links=[...new Map(links.map(x=>[x.url,x])).values()];const chosen=[...row.links].sort((a,b)=>Number(/interview|entretien/i.test(a.title))-Number(/interview|entretien/i.test(b.title))).slice(0,sourceLimit);
for(const link of chosen){try{const key=link.url.match(/\/discours\/(\d+)/)[1]+'.html',p=path.join(D,'speeches',key);let data;if(fs.existsSync(p))data=fs.readFileSync(p);else{await page.goto(link.url,{waitUntil:'domcontentloaded',timeout:35000});await page.waitForTimeout(100);data=Buffer.from(await page.content());fs.writeFileSync(p,data);}row.sources.push({...link,cacheKey:key,sha256:digest(data)});}catch(e){row.sources.push({...link,error:e.message});}}
}catch(e){row.error=e.message;}out.push(row);persist(out);if(out.length%10===0)console.log(JSON.stringify({processed:out.length,total:targets.length,withSources:out.filter(x=>x.sources.length).length}));}await page.close();}
await Promise.all([worker(),worker(),worker()]);console.log('Complete '+out.length);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
