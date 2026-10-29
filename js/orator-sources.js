/* Búsqueda local sobre el archivo editorial. Sin red, cuentas ni seguimiento. */
(function(){'use strict';
var form=document.querySelector('[data-source-controls]');if(!form)return;
var search=document.getElementById('sourceSearch'),cards=Array.from(document.querySelectorAll('.orator-card')),filter='all',status=document.querySelector('[data-source-results]'),empty=document.querySelector('[data-source-empty]');
function normalize(text){return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function update(){var query=normalize(search.value.trim()),orators=0,phrases=0;cards.forEach(function(card){var visible=0;card.querySelectorAll('.quote-entry').forEach(function(quote){var match=(!query||normalize(quote.dataset.search).indexOf(query)>=0)&&(filter==='all'||(filter==='partial'?quote.dataset.partial==='true':quote.dataset.kind===filter));quote.hidden=!match;if(match)visible++;});card.hidden=!visible;if(visible){orators++;phrases+=visible;}if(query||filter!=='all')card.open=!!visible;});status.textContent=orators+' '+(orators===1?'orador':'oradores')+' · '+phrases+' '+(phrases===1?'frase':'frases');empty.hidden=orators!==0;}
form.hidden=false;form.addEventListener('submit',function(e){e.preventDefault();});search.addEventListener('input',update);
form.addEventListener('click',function(e){var button=e.target.closest('[data-source-filter]');if(!button)return;filter=button.dataset.sourceFilter;form.querySelectorAll('[data-source-filter]').forEach(function(b){b.setAttribute('aria-pressed',String(b===button));});update();});
form.addEventListener('reset',function(){filter='all';search.value='';form.querySelectorAll('[data-source-filter]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.sourceFilter==='all'));});cards.forEach(function(c){c.open=false;});update();search.focus();});
function reveal(){var id;try{id=decodeURIComponent(location.hash.slice(1));}catch(ignore){return;}var target=document.getElementById(id);if(!target||!target.matches('.orator-card'))return;form.reset();target.open=true;target.querySelector('summary').focus({preventScroll:true});target.scrollIntoView({block:'start'});}
window.addEventListener('hashchange',reveal);reveal();
})();
