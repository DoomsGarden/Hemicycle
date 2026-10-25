'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('index.html','utf8').split('reconcileRanked:')[1].split(',canOpen:')[0];
function fixture(enabled){const calls=[],cloud={enabled,remote:{revision:7},phase:enabled?'conflict':'available'},context=vm.createContext({G:{authoritative:true,over:false},CLOUD_SAVE:{state:()=>cloud,refresh:async()=>calls.push('refresh'),restore:async revision=>calls.push(['restore',revision])}});return {context,calls,run:vm.runInContext('('+source+')',context),cloud};}
test('Una amistosa no sustituye el guardado local si la nube está desactivada',async()=>{const f=fixture(false);await f.run({mode:'normal'});a.deepEqual(f.calls,[]);a.equal(f.context.G.over,true);});
test('El progreso online se sincroniza al terminar una amistosa con la nube activa',async()=>{const f=fixture(true);await f.run({mode:'rapida'});a.deepEqual(f.calls,['refresh',['restore',7]]);});
test('Clasificatoria conserva su sincronización obligatoria y no restaura una copia ya sincronizada',async()=>{const f=fixture(true);f.cloud.phase='synced';await f.run({mode:'ranked'});a.deepEqual(f.calls,['refresh']);});
