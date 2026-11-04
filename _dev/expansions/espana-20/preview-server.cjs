'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),{compile,previewIndex,sourceCards}=require('./prepare.cjs');
const root=path.resolve(__dirname,'../../..');
function createServer(){
 const {files}=compile(),html=previewIndex(),sheets=new Set(sourceCards.map(c=>path.basename(c.art.sheet)));
 return http.createServer((req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('Content-Security-Policy',"connect-src 'self'; frame-ancestors 'none'");
  if(req.method!=='GET'){res.writeHead(405).end();return;}
  let url;try{url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  let buffer,type;
  if(url==='/'||url==='/index.html'){buffer=html;type='text/html; charset=utf-8';}
  else if(files[url.slice(1)]){buffer=files[url.slice(1)];type=url.endsWith('.js')?'application/javascript':'application/json';}
  else if(url.startsWith('/__reserve/')&&sheets.has(url.slice(11))){buffer=fs.readFileSync(path.join(root,'_dev/proposals/espana-1986-2026/art',url.slice(11)));type='image/png';}
  else{
   if(url.includes('..')||url.startsWith('/_')||url.includes('/.')||url==='/sw.js'){res.writeHead(404).end();return;}
   const target=path.resolve(root,'.'+url);if(!target.startsWith(root+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404).end();return;}
   buffer=fs.readFileSync(target);type=({'.js':'application/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2','.mp3':'audio/mpeg','.webm':'video/webm'})[path.extname(target)]||'application/octet-stream';
  }
  res.writeHead(200,{'Content-Type':type});res.end(buffer);
 });
}
module.exports={createServer};
if(require.main===module)createServer().listen(8096,'127.0.0.1',()=>console.log('Reserva interna: http://127.0.0.1:8096 · almacenamiento aislado, sin API remota ni service worker.'));
