/* Servidor aislado de pruebas: inventario y FS de demostración, nunca el guardado real. */
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {DatabaseSync}=require('node:sqlite');
const {root,cards,packs}=require('./catalog.cjs');
const rules=require('../../js/market-rules.js').create(cards,packs);
class RequestError extends Error{constructor(message,status=400){super(message);this.status=status;}}
function createMarketServer({dbPath=':memory:',now=()=>Date.now()}={}){
 const db=new DatabaseSync(dbPath);
 db.exec(`PRAGMA foreign_keys=ON; PRAGMA busy_timeout=3000;
 CREATE TABLE IF NOT EXISTS players(id TEXT PRIMARY KEY,name TEXT NOT NULL,fs INTEGER NOT NULL CHECK(fs>=0));
 CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,player TEXT NOT NULL REFERENCES players(id));
 CREATE TABLE IF NOT EXISTS inventory(player TEXT NOT NULL REFERENCES players(id),card TEXT NOT NULL,quantity INTEGER NOT NULL CHECK(quantity>=0),PRIMARY KEY(player,card));
 CREATE TABLE IF NOT EXISTS listings(id TEXT PRIMARY KEY,seller TEXT NOT NULL REFERENCES players(id),card TEXT NOT NULL,quantity INTEGER NOT NULL,remaining INTEGER NOT NULL CHECK(remaining>=0),unit INTEGER NOT NULL,revision INTEGER NOT NULL DEFAULT 1,status TEXT NOT NULL,created INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS quotes(id TEXT PRIMARY KEY,buyer TEXT NOT NULL,listing TEXT NOT NULL,quantity INTEGER NOT NULL,revision INTEGER NOT NULL,unit INTEGER NOT NULL,expires INTEGER NOT NULL,result TEXT);
 CREATE TABLE IF NOT EXISTS trades(id TEXT PRIMARY KEY,proposer TEXT NOT NULL REFERENCES players(id),recipient TEXT NOT NULL REFERENCES players(id),terms TEXT NOT NULL,status TEXT NOT NULL,verified_a INTEGER NOT NULL DEFAULT 0,verified_b INTEGER NOT NULL DEFAULT 0,confirmed_a INTEGER NOT NULL DEFAULT 0,confirmed_b INTEGER NOT NULL DEFAULT 0,expires INTEGER NOT NULL,created INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS operations(player TEXT NOT NULL,key TEXT NOT NULL,payload TEXT NOT NULL,result TEXT NOT NULL,PRIMARY KEY(player,key));
 CREATE TABLE IF NOT EXISTS receipts(id TEXT PRIMARY KEY,player TEXT NOT NULL,kind TEXT NOT NULL,data TEXT NOT NULL,created INTEGER NOT NULL);`);
 const all=(sql,...args)=>db.prepare(sql).all(...args),one=(sql,...args)=>db.prepare(sql).get(...args),run=(sql,...args)=>db.prepare(sql).run(...args);
 function atomic(fn){db.exec('BEGIN IMMEDIATE');try{const value=fn();db.exec('COMMIT');return value;}catch(e){db.exec('ROLLBACK');throw e;}}
 function bad(message,status){throw new RequestError(message,status);}
 function account(id){const p=one('SELECT * FROM players WHERE id=?',id);if(!p)bad('Jugador no encontrado.',404);return p;}
 function quantity(player,id){return one('SELECT quantity FROM inventory WHERE player=? AND card=?',player,id)?.quantity||0;}
 function add(player,id,n){run('INSERT INTO inventory(player,card,quantity) VALUES(?,?,?) ON CONFLICT(player,card) DO UPDATE SET quantity=quantity+excluded.quantity',player,id,n);}
 function take(player,id,n){rules.card(id);rules.integer(n,'Cantidad');if(quantity(player,id)-n<1)bad('No hay suficientes repetidos disponibles. Conservas una copia.',409);run('UPDATE inventory SET quantity=quantity-? WHERE player=? AND card=?',n,player,id);}
 function pay(player,fs){if(account(player).fs<fs)bad('No hay suficientes FS disponibles.',409);run('UPDATE players SET fs=fs-? WHERE id=?',fs,player);}
 function credit(player,fs){rules.integer(account(player).fs+fs,'Saldo FS',0);run('UPDATE players SET fs=fs+? WHERE id=?',fs,player);}
 function receipt(player,kind,data){const item={id:crypto.randomUUID(),kind,...data,created:now()};run('INSERT INTO receipts VALUES(?,?,?,?,?)',item.id,player,kind,JSON.stringify(data),item.created);return item;}
 function once(player,key,payload,fn){
  if(typeof key!=='string'||key.length<8||key.length>100)bad('Identificador de operación no válido.');
  const encoded=JSON.stringify(payload),old=one('SELECT * FROM operations WHERE player=? AND key=?',player,key);
  if(old){if(old.payload!==encoded)bad('El identificador ya pertenece a otra operación.',409);return JSON.parse(old.result);}
  const result=fn();run('INSERT INTO operations VALUES(?,?,?,?)',player,key,encoded,JSON.stringify(result));return result;
 }
 function tradeRow(id,player){const t=one('SELECT * FROM trades WHERE id=?',id);if(!t)bad('Intercambio no encontrado.',404);if(t.proposer!==player&&t.recipient!==player)bad('Este intercambio pertenece a otros jugadores.',403);return t;}
 function unlock(t){
  const terms=JSON.parse(t.terms);
  for(const [side,player,items,fs]of [['a',t.proposer,terms.give,terms.giveFS],['b',t.recipient,terms.receive,terms.receiveFS]]){
   if(t['verified_'+side]){items.forEach(c=>add(player,c.id,c.quantity));credit(player,fs);}
  }
 }
 function completeTrade(t){
  if(t.status==='completed'||!t.verified_a||!t.verified_b||!t.confirmed_a||!t.confirmed_b)return;
  const terms=JSON.parse(t.terms);
  terms.receive.forEach(c=>add(t.proposer,c.id,c.quantity));terms.give.forEach(c=>add(t.recipient,c.id,c.quantity));
  credit(t.proposer,terms.receiveFS);credit(t.recipient,terms.giveFS);
  run("UPDATE trades SET status='completed' WHERE id=?",t.id);
  receipt(t.proposer,'trade',{trade:t.id});receipt(t.recipient,'trade',{trade:t.id});
 }
 function expire(){atomic(()=>{
  for(const t of all("SELECT * FROM trades WHERE status IN ('verification','confirmation') AND expires<=?",now())){unlock(t);run("UPDATE trades SET status='expired' WHERE id=?",t.id);}
 });}
 function publicTrade(t){return {...t,terms:JSON.parse(t.terms),proposerName:account(t.proposer).name,recipientName:account(t.recipient).name};}
 function me(player){return {...account(player),inventory:all('SELECT card AS id,quantity FROM inventory WHERE player=? AND quantity>0 ORDER BY card',player),demo:true};}
 function createSession(name){
  const id=crypto.randomUUID(),token=crypto.randomBytes(32).toString('base64url');
  name=typeof name==='string'?name.trim():'';
  if(name.length>28)bad('Usa un nombre de hasta 28 caracteres.');
  atomic(()=>{
   const ordinal=one('SELECT COUNT(*) AS n FROM players').n;
   run('INSERT INTO players VALUES(?,?,?)',id,name||'Jugador '+String(ordinal+1).padStart(2,'0'),6000);
   const shared=new Set(['comun','raro','especial','legendario'].flatMap(r=>cards.filter(c=>c.r===r).slice(0,4).map(c=>c.id)));
   cards.forEach((c,i)=>{if(shared.has(c.id)||(i+ordinal)%3===0)add(id,c.id,3);});
   run('INSERT INTO sessions VALUES(?,?)',crypto.createHash('sha256').update(token).digest('hex'),id);
  });
  return {id,token};
 }
 function auth(req){
  const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('hemicycle_market='))?.slice(17);
  if(!token)return null;
  return one('SELECT player FROM sessions WHERE token=?',crypto.createHash('sha256').update(token).digest('hex'))?.player||null;
 }
 async function body(req){
  if(!(req.headers['content-type']||'').startsWith('application/json'))bad('Envía la operación como JSON.',415);
  const origin=req.headers.origin;
  if(origin&&origin!=='http://'+req.headers.host)bad('Origen no permitido.',403);
  let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>32768)bad('Solicitud demasiado grande.',413);}
  try{return JSON.parse(text||'{}');}catch(e){bad('La solicitud no es válida.');}
 }
 async function api(req,res,url){
  const endpoint=url.pathname.slice('/api/market'.length);
  if(req.method==='GET'&&endpoint==='/status')return {enabled:true,demo:true,prices:rules.prices};
  expire();let player=auth(req);
  const data=req.method==='POST'?await body(req):{};
  if(req.method==='POST'&&endpoint==='/session'){
   if(!player){const session=createSession(data.name);player=session.id;res.setHeader('Set-Cookie','hemicycle_market='+session.token+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=31536000');}
   return me(player);
  }
  if(!player)bad('Abre una sesión de pruebas para entrar en el mercado.',401);
  if(req.method==='GET'&&endpoint==='/me')return me(player);
  if(req.method==='GET'&&endpoint==='/players')return all('SELECT id,name FROM players WHERE id<>? ORDER BY name',player);
  const publicInventory=endpoint.match(/^\/players\/([^/]+)\/cards$/);
  if(req.method==='GET'&&publicInventory){account(publicInventory[1]);return all('SELECT card AS id,quantity-1 AS available FROM inventory WHERE player=? AND quantity>1 ORDER BY card',publicInventory[1]);}
  if(req.method==='GET'&&endpoint==='/listings')return all("SELECT l.*,p.name AS sellerName FROM listings l JOIN players p ON p.id=l.seller WHERE l.status='active' AND l.remaining>0 ORDER BY l.created DESC");
  if(req.method==='GET'&&endpoint==='/activity')return {
   listings:all('SELECT * FROM listings WHERE seller=? ORDER BY created DESC LIMIT 100',player),
   trades:all('SELECT * FROM trades WHERE proposer=? OR recipient=? ORDER BY created DESC LIMIT 100',player,player).map(publicTrade),
   receipts:all('SELECT * FROM receipts WHERE player=? ORDER BY created DESC LIMIT 50',player).map(r=>({...r,data:JSON.parse(r.data)}))
  };
  if(req.method==='POST'&&endpoint==='/sales/machine')return atomic(()=>once(player,data.key,{id:data.id,quantity:data.quantity,target:'machine'},()=>{
   const quote=rules.sale(data.id,data.quantity,'machine');take(player,data.id,data.quantity);credit(player,quote.total);return receipt(player,'machine',quote);
  }));
  if(req.method==='POST'&&endpoint==='/listings')return atomic(()=>once(player,data.key,{id:data.id,quantity:data.quantity,target:'player'},()=>{
   const quote=rules.sale(data.id,data.quantity,'player');take(player,data.id,data.quantity);
   const id=crypto.randomUUID();run('INSERT INTO listings(id,seller,card,quantity,remaining,unit,status,created) VALUES(?,?,?,?,?,?,?,?)',id,player,data.id,data.quantity,data.quantity,quote.unit,'active',now());
   return {id,...quote};
  }));
  const cancelListing=endpoint.match(/^\/listings\/([^/]+)\/cancel$/);
  if(req.method==='POST'&&cancelListing)return atomic(()=>{
   const l=one('SELECT * FROM listings WHERE id=?',cancelListing[1]);if(!l)bad('Oferta no encontrada.',404);if(l.seller!==player)bad('Solo puedes retirar tus propias ofertas.',403);
   if(l.status==='active'){add(player,l.card,l.remaining);run("UPDATE listings SET status='cancelled',revision=revision+1 WHERE id=?",l.id);}
   return {status:l.status==='active'?'cancelled':l.status};
  });
  if(req.method==='POST'&&endpoint==='/quotes/purchase')return atomic(()=>{
   const l=one('SELECT * FROM listings WHERE id=?',data.listing);rules.integer(data.quantity,'Cantidad');
   if(!l||l.status!=='active'||l.remaining<data.quantity)bad('La oferta ya no tiene esa cantidad disponible.',409);
   if(l.seller===player)bad('No puedes comprar tu propia oferta.');
   const total=l.unit*data.quantity;rules.integer(total,'Importe');if(account(player).fs<total)bad('No tienes suficientes FS.',409);
   const id=crypto.randomUUID(),expires=now()+120000;
   run('INSERT INTO quotes VALUES(?,?,?,?,?,?,?,NULL)',id,player,l.id,data.quantity,l.revision,l.unit,expires);
   return {id,cardId:l.card,quantity:data.quantity,unit:l.unit,total,expires,sellerName:account(l.seller).name};
  });
  if(req.method==='POST'&&endpoint==='/purchases')return atomic(()=>{
   const q=one('SELECT * FROM quotes WHERE id=? AND buyer=?',data.quote,player);if(!q)bad('Verifica la compra antes de confirmarla.',409);
   if(q.result)return JSON.parse(q.result);if(q.expires<=now())bad('La verificación ha caducado. Revisa la compra de nuevo.',410);
   const l=one('SELECT * FROM listings WHERE id=?',q.listing);
   if(!l||l.status!=='active'||l.revision!==q.revision||l.remaining<q.quantity)bad('La oferta ha cambiado. Revisa de nuevo antes de comprar.',409);
   const total=q.unit*q.quantity;pay(player,total);credit(l.seller,total);add(player,l.card,q.quantity);
   run("UPDATE listings SET remaining=remaining-?,revision=revision+1,status=CASE WHEN remaining=? THEN 'sold' ELSE 'active' END WHERE id=?",q.quantity,q.quantity,l.id);
   const result=receipt(player,'purchase',{cardId:l.card,quantity:q.quantity,total,counterparty:account(l.seller).name});
   receipt(l.seller,'player-sale',{cardId:l.card,quantity:q.quantity,total,counterparty:account(player).name});
   run('UPDATE quotes SET result=? WHERE id=?',JSON.stringify(result),q.id);return result;
  });
  if(req.method==='POST'&&endpoint==='/trades')return atomic(()=>once(player,data.key,{recipient:data.recipient,give:data.give,receive:data.receive,verify:data.verify===true,...(data.accept===true?{accept:true}:{})},()=>{
   if(data.recipient===player)bad('Elige otro jugador.');account(data.recipient);
   const terms=rules.trade(data.give,data.receive);
   for(const [who,items,fee]of [[player,terms.give,terms.giveFS],[data.recipient,terms.receive,terms.receiveFS]]){
    items.forEach(c=>{if(quantity(who,c.id)-c.quantity<1)bad('Uno de los jugadores ya no tiene esos repetidos disponibles.',409);});
    if(account(who).fs<fee)bad('Uno de los jugadores no tiene FS suficientes para el suplemento.',409);
   }
   const id=crypto.randomUUID();run('INSERT INTO trades(id,proposer,recipient,terms,status,expires,created) VALUES(?,?,?,?,?,?,?)',id,player,data.recipient,JSON.stringify(terms),'verification',now()+900000,now());
   if(data.verify===true||data.accept===true){terms.give.forEach(c=>take(player,c.id,c.quantity));pay(player,terms.giveFS);run('UPDATE trades SET verified_a=1,confirmed_a=? WHERE id=?',data.accept===true?1:0,id);}
   return publicTrade(tradeRow(id,player));
  }));
  const tradeAction=endpoint.match(/^\/trades\/([^/]+)\/(verify|confirm|accept|cancel)$/);
  if(req.method==='POST'&&tradeAction)return atomic(()=>{
   const t=tradeRow(tradeAction[1],player),action=tradeAction[2],side=t.proposer===player?'a':'b',terms=JSON.parse(t.terms);
   if(action==='cancel'){
    if(t.status==='completed')bad('Un intercambio completado no se puede cancelar.',409);
    if(t.status==='verification'||t.status==='confirmation'){unlock(t);run("UPDATE trades SET status='cancelled' WHERE id=?",t.id);}
    return publicTrade(tradeRow(t.id,player));
   }
   if(t.status==='completed')return publicTrade(t);
   if(t.expires<=now())bad('El intercambio ha caducado. Actualiza el mercado.',410);
   if(!['verification','confirmation'].includes(t.status))bad('Este intercambio ya no está disponible.',409);
   if(action==='verify'||action==='accept'){
    if(!t['verified_'+side]){
     const items=side==='a'?terms.give:terms.receive,fee=side==='a'?terms.giveFS:terms.receiveFS;
     items.forEach(c=>take(player,c.id,c.quantity));pay(player,fee);
     run('UPDATE trades SET verified_'+side+'=1 WHERE id=?',t.id);
    }
    if(action==='accept')run('UPDATE trades SET confirmed_'+side+'=1 WHERE id=?',t.id);
    const fresh=tradeRow(t.id,player);
    if(fresh.verified_a&&fresh.verified_b)run("UPDATE trades SET status='confirmation' WHERE id=?",t.id);
    completeTrade(tradeRow(t.id,player));
   }else{
    if(t.status!=='confirmation'||!t.verified_a||!t.verified_b)bad('Ambos jugadores deben verificar las condiciones antes de confirmar.',409);
    run('UPDATE trades SET confirmed_'+side+'=1 WHERE id=?',t.id);
    completeTrade(tradeRow(t.id,player));
   }
   return publicTrade(tradeRow(t.id,player));
  });
  bad('Ruta de mercado no encontrada.',404);
 }
 const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');
  try{
   const url=new URL(req.url,'http://'+req.headers.host);
   if(url.pathname==='/health'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({ok:true,mode:'market-demo'}));return;}
   if(url.pathname.startsWith('/api/market/')){
    const result=await api(req,res,url);res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(result));return;
   }
   if(req.method!=='GET'&&req.method!=='HEAD')bad('Método no permitido.',405);
   const name=decodeURIComponent(url.pathname).replace(/^\/(?:Hemicycle\/)?/,'')||'index.html';
   if(!/^(?:index\.html|sw\.js|manifest\.json|icon-(?:192|512)\.png|js\/[a-z-]+\.js|css\/[a-z-]+\.css|cards\/[a-z0-9-]+\.webp|fonts\/Anton-Regular\.ttf|audio\/[a-z-]+\.mp3)$/.test(name))bad('Archivo no encontrado.',404);
   const file=path.join(root,name),types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.webp':'image/webp','.ttf':'font/ttf','.mp3':'audio/mpeg'};
   const bytes=fs.readFileSync(file);res.setHeader('Content-Type',types[path.extname(file)]);res.end(req.method==='HEAD'?undefined:bytes);
  }catch(e){res.statusCode=e.status||(e.code==='ENOENT'?404:400);res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify({error:e.message||'No se ha podido completar la operación.'}));}
 });
 return {server,db,close(){return new Promise(resolve=>server.close(()=>{db.close();resolve();}));}};
}
module.exports={createMarketServer};
if(require.main===module){
 if(!process.argv.includes('--demo')){console.error('Este servidor usa inventarios de prueba. Inícialo con --demo.');process.exitCode=1;}
 else{
  const portIndex=process.argv.indexOf('--port'),dbIndex=process.argv.indexOf('--db');
  const port=portIndex<0?8022:Number(process.argv[portIndex+1]),dbPath=dbIndex<0?'/tmp/hemicycle-market-demo.sqlite':path.resolve(process.argv[dbIndex+1]);
  const app=createMarketServer({dbPath});app.server.listen(port,'127.0.0.1',()=>console.log('Servidor de mercado de pruebas listo en el puerto '+port+'. Los guardados reales permanecen en el navegador.'));
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>app.close().then(()=>process.exit(0)));
 }
}
