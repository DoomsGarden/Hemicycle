-- Modos y emparejamiento de PRUEBA. Después de private_combat.sql.
-- Clasificatoria vincula una vez el Elo del respaldo de la cuenta; después lo controla el servidor.
-- Conserva Elo, cromos, FS y logros; no aplica reinicios ni cambios de temporada.
begin;
alter table public.hemicycle_online_rooms add column if not exists mode text not null default 'normal' check(mode in ('normal','rapida','ranked'));
alter table public.hemicycle_online_rooms add column if not exists mode_locked boolean not null default false;
alter table public.hemicycle_online_rooms add column if not exists cancelled boolean not null default false;
create or replace function public.hemicycle_room_view(p_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.hemicycle_online_rooms; actor uuid:=auth.uid();
begin
 if actor is null then raise exception 'Inicia sesión.' using errcode='28000';end if;
 select * into r from public.hemicycle_online_rooms where id=p_id;
 if not found or (actor<>r.host_id and actor is distinct from r.guest_id) then raise exception 'Sala no disponible.' using errcode='42501';end if;
 return jsonb_build_object('id',r.id,'mode',r.mode,'code',case when actor=r.host_id then r.code else null end,'role',case when actor=r.host_id then 'host' else 'guest' end,'status',case when r.cancelled then 'expired' when exists(select 1 from public.hemicycle_test_combats where room_id=r.id and state->>'status' in ('active','finished')) then 'paired' when r.expires_at<=now() then 'expired' when r.guest_id is null then 'waiting' else 'paired' end,'expiresAt',r.expires_at,'combatEnabled',false);
end $$;
create table if not exists public.hemicycle_online_rankings(user_id uuid primary key references auth.users(id),elo bigint not null check(elo>=0),wins integer not null default 0,losses integer not null default 0);
create table if not exists public.hemicycle_test_queue(user_id uuid primary key references auth.users(id),mode text not null check(mode in ('normal','rapida','ranked')),queued_at timestamptz not null default now(),heartbeat timestamptz not null default now(),room_id uuid references public.hemicycle_online_rooms(id));
create table if not exists public.hemicycle_test_results(room_id uuid primary key references public.hemicycle_online_rooms(id),winner uuid references auth.users(id),host_delta integer not null,guest_delta integer not null);
alter table public.hemicycle_online_rankings enable row level security;
alter table public.hemicycle_test_queue enable row level security;
alter table public.hemicycle_test_results enable row level security;
revoke all on public.hemicycle_online_rankings,public.hemicycle_test_queue,public.hemicycle_test_results from public,anon,authenticated;
create or replace function public.hemicycle_test_band(p_seconds numeric) returns bigint language sql immutable set search_path='' as $$select case when p_seconds<30 then 250 when p_seconds<60 then 500 when p_seconds<90 then 1000 when p_seconds<120 then 2500 else 9007199254740991 end$$;
revoke all on function public.hemicycle_test_band(numeric) from public,anon,authenticated;
create or replace function public.hemicycle_test_matchmake(p_mode text) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); own public.hemicycle_test_queue; peer public.hemicycle_test_queue; r public.hemicycle_online_rooms; matched_id uuid; rating bigint; status text; age numeric; result jsonb;
begin
 if actor is null then raise exception 'Inicia sesión.';end if;
 if p_mode is null or p_mode not in ('normal','rapida','ranked') then raise exception 'Modo no válido.';end if;
 -- Serializa el emparejamiento; cada cuenta tiene una única entrada.
 perform pg_advisory_xact_lock(744320241);
 select elo into rating from public.hemicycle_online_rankings where user_id=actor;
 select * into own from public.hemicycle_test_queue where user_id=actor;
 if found and own.room_id is not null then
  select * into r from public.hemicycle_online_rooms where id=own.room_id;
  select state->>'status' into status from public.hemicycle_test_combats where public.hemicycle_test_combats.room_id=own.room_id;
  if not r.cancelled and status is distinct from 'finished' and (r.expires_at>now() or status='active') then return jsonb_build_object('status','matched','room',public.hemicycle_room_view(r.id),'rating',rating);end if;
  delete from public.hemicycle_test_queue where user_id=actor;
 end if;
 if p_mode='ranked' and not exists(select 1 from public.hemicycle_online_rankings where user_id=actor) then
  -- Única vinculación del progreso ya respaldado. El cliente no aporta el Elo.
  perform 1 from public.hemicycle_cloud_saves where user_id=actor and revision>0 and payload is not null for update;
  if not found then raise exception 'Activa y sincroniza primero el guardado en la nube.';end if;
  insert into public.hemicycle_online_rankings(user_id,elo) select actor,(payload#>>'{profile,elo}')::bigint from public.hemicycle_cloud_saves where user_id=actor on conflict do nothing;
 end if;
 select coalesce((select elo from public.hemicycle_online_rankings where user_id=actor),0) into rating;
 -- Los ausentes dejan de ser candidatos, sin convertirlos en rivales IA.
 delete from public.hemicycle_test_queue where room_id is null and heartbeat<now()-interval '90 seconds';
 insert into public.hemicycle_test_queue(user_id,mode) values(actor,p_mode) on conflict(user_id) do update set heartbeat=now();
 select * into own from public.hemicycle_test_queue where user_id=actor;
 if own.mode<>p_mode then raise exception 'Cancela la búsqueda anterior antes de cambiar de modo.';end if;
 age:=extract(epoch from now()-own.queued_at);
 select q.* into peer from public.hemicycle_test_queue q left join public.hemicycle_online_rankings mm on mm.user_id=q.user_id
 where q.user_id<>actor and q.mode=p_mode and q.room_id is null
 and (p_mode<>'ranked' or abs(mm.elo::bigint-rating)<=least(public.hemicycle_test_band(age),public.hemicycle_test_band(extract(epoch from now()-q.queued_at))))
 order by case when p_mode='ranked' then abs(mm.elo::bigint-rating) else 0 end,q.queued_at,q.user_id limit 1 for update of q;
 if found then
  insert into public.hemicycle_online_rooms(host_id,guest_id,request_id,mode,mode_locked,expires_at) values(peer.user_id,actor,gen_random_uuid(),p_mode,true,now()+interval '2 minutes') returning id into matched_id;
  update public.hemicycle_test_queue q set room_id=matched_id where q.user_id in (actor,peer.user_id);
  return jsonb_build_object('status','matched','room',public.hemicycle_room_view(matched_id),'rating',rating);
 end if;
 return jsonb_build_object('status','waiting','mode',p_mode,'queuedAt',own.queued_at,'band',case when age>=120 then null else public.hemicycle_test_band(age) end,'rating',rating);
end $$;
create or replace function public.hemicycle_test_queue_cancel() returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); own public.hemicycle_test_queue; r public.hemicycle_online_rooms; status text;
begin
 if actor is null then raise exception 'Inicia sesión.';end if;
 perform pg_advisory_xact_lock(744320241);
 select * into own from public.hemicycle_test_queue where user_id=actor;
 if own.room_id is not null then
  select * into r from public.hemicycle_online_rooms where id=own.room_id for update;
  select state->>'status' into status from public.hemicycle_test_combats where room_id=r.id;
  if status='finished' then delete from public.hemicycle_test_queue where user_id=actor;return jsonb_build_object('status','cancelled');end if;
  if status='active' then raise exception 'La partida ya empezó. Usa Abandonar en el combate.';end if;
  update public.hemicycle_online_rooms set cancelled=true where id=r.id;
  delete from public.hemicycle_test_queue where room_id=r.id;
 else delete from public.hemicycle_test_queue where user_id=actor;
 end if;
 return jsonb_build_object('status','cancelled');
end $$;
create or replace function public.hemicycle_test_room_mode(p_request_id uuid,p_mode text,p_player_id uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); result jsonb; r public.hemicycle_online_rooms;
begin
 if actor is null then raise exception 'Inicia sesión.';end if;
 if p_mode is null or p_mode not in ('normal','rapida') then raise exception 'Clasificatoria requiere cola.';end if;
 if p_player_id is null then result:=public.hemicycle_room_create(p_request_id);else result:=public.hemicycle_test_invite(p_player_id,p_request_id);end if;
 select * into r from public.hemicycle_online_rooms where id=(result->>'id')::uuid for update;
 if r.mode_locked and r.mode<>p_mode then raise exception 'La partida ya está preparada.';end if;
 update public.hemicycle_online_rooms set mode=p_mode,mode_locked=true where id=r.id;
 return public.hemicycle_room_view(r.id);
end $$;
revoke all on function public.hemicycle_test_matchmake(text),public.hemicycle_test_queue_cancel(),public.hemicycle_test_room_mode(uuid,text,uuid) from public,anon;
grant execute on function public.hemicycle_test_matchmake(text),public.hemicycle_test_queue_cancel(),public.hemicycle_test_room_mode(uuid,text,uuid) to authenticated;

create or replace function public.hemicycle_ranked_apply(p_actor uuid,p_elo bigint,p_won boolean) returns void language plpgsql security definer set search_path='' as $$
declare save public.hemicycle_cloud_saves; next_payload jsonb; ranked jsonb; highest integer; step integer; promotion integer; idx integer; sid integer; rewards jsonb;
begin
 select * into save from public.hemicycle_cloud_saves where user_id=p_actor for update;
 if not found or save.payload is null then raise exception 'Falta el guardado vinculado.';end if;
 next_payload:=save.payload;ranked:=next_payload->'ranked';
 if ranked is null or ranked='null'::jsonb then ranked:=jsonb_build_object('season',1,'highest',least(59,floor((next_payload#>>'{profile,elo}')::numeric/250)),'promotions',0,'rewards','[]'::jsonb,'lastDemotion',null);end if;
 highest:=(ranked->>'highest')::integer;step:=least(59,floor(p_elo::numeric/250));promotion:=(ranked->>'promotions')::integer;sid:=(ranked->>'season')::integer;rewards:=ranked->'rewards';
 if step>highest then
  for idx in highest+1..step loop
   promotion:=promotion+1;
   rewards:=rewards||jsonb_build_array(jsonb_build_object('id','S'||sid||'-D'||idx||'-comun','season',sid,'kind','comun','division',idx,'claimed',false));
   if promotion%5=0 then rewards:=rewards||jsonb_build_array(jsonb_build_object('id','S'||sid||'-D'||idx||'-raro','season',sid,'kind','raro','division',idx,'claimed',false));end if;
   if idx%10=0 then rewards:=rewards||jsonb_build_array(jsonb_build_object('id','S'||sid||'-D'||idx||'-legendario','season',sid,'kind','legendario','division',idx,'claimed',false));end if;
  end loop;
  ranked:=ranked||jsonb_build_object('highest',step,'promotions',promotion,'rewards',rewards);
 end if;
 next_payload:=jsonb_set(next_payload,'{ranked}',ranked);
 next_payload:=jsonb_set(next_payload,'{profile,elo}',to_jsonb(p_elo));
 if p_won then next_payload:=jsonb_set(next_payload,'{profile,w}',to_jsonb((next_payload#>>'{profile,w}')::bigint+1));else next_payload:=jsonb_set(next_payload,'{profile,l}',to_jsonb((next_payload#>>'{profile,l}')::bigint+1));end if;
 update public.hemicycle_cloud_saves set payload=next_payload,revision=revision+1,last_operation_id=gen_random_uuid(),updated_at=now() where user_id=p_actor;
end $$;
revoke all on function public.hemicycle_ranked_apply(uuid,bigint,boolean) from public,anon,authenticated;

create or replace function public.hemicycle_combat_load(p_room_id uuid,p_actor uuid,p_operation_id uuid default null,p_request jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.hemicycle_online_rooms; g public.hemicycle_test_combats; old jsonb; done boolean;
begin
 select * into r from public.hemicycle_online_rooms where id=p_room_id;
 if not found or r.cancelled or p_actor is null or (p_actor<>r.host_id and p_actor is distinct from r.guest_id) then raise exception 'Sala no disponible.';end if;
 if r.guest_id is null then raise exception 'Falta el segundo jugador.';end if;
 select * into g from public.hemicycle_test_combats where room_id=p_room_id;
 if (g.state is null or g.state->>'status'='preparing') and r.expires_at<=now() then raise exception 'La sala ha caducado.';end if;
 select request into old from public.hemicycle_test_combat_operations where room_id=p_room_id and actor=p_actor and operation_id=p_operation_id;
 done:=found;
 if done and old is distinct from p_request then raise exception 'Operación reutilizada con otros datos.';end if;
 return jsonb_build_object('mode',r.mode,'rating',(select elo from public.hemicycle_online_rankings where user_id=p_actor),'side',case when p_actor=r.host_id then 0 else 1 end,'revision',coalesce(g.revision,0),'state',g.state,'processed',done,'now',floor(extract(epoch from clock_timestamp())*1000));
end $$;
create or replace function public.hemicycle_combat_commit(p_room_id uuid,p_actor uuid,p_expected_revision bigint,p_state jsonb,p_operation_id uuid,p_request jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
declare existing bigint; r public.hemicycle_online_rooms; old jsonb;
begin
 select * into r from public.hemicycle_online_rooms where id=p_room_id for update;
 if not found or r.cancelled or p_actor is null or (p_actor<>r.host_id and p_actor is distinct from r.guest_id) or r.guest_id is null then raise exception 'Sala no disponible.';end if;
 select request into old from public.hemicycle_test_combat_operations where room_id=p_room_id and actor=p_actor and operation_id=p_operation_id;
 if found then
  if old is distinct from p_request then raise exception 'Operación reutilizada con otros datos.';end if;
  return true;
 end if;
 select revision into existing from public.hemicycle_test_combats where room_id=p_room_id;
 if coalesce(existing,0)<>p_expected_revision then return false;end if;
 if existing is null and r.expires_at<=now() then raise exception 'La sala ha caducado.';end if;
 if p_operation_id is null or p_request is null or p_state->>'schema' is distinct from '1' or octet_length(p_state::text)>131072 then raise exception 'Estado no válido.';end if;
 insert into public.hemicycle_test_combats(room_id,revision,state) values(p_room_id,1,p_state)
 on conflict(room_id) do update set revision=public.hemicycle_test_combats.revision+1,state=excluded.state,updated_at=now();
 insert into public.hemicycle_test_combat_operations values(p_room_id,p_actor,p_operation_id,p_request);
 if r.mode='ranked' and p_state->>'status'='finished' then
  if not exists(select 1 from public.hemicycle_online_rankings where user_id=r.host_id) or not exists(select 1 from public.hemicycle_online_rankings where user_id=r.guest_id) then raise exception 'Falta la vinculación de Elo.';end if;
  perform 1 from public.hemicycle_online_rankings where user_id in (r.host_id,r.guest_id) order by user_id for update;
  insert into public.hemicycle_test_results(room_id,winner,host_delta,guest_delta)
  select r.id,case when p_state->>'winner'='0' then r.host_id else r.guest_id end,
   case when p_state->>'winner'='0' then win_delta else -loss_delta end,
   case when p_state->>'winner'='1' then win_delta else -loss_delta end
  from (select 10+floor(15*least(1.0,margin/0.75))::integer as win_delta,
   case when p_state->>'reason' in ('inactividad','rendición') then 18 else 5+floor(13*margin)::integer end as loss_delta
   from (select greatest(0.0,least(1.0,((p_state#>>array['players',p_state->>'winner','votes'])::numeric-(p_state#>>array['players',case when p_state->>'winner'='0' then '1' else '0' end,'votes'])::numeric)/greatest(1,(p_state#>>array['players',p_state->>'winner','votes'])::numeric))) as margin) margins) deltas
  on conflict(room_id) do nothing;
  if found then
   update public.hemicycle_online_rankings mm set elo=greatest(0,elo+case when mm.user_id=r.host_id then result.host_delta else result.guest_delta end),wins=wins+case when mm.user_id=result.winner then 1 else 0 end,losses=losses+case when mm.user_id<>result.winner then 1 else 0 end from public.hemicycle_test_results result where result.room_id=r.id and mm.user_id in (r.host_id,r.guest_id);
   perform public.hemicycle_ranked_apply(r.host_id,(select elo from public.hemicycle_online_rankings where user_id=r.host_id),p_state->>'winner'='0');
   perform public.hemicycle_ranked_apply(r.guest_id,(select elo from public.hemicycle_online_rankings where user_id=r.guest_id),p_state->>'winner'='1');
  end if;
 end if;

 return true;
end $$;
revoke all on function public.hemicycle_combat_load(uuid,uuid,uuid,jsonb),public.hemicycle_combat_commit(uuid,uuid,bigint,jsonb,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.hemicycle_combat_load(uuid,uuid,uuid,jsonb),public.hemicycle_combat_commit(uuid,uuid,bigint,jsonb,uuid,jsonb) to service_role;

create or replace function public.hemicycle_put_cloud_save(p_payload jsonb,p_expected_revision bigint,p_operation_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); p public.hemicycle_cloud_saves; origin text; k text; n numeric; server_elo bigint; action_index integer; action_value jsonb;
begin
 if actor is null then raise exception 'Debes iniciar sesión.' using errcode='28000'; end if;
 if p_expected_revision is null or p_expected_revision<0 or p_operation_id is null then raise exception 'Solicitud de guardado no válida.' using errcode='22023'; end if;
 if p_payload is null or jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>8388608
  or p_payload->>'format' is distinct from 'hemiciclo-backup' or p_payload->>'schemaVersion' is distinct from '1'
  or jsonb_typeof(p_payload->'profile') is distinct from 'object'
  or jsonb_typeof(p_payload#>'{profile,album}') is distinct from 'array' then
  raise exception 'El respaldo no tiene un formato válido.' using errcode='22023';
 end if;
 origin:=p_payload#>>'{identity,id}';
 if origin is null or origin !~* '^HC-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  or jsonb_array_length(p_payload#>'{profile,album}')>250000 then raise exception 'El ID o la colección no son válidos.' using errcode='22023'; end if;
 if exists(select 1 from jsonb_array_elements(p_payload#>'{profile,album}') as card where jsonb_typeof(card)<>'string' or length(card#>>'{}')>100) then
  raise exception 'La colección contiene valores incorrectos.' using errcode='22023';
 end if;
 foreach k in array array['fs','elo','w','l','lastDaily','lastWeekly','dtWins'] loop
  if jsonb_typeof(p_payload->'profile'->k) is distinct from 'number' then raise exception 'Falta un valor numérico del progreso.' using errcode='22023'; end if;
  n:=(p_payload->'profile'->>k)::numeric;
  if n<0 or n>9007199254740991 or trunc(n)<>n then raise exception 'Valor numérico fuera del intervalo permitido.' using errcode='22023'; end if;
 end loop;
 if jsonb_typeof(p_payload#>'{profile,dtGoldUnlocked}') is distinct from 'boolean'
  or jsonb_typeof(p_payload#>'{profile,dtGoldActive}') is distinct from 'boolean' then raise exception 'El progreso de la colección no es válido.' using errcode='22023'; end if;
 insert into public.hemicycle_cloud_saves(user_id) values(actor) on conflict do nothing;
 select * into p from public.hemicycle_cloud_saves where user_id=actor for update;
 -- Compatibilidad: un cliente anterior no elimina acciones que aún no conoce.
 if p_payload#>'{profile,actionAlbum}' is null and p.payload#>'{profile,actionAlbum}' is not null then
  p_payload:=jsonb_set(p_payload,'{profile,actionAlbum}',p.payload#>'{profile,actionAlbum}');
  if p_payload#>'{profile,cabinets}' is null and p.payload#>'{profile,cabinets}' is not null then p_payload:=jsonb_set(p_payload,'{profile,cabinets}',p.payload#>'{profile,cabinets}');end if;
  if jsonb_typeof(p_payload#>'{profile,cabinets,slots}')='array' then
   for action_index in 0..4 loop
    if p_payload#>array['profile','cabinets','slots',action_index::text,'actions'] is null and p.payload#>array['profile','cabinets','slots',action_index::text,'actions'] is not null then
     action_value:=case when jsonb_array_length(p_payload#>array['profile','cabinets','slots',action_index::text,'ids'])>0 then p.payload#>array['profile','cabinets','slots',action_index::text,'actions'] else '[]'::jsonb end;
     p_payload:=jsonb_set(p_payload,array['profile','cabinets','slots',action_index::text,'actions'],action_value);
    end if;
   end loop;
  end if;
 end if;
 if p_payload#>'{profile,actionAlbum}' is not null then
  if jsonb_typeof(p_payload#>'{profile,actionAlbum}')<>'array' then raise exception 'La colección de acciones no es válida.' using errcode='22023';end if;
  if jsonb_array_length(p_payload#>'{profile,actionAlbum}')>250000 or exists(select 1 from jsonb_array_elements(p_payload#>'{profile,actionAlbum}') x where jsonb_typeof(x)<>'string' or (x#>>'{}') not in ('turno-de-palabra','replica','receso','disciplina-de-grupo','pregunta-incomoda','pausa-parlamentaria','escudo-parlamentario','interpelacion','debate-abierto','mocion-de-censura','mayoria-reforzada','acuerdo-de-estado')) then raise exception 'La colección de acciones contiene datos no válidos.' using errcode='22023';end if;
 end if;
 if p.last_operation_id=p_operation_id then
  if p.payload is distinct from p_payload then raise exception 'El reintento contiene datos diferentes.' using errcode='22023'; end if;
  return jsonb_build_object('status','saved','save',public.hemicycle_get_cloud_save());
 end if;
 if p.revision<>p_expected_revision then return jsonb_build_object('status','conflict','save',public.hemicycle_get_cloud_save()); end if;
 if to_regclass('public.hemicycle_online_rankings') is not null then
  execute 'select elo from public.hemicycle_online_rankings where user_id=$1' into server_elo using actor;
  if server_elo is not null and server_elo<>(p_payload#>>'{profile,elo}')::bigint then raise exception 'El Elo está vinculado al servidor. Recupera primero el progreso de tu cuenta.' using errcode='22023';end if;
 end if;
 if p.source_id is not null and p.source_id<>origin then raise exception 'El ID de esta copia no coincide con el vinculado a la cuenta.' using errcode='22023'; end if;
 begin
  update public.hemicycle_cloud_saves set source_id=origin,payload=p_payload,revision=p.revision+1,last_operation_id=p_operation_id,updated_at=now() where user_id=actor;
 exception when unique_violation then
  raise exception 'Este progreso ya está vinculado a otra cuenta.' using errcode='P0001';
 end;
 return jsonb_build_object('status','saved','save',public.hemicycle_get_cloud_save());
end $$;
commit;
