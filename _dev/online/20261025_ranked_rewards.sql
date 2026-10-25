-- Desglose privado y FS de partidas clasificatorias nuevas.
-- Ejecutar después de 20261024_ranked_ai.sql. No reinicia ni recalcula partidas anteriores.
begin;
create table if not exists public.hemicycle_ranked_rewards (
 room_id uuid not null references public.hemicycle_online_rooms(id),
 user_id uuid not null references auth.users(id),
 elo_before bigint not null, elo_after bigint not null,
 fs integer not null check(fs between 20 and 100),
 primary key(room_id,user_id)
);
alter table public.hemicycle_ranked_rewards enable row level security;
revoke all on public.hemicycle_ranked_rewards from public,anon,authenticated;
create or replace function public.hemicycle_reward_ranked_result()
returns trigger language plpgsql security definer set search_path='' as $$
declare room public.hemicycle_online_rooms; actor uuid; before_elo bigint; delta integer; reward integer; won boolean;
begin
 select * into room from public.hemicycle_online_rooms where id=new.room_id;
 if room.mode<>'ranked' then return new;end if;
 foreach actor in array array[room.host_id,room.guest_id] loop
  if actor is null then continue;end if;
  select elo into strict before_elo from public.hemicycle_online_rankings where user_id=actor for update;
  delta:=case when actor=room.host_id then new.host_delta else new.guest_delta end;
  won:=coalesce(actor=new.winner,false);
  reward:=case when won then 50+floor(random()*51)::integer else 20+floor(random()*11)::integer end;
  insert into public.hemicycle_ranked_rewards(room_id,user_id,elo_before,elo_after,fs)
   values(room.id,actor,before_elo,greatest(0,before_elo+delta),reward) on conflict do nothing;
  if found then
   update public.hemicycle_cloud_saves set
    payload=jsonb_set(payload,'{profile,fs}',to_jsonb(coalesce((payload#>>'{profile,fs}')::bigint,0)+reward)),
    revision=revision+1,last_operation_id=gen_random_uuid(),updated_at=now()
    where user_id=actor;
   if not found then raise exception 'Falta el guardado vinculado.';end if;
  end if;
 end loop;
 return new;
end $$;
revoke all on function public.hemicycle_reward_ranked_result() from public,anon,authenticated;
-- Crear el disparador una sola vez permite volver a ejecutar el archivo con seguridad.
do $$ begin
 if not exists(select 1 from pg_trigger where tgname='hemicycle_ranked_reward_once' and tgrelid='public.hemicycle_test_results'::regclass) then
  create trigger hemicycle_ranked_reward_once after insert on public.hemicycle_test_results
   for each row execute function public.hemicycle_reward_ranked_result();
 end if;
end $$;
create or replace function public.hemicycle_combat_load(p_room_id uuid,p_actor uuid,p_operation_id uuid default null,p_request jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.hemicycle_online_rooms; g public.hemicycle_test_combats; old jsonb; done boolean; settlement jsonb;
begin
 select * into r from public.hemicycle_online_rooms where id=p_room_id;
 if not found or r.cancelled or p_actor is null or (p_actor<>r.host_id and p_actor is distinct from r.guest_id) then raise exception 'Sala no disponible.';end if;
 if r.guest_id is null and r.opponent_kind<>'ai' then raise exception 'Falta el segundo jugador.';end if;
 select * into g from public.hemicycle_test_combats where room_id=p_room_id;
 if (g.state is null or g.state->>'status'='preparing') and r.expires_at<=now() then raise exception 'La sala ha caducado.';end if;
 select request into old from public.hemicycle_test_combat_operations where room_id=p_room_id and actor=p_actor and operation_id=p_operation_id;
 done:=found;
 if done and old is distinct from p_request then raise exception 'Operación reutilizada con otros datos.';end if;
 select jsonb_build_object('eloBefore',elo_before,'eloAfter',elo_after,'eloDelta',elo_after-elo_before,'fs',fs)
  into settlement from public.hemicycle_ranked_rewards where room_id=p_room_id and user_id=p_actor;
 return jsonb_build_object('mode',r.mode,'opponentKind',r.opponent_kind,'rating',(select elo from public.hemicycle_online_rankings where user_id=p_actor),'result',settlement,'side',case when p_actor=r.host_id then 0 else 1 end,'revision',coalesce(g.revision,0),'state',g.state,'processed',done,'now',floor(extract(epoch from clock_timestamp())*1000));
end $$;
revoke all on function public.hemicycle_combat_load(uuid,uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.hemicycle_combat_load(uuid,uuid,uuid,jsonb) to service_role;
commit;
