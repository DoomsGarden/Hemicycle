'use strict';
// All requests are fulfilled from local files or synthetic auth endpoints.
// The browser origin is the destination domain; no live DNS change/access occurs.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),crypto=require('node:crypto');
const mode=process.argv[2]||'recovery',name=mode==='profile'?'v31.0.2.5-auth-profile.cjs':'v31.0.2.5-password-recovery.cjs',file=path.join(__dirname,name),data=require('../../js/legal-documents.js');
const receipt={id:crypto.randomUUID(),version:data.version,hash:data.hash,accepted:true,acceptedAt:new Date().toISOString(),ageBand:'18+',syncedAccounts:[]};
let source=fs.readFileSync(file,'utf8').replaceAll('http://127.0.0.1:8055/Hemicycle/','https://hemicycle.online/').replaceAll('https://doomsgarden.github.io/Hemicycle/','https://hemicycle.online/').replaceAll('_dev/reports/v31.0.2.5-password-recovery','_dev/reports/domain-migration/accounts');
const setup="await c.route('https://**/*',r=>r.abort());await c.route('https://hemicycle.online/**',r=>{var name=decodeURIComponent(new URL(r.request().url()).pathname).replace(/^\\//,'')||'index.html',root=domainPath.resolve('.'),target=domainPath.resolve(root,name);if(!target.startsWith(root+'/'))return r.fulfill({status:403,body:''});try{if(fs.statSync(target).isDirectory())target=domainPath.join(target,'index.html');var type={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.txt':'text/plain','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.mp3':'audio/mpeg'}[domainPath.extname(target)]||'application/octet-stream';return r.fulfill({contentType:type,body:fs.readFileSync(target)});}catch{return r.fulfill({status:404,body:''});}});await c.addInitScript(()=>{localStorage.setItem('hemicycle_legal_acceptance_v1',"+JSON.stringify(JSON.stringify(receipt))+");});await c.addInitScript(";
source=source.replace('await c.addInitScript(',setup);
// Recovery checker originally imports only fs; add path to its local module.
if(mode!=='profile')source=source.replace("const fs=require('node:fs'),", "const path=require('node:path'),fs=require('node:fs'),");
source=source.replaceAll('=>{localStorage.',"=>{if(location.protocol!=='https:')return;localStorage.").replace('({ids,saved,session,late})=>{',"({ids,saved,session,late})=>{if(location.protocol!=='https:')return;");
source="'use strict';const domainPath=require('node:path');\n"+source;
source=source.replace("page.on('pageerror',e=>errors.push(e.message));","page.on('pageerror',e=>{errors.push(e.message);console.error('Page error at',page.url(),e.stack);});");
const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(__dirname);m._compile(source,file);
