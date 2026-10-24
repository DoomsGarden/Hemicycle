-- Partidas privadas de prueba. Ejecutar después de rooms.sql y test_players.sql.
-- No lee ni modifica inventarios, respaldos, FS, Elo, logros ni nicks.
begin;
create table if not exists public.hemicycle_test_combats (
 room_id uuid primary key references public.hemicycle_online_rooms(id),
 revision bigint not null default 0,
 state jsonb not null,
 updated_at timestamptz not null default now()
);
create table if not exists public.hemicycle_test_combat_operations (
 room_id uuid not null references public.hemicycle_online_rooms(id),
 actor uuid not null references auth.users(id),
 operation_id uuid not null,
 request jsonb not null,
 primary key(room_id,actor,operation_id)
);
alter table public.hemicycle_test_combats enable row level security;
alter table public.hemicycle_test_combat_operations enable row level security;
revoke all on public.hemicycle_test_combats,public.hemicycle_test_combat_operations from public,anon,authenticated;
create or replace function public.hemicycle_combat_load(p_room_id uuid,p_actor uuid,p_operation_id uuid default null,p_request jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.hemicycle_online_rooms; g public.hemicycle_test_combats; old jsonb; done boolean;
begin
 select * into r from public.hemicycle_online_rooms where id=p_room_id;
 if not found or p_actor is null or (p_actor<>r.host_id and p_actor is distinct from r.guest_id) then raise exception 'Sala no disponible.';end if;
 if r.guest_id is null then raise exception 'Falta el segundo jugador.';end if;
 select * into g from public.hemicycle_test_combats where room_id=p_room_id;
 if not found and r.expires_at<=now() then raise exception 'La sala ha caducado.';end if;
 select request into old from public.hemicycle_test_combat_operations where room_id=p_room_id and actor=p_actor and operation_id=p_operation_id;
 done:=found;
 if done and old is distinct from p_request then raise exception 'Operación reutilizada con otros datos.';end if;
 return jsonb_build_object('side',case when p_actor=r.host_id then 0 else 1 end,'revision',coalesce(g.revision,0),'state',g.state,'processed',done,'now',floor(extract(epoch from clock_timestamp())*1000));
end $$;
create or replace function public.hemicycle_combat_commit(p_room_id uuid,p_actor uuid,p_expected_revision bigint,p_state jsonb,p_operation_id uuid,p_request jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
declare existing bigint; r public.hemicycle_online_rooms; old jsonb;
begin
 select * into r from public.hemicycle_online_rooms where id=p_room_id for update;
 if not found or p_actor is null or (p_actor<>r.host_id and p_actor is distinct from r.guest_id) or r.guest_id is null then raise exception 'Sala no disponible.';end if;
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
 return true;
end $$;
revoke all on function public.hemicycle_combat_load(uuid,uuid,uuid,jsonb),public.hemicycle_combat_commit(uuid,uuid,bigint,jsonb,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.hemicycle_combat_load(uuid,uuid,uuid,jsonb),public.hemicycle_combat_commit(uuid,uuid,bigint,jsonb,uuid,jsonb) to service_role;
commit;
