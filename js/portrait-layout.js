/* Una geometría proporcional para cromos, sobres y miniaturas; sin modificar píxeles del arte. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.HemicyclePortraits=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function escape(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
var instance=0;
function html(art,className){
 var aspect=art.aspect||[3,4],w=aspect[0],h=aspect[1],columns=art.columns||2,rows=art.rows||2,position=(art.position||'0% 0%').split(/\s+/),column=Number.isInteger(art.column)?art.column:Math.round(parseFloat(position[0])/100*(columns-1)),row=Number.isInteger(art.row)?art.row:Math.round(parseFloat(position[1])/100*(rows-1)),framing=art.framing||{scale:1,x:0,y:0},scale=framing.scale,context=art.context,key='portrait-'+String(art.key||art.url).replace(/[^a-zA-Z0-9-]/g,'-');
 key+='-'+(++instance);var clip=key+'-cell',inset=columns>1||rows>1?(art.clipInset||0):0;
 var backdrop=context?'<defs><linearGradient id="'+key+'" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="'+escape(context.colors[1])+'"/><stop offset="1" stop-color="'+escape(context.colors[0])+'"/></linearGradient></defs><rect width="'+w+'" height="'+h+'" fill="url(#'+key+')"/><path d="M.1 1.1 2.6 .3M.1 1.3 2.8 .5M.1 1.5 2.9 .7" stroke="#d9c8a0" opacity=".08" stroke-width=".08"/>':'';
 // Isolate the cell BEFORE framing or masks. No atlas neighbour can enter a
 // portrait when Android composites a scaled SVG, even outside its viewport.
 var picture='<defs><clipPath id="'+clip+'" clipPathUnits="userSpaceOnUse"><rect x="'+inset+'" y="'+inset+'" width="'+(w-2*inset)+'" height="'+(h-2*inset)+'"/></clipPath></defs><svg class="portrait-plane'+(scale<.99?' portrait-plane-fit':'')+'" x="'+(framing.x*w)+'" y="'+(framing.y*h)+'" width="'+(w*scale)+'" height="'+(h*scale)+'" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="'+escape(art.align||'xMidYMin slice')+'" overflow="hidden"><g clip-path="url(#'+clip+')"><image href="'+escape(art.url)+'" x="'+(-w*column)+'" y="'+(-h*row)+'" width="'+(w*columns)+'" height="'+(h*rows)+'" preserveAspectRatio="none"/></g></svg>';
 var caption=''; // No artificial institutional labels over the illustration.

 return '<svg class="'+escape(className||'orator-atlas')+'" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="'+escape(art.align||'xMidYMin slice')+'" aria-hidden="true" focusable="false">'+backdrop+picture+caption+'</svg>';
}
return {html:html};
});
