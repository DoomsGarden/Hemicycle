'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const files={'/':['preview.html','text/html'],'/actions.js':['actions.cjs','text/javascript'],'/preview.js':['preview.js','text/javascript'],'/preview.css':['preview.css','text/css']};
http.createServer((req,res)=>{const f=files[req.url];if(!f){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',f[1]+'; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(fs.readFileSync(path.join(__dirname,f[0])));}).listen(8031,'127.0.0.1',()=>console.log('Prototipo local: http://127.0.0.1:8031'));
