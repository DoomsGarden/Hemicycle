-- CANDIDATA EN REVISIÓN. NO EJECUTAR ANTES DE REVISAR EL CLIENTE Y EL SERVICIO.
-- Conserva los respaldos existentes. No cambia la temporada ni reinicia cuentas.
begin;
create table if not exists public.hemicycle_economy_state(id boolean primary key default true check(id),revision bigint not null default 0,data jsonb not null default '{"players":[],"listings":[],"trades":[],"quotes":[],"receipts":[]}'::jsonb);
insert into public.hemicycle_economy_state(id) values(true) on conflict do nothing;
create table if not exists public.hemicycle_economy_operations(user_id uuid not null references auth.users(id),operation_id uuid not null,request jsonb not null,result jsonb not null,created_at timestamptz not null default now(),primary key(user_id,operation_id));
create table if not exists public.hemicycle_offline_tickets(id uuid primary key, user_id uuid not null references auth.users(id),seed bigint not null,profile jsonb not null,issued_at timestamptz not null default now(),expires_at timestamptz not null default now()+interval '7 days',result jsonb);
alter table public.hemicycle_economy_state enable row level security;
alter table public.hemicycle_economy_operations enable row level security;
alter table public.hemicycle_offline_tickets enable row level security;
revoke all on public.hemicycle_economy_state,public.hemicycle_economy_operations,public.hemicycle_offline_tickets from public,anon,authenticated;
create or replace function public.hemicycle_economy_context(p_actor uuid,p_operation_id uuid default null,p_request jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare market public.hemicycle_economy_state; old public.hemicycle_economy_operations; accounts jsonb; peers uuid[]; ticket public.hemicycle_offline_tickets;
begin
 if p_actor is null or not exists(select 1 from auth.users where id=p_actor) then raise exception 'Cuenta no válida.';end if;
 select * into old from public.hemicycle_economy_operations where user_id=p_actor and operation_id=p_operation_id;
 if found then
  if old.request is distinct from p_request then raise exception 'Operación reutilizada con otros datos.';end if;
  return jsonb_build_object('processed',true,'result',old.result);
 end if;
 if p_request->>'type'='offline-settle' then
 select * into ticket from public.hemicycle_offline_tickets where id=(p_request->>'ticketId')::uuid and user_id=p_actor;
 if not found or ticket.expires_at<=now() then raise exception 'Partida descargada no disponible.';end if;
 end if;
 select * into market from public.hemicycle_economy_state where id;
 -- Solo perfiles implicados en ofertas, propuestas o participantes que han aceptado aparecer.
 select array_agg(distinct id::uuid) into peers from (
  select p_actor::text as id union all select p_request->>'recipient'
  union all select x->>'id' from jsonb_array_elements(market.data->'players') x where (x->>'visible')::boolean
  union all select x->>'seller' from jsonb_array_elements(market.data->'listings') x where x->>'status'='active'
  union all select x->>'proposer' from jsonb_array_elements(market.data->'trades') x where x->>'status'='pending'
  union all select x->>'recipient' from jsonb_array_elements(market.data->'trades') x where x->>'status'='pending'
 ) x where id is not null;
 select coalesce(jsonb_object_agg(s.user_id::text,jsonb_build_object('revision',s.revision,'payload',s.payload,'name',coalesce(n.nickname,'Jugador #'||upper(left(s.user_id::text,6))))),'{}') into accounts
 from public.hemicycle_cloud_saves s left join public.hemicycle_account_profiles n on n.user_id=s.user_id where s.user_id=any(peers) and s.payload is not null;
 return jsonb_build_object('ticket',case when ticket.id is not null then jsonb_build_object('id',ticket.id,'seed',ticket.seed,'profile',ticket.profile,'rules','offline1','expires',floor(extract(epoch from ticket.expires_at)*1000),'result',ticket.result) else null end,'version',market.revision,'market',market.data,'accounts',accounts,'now',floor(extract(epoch from clock_timestamp())*1000));
end $$;
create or replace function public.hemicycle_economy_commit(p_actor uuid,p_operation_id uuid,p_request jsonb,p_version bigint,p_market jsonb,p_updates jsonb,p_result jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
declare m public.hemicycle_economy_state; old public.hemicycle_economy_operations; u jsonb; stored public.hemicycle_cloud_saves;
begin
 select * into m from public.hemicycle_economy_state where id for update;
 select * into old from public.hemicycle_economy_operations where user_id=p_actor and operation_id=p_operation_id;
 if found then if old.request is distinct from p_request then raise exception 'Operación reutilizada con otros datos.';end if;return true;end if;
 if m.revision<>p_version then return false;end if;
 if p_operation_id is null or jsonb_typeof(p_updates)<>'array' or jsonb_typeof(p_market)<>'object' then raise exception 'Operación no válida.';end if;
 if p_request->>'type'='offline-settle' then
 perform 1 from public.hemicycle_online_rankings where user_id=p_actor for update;
 perform 1 from public.hemicycle_offline_tickets where id=(p_request->>'ticketId')::uuid and user_id=p_actor for update;
 if not found or exists(select 1 from public.hemicycle_offline_tickets where id=(p_request->>'ticketId')::uuid and (result is not null or expires_at<=now())) then raise exception 'Partida descargada ya procesada o caducada.';end if;
 end if;
 perform 1 from public.hemicycle_cloud_saves where user_id in(select (value->>'userId')::uuid from jsonb_array_elements(p_updates)) order by user_id for update;
 for u in select value from jsonb_array_elements(p_updates) loop
  select * into stored from public.hemicycle_cloud_saves where user_id=(u->>'userId')::uuid;
  if not found or stored.revision<>(u->>'revision')::bigint then return false;end if;
  if stored.source_id is distinct from u#>>'{payload,identity,id}' then raise exception 'El ID vinculado no coincide.';end if;
 end loop;
 for u in select value from jsonb_array_elements(p_updates) loop
  update public.hemicycle_cloud_saves set payload=u->'payload',revision=revision+1,last_operation_id=p_operation_id,updated_at=now() where user_id=(u->>'userId')::uuid;
 end loop;
 if p_request->>'type'='offline-settle' then
 update public.hemicycle_offline_tickets set result=p_result where id=(p_request->>'ticketId')::uuid and user_id=p_actor;
 if p_result->>'mode'='ranked' then
 insert into public.hemicycle_online_rankings(user_id,elo,wins,losses) values(p_actor,(p_result->>'eloAfter')::bigint,case when (p_result->>'win')::boolean then 1 else 0 end,case when (p_result->>'win')::boolean then 0 else 1 end) on conflict(user_id) do update set elo=excluded.elo,wins=public.hemicycle_online_rankings.wins+excluded.wins,losses=public.hemicycle_online_rankings.losses+excluded.losses;
 end if;
 end if;
 update public.hemicycle_economy_state set revision=revision+1,data=p_market where id;
 insert into public.hemicycle_economy_operations(user_id,operation_id,request,result) values(p_actor,p_operation_id,p_request,p_result);
 return true;
end $$;
-- El guardado general solo cambia preferencias. Los recursos vienen de operaciones del servicio.
do $$ begin
 if to_regprocedure('public.hemicycle_put_cloud_save_legacy(jsonb,bigint,uuid)') is null then
  alter function public.hemicycle_put_cloud_save(jsonb,bigint,uuid) rename to hemicycle_put_cloud_save_legacy;
 end if;
end $$;
revoke all on function public.hemicycle_put_cloud_save_legacy(jsonb,bigint,uuid) from public,anon,authenticated;
create or replace function public.hemicycle_put_cloud_save(p_payload jsonb,p_expected_revision bigint,p_operation_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare stored public.hemicycle_cloud_saves; original jsonb; proposed jsonb; mastery jsonb; item jsonb;
begin
 if auth.uid() is null then raise exception 'Inicia sesión.' using errcode='28000';end if;
 select * into stored from public.hemicycle_cloud_saves where user_id=auth.uid() for update;
 if stored.payload is null then raise exception 'Inicializa el progreso desde el servicio de cuenta.' using errcode='22023';end if;
 if stored.revision<>p_expected_revision and stored.last_operation_id is distinct from p_operation_id then return jsonb_build_object('status','conflict','save',public.hemicycle_get_cloud_save());end if;
 original:=stored.payload->'profile';proposed:=p_payload->'profile';
 if (original-array['cabinets','battleTheme','dtGoldActive','leaderMastery']) is distinct from (proposed-array['cabinets','battleTheme','dtGoldActive','leaderMastery'])
  or stored.payload->'ranked' is distinct from p_payload->'ranked' or stored.payload->'league' is distinct from p_payload->'league'
  or ((original->'leaderMastery')-'active') is distinct from ((proposed->'leaderMastery')-'active') then
  raise exception 'Los recursos y resultados se validan en el servidor. Sincroniza las operaciones pendientes.' using errcode='22023';
 end if;
 if coalesce((proposed->>'dtGoldActive')::boolean,false) and not coalesce((original->>'dtGoldUnlocked')::boolean,false) then raise exception 'Edición no disponible.' using errcode='22023';end if;
 mastery:=proposed->'leaderMastery';
 if coalesce((proposed->>'dtGoldActive')::boolean,false) and coalesce(mastery->'active','[]') ? 'donald-trump' then raise exception 'Elige una sola edición.' using errcode='22023';end if;
 if mastery is not null and exists(select 1 from jsonb_array_elements_text(coalesce(mastery->'active','[]')) x where not (coalesce(original#>'{leaderMastery,unlocked}','[]') ? x)) then raise exception 'Edición no disponible.' using errcode='22023';end if;
 if proposed->'cabinets' is not null and (jsonb_typeof(proposed#>'{cabinets,slots}') is distinct from 'array' or jsonb_array_length(proposed#>'{cabinets,slots}')<>5 or (proposed#>>'{cabinets,selected}') !~ '^[0-4]$') then raise exception 'Gabinetes no válidos.' using errcode='22023';end if;
 if original->'cabinets' is distinct from proposed->'cabinets' and jsonb_typeof(proposed#>'{cabinets,slots}')='array' then
  for item in select value from jsonb_array_elements(proposed#>'{cabinets,slots}') loop
   if jsonb_typeof(item->'ids') is distinct from 'array' or jsonb_array_length(item->'ids') not in (0,5) or (select count(distinct x) from jsonb_array_elements_text(item->'ids') x)<>jsonb_array_length(item->'ids') or (jsonb_array_length(item->'ids')>0 and not (item->'ids' ? (item->>'leader'))) or (jsonb_array_length(item->'ids')=0 and item->>'leader' is not null) or (item->'actions' is not null and (jsonb_typeof(item->'actions') is distinct from 'array' or jsonb_array_length(item->'actions')>2 or (select count(distinct x) from jsonb_array_elements_text(item->'actions') x)<>jsonb_array_length(item->'actions'))) then raise exception 'Gabinete no válido.' using errcode='22023';end if;
   if exists(select 1 from jsonb_array_elements_text(coalesce(item->'ids','[]')) x where not (original->'album' ? x))
    or exists(select 1 from jsonb_array_elements_text(coalesce(item->'actions','[]')) x where not (coalesce(original->'actionAlbum','[]') ? x)) then raise exception 'El gabinete contiene cromos que no posees.' using errcode='22023';end if;
  end loop;
 end if;
 return public.hemicycle_put_cloud_save_legacy(p_payload,p_expected_revision,p_operation_id);
end $$;
revoke all on function public.hemicycle_put_cloud_save(jsonb,bigint,uuid) from public,anon;
grant execute on function public.hemicycle_put_cloud_save(jsonb,bigint,uuid) to authenticated;
revoke all on function public.hemicycle_economy_context(uuid,uuid,jsonb),public.hemicycle_economy_commit(uuid,uuid,jsonb,bigint,jsonb,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.hemicycle_economy_context(uuid,uuid,jsonb),public.hemicycle_economy_commit(uuid,uuid,jsonb,bigint,jsonb,jsonb,jsonb) to service_role;
create or replace function public.hemicycle_economy_bootstrap(p_actor uuid,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare saved public.hemicycle_cloud_saves;
begin
 if p_actor is null then raise exception 'Cuenta no válida.';end if;
 insert into public.hemicycle_cloud_saves(user_id) values(p_actor) on conflict do nothing;
 select * into saved from public.hemicycle_cloud_saves where user_id=p_actor for update;
 if saved.payload is null then
  update public.hemicycle_cloud_saves set payload=p_payload,source_id=p_payload#>>'{identity,id}',revision=1,last_operation_id=gen_random_uuid(),updated_at=now() where user_id=p_actor;
 end if;
 return jsonb_build_object('initialized',true);
end $$;
create or replace function public.hemicycle_offline_download(p_actor uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare saved public.hemicycle_cloud_saves; n integer; tickets jsonb; context jsonb; total integer;
begin
 select * into saved from public.hemicycle_cloud_saves where user_id=p_actor for update;
 if saved.payload is null then raise exception 'Activa primero la nube.';end if;
 context:=jsonb_build_object('leagueDiv',coalesce((saved.payload#>>'{league,div}')::integer,3),'album',(select jsonb_agg(id order by id) from(select distinct value as id from jsonb_array_elements(saved.payload#>'{profile,album}')) x),'actionAlbum',coalesce((select jsonb_agg(id order by id) from(select distinct value as id from jsonb_array_elements(coalesce(saved.payload#>'{profile,actionAlbum}','[]'))) x),'[]'),'elo',saved.payload#>'{profile,elo}','dtGoldActive',saved.payload#>'{profile,dtGoldActive}','dtGoldUnlocked',saved.payload#>'{profile,dtGoldUnlocked}');
 if saved.payload#>'{profile,leaderMastery}' is not null then context:=context||jsonb_build_object('leaderMastery',saved.payload#>'{profile,leaderMastery}');end if;
 select count(*) into n from public.hemicycle_offline_tickets where user_id=p_actor and result is null and expires_at>now() and profile=context;
 select count(*) into total from public.hemicycle_offline_tickets where user_id=p_actor and result is null and expires_at>now();
 if n<10 and total<100 then
  insert into public.hemicycle_offline_tickets(id,user_id,seed,profile)
   select gen_random_uuid(),p_actor,floor(random()*4294967296)::bigint,context from generate_series(1,least(10-n,100-total));
 end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'seed',seed,'profile',profile,'rules','offline1','expires',floor(extract(epoch from expires_at)*1000)) order by issued_at desc,id),'[]') into tickets from public.hemicycle_offline_tickets where user_id=p_actor and result is null and expires_at>now();
 return tickets;
end $$;
revoke all on function public.hemicycle_economy_bootstrap(uuid,jsonb),public.hemicycle_offline_download(uuid) from public,anon,authenticated;
grant execute on function public.hemicycle_economy_bootstrap(uuid,jsonb),public.hemicycle_offline_download(uuid) to service_role;

-- Solicitudes privadas para migrar progreso local anterior. Nunca se aprueban automáticamente.
create table if not exists public.hemicycle_legacy_import_requests(user_id uuid primary key references auth.users(id),payload jsonb not null,submitted_at timestamptz not null default now(),approved_at timestamptz);
alter table public.hemicycle_legacy_import_requests enable row level security;
revoke all on public.hemicycle_legacy_import_requests from public,anon,authenticated;
create or replace function public.hemicycle_request_legacy_import(p_actor uuid,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.hemicycle_cloud_saves where user_id=p_actor and payload is not null) then raise exception 'Esta cuenta ya tiene un respaldo vinculado. Recupéralo primero.';end if;
 insert into public.hemicycle_legacy_import_requests(user_id,payload) values(p_actor,p_payload) on conflict(user_id) do update set payload=excluded.payload,submitted_at=now() where public.hemicycle_legacy_import_requests.approved_at is null;
 return jsonb_build_object('status','pending');
end $$;
revoke all on function public.hemicycle_request_legacy_import(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.hemicycle_request_legacy_import(uuid,jsonb) to service_role;

create or replace function public.hemicycle_combat_commit_progress(
 p_room_id uuid,p_actor uuid,p_expected_revision bigint,p_state jsonb,
 p_operation_id uuid,p_request jsonb,p_progress jsonb
) returns boolean language plpgsql security definer set search_path='' as $$
declare r public.hemicycle_online_rooms; item jsonb; saved public.hemicycle_cloud_saves; expected_user uuid; i integer; ok boolean;
begin
 select * into r from public.hemicycle_online_rooms where id=p_room_id for update;
 if not found or r.cancelled or p_actor is null or (p_actor<>r.host_id and p_actor is distinct from r.guest_id) then raise exception 'Sala no disponible.';end if;
 if p_state->>'status' is distinct from 'finished' or jsonb_typeof(p_progress) is distinct from 'array' or jsonb_array_length(p_progress)<>2 then raise exception 'Progreso no válido.';end if;
 -- Mismo orden de bloqueos que la liquidación de Elo; evita invertirlos con otro cierre.
 perform 1 from public.hemicycle_online_rankings where user_id in (r.host_id,r.guest_id) order by user_id for update;
 perform 1 from public.hemicycle_cloud_saves where user_id in (r.host_id,r.guest_id) order by user_id for update;
 for i in 0..1 loop
  item:=p_progress->i;expected_user:=case when i=0 then r.host_id else r.guest_id end;
  if item is null or item='null'::jsonb then continue;end if;
  if expected_user is null or item->>'userId' is distinct from expected_user::text or jsonb_typeof(item->'objectives') is distinct from 'object' then raise exception 'Jugador no válido.';end if;
  if exists(select 1 from public.hemicycle_combat_progress where room_id=r.id and user_id=expected_user) then continue;end if;
  select * into saved from public.hemicycle_cloud_saves where user_id=expected_user;
  if not found or saved.revision<>(item->>'revision')::bigint then return false;end if;
 end loop;
 ok:=public.hemicycle_combat_commit(p_room_id,p_actor,p_expected_revision,p_state,p_operation_id,p_request);
 if not ok then return false;end if;
 for i in 0..1 loop
  item:=p_progress->i;if item is null or item='null'::jsonb then continue;end if;
  expected_user:=case when i=0 then r.host_id else r.guest_id end;
  insert into public.hemicycle_combat_progress(room_id,user_id) values(r.id,expected_user) on conflict do nothing;
  if found then
   if item->>'dtWins' is not null then
    update public.hemicycle_cloud_saves set payload=jsonb_set(jsonb_set(payload,'{profile,dtWins}',to_jsonb((item->>'dtWins')::bigint)),'{profile,dtGoldUnlocked}',to_jsonb((item->>'dtGoldUnlocked')::boolean)) where user_id=expected_user;
   end if;
   update public.hemicycle_cloud_saves set payload=jsonb_set(
    case when item->'leaderMastery' is null or item->'leaderMastery'='null'::jsonb then payload
    else jsonb_set(payload,'{profile,leaderMastery}',item->'leaderMastery') end,
    '{profile,objectives}',item->'objectives'),revision=revision+1,last_operation_id=gen_random_uuid(),updated_at=now()
    where user_id=expected_user;
  end if;
 end loop;
 return true;
end $$;

commit;
