// Package independent, opaque WebP frames; merge identical consecutive holds.
const fs=require('node:fs'),path=require('node:path');
const source=process.argv[2];if(!source)throw new Error('Usage: node mux.cjs <directory of numbered WebP frames>');
const root=path.resolve(__dirname,'../../..'),frames=[];
function chunks(buf){const out=[];for(let p=12;p+8<=buf.length;){const n=buf.readUInt32LE(p+4),end=p+8+n+(n&1),tag=buf.toString('ascii',p,p+4);if(['VP8 ','VP8L','ALPH'].includes(tag))out.push(buf.subarray(p,end));p=end;}return Buffer.concat(out)}
function u24(buf,n,offset){buf.writeUIntLE(n,offset,3)}
function chunk(tag,body){const header=Buffer.alloc(8);header.write(tag);header.writeUInt32LE(body.length,4);return Buffer.concat([header,body,Buffer.alloc(body.length&1)])}
for(const file of fs.readdirSync(source).filter(n=>n.endsWith('.webp')).sort()){
 const original=fs.readFileSync(path.join(source,file)),body=chunks(original),last=frames.at(-1);
 if(last&&last.body.equals(body))last.duration+=56;else frames.push({body,duration:56,original});
}
const vp8x=Buffer.alloc(10);vp8x[0]=2;u24(vp8x,419,4);u24(vp8x,559,7);
const anim=Buffer.alloc(6); // Infinite loop; opaque frames replace their predecessors.
const output=[chunk('VP8X',vp8x),chunk('ANIM',anim)];
for(const f of frames){const h=Buffer.alloc(16);u24(h,419,6);u24(h,559,9);u24(h,f.duration,12);h[15]=2;output.push(chunk('ANMF',Buffer.concat([h,f.body])))}
const body=Buffer.concat(output),riff=Buffer.alloc(12);riff.write('RIFF');riff.writeUInt32LE(body.length+4,4);riff.write('WEBP',8);
fs.writeFileSync(root+'/cards/donald-trump-golden.webp',Buffer.concat([riff,body]));
fs.writeFileSync(root+'/cards/donald-trump-golden-portrait.webp',frames[0].original);
console.log(JSON.stringify({frames:frames.length,duration:frames.reduce((a,f)=>a+f.duration,0),bytes:body.length+12},null,2));
