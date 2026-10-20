/* Mantiene los gestos dentro de los paneles desplazables del juego. */
(function(){
 'use strict';
 var app=document.getElementById('screen');if(!app)return;
 var point=null;
 function editable(target){return !!(target&&target.closest&&target.closest('input,textarea,select,[contenteditable="true"]'));}
 function canScroll(target,dx,dy){
  var horizontal=Math.abs(dx)>Math.abs(dy),delta=horizontal?dx:dy;
  if(!delta)return true;
  for(var el=target&&target.nodeType===1?target:target&&target.parentElement;el&&app.contains(el);el=el.parentElement){
   var style=getComputedStyle(el),overflow=horizontal?style.overflowX:style.overflowY;
   if(overflow!=='auto'&&overflow!=='scroll')continue;
   var position=horizontal?el.scrollLeft:el.scrollTop;
   var max=(horizontal?el.scrollWidth-el.clientWidth:el.scrollHeight-el.clientHeight);
   if(max>1&&((delta<0&&position>1)||(delta>0&&position<max-1)))return true;
  }
  return false;
 }
 app.addEventListener('contextmenu',function(event){event.preventDefault();});
 app.addEventListener('dragstart',function(event){if(!editable(event.target))event.preventDefault();});
 app.addEventListener('selectstart',function(event){if(!editable(event.target))event.preventDefault();});
 app.addEventListener('wheel',function(event){
  if(event.ctrlKey||editable(event.target))return;
  var dx=event.deltaX||(event.shiftKey?event.deltaY:0),dy=event.shiftKey?0:event.deltaY;
  if(!canScroll(event.target,dx,dy))event.preventDefault();
 },{passive:false});
 app.addEventListener('touchstart',function(event){
  point=event.touches.length===1?{id:event.touches[0].identifier,x:event.touches[0].clientX,y:event.touches[0].clientY}:null;
 },{passive:true});
 app.addEventListener('touchmove',function(event){
  if(!point||event.touches.length!==1)return;
  var touch=event.touches[0];if(touch.identifier!==point.id)return;
  var dx=point.x-touch.clientX,dy=point.y-touch.clientY;point.x=touch.clientX;point.y=touch.clientY;
  if(!editable(event.target)&&!canScroll(event.target,dx,dy)&&event.cancelable)event.preventDefault();
 },{passive:false});
 function end(){point=null;}
 app.addEventListener('touchend',end,{passive:true});
 app.addEventListener('touchcancel',end,{passive:true});
})();
