'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function createServer(config={}){
 const url=config.url||process.env.SUPABASE_URL,key=config.key||process.env.SUPABASE_PUBLISHABLE_KEY;
 const origins=(config.origins||process.env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean),fetcher=config.fetch||fetch;
 const serviceOrigin=config.serviceOrigin||process.env.RENDER_EXTERNAL_URL;
 if(serviceOrigin&&/^https:\/\/[a-z0-9-]+\.onrender\.com$/.test(serviceOrigin))origins.push(serviceOrigin);
 const secret=config.secret||process.env.SUPABASE_SERVICE_ROLE_KEY;
 const combat=require('./combat-service.cjs').create({url,key,secret,fetcher});
 const configured=!!(url&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)&&key&&origins.length&&!origins.includes('*'));
 return http.createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Type','application/json; charset=utf-8');
  const pathname=new URL(req.url,'http://localhost').pathname;
  const reply=(status,value)=>{res.writeHead(status);res.end(JSON.stringify(value));};
  if(pathname==='/health'&&req.method==='GET')return reply(200,{service:'hemicycle-private-rooms',configured,combatEnabled:!!secret});
  if(req.method==='GET'&&pathname==='/rooms-test'){res.writeHead(308,{Location:'/rooms-test/'+new URL(req.url,'http://localhost').search});res.end();return;}
  const testFiles={'/rooms-test/':['lobby.html','text/html; charset=utf-8'],'/rooms-test/client.js':['lobby.js','text/javascript; charset=utf-8'],'/rooms-test/style.css':['lobby.css','text/css; charset=utf-8'],'/rooms-test/combat.js':['../../js/online-combat-ui.js','text/javascript; charset=utf-8'],'/rooms-test/sdk.js':['../../js/supabase-sdk.js','text/javascript; charset=utf-8']};
  if(req.method==='GET'&&testFiles[pathname]){const [file,type]=testFiles[pathname];res.setHeader('Content-Type',type);if(type.startsWith('text/html'))res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");res.writeHead(200);res.end(fs.readFileSync(path.join(__dirname,file)));return;}
  const portrait=pathname.match(/^\/rooms-test\/portraits\/([a-z0-9-]+)\.webp$/);
  if(req.method==='GET'&&portrait&&require('./combat.cjs').catalog[portrait[1]]){res.setHeader('Content-Type','image/webp');res.writeHead(200);res.end(fs.readFileSync(path.join(__dirname,'../../cards',portrait[1]+'.webp')));return;}
  if(req.method==='GET'&&pathname==='/rooms-test/catalog')return reply(200,{orators:require('./combat.cjs').cards,actions:require('./actions.cjs').cards});
  if(req.method==='GET'&&pathname==='/rooms-test/config')return reply(configured?200:503,configured?{url,publishableKey:key}:{error:'Servicio pendiente de configurar.'});
  const origin=req.headers.origin;if(origin&&!origins.includes(origin))return reply(403,{error:'Origen no permitido.'});
  if(origin){res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
  if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Headers','Authorization,Content-Type');res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');return reply(204,{});}
  if(!configured)return reply(503,{error:'Servicio de pruebas pendiente de configurar.'});
  const auth=req.headers.authorization;if(!auth||!/^Bearer [A-Za-z0-9._-]{1,8192}$/.test(auth))return reply(401,{error:'Inicia sesión.'});
  try{
   let body={};if(req.method==='POST'){
    if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return reply(415,{error:'Envía JSON.'});
    let size=0,chunks=[];for await(const chunk of req){size+=chunk.length;if(size>2048){reply(413,{error:'Solicitud demasiado grande.'});req.resume();return;}chunks.push(chunk);}
    try{body=JSON.parse(Buffer.concat(chunks).toString());}catch{return reply(400,{error:'JSON no válido.'});}
    if(!body||typeof body!=='object'||Array.isArray(body))return reply(400,{error:'Solicitud no válida.'});
   }
   const combatPath=pathname.match(/^\/combats\/([0-9a-f-]{36})$/i);
   if(combatPath&&uuid.test(combatPath[1])&&(req.method==='GET'||req.method==='POST')){
    if(req.method==='POST'&&(!uuid.test(body.operationId||'')||!body.command||typeof body.command!=='object'||Array.isArray(body.command)))return reply(400,{error:'Acción de combate no válida.'});
    try{return reply(200,await combat(auth,combatPath[1],req.method==='POST'?body.command:null,req.method==='POST'?body.operationId:null));}catch(e){return reply(e.status||409,{error:e.message});}
   }
   let method,args;
   if(req.method==='POST'&&pathname==='/queue'){if(!['normal','rapida','ranked'].includes(body.mode))return reply(400,{error:'Modo no válido.'});method='hemicycle_test_matchmake';args={p_mode:body.mode};}
   else if(req.method==='POST'&&pathname==='/queue/cancel'){method='hemicycle_test_queue_cancel';args={};}
   else
   if(req.method==='POST'&&pathname==='/rooms'){if(!uuid.test(body.operationId||''))return reply(400,{error:'Operación no válida.'});if(body.mode){if(!['normal','rapida'].includes(body.mode))return reply(400,{error:'Clasificatoria requiere cola.'});method='hemicycle_test_room_mode';args={p_request_id:body.operationId,p_mode:body.mode,p_player_id:null};}else{method='hemicycle_room_create';args={p_request_id:body.operationId};}}
   else if(req.method==='POST'&&pathname==='/rooms/join'){if(typeof body.code!=='string'||!(/^[0-9a-f]{12}$/i).test(body.code))return reply(400,{error:'Código no válido.'});method='hemicycle_room_join';args={p_code:body.code.toUpperCase()};}
   else if(req.method==='GET'&&pathname==='/players'){method='hemicycle_test_directory';args={};}
   else if(req.method==='POST'&&pathname==='/players/presence'){if(typeof body.visible!=='boolean'||typeof body.online!=='boolean')return reply(400,{error:'Estado no válido.'});method='hemicycle_test_presence';args={p_visible:body.visible,p_online:body.online};}
   else if(req.method==='POST'&&pathname==='/rooms/invite'){if(!uuid.test(body.playerId||'')||!uuid.test(body.operationId||''))return reply(400,{error:'Invitación no válida.'});if(body.mode){if(!['normal','rapida'].includes(body.mode))return reply(400,{error:'Clasificatoria requiere cola.'});method='hemicycle_test_room_mode';args={p_request_id:body.operationId,p_mode:body.mode,p_player_id:body.playerId};}else{method='hemicycle_test_invite';args={p_player_id:body.playerId,p_request_id:body.operationId};}}
   else if(req.method==='POST'&&pathname==='/rooms/accept'){if(!uuid.test(body.roomId||''))return reply(400,{error:'Invitación no válida.'});method='hemicycle_test_accept';args={p_room_id:body.roomId};}
   else if(req.method==='GET'&&pathname.startsWith('/rooms/')&&uuid.test(pathname.slice(7))){method='hemicycle_room_view';args={p_id:pathname.slice(7)};}
   else return reply(404,{error:'Ruta no disponible.'});
   // Supabase verifica el JWT y auth.uid(); no se confía en un ID enviado por el cliente.
   const response=await fetcher(url.replace(/\/$/,'')+'/rest/v1/rpc/'+method,{method:'POST',headers:{apikey:key,Authorization:auth,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(8000)});
   if(!response.ok)return reply(response.status===401?401:response.status===403?403:409,{error:'No se pudo acceder a la sala. Comprueba la sesión, el código o la disponibilidad.'});
   reply(200,await response.json());
  }catch{return reply(503,{error:'No hay conexión con el servicio de salas. Vuelve a intentarlo.'});}
 });
}
if(require.main===module){const server=createServer();server.requestTimeout=10000;server.headersTimeout=10000;server.listen(Number(process.env.PORT)||8030,'0.0.0.0',()=>console.log('Servicio de salas y combate privado de prueba iniciado.'));process.on('SIGTERM',()=>server.close(()=>process.exit(0)));}
module.exports={createServer};
