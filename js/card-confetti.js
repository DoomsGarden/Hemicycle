/* Confeti para cromos. Adaptado del compositor aportado por el autor de Hemiciclo.
 * Solo dibuja: no consulta el DOM, la red, el almacenamiento ni el estado del juego.
 */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else root.CardConfetti=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 var GOLD=[['#FFF7D6','#F6C24E','#B8801A'],['#FFE9A8','#E9A72A','#96690F'],['#FFFDF0','#FFD980','#C68C1C'],['#FFF2BE','#DFA128','#8E6412']];
 var TRUMP=Object.freeze({width:420,height:560,count:95,size:1,speed:1,drift:1,loopSeconds:6,seed:90210});
 function limit(value,fallback,min,max){
  value=Number(value);return Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
 }
 function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  if(typeof ctx.roundRect==='function'){ctx.roundRect(x,y,w,h,r);return;}
  ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
 }
 function create(options){
  options=options||{};
  var settings={
   width:limit(options.width,TRUMP.width,1,4096),height:limit(options.height,TRUMP.height,1,4096),
   count:Math.round(limit(options.count,TRUMP.count,0,220)),size:limit(options.size,TRUMP.size,0.1,3),
   speed:limit(options.speed,TRUMP.speed,0.1,4),drift:limit(options.drift,TRUMP.drift,0,2),
   loopSeconds:limit(options.loopSeconds,TRUMP.loopSeconds,1,60),
   seed:limit(options.seed,TRUMP.seed,0,4294967295)>>>0
  };
  var palette=GOLD;
  if(Array.isArray(options.palette)&&options.palette.length&&options.palette.every(function(row){
   return Array.isArray(row)&&row.length===3&&row.every(function(color){return typeof color==='string'&&/^#[0-9a-f]{6}$/i.test(color);});
  }))palette=options.palette.map(function(row){return row.slice();});
  var state=settings.seed,particles=[],margin=Math.max(Math.round(settings.height*0.06),Math.ceil(18*settings.size*settings.height/560));
  var travel=settings.height+margin*2;
  function random(){state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;}
  for(var i=0;i<settings.count;i++){
   var r=random(),base=r<0.14?16+random()*14:(r<0.55?8+random()*8:3.5+random()*4.5);
   var size=base*settings.size*settings.height/1400,u=random()*2-1;
   var push=Math.sign(u)*Math.pow(Math.abs(u),0.62);
   particles.push({
    x0:settings.width*0.5+push*settings.width*0.5,y0:random()*travel,
    height:size,width:size*(0.5+random()*0.85),vy:settings.speed*travel/settings.loopSeconds,
    amp:(5+random()*22)*settings.drift*settings.width/1050,
    m:1+(random()<0.5?1:0),phase:random()*Math.PI*2,rot0:random()*Math.PI*2,
    nr:1+(random()<0.6?1:0),spin:random()<0.5?-1:1,
    alpha:0.45+random()*0.55,colors:palette[Math.floor(random()*palette.length)],depth:random()
   });
  }
  function at(index,elapsed){
   var p=particles[index];if(!p)return null;
   var milliseconds=Number(elapsed);
   var t=(Number.isFinite(milliseconds)?Math.max(0,milliseconds):0)/1000,distance=p.y0+p.vy*t;
   return {
    x:p.x0+p.amp*Math.sin(2*Math.PI*p.m*t/settings.loopSeconds+p.phase),
    y:distance%travel-margin,cycle:Math.floor(distance/travel),distance:distance,
    rotation:p.rot0+p.spin*2*Math.PI*p.nr*t/settings.loopSeconds,
    width:p.width,height:p.height,alpha:p.alpha*(0.65+p.depth*0.35),colors:p.colors
   };
  }
  function draw(ctx,elapsed){
   for(var i=0;i<particles.length;i++){
    var p=at(i,elapsed),w=p.width,h=p.height;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rotation);ctx.globalAlpha=p.alpha;
    if(h>9){
     ctx.globalAlpha*=0.35;ctx.fillStyle=p.colors[1];roundRect(ctx,-w*0.85,-h*0.85,w*1.7,h*1.7,h*0.4);ctx.fill();
     ctx.globalAlpha=p.alpha;
    }
    var gradient=ctx.createLinearGradient(-w/2,-h/2,w/2,h/2);
    gradient.addColorStop(0,p.colors[0]);gradient.addColorStop(0.45,p.colors[1]);gradient.addColorStop(1,p.colors[2]);
    ctx.fillStyle=gradient;roundRect(ctx,-w/2,-h/2,w,h,h*0.28);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,'+(Math.abs(Math.cos(p.rotation))*0.5+0.12).toFixed(3)+')';
    ctx.fillRect(-w/2,-h/2,w,h*0.26);ctx.restore();
   }
  }
  return {settings:Object.freeze(settings),particles:particles,at:at,draw:draw,margin:margin,travel:travel};
 }
 return Object.freeze({create:create,TRUMP:TRUMP});
});
