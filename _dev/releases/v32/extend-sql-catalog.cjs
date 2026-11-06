'use strict';const fs=require('fs'),C=require('../../../js/orator-catalog.js'),A=require('../../../js/action-cards.js'),oldA=require('./action-cards-before.js');
const sqlList=ids=>ids.map(id=>"'"+id.replace(/'/g,"''")+"'").join(','),oldActions=sqlList(oldA.ids),newActions=sqlList(A.ids),source=fs.readFileSync('_dev/online/20261031_automatic_legacy_import.sql','utf8'),oldOrators=source.match(/not in \(([^)]+donald-trump[^)]+)\)/)[1],newOrators=sqlList(C.cards.map(c=>c.id));
let sql=fs.readFileSync('_dev/online/20261106_expansion_v32.sql','utf8');const marker='-- Catálogo v32 de acciones e importación inicial';if(sql.includes(marker))sql=sql.slice(0,sql.indexOf(marker))+'commit;\n';
const block=`${marker}: actualiza las listas sin sustituir las comprobaciones previas.
do $expand32$ declare definition text; begin
 definition:=pg_get_functiondef('public.hemicycle_put_cloud_save_legacy(jsonb,bigint,uuid)'::regprocedure);
 if position($old32$${oldActions}$old32$ in definition)>0 then
  execute replace(definition,$old32$${oldActions}$old32$,$new32$${newActions}$new32$);
 elsif position($new32$${newActions}$new32$ in definition)=0 then raise exception 'Revisa el validador de acciones antes de aplicar la ampliación.';end if;
 definition:=pg_get_functiondef('public.hemicycle_legacy_import_valid(jsonb)'::regprocedure);
 definition:=replace(definition,$old32$${oldActions}$old32$,$new32$${newActions}$new32$);
 definition:=replace(definition,$old32$${oldOrators}$old32$,$new32$${newOrators}$new32$);
 execute definition;
end $expand32$;
revoke all on function public.hemicycle_put_cloud_save_legacy(jsonb,bigint,uuid) from public,anon,authenticated;
`;
sql=sql.replace(/commit;\s*$/,()=>block+'commit;\n');fs.writeFileSync('_dev/online/20261106_expansion_v32.sql',sql);
