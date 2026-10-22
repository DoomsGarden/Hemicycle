/* Datos públicos de conexión. Este archivo no contiene credenciales administrativas.
 * El acceso y el nick no modifican ni migran el guardado local del juego.
 */
(function(root){
 'use strict';
 var origin=root.location&&root.location.origin;
 var redirect=['https://hemicycle.online','https://www.hemicycle.online'].indexOf(origin)>=0?origin+'/':'https://doomsgarden.github.io/Hemicycle/';
 var config=Object.freeze({
  url:'https://fdotndyenfreqbmzqdzd.supabase.co',
  publishableKey:'sb_publishable_Uztkuwu0Wt_dwoQIRfAGKg_en2K-W8I',
  redirectTo:redirect
 });
 if(typeof module==='object'&&module.exports)module.exports=config;
 else root.HemicycleSupabaseConfig=config;
})(typeof globalThis!=='undefined'?globalThis:this);
