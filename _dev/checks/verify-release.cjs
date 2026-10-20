const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'_dev/reports/v30.2.55');
fs.mkdirSync(out,{recursive:true});
const checkedFiles=['index.html','sw.js','css/interface.css','js/market-rules.js','js/market-ui.js','js/changelog.js','_dev/market/server.cjs','_dev/market/catalog.cjs'];
function hashes(){return Object.fromEntries(checkedFiles.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')]))}
const rounds=Number(process.env.VERIFY_ROUNDS||10),report={version:'v30.2.55',requestedRounds:rounds,started:new Date().toISOString(),sourceHashes:hashes(),rounds:[]};
function save(){fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,2)+'\n');}
function run(name,args,round){return new Promise((resolve,reject)=>{
 const started=Date.now(),file=path.join(out,String(round).padStart(2,'0')+'-'+name+'.log'),stream=fs.createWriteStream(file);
 const child=spawn(process.execPath,args,{cwd:root,env:{...process.env,HELP_ONLY:'',RANKED_ONLY:'',SMALL_ONLY:'',SKIP_NAV:''}});
 let text='';child.stdout.on('data',data=>{text+=data;stream.write(data)});child.stderr.on('data',data=>{text+=data;stream.write(data)});
 child.on('error',e=>{stream.end();reject(e)});child.on('close',code=>{
  stream.end();const result={check:name,passed:code===0,durationMs:Date.now()-started,log:path.relative(root,file)};
  if(name==='rules'){result.tests=Number(text.match(/tests (\d+)/)?.[1]);if(!result.tests||!/fail 0\b/.test(text)||!/skipped 0\b/.test(text))result.passed=false;}
  if(name==='battles'){const line=text.split('\n').find(line=>line.startsWith('{"completedMatches"'));if(line)Object.assign(result,JSON.parse(line));if(result.completedMatches!==8||result.immediate100Scenarios!==18)result.passed=false;}
  console.log('Pasada '+round+'/'+rounds+' · '+name+': '+(result.passed?'OK':'FALLO')+' ('+Math.round(result.durationMs/1000)+' s)');
  if(!result.passed)reject(Object.assign(new Error(name+' failed; see '+file),{result}));else resolve(result);
 });
});}
(async()=>{
 for(let round=1;round<=rounds;round++){
  const item={number:round,checks:[]};report.rounds.push(item);save();console.log('Comienza pasada '+round+'/'+rounds);
  const groups=[
   [['rules',['--test',...fs.readdirSync(path.join(root,'tests')).filter(n=>n.endsWith('.test.cjs')).map(n=>'tests/'+n)]],['market',['_dev/market/browser-check.cjs']],['extra-ui',['_dev/checks/extra-ui.cjs']]],
   [['battles',['_dev/checks/battle-browser.cjs']],['gold',['_dev/checks/gold-browser.cjs']]],
   [['catalog',['_dev/checks/catalog-browser.cjs']],['upgrade',['_dev/checks/pwa-upgrade.cjs']]]
  ];
  const results=await Promise.allSettled(groups.map(async group=>{for(const [name,args]of group){try{item.checks.push(await run(name,args,round));save();}catch(e){if(e.result)item.checks.push(e.result);save();throw e;}}}));
  const failed=results.find(r=>r.status==='rejected');if(failed)throw failed.reason;
  item.passed=item.checks.length===7&&item.checks.every(r=>r.passed);save();
 }
 if(JSON.stringify(hashes())!==JSON.stringify(report.sourceHashes))throw new Error('Application source changed during verification. Repeat the checks for the final source.');
 report.passed=report.rounds.length===rounds&&report.rounds.every(r=>r.passed);report.finished=new Date().toISOString();save();
 console.log('VERIFICACIÓN COMPLETADA: '+rounds+' pasadas, '+report.rounds.reduce((s,r)=>s+r.checks.find(c=>c.check==='rules').tests,0)+' pruebas automáticas, '+rounds*8+' partidas completas, '+rounds*18+' escenarios de 100 votos.');
})().catch(e=>{report.passed=false;report.error=e.message;save();console.error(e.message);process.exitCode=1;});
