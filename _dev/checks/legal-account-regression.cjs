'use strict';
// Reuse the real-SDK account checks with an accepted adult policy in the test
// browser. Redirect their evidence to this change's report directory.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),crypto=require('node:crypto');
const mode=process.argv[2]||'recovery',name=mode==='profile'?'v31.0.2.5-auth-profile.cjs':'v31.0.2.5-password-recovery.cjs',file=path.join(__dirname,name),data=require('../../js/legal-documents.js');
const receipt={id:crypto.randomUUID(),version:data.version,hash:data.hash,accepted:true,acceptedAt:new Date().toISOString(),ageBand:'18+',syncedAccounts:[]};
let source=fs.readFileSync(file,'utf8').replaceAll('_dev/reports/v31.0.2.5-password-recovery','_dev/reports/legal-preview/accounts');
source=source.replace('await c.addInitScript(',"await c.addInitScript(()=>{localStorage.setItem('hemicycle_legal_acceptance_v1',"+JSON.stringify(JSON.stringify(receipt))+");});await c.addInitScript(");
const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(__dirname);m._compile(source,file);
