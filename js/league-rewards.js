/* Premio de temporada compartido por el juego local y el servidor. */
(function(root,factory){'use strict';var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicycleLeagueRewards=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
 function seasonReward(position,teams){
  if(teams===undefined)teams=30;
  if(!Number.isSafeInteger(teams)||teams<2||!Number.isSafeInteger(position)||position<1||position>teams)throw Error('Posición de Liga no válida.');
  return Math.round(1100-800*(position-1)/(teams-1));
 }
 return {seasonReward:seasonReward};
});
