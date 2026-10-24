/* Previsualización reproducible del mismo compositor que usa el juego. */
const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process'),{createCanvas,loadImage}=require('@napi-rs/canvas'),F=require('../../js/card-confetti.js'),{cards}=require('../market/catalog.cjs');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'_dev/previews/legendary-confetti');fs.mkdirSync(out,{recursive:true});
(async()=>{const legends=cards.filter(c=>c.r==='legendario'),sheet=createCanvas(1120,1230),g=sheet.getContext('2d');g.fillStyle='#0b101d';g.fillRect(0,0,1120,1230);const effect=F.create(F.TRUMP);let trump;
for(let i=0;i<legends.length;i++){const c=legends[i],im=await loadImage(path.join(root,'cards',c.id+'.webp')),x=(i%4)*280+10,y=Math.floor(i/4)*410+10;const tile=createCanvas(420,560),t=tile.getContext('2d');t.drawImage(im,0,0,420,560);effect.draw(t,2400);g.drawImage(tile,x,y,260,347);g.fillStyle='#ecd19a';g.font='14px sans-serif';g.fillText(c.n,x,y+371);g.fillStyle='#99a5bd';g.font='12px sans-serif';g.fillText('Edición confeti · 250 victorias',x,y+391);if(c.id==='donald-trump')trump=im;}
fs.writeFileSync(path.join(out,'legendarios-confeti.png'),sheet.toBuffer('image/png'));
const canvas=createCanvas(420,560),ctx=canvas.getContext('2d'),frames=[];
for(let i=0;i<180;i++){ctx.clearRect(0,0,420,560);ctx.drawImage(trump,0,0,420,560);effect.draw(ctx,i*1000/30);frames.push(canvas.toBuffer('image/png'));}
const r=spawnSync('ffmpeg',['-y','-f','image2pipe','-framerate','30','-i','pipe:0','-c:v','libwebp_anim','-quality','70','-loop','0',path.join(out,'trump-normal-confeti.webp')],{input:Buffer.concat(frames),maxBuffer:8*1024*1024});if(r.status!==0)throw Error(r.stderr.toString());
console.log('12 ediciones y loop de Trump normal renderizados en '+out);
})().catch(e=>{console.error(e);process.exitCode=1;});
