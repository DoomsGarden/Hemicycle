/* Reglas y probabilidades exactas compartidas por cliente y servicio de economía. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./orator-catalog.js'),require('./action-cards.js'));else root.HemicyclePackRules=factory(root.HemicycleCatalog,root.HemicycleActions);})(typeof globalThis!=='undefined'?globalThis:this,function(C,A){
'use strict';
var tiers=['comun','raro','especial','legendario'];
var recipes={comun:[{comun:1},{comun:1},{comun:1},{comun:1},{comun:.8,raro:.2}],raro:[{raro:1},{raro:1},{raro:1},{raro:1},{raro:.75,especial:.25}],legendario:[{legendario:1},{especial:1},{raro:1},{raro:1},{raro:1}],mitico:[{legendario:1},{legendario:1},{legendario:1},{legendario:1},{legendario:1}]};
function key(kind){return kind==='diario'?'comun':kind==='semanal'?'raro':kind;}
function recipe(kind){var value=recipes[key(kind)];if(!value)throw Error('Sobre no válido.');return value;}
function country(code){if(code===undefined||code===null||code==='')return '';if(typeof code!=='string'||!Object.hasOwn(C.countryNames,code))throw Error('País no válido.');return code;}
function pool(r,code){code=country(code);return C.cards.filter(function(c){return c.r===r&&(!code||c.country===code);});}
function available(kind,code){try{code=country(code);if(code&&(kind==='diario'||kind==='semanal'))return false;return recipe(kind).every(function(slot){return Object.keys(slot).every(function(r){return pool(r,code).length>0;});});}catch(ignore){return false;}}
function price(kind,code){code=country(code);var pack=C.packs.find(function(p){return p.k===kind;});if(!pack)throw Error('Sobre no válido.');return pack.p*(code?2:1);}
function roll(random){var n=random();if(!Number.isFinite(n)||n<0||n>=1)throw Error('Azar no válido.');return n;}
function contents(kind,code,random){code=country(code);if(!available(kind,code))throw Error('Este país todavía no tiene oradores de todas las rarezas de este sobre.');random=random||Math.random;
 var result=recipe(kind).map(function(slot){var value=roll(random),sum=0,rarity=Object.keys(slot).find(function(r){sum+=slot[r];return value<sum;});var choices=pool(rarity,code);return choices[Math.floor(roll(random)*choices.length)];});
 return A.inject(result,random,kind).map(function(c){return typeof c==='string'?c:c.id;});
}
function cover(kind,code,now){code=country(code);var rarity=key(kind)==='comun'?'comun':key(kind)==='raro'?'raro':'legendario',choices=pool(rarity,code).slice().sort(function(a,b){return a.id.localeCompare(b.id);});if(!choices.length)return null;var week=Math.floor(((now===undefined?Date.now():now)-Date.UTC(1970,0,5))/(7*86400000)),offset=kind==='diario'||kind==='semanal'||kind==='mitico'?1:0;return choices[((week+offset)%choices.length+choices.length)%choices.length];}
function odds(kind,code){code=country(code);if(!available(kind,code))return [];var slots=recipe(kind),injection=kind==='mitico'?.25:.4;
 return tiers.map(function(r){var expected=slots.reduce(function(n,s){return n+(s[r]||0);},0),orators=pool(r,code),actions=A.cards.filter(function(c){return c.r===r;});if(!expected)return {rarity:r,expectedSlots:0,rows:[]};
  var probabilities=slots.map(function(s){return (s[r]||0)/orators.length;}),noBase=probabilities.reduce(function(n,p){return n*(1-p);},1),noReplaced=probabilities.reduce(function(sum,_,index){return sum+probabilities.reduce(function(n,p,j){return n*(j===index?1:1-p);},1);},0)/slots.length;
  var chance=1-((1-injection)*noBase+injection*noReplaced),actionChance=injection*expected/(slots.length*actions.length);
  return {rarity:r,expectedSlots:expected,rows:orators.map(function(c){return {id:c.id,name:c.n,action:false,country:c.country,chance:chance,expectedCopies:expected*(1-injection/slots.length)/orators.length};}).concat(actions.map(function(c){return {id:c.id,name:c.n,action:true,country:null,chance:actionChance,expectedCopies:actionChance};}))};
 });
}
return Object.freeze({tiers:tiers,recipe:recipe,country:country,pool:pool,available:available,price:price,contents:contents,cover:cover,odds:odds,countries:function(){return Object.keys(C.countryNames).filter(function(code){return C.cards.some(function(c){return c.country===code;});});}});
});
