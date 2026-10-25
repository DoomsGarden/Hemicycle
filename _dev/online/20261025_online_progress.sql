-- Progreso online validado por el servidor. Ejecutar después de ranked_rewards.sql.
-- No reinicia datos ni recalcula resultados anteriores. Solo el servicio usa estas funciones.
begin;
create table if not exists public.hemicycle_combat_progress (
 room_id uuid not null references public.hemicycle_online_rooms(id),
 user_id uuid not null references auth.users(id),
 recorded_at timestamptz not null default now(),
 primary key(room_id,user_id)
);
alter table public.hemicycle_combat_progress enable row level security;
revoke all on public.hemicycle_combat_progress from public,anon,authenticated;
create or replace function public.hemicycle_combat_context(p_room_id uuid,p_actor uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.hemicycle_online_rooms;
begin
 select * into r from public.hemicycle_online_rooms where id=p_room_id;
 if not found or r.cancelled or p_actor is null or (p_actor<>r.host_id and p_actor is distinct from r.guest_id) then raise exception 'Sala no disponible.';end if;
 return jsonb_build_array(
  (select jsonb_build_object('userId',user_id,'revision',revision,'profile',payload->'profile') from public.hemicycle_cloud_saves where user_id=r.host_id),
  (select jsonb_build_object('userId',user_id,'revision',revision,'profile',payload->'profile') from public.hemicycle_cloud_saves where user_id=r.guest_id)
 );
end $$;
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
   update public.hemicycle_cloud_saves set payload=jsonb_set(
    case when item->'leaderMastery' is null or item->'leaderMastery'='null'::jsonb then payload
    else jsonb_set(payload,'{profile,leaderMastery}',item->'leaderMastery') end,
    '{profile,objectives}',item->'objectives'),revision=revision+1,last_operation_id=gen_random_uuid(),updated_at=now()
    where user_id=expected_user;
  end if;
 end loop;
 return true;
end $$;
revoke all on function public.hemicycle_combat_context(uuid,uuid),public.hemicycle_combat_commit_progress(uuid,uuid,bigint,jsonb,uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.hemicycle_combat_context(uuid,uuid),public.hemicycle_combat_commit_progress(uuid,uuid,bigint,jsonb,uuid,jsonb,jsonb) to service_role;
commit;
