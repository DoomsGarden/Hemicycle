/* Selectores del juego: mantienen el valor y los eventos del control original. */
(function(root){'use strict';
 var widgets=new WeakMap(),opened=null,serial=0,typed='',typedAt=0;
 function label(select){
  if(select.getAttribute('aria-label'))return select.getAttribute('aria-label');
  var by=select.getAttribute('aria-labelledby');if(by)return by.split(/\s+/).map(function(id){var el=document.getElementById(id);return el?el.textContent:'';}).join(' ').trim();
  return Array.from(select.labels||[]).map(function(el){var copy=el.cloneNode(true);copy.querySelectorAll('select,button,.game-select').forEach(function(n){n.remove();});return copy.textContent.trim();}).join(' ')||'Seleccionar';
 }
 function update(select){
  var w=widgets.get(select);if(!w)return;
  var option=select.options[select.selectedIndex],text=option?option.textContent:'Seleccionar';
  if(w.value.textContent!==text)w.value.textContent=text;
  w.button.disabled=select.disabled;
  var name=label(select)+': '+text;if(w.button.getAttribute('aria-label')!==name)w.button.setAttribute('aria-label',name);
 }
 function enhance(select){
  if(widgets.has(select)){update(select);return;}
  if(select.multiple||select.size>1||select.hasAttribute('data-native-select'))return;
  if(!select.id)select.id=select.hasAttribute('data-pack-quantity')?'pack-quantity-'+select.dataset.packQuantity:'game-select-'+(++serial);
  var wrapper=document.createElement('span'),button=document.createElement('button'),value=document.createElement('span');
  wrapper.className='game-select';button.type='button';button.className='game-select-button';button.dataset.selectFor=select.id;
  button.setAttribute('role','combobox');button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','options-'+select.id);
  value.className='game-select-value';button.append(value);button.insertAdjacentHTML('beforeend','<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m6 9 6 6 6-6"/></svg>');
  select.before(wrapper);wrapper.append(select,button);select.classList.add('game-select-native');select.tabIndex=-1;select.setAttribute('aria-hidden','true');
  widgets.set(select,{button:button,value:value,wrapper:wrapper});update(select);
 }
 function scan(node){if(!node||node.nodeType!==1)return;if(node.matches('select'))enhance(node);node.querySelectorAll('select').forEach(enhance);}
 function close(restore){if(!opened)return;var previous=opened;opened=null;previous.w.button.setAttribute('aria-expanded','false');previous.w.button.removeAttribute('aria-activedescendant');previous.menu.remove();if(restore&&previous.w.button.isConnected)previous.w.button.focus({preventScroll:true});}
 function move(index){
  if(!opened||!opened.options.length)return;opened.index=(index+opened.options.length)%opened.options.length;
  opened.menu.querySelectorAll('[role=option]').forEach(function(el){el.classList.toggle('is-active',Number(el.dataset.index)===opened.options[opened.index].index);});
  var el=opened.menu.querySelector('[data-index="'+opened.options[opened.index].index+'"]');
  if(el){opened.w.button.setAttribute('aria-activedescendant',el.id);el.scrollIntoView({block:'nearest'});}
 }
 function position(){
  if(!opened)return;var r=opened.w.button.getBoundingClientRect(),v=root.visualViewport,left=v?v.offsetLeft:0,top=v?v.offsetTop:0,width=v?v.width:innerWidth,height=v?v.height:innerHeight,menu=opened.menu;
  var w=Math.min(width-16,Math.max(r.width,Math.min(260,width-16))),below=top+height-r.bottom-8,above=r.top-top-8;
  menu.style.width=w+'px';menu.classList.remove('has-overflow');menu.style.maxHeight='none';
  var desired=Math.min(320,menu.scrollHeight+2),up=below<desired&&above>below,room=Math.max(40,Math.min(320,up?above:below));
  if(room<desired&&desired<=height-16)room=desired;
  menu.style.maxHeight=room+'px';menu.style.left=Math.max(left+8,Math.min(r.left,left+width-w-8))+'px';
  menu.classList.toggle('has-overflow',menu.scrollHeight>menu.clientHeight+1);
  menu.style.top=Math.max(top+8,Math.min(top+height-menu.offsetHeight-8,up?r.top-menu.offsetHeight-6:r.bottom+6))+'px';
 }
 function open(select){
  var w=widgets.get(select);if(!w||select.disabled||select.closest('[inert]'))return;
  if(opened&&opened.select===select){close(true);return;}close(false);update(select);
  var menu=document.createElement('div');menu.className='game-select-menu';menu.id='options-'+select.id;menu.setAttribute('role','listbox');menu.setAttribute('aria-label',label(select));
  var enabled=[];Array.from(select.options).forEach(function(option){if(option.hidden)return;var disabled=option.disabled||option.parentElement.disabled,el=document.createElement('div');el.className='game-select-option';el.id=menu.id+'-'+option.index;el.dataset.index=option.index;el.setAttribute('role','option');el.setAttribute('aria-selected',String(option.selected));if(disabled)el.setAttribute('aria-disabled','true');else enabled.push(option);el.textContent=option.textContent;menu.append(el);});
  if(!enabled.length){var empty=document.createElement('div');empty.className='game-select-empty';empty.textContent='No hay opciones disponibles.';menu.append(empty);}
  var note=document.createElement('div');note.className='game-select-scroll-note';note.setAttribute('role','presentation');note.setAttribute('aria-hidden','true');note.textContent='Desliza para ver más opciones';menu.append(note);
  document.body.append(menu);opened={select:select,w:w,menu:menu,options:enabled,index:Math.max(0,enabled.findIndex(function(o){return o.selected;}))};typed='';typedAt=0;
  w.button.setAttribute('aria-expanded','true');w.button.focus({preventScroll:true});position();move(opened.index);
 }
 function choose(index){
  if(!opened)return;var select=opened.select,key=select.id,option=select.options[index];if(!option||option.disabled||option.parentElement.disabled)return;
  var changed=select.selectedIndex!==index;select.selectedIndex=index;update(select);close(false);
  if(changed){select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));}
  scan(document.body);var current=document.getElementById(key),w=current&&widgets.get(current);if(w)w.button.focus({preventScroll:true});
 }
 document.addEventListener('click',function(e){
  var trigger=e.target.closest('.game-select-button'),option=e.target.closest('.game-select-option');
  if(e.target.matches('select.game-select-native')){e.preventDefault();e.stopImmediatePropagation();open(e.target);return;}
  if(trigger){e.preventDefault();e.stopImmediatePropagation();var select=document.getElementById(trigger.dataset.selectFor);if(select)open(select);return;}
  if(option&&opened&&opened.menu.contains(option)){e.preventDefault();e.stopImmediatePropagation();if(option.getAttribute('aria-disabled')!=='true')choose(Number(option.dataset.index));return;}
  if(opened&&!opened.menu.contains(e.target))close(false);
 },true);
 document.addEventListener('keydown',function(e){
  var trigger=e.target.closest('.game-select-button');
  if(!opened){if(trigger&&['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();open(document.getElementById(trigger.dataset.selectFor));if(e.key==='End')move(opened.options.length-1);}return;}
  if(e.key==='Tab'){close(false);return;}
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close(true);return;}
  var index=opened.index;
  if(e.key==='ArrowDown')move(index+1);else if(e.key==='ArrowUp')move(index-1);else if(e.key==='Home')move(0);else if(e.key==='End')move(opened.options.length-1);else if(e.key==='PageDown')move(Math.min(index+5,opened.options.length-1));else if(e.key==='PageUp')move(Math.max(0,index-5));else if(e.key==='Enter'||e.key===' '){if(opened.options.length)choose(opened.options[index].index);}else if(e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey){var now=Date.now();typed=now-typedAt>700?e.key:typed+e.key;typedAt=now;var normalize=function(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();},at=opened.options.findIndex(function(o){return normalize(o.textContent.trim()).startsWith(normalize(typed));});if(at>=0)move(at);}else return;
  e.preventDefault();e.stopImmediatePropagation();
 },true);
 document.addEventListener('change',function(e){if(e.target.matches('select'))update(e.target);},true);
 document.addEventListener('scroll',function(e){if(!opened||opened.menu.contains(e.target))return;var r=opened.w.button.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight){close(false);return;}position();},true);
 root.addEventListener('resize',function(){close(true);});if(root.visualViewport)root.visualViewport.addEventListener('resize',function(){close(true);});
 function start(){scan(document.body);new MutationObserver(function(records){records.forEach(function(r){var select=r.target.nodeType===1&&(r.target.matches('select')?r.target:r.target.closest('select'));if(select){update(select);if(opened&&opened.select===select&&(r.target!==select||r.type==='childList'))close(true);}r.addedNodes.forEach(scan);});if(opened&&(!opened.select.isConnected||opened.select.disabled||opened.select.closest('[inert]')))close(false);}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['disabled','selected','label','aria-label','hidden','inert']});}
 if(document.body)start();else document.addEventListener('DOMContentLoaded',start,{once:true});
 root.HemicycleSelect={scan:scan,close:function(){close(true);}};
})(window);
