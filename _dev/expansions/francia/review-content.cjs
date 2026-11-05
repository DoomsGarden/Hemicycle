'use strict';
const originals=require('./frases-originales.json');
const sheets=require('./primera-100/arte-generacion.json').sheets;
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const originalById=new Map(originals.cards.map(c=>[c.id,c]));
const artById=new Map(sheets.flatMap(s=>s.ids.map((id,i)=>[id,{sheet:s.sheet,x:i%2*100,y:Math.floor(i/2)*100}])));
const actions={normal:'Zasca',strong:'Zasca fuerte',support:'Defensa y curación'};

function originalHTML(card){
 const item=originalById.get(card.id);
 if(!item)return '<p class="pending">Sin selección bilingüe revisada todavía</p>';
 return '<details class="bilingual"><summary>'+item.candidates.length+' candidatas bilingües · original y hablante revisados</summary>'+
 '<p>'+esc(item.contextSummaryES)+'</p>'+item.candidates.map(q=>
 '<h3>'+actions[q.action]+' · propuesta</h3><blockquote lang="es">'+esc(q.textES)+'</blockquote>'+
 '<p lang="fr">Original: «'+esc(q.originalFR)+'»</p><a href="'+esc(q.source)+'" target="_blank" rel="noreferrer">Fuente francesa · '+esc(q.spokenOn||'publicación '+q.publishedOn+'; fecha de declaración no precisada')+'</a>'+
 '<p class="muted">Traducción propia de un fragmento continuo. '+esc(q.speakerCheck.review)+' Revisión del tono para esta acción: pendiente.</p>').join('')+'</details>';
}

function portraitHTML(card){
 const art=artById.get(card.id);
 if(!art)return '<p class="pending">Retrato pendiente de referencia visual y generación</p>';
 return '<figure><div class="portrait" role="img" aria-label="Ilustración generada mediante IA de '+esc(card.name)+'"><img alt="" loading="lazy" src="primera-100/'+esc(art.sheet)+'" style="left:-'+art.x+'%;top:-'+art.y+'%"></div><figcaption>Arte generado mediante IA · provisional</figcaption></figure>';
}

module.exports={originalHTML,portraitHTML,artById,originalById,
 generatedPortraits:artById.size,bilingualProfiles:originals.cards.length,
 bilingualCandidates:originals.cards.reduce((n,c)=>n+c.candidates.length,0)};
