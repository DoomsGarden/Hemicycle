'use strict';
const fs=require('node:fs'),Backup=require('../../js/player-backup.js'),{cards}=require('../market/catalog.cjs');
const quote=s=>"'"+String(s).replace(/'/g,"''")+"'";
function review(row,{reason,decision='approve'}={}){
 if(!row||!(/^[0-9a-f-]{36}$/i).test(row.userId||'')||!(/^[0-9a-f]{32}$/i).test(row.payloadHash||''))throw Error('Exportación de revisión no válida.');
 if(!['approve','reject'].includes(decision)||typeof reason!=='string'||reason.trim().length<10||reason.length>500)throw Error('Indica decisión y motivo revisable de 10–500 caracteres.');
 const payload=Backup.validate(row.payload,cards.map(c=>c.id));if(row.cloudExists&&decision==='approve')throw Error('Ya existe un guardado: recuperar la nube, no sustituirla.');
 const p=payload.profile,summary={userId:row.userId,nickname:row.nickname||null,fs:p.fs,elo:p.elo,wins:p.w,losses:p.l,oratorCopies:p.album.length,actionCopies:(p.actionAlbum||[]).length,payloadHash:row.payloadHash,decision};
 const sql=`-- Revisión administrativa explícita. Revisar resumen y motivo antes de ejecutar.
begin;
create table if not exists public.hemicycle_import_reviews(user_id uuid not null references auth.users(id),payload_hash text not null,decision text not null,reason text not null,reviewed_by text not null,reviewed_at timestamptz not null default now(),primary key(user_id,payload_hash));
alter table public.hemicycle_import_reviews enable row level security;
revoke all on public.hemicycle_import_reviews from public,anon,authenticated;
do $review$
declare request public.hemicycle_legacy_import_requests; saved public.hemicycle_cloud_saves;
begin
 select * into request from public.hemicycle_legacy_import_requests where user_id=${quote(row.userId)}::uuid for update;
 if not found or md5(request.payload::text)<>${quote(row.payloadHash)} then raise exception 'La solicitud cambió: volver a revisarla.';end if;
 if exists(select 1 from public.hemicycle_import_reviews where user_id=request.user_id and payload_hash=${quote(row.payloadHash)}) then raise notice 'Solicitud ya revisada; no se repite.';return;end if;
 if request.approved_at is not null then raise exception 'Solicitud ya aprobada.';end if;
 if ${quote(decision)}='approve' then
  perform public.hemicycle_economy_bootstrap(request.user_id,request.payload);
  select * into saved from public.hemicycle_cloud_saves where user_id=request.user_id for update;
  if saved.payload is distinct from request.payload then raise exception 'Ya existe otro guardado; no se sustituye.';end if;
  update public.hemicycle_legacy_import_requests set approved_at=now() where user_id=request.user_id;
 end if;
 insert into public.hemicycle_import_reviews(user_id,payload_hash,decision,reason,reviewed_by) values(request.user_id,${quote(row.payloadHash)},${quote(decision)},convert_from(decode(${quote(Buffer.from(reason.trim()).toString('hex'))},'hex'),'UTF8'),current_user);
end $review$;
commit;
`;
 return {summary,sql};
}
if(require.main===module){try{const [, ,file,decision,reason]=process.argv;if(!file)throw Error('Uso: node _dev/admin/review-import.cjs revision.json approve|reject "Motivo de la decisión"');const result=review(JSON.parse(fs.readFileSync(file,'utf8')),{decision,reason});console.error(JSON.stringify(result.summary,null,2));process.stdout.write(result.sql);}catch(e){console.error(e.message);process.exitCode=1;}}
module.exports={review};
