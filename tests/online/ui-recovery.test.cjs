const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
test('a rendering exception releases the online command lock and allows retry',async()=>{
 const nodes={combat:{hidden:true},'combat-message':{textContent:''},'combat-content':{replaceChildren(){}}};let controls,fail=false,posts=0;
 const context=vm.createContext({document:{getElementById:id=>nodes[id]},AbortSignal,AbortController,DOMException,setTimeout,clearTimeout,crypto:require('node:crypto').webcrypto,setInterval:()=>1,clearInterval(){},fetch:async(url,options)=>({ok:true,json:async()=>{if(url.endsWith('catalog'))return {orators:[],actions:[]};if(options.method==='POST')posts++;return {revision:1,status:'active',serverNow:Date.now(),players:[],you:0};}})});
 vm.runInContext(fs.readFileSync('js/online-combat-ui.js','utf8'),context);
 const combat=context.HemicycleTestCombat.create({base:'https://example.invalid',account:()=>({user:{id:'one'},access_token:'test'}),renderBattle:(s,c)=>{controls=c;if(fail){fail=false;throw Error('interrupted selection');}}});
 await combat.open('one');fail=true;assert.equal(controls.send({type:'end'}),true);await new Promise(setImmediate);assert.match(nodes['combat-message'].textContent,/interrupted selection/);assert.equal(posts,0);
 assert.equal(controls.send({type:'end'}),true);await new Promise(setImmediate);assert.equal(posts,1);combat.close();
});

test('a slow background poll yields to a move and its late response cannot replace the move result',async()=>{
 const nodes={combat:{hidden:true},'combat-message':{textContent:''},'combat-content':{replaceChildren(){}}},intervals=[];let controls,releasePoll,pollSignal,reads=0,posts=0,lastRevision;
 const snapshot=revision=>({revision,status:'active',serverNow:Date.now(),players:[],you:0});
 const context=vm.createContext({document:{getElementById:id=>nodes[id]},AbortSignal,AbortController,DOMException,setTimeout,clearTimeout,crypto:require('node:crypto').webcrypto,setInterval:fn=>{intervals.push(fn);return intervals.length;},clearInterval(){},fetch:async(url,options)=>{
  if(url.endsWith('catalog'))return {ok:true,json:async()=>({orators:[],actions:[]})};
  if(options.method==='POST'){posts++;return {ok:true,json:async()=>snapshot(2)};}
  if(++reads===1)return {ok:true,json:async()=>snapshot(1)};
  pollSignal=options.signal;return new Promise(resolve=>{releasePoll=()=>resolve({ok:true,json:async()=>snapshot(99)});});
 }});
 vm.runInContext(fs.readFileSync('js/online-combat-ui.js','utf8'),context);const combat=context.HemicycleTestCombat.create({base:'https://example.invalid',account:()=>({user:{id:'one'},access_token:'test'}),renderBattle:(s,c)=>{controls=c;lastRevision=s.revision;}});await combat.open('one');intervals[0]();assert.ok(releasePoll);assert.equal(controls.send({type:'end'}),true);assert.equal(pollSignal.aborted,true);await new Promise(setImmediate);assert.equal(posts,1);assert.equal(lastRevision,2);releasePoll();await new Promise(setImmediate);assert.equal(lastRevision,2);assert.equal(nodes['combat-message'].textContent,'');combat.close();
});

test('a pending move is never preempted and a lost reply retries the identical operation ID',async()=>{
 const nodes={combat:{hidden:true},'combat-message':{textContent:''},'combat-content':{replaceChildren(){}}};let controls,releaseMove,firstSignal,posts=[],first=true;
 const snapshot={revision:1,status:'active',serverNow:Date.now(),players:[],you:0};
 const context=vm.createContext({document:{getElementById:id=>nodes[id]},AbortSignal,AbortController,DOMException,setTimeout,clearTimeout,crypto:require('node:crypto').webcrypto,setInterval:()=>1,clearInterval(){},fetch:async(url,options)=>{if(url.endsWith('catalog'))return {ok:true,json:async()=>({orators:[],actions:[]})};if(options.method!=='POST')return {ok:true,json:async()=>snapshot};posts.push(JSON.parse(options.body));if(first){first=false;firstSignal=options.signal;return new Promise(resolve=>{releaseMove=()=>resolve({ok:false,status:503,json:async()=>({error:'Respuesta perdida'})});});}return {ok:true,json:async()=>({...snapshot,revision:2})};}});
 vm.runInContext(fs.readFileSync('js/online-combat-ui.js','utf8'),context);const combat=context.HemicycleTestCombat.create({base:'https://example.invalid',account:()=>({user:{id:'one'},access_token:'test'}),renderBattle:(s,c)=>{controls=c;}});await combat.open('one');assert.equal(controls.send({type:'end'}),true);assert.equal(controls.send({type:'resign'}),false);assert.equal(firstSignal.aborted,false);releaseMove();await new Promise(setImmediate);combat.retry();await new Promise(setImmediate);assert.equal(posts.length,2);assert.deepEqual(posts[0],posts[1]);combat.close();
});
