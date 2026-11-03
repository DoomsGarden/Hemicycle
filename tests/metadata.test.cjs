'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8'),json=f=>JSON.parse(read(f));
const html=read('index.html'),version=html.match(/var VERSION='([^']+)'/)[1],manifest=json('manifest.json'),assets=vm.runInNewContext(read('sw.js').match(/const ASSETS = (\[[^;]+\]);/)[1]);
test('installation and social metadata agree with the current app and canonical domain',()=>{
 for(const key of ['id','start_url','scope'])a.equal(manifest[key],'./');a.equal(manifest.orientation,'any');a.equal(manifest.lang,'es-ES');
 a.ok(html.includes('content="'+manifest.description+'"'));const structured=JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);a.equal(structured.softwareVersion,version.slice(1));a.equal(structured.description,manifest.description);a.equal(structured.name,manifest.name);a.equal(new URL(structured.url).hostname,read('CNAME').trim());a.ok(html.includes('rel="canonical" href="'+structured.url+'"'));
 for(const attr of ['og:image','twitter:image'])a.ok(html.includes(attr+'" content="'+structured.image+'"'));a.ok(fs.existsSync(path.join(root,new URL(structured.image).pathname)));
 const manifestUrl=html.match(/rel="manifest" href="([^"]+)"/)[1];a.ok(assets.includes('./'+manifestUrl));a.ok(manifestUrl.includes(version.slice(1)));
});
test('every static module and installation resource exists and is included in the worker',()=>{
 for(const m of html.matchAll(/(?:src|href)="((?:js|css)\/[^"<>]+)"/g)){a.ok(fs.existsSync(path.join(root,m[1].split('?')[0])),m[1]);a.ok(assets.includes('./'+m[1]),m[1]);}
 a.deepEqual(new Set(manifest.screenshots.map(s=>s.form_factor)),new Set(['narrow','wide']));
 for(const shot of manifest.screenshots){a.ok(shot.label);a.ok(assets.includes('./'+shot.src));a.ok(fs.existsSync(path.join(root,shot.src)));}
 for(const icon of manifest.icons){const bytes=fs.readFileSync(path.join(root,icon.src));a.equal(bytes.readUInt32BE(16)+'x'+bytes.readUInt32BE(20),icon.sizes);}
 a.ok(assets.includes('./Readme.html'));a.ok(!read('Readme.html').includes('location.replace'));
});
test('current exports, health and test results identify the current web version',()=>{
 a.ok(read('_dev/online/server.cjs').includes("version:'"+version+"'"));a.ok(read('pruebas/index.html').includes("version:'"+version+"'"));
 for(const file of ['_dev/marketing/captures.json','_dev/marketing/exports.json','_dev/marketing/install-assets.json','press/capturas-es.json'])a.equal(json(file).gameVersion,version,file);
 for(const [file,prefix] of [['_dev/marketing/install-assets.json',''],['press/capturas-es.json','press/']])for(const entry of json(file).files){const bytes=fs.readFileSync(path.join(root,prefix+entry.file));a.equal(bytes.length,entry.bytes);a.equal(crypto.createHash('sha256').update(bytes).digest('hex'),entry.sha256);}
});
