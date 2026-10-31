-- Importación inicial automática autorizada por el propietario (31-10-2026).
-- Ejecutar completo una vez en Supabase → SQL Editor, después de la economía.
-- Incluye las solicitudes pendientes; se puede repetir sin duplicar progreso.
-- Acepta progreso local sin firma como punto de partida. Desde entonces manda el servidor.
begin;
create table if not exists public.hemicycle_import_reviews(
 user_id uuid not null references auth.users(id),payload_hash text not null,
 decision text not null,reason text not null,reviewed_by text not null,
 reviewed_at timestamptz not null default now(),primary key(user_id,payload_hash)
);
alter table public.hemicycle_import_reviews enable row level security;
revoke all on public.hemicycle_import_reviews from public,anon,authenticated;

-- El servicio aplica además HemicycleBackup.validate (campos admitidos, gabinetes,
-- Liga, objetivos, aspectos y maestrías). Las solicitudes antiguas ya pasaron ese
-- validador al enviarse. Esta comprobación SQL refuerza los invariantes de entrada.
create or replace function public.hemicycle_legacy_import_valid(p jsonb)
returns boolean language plpgsql immutable set search_path='' as $$
declare k text; n numeric; profile jsonb:=p->'profile';
begin
 if p is null or jsonb_typeof(p) is distinct from 'object' or octet_length(p::text)>8388608
  or p->>'format' is distinct from 'hemiciclo-backup' or p->>'schemaVersion' is distinct from '1'
  or jsonb_typeof(profile) is distinct from 'object'
  or coalesce(p#>>'{identity,id}','') !~* '^HC-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  then return false;end if;
 if jsonb_typeof(profile->'album') is distinct from 'array' then return false;end if;
 if jsonb_array_length(profile->'album')>250000 or exists(
  select 1 from jsonb_array_elements(profile->'album') c
  where jsonb_typeof(c)<>'string' or (c#>>'{}') not in ('alberto-nunez-feijoo','angela-merkel','barack-obama','boris-johnson','carles-puigdemont','donald-trump','emmanuel-macron','isabel-diaz-ayuso','mariano-rajoy','pedro-sanchez','vladimir-putin','yolanda-diaz','ada-colau','andres-manuel-lopez-obrador','bernie-sanders','christine-lagarde','cristina-fernandez-de-kirchner','felipe-gonzalez','gabriel-rufian','giorgia-meloni','hillary-clinton','javier-milei','joe-biden','jose-maria-aznar','justin-trudeau','kamala-harris','marine-le-pen','matteo-salvini','nicolas-maduro','nigel-farage','pablo-iglesias','recep-tayyip-erdogan','salvador-illa','santiago-abascal','ursula-von-der-leyen','viktor-orban','adriana-lastra','albert-rivera','alberto-garzon','ana-botella','anna-gabriel','begona-villacis','cayetana-alvarez-de-toledo','cristina-cifuentes','cristobal-montoro','dolores-de-cospedal','edmundo-bal','esperanza-aguirre','ines-arrimadas','inigo-errejon','irene-montero','isabel-cela','jordi-turull','jorge-fernandez-diaz','jose-luis-rodriguez-zapatero','jose-manuel-garcia-margallo','julio-anguita','laura-borras','luis-de-guindos','maria-jesus-montero','marta-rovira','miquel-iceta','miriam-nogueras','monica-garcia','nadia-calvino','oriol-junqueras','pablo-casado','pablo-echenique','pilar-alegria','rocio-monasterio','sara-gimenez','soraya-saenz-de-santamaria','alfonso-alonso','alvaro-nadal','ana-pastor','andrea-levy','antonio-maillo','borja-semper','carlos-floriano','carme-forcadell','carmen-calvo','celia-villalobos','cuca-gamarra','dolors-montserrat','elias-bendodo','emiliano-garcia-page','esteban-gonzalez-pons','fatima-banez','fernando-grande-marlaska','inigo-mendez-de-vigo','isabel-garcia-tejerina','jaime-de-olano','javier-maroto','jordi-sanchez','jose-luis-abalos','josep-rull','juan-espadas','juan-vicente-herrera','marta-lois','marta-rivera-de-la-cruz','meritxell-batet','miguel-arias-canete','nacho-alvarez','oscar-puente','pablo-cambronero','pablo-montesinos','patxi-lopez','pere-aragones','pilar-llop','quim-torra','rafael-catala','rafael-hernando','raquel-sanchez','raul-romeva','reyes-maroto','roger-torrent','susana-diaz','teodoro-garcia-egea','toni-canto','toni-comin')
 ) then return false;end if;
 if profile ? 'actionAlbum' then
  if jsonb_typeof(profile->'actionAlbum') is distinct from 'array' then return false;end if;
  if jsonb_array_length(profile->'actionAlbum')>250000 or exists(
   select 1 from jsonb_array_elements(profile->'actionAlbum') c
   where jsonb_typeof(c)<>'string' or (c#>>'{}') not in ('turno-de-palabra','replica','receso','disciplina-de-grupo','pregunta-incomoda','pausa-parlamentaria','escudo-parlamentario','interpelacion','debate-abierto','mocion-de-censura','mayoria-reforzada','acuerdo-de-estado')
  ) then return false;end if;
 end if;
 foreach k in array array['fs','elo','w','l','lastDaily','lastWeekly','dtWins'] loop
  if jsonb_typeof(profile->k) is distinct from 'number' then return false;end if;
  n:=(profile->>k)::numeric;
  if n<0 or n>9007199254740991 or trunc(n)<>n then return false;end if;
 end loop;
 if jsonb_typeof(profile->'dtGoldUnlocked') is distinct from 'boolean'
  or jsonb_typeof(profile->'dtGoldActive') is distinct from 'boolean'
  then return false;end if;
 if (profile->>'dtGoldActive')::boolean and not (profile->>'dtGoldUnlocked')::boolean then return false;end if;
 if profile ? 'xp' then
  if jsonb_typeof(profile->'xp') is distinct from 'number' then return false;end if;
  n:=(profile->>'xp')::numeric;
  if n<0 or n>2008644 or trunc(n)<>n then return false;end if;
 end if;
 return true;
end $$;
revoke all on function public.hemicycle_legacy_import_valid(jsonb) from public,anon,authenticated;
grant execute on function public.hemicycle_legacy_import_valid(jsonb) to service_role;

-- Los bloqueos siempre empiezan por la nube. El hash evita aprobar una solicitud
-- distinta de la que se leyó; source_id UNIQUE impide vincularla a dos cuentas.
create or replace function public.hemicycle_accept_legacy_import(p_actor uuid,p_hash text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare saved public.hemicycle_cloud_saves; request public.hemicycle_legacy_import_requests;
begin
 perform pg_advisory_xact_lock(31,1011);
 if p_actor is null or not exists(select 1 from auth.users where id=p_actor) then raise exception 'Cuenta no válida.';end if;
 insert into public.hemicycle_cloud_saves(user_id) values(p_actor) on conflict do nothing;
 select * into saved from public.hemicycle_cloud_saves where user_id=p_actor for update;
 select * into request from public.hemicycle_legacy_import_requests where user_id=p_actor for update;
 if not found or md5(request.payload::text) is distinct from p_hash then return jsonb_build_object('status','changed');end if;
 if request.approved_at is not null then
  if saved.payload is null then return jsonb_build_object('status','consumed');end if;
  return jsonb_build_object('status','approved','alreadyApproved',true);
 end if;
 if exists(select 1 from public.hemicycle_import_reviews where user_id=p_actor and payload_hash=p_hash and decision='reject') then return jsonb_build_object('status','rejected');end if;
 if not public.hemicycle_legacy_import_valid(request.payload) then return jsonb_build_object('status','invalid');end if;
 if saved.payload is not null then return jsonb_build_object('status','existing_cloud');end if;
 begin
  perform public.hemicycle_economy_bootstrap(p_actor,request.payload);
 exception when unique_violation then return jsonb_build_object('status','source_conflict');
 end;
 select * into saved from public.hemicycle_cloud_saves where user_id=p_actor;
 if saved.payload is distinct from request.payload then raise exception 'La copia no se ha podido importar íntegra.';end if;
 update public.hemicycle_legacy_import_requests set approved_at=now() where user_id=p_actor;
 insert into public.hemicycle_import_reviews(user_id,payload_hash,decision,reason,reviewed_by)
 values(p_actor,p_hash,'approve','Importación inicial automática. Política autorizada por el propietario: automatic-local-v1.',current_user)
 on conflict(user_id,payload_hash) do nothing;
 return jsonb_build_object('status','approved','alreadyApproved',false);
end $$;
revoke all on function public.hemicycle_accept_legacy_import(uuid,text) from public,anon,authenticated;
grant execute on function public.hemicycle_accept_legacy_import(uuid,text) to service_role;

-- Conserva la ruta RPC existente: clientes anteriores pueden volver a Comprobar.
create or replace function public.hemicycle_request_legacy_import(p_actor uuid,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare saved public.hemicycle_cloud_saves; request public.hemicycle_legacy_import_requests;
begin
 perform pg_advisory_xact_lock(31,1011);
 if p_actor is null or not exists(select 1 from auth.users where id=p_actor) then raise exception 'Cuenta no válida.';end if;
 if not public.hemicycle_legacy_import_valid(p_payload) then return jsonb_build_object('status','invalid');end if;
 insert into public.hemicycle_cloud_saves(user_id) values(p_actor) on conflict do nothing;
 select * into saved from public.hemicycle_cloud_saves where user_id=p_actor for update;
 select * into request from public.hemicycle_legacy_import_requests where user_id=p_actor for update;
 if request.approved_at is not null then
  if saved.payload is null then return jsonb_build_object('status','consumed');end if;
  if (request.payload-array['exportedAt','gameVersion'])=(p_payload-array['exportedAt','gameVersion']) then
   return jsonb_build_object('status','approved','alreadyApproved',true);
  end if;
  return jsonb_build_object('status','existing_cloud');
 end if;
 if saved.payload is not null then return jsonb_build_object('status','existing_cloud');end if;
 insert into public.hemicycle_legacy_import_requests(user_id,payload) values(p_actor,p_payload)
 on conflict(user_id) do update set payload=excluded.payload,submitted_at=now();
 return public.hemicycle_accept_legacy_import(p_actor,md5(p_payload::text));
end $$;
revoke all on function public.hemicycle_request_legacy_import(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.hemicycle_request_legacy_import(uuid,jsonb) to service_role;

create or replace function public.hemicycle_accept_pending_imports()
returns jsonb language plpgsql security definer set search_path='' as $$
declare request record; response jsonb; approved integer:=0; skipped jsonb:='{}'; status text;
begin
 perform pg_advisory_xact_lock(31,1011);
 for request in select user_id,md5(payload::text) as hash from public.hemicycle_legacy_import_requests where approved_at is null order by submitted_at,user_id loop
  response:=public.hemicycle_accept_legacy_import(request.user_id,request.hash);status:=response->>'status';
  if status='approved' and response->>'alreadyApproved'='false' then approved:=approved+1;
  elsif status<>'approved' then skipped:=jsonb_set(skipped,array[status],to_jsonb(coalesce((skipped->>status)::integer,0)+1));end if;
 end loop;
 return jsonb_build_object('approved',approved,'skipped',skipped);
end $$;
revoke all on function public.hemicycle_accept_pending_imports() from public,anon,authenticated;
grant execute on function public.hemicycle_accept_pending_imports() to service_role;

-- Procesa las pendientes en esta misma ejecución. Solo devuelve cantidades.
select public.hemicycle_accept_pending_imports() as migration_summary;
commit;
