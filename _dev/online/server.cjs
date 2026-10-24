'use strict';
const http=require('node:http');
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function createServer(config={}){
 const url=config.url||process.env.SUPABASE_URL,key=config.key||process.env.SUPABASE_PUBLISHABLE_KEY;
 const origins=(config.origins||process.env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean),fetcher=config.fetch||fetch;
 const configured=!!(url&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)&&key&&origins.length&&!origins.includes('*'));
 return http.createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Type','application/json; charset=utf-8');
  const reply=(status,value)=>{res.writeHead(status);res.end(JSON.stringify(value));};
  if(req.url==='/health'&&req.method==='GET')return reply(200,{service:'hemicycle-private-rooms',configured,combatEnabled:false});
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
   let method,args;
   if(req.method==='POST'&&req.url==='/rooms'){if(!uuid.test(body.operationId||''))return reply(400,{error:'Operación no válida.'});method='hemicycle_room_create';args={p_request_id:body.operationId};}
   else if(req.method==='POST'&&req.url==='/rooms/join'){if(typeof body.code!=='string'||!(/^[0-9a-f]{12}$/i).test(body.code))return reply(400,{error:'Código no válido.'});method='hemicycle_room_join';args={p_code:body.code.toUpperCase()};}
   else if(req.method==='GET'&&req.url.startsWith('/rooms/')&&uuid.test(req.url.slice(7))){method='hemicycle_room_view';args={p_id:req.url.slice(7)};}
   else return reply(404,{error:'Ruta no disponible.'});
   // Supabase verifica el JWT y auth.uid(); no se confía en un ID enviado por el cliente.
   const response=await fetcher(url.replace(/\/$/,'')+'/rest/v1/rpc/'+method,{method:'POST',headers:{apikey:key,Authorization:auth,'Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(8000)});
   if(!response.ok)return reply(response.status===401?401:response.status===403?403:409,{error:'No se pudo acceder a la sala. Comprueba la sesión, el código o la disponibilidad.'});
   reply(200,await response.json());
  }catch{return reply(503,{error:'No hay conexión con el servicio de salas. Vuelve a intentarlo.'});}
 });
}
if(require.main===module){const server=createServer();server.requestTimeout=10000;server.headersTimeout=10000;server.listen(Number(process.env.PORT)||8030,'0.0.0.0',()=>console.log('Servicio de salas iniciado. Combate todavía deshabilitado.'));process.on('SIGTERM',()=>server.close(()=>process.exit(0)));}
module.exports={createServer};
