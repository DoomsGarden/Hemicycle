const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('a rendering exception releases the online command lock and allows retry',async()=>{
 const nodes={combat:{hidden:true},'combat-message':{textContent:''},'combat-content':{replaceChildren(){}}};let controls,fail=false,posts=0;
 const context=vm.createContext({document:{getElementById:id=>nodes[id]},AbortSignal,crypto:require('node:crypto').webcrypto,setInterval:()=>1,clearInterval(){},fetch:async(url,options)=>({ok:true,json:async()=>{if(url.endsWith('catalog'))return {orators:[],actions:[]};if(options.method==='POST')posts++;return {revision:1,status:'active',serverNow:Date.now(),players:[],you:0};}})});
 vm.runInContext(fs.readFileSync('js/online-combat-ui.js','utf8'),context);
 const combat=context.HemicycleTestCombat.create({base:'https://example.invalid',account:()=>({user:{id:'one'},access_token:'test'}),renderBattle:(s,c)=>{controls=c;if(fail){fail=false;throw Error('interrupted selection');}}});
 await combat.open('one');fail=true;assert.equal(controls.send({type:'end'}),true);await new Promise(setImmediate);assert.match(nodes['combat-message'].textContent,/interrupted selection/);assert.equal(posts,0);
 assert.equal(controls.send({type:'end'}),true);await new Promise(setImmediate);assert.equal(posts,1);combat.close();
});
