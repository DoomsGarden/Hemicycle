'use strict';
// Reads an exported Render log locally; no network, credentials or player data.
const fs=require('node:fs');
function summarize(text){const instances=new Map();for(const line of text.split('\n')){const at=line.indexOf('{');if(at<0)continue;let row;try{row=JSON.parse(line.slice(at));}catch{continue;}if(row.event!=='hemicycle.operations'||row.kind!=='summary'||!/^[0-9a-f-]{36}$/i.test(row.instanceId||''))continue;
 const fields=['requests','errors','clientErrors','aborted','slow','rpc','rpcErrors','conflicts','rejected','inFlight','peak','durationMs','rpcDurationMs'];const safe={};for(const k of fields)if(Number.isFinite(row[k])&&row[k]>=0)safe[k]=row[k];instances.set(row.instanceId,safe);}
 return {instances:instances.size,summaries:[...instances.values()],note:'Último resumen acumulado por instancia del archivo. No sumar resúmenes repetidos. Sin resumen no equivale a cero errores.'};}
if(require.main===module){if(process.argv.length!==3){console.error('Uso: node _dev/operations/summarize.cjs /ruta/render.log');process.exitCode=1;}else console.log(JSON.stringify(summarize(fs.readFileSync(process.argv[2],'utf8')),null,2));}
module.exports={summarize};
