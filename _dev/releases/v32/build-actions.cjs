'use strict';
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'../../..');
const plans=[
['confused','negative',['Pregunta enredada','Cruce de argumentos','Debate confuso','Laberinto parlamentario']],
['weakness','negative',['Duda razonable','Argumento debilitado','Bancada insegura','Desgaste de discurso']],
['strength','positive',['Convicción','Voz firme','Ánimo de grupo','Fortaleza parlamentaria']],
['fullness','positive',['Pausa reparadora','Plenitud','Bancada serena','Pleno bienestar']],
['regeneration','positive',['Agua en la tribuna','Descanso pautado','Relevo reparador','Recuperación colectiva']],
['attrition','negative',['Presión constante','Réplica persistente','Sesión interminable','Maratón de preguntas']],
['fortress','positive',['Atril firme','Resistencia','Escudos del consenso','Fortaleza institucional']],
['exposed','negative',['Flanco abierto','Foco incisivo','Bancada expuesta','Escrutinio total']],
['relief','positive',['Palabras de ánimo','Sosiego','Escucha compartida','Acuerdo reconfortante']],
['wound','negative',['Sesión agotadora','Sin descanso','Fatiga de bancada','Agotamiento general']],
['precision','positive',['Dato certero','Puntería dialéctica','Informe compartido','Precisión colectiva']],
['fatigue','negative',['Apatía','Desánimo','Silencio en los escaños','Desmovilización']],
['damage','negative',['Inciso punzante','Argumento directo','Ronda de réplicas','Zasca del hemiciclo']],
['heal','positive',['Vaso de agua','Respiro oportuno','Receso de bancada','Acuerdo reparador']],
['boost','positive',['Apunte oportuno','Impulso argumental','Guion compartido','Discurso coral']],
['guard','positive',['Carpeta protectora','Turno prudente','Protección de bancada','Cordón parlamentario']],
['cleanse','positive',['Aclaración','Punto de orden','Consenso esclarecedor','Renovación de bancada']],
['purge','negative',['Contraste de datos','Revisión crítica','Control de bancada','Fiscalización plena']],
['cleanse-heal','positive',['Apoyo cercano','Diálogo reparador','Pacto de recuperación','Renovación del consenso']],
['purge-damage','negative',['Matiz decisivo','Contrarréplica','Interrogatorio colectivo','Moción de escrutinio']]
];
const slug=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),S=require('../../../js/action-status.js');
const cards=plans.flatMap(([effect,polarity,names],family)=>names.map((n,variant)=>{
 const r=variant===0?'comun':variant===1?(family<12?'comun':'raro'):variant===2?(family<16?'raro':'especial'):(family<12?'especial':'legendario'),tier=['comun','raro','especial','legendario'].indexOf(r),all=variant>=2,target=(all?'all-':'')+(polarity==='negative'?'rival':'self'),value=effect==='confused'||effect==='precision'||effect==='guard'?1:variant===1?2:variant===3&&tier===3?2:1,duration=variant===3?2:1,status=Object.hasOwn(S.definitions,effect),cost=Math.min(7,1+tier+(all?1:0)+(variant===3?1:0)+(effect==='cleanse-heal'||effect==='purge-damage'?1:0)),who=all?(polarity==='negative'?'todos los oradores rivales':'todos tus oradores'):(polarity==='negative'?'un orador rival':'un orador propio');
 let text=status?'Aplica '+S.definitions[effect].name+' (potencia '+value+') a '+who+', hasta terminar sus próximos '+duration+' turnos propios. '+S.definitions[effect].text:effect==='damage'?'Causa '+(value+1)+' de daño a '+who+'.':effect==='heal'?'Restaura '+(value+1)+' de Aguante a '+who+'.':effect==='boost'?'Suma '+value+' Zasca a '+who+' durante su turno activo.':effect==='guard'?'Prepara defensa del 50 % para '+who+', hasta el próximo turno propio.':effect==='cleanse'?'Elimina los estados negativos de acciones de '+who+'.':effect==='purge'?'Elimina los estados positivos de acciones y la defensa de '+who+'.':effect==='cleanse-heal'?'Elimina los estados negativos de acciones y restaura '+value+' de Aguante a '+who+'.':'Retira los estados positivos de acciones y la defensa, y causa '+value+' de daño a '+who+'.';
 return {id:slug(n),n,r,cost,effect:status?'status':effect,...(status?{status:effect,duration}:{}),target,value:['damage','heal'].includes(effect)?value+1:value,text,artFamily:family,artVariant:variant};
}));
const counts=Object.fromEntries(['comun','raro','especial','legendario'].map(r=>[r,cards.filter(c=>c.r===r).length]));if(JSON.stringify(Object.values(counts))!=='[32,24,16,8]'||new Set(cards.map(c=>c.id)).size!==80)throw Error('Composición no válida.');
let source=fs.readFileSync(path.join(__dirname,'action-cards-before.js'),'utf8');source=source.replace('].map(Object.freeze));','].concat('+JSON.stringify(cards)+').map(Object.freeze));');
source=source.replace("else effect=scope+': defensa", "else if(card.effect==='status'||['cleanse','purge','cleanse-heal','purge-damage'].includes(card.effect))effect=scope+': '+card.text;\n else effect=scope+': defensa");
fs.writeFileSync(path.join(root,'js/action-cards.js'),source);fs.writeFileSync(path.join(__dirname,'actions-added.json'),JSON.stringify({counts,cards},null,2)+'\n');console.log('Added 80 actions:',counts);
