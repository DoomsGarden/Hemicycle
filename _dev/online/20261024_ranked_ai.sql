-- Clasificatoria contra IA durante el prelanzamiento. Ejecutar después de matchmaking.sql.
-- Conserva las cuentas, colecciones, FS, Elo y temporada. Solo el servidor confirma resultados.
begin;
alter table public.hemicycle_online_rooms add column if not exists opponent_kind text not null default 'player' check(opponent_kind in ('player','ai'));
create or replace function public.hemicycle_ai_room(p_actor uuid,p_request_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare save public.hemicycle_cloud_saves; r public.hemicycle_online_rooms; slot jsonb; rating bigint;
begin
 if p_actor is null or p_request_id is null then raise exception 'Cuenta no válida.';end if;
 select * into save from public.hemicycle_cloud_saves where user_id=p_actor;
 if not found or save.payload is null then raise exception 'Sincroniza primero tu progreso en la nube.';end if;
 slot:=save.payload#>array['profile','cabinets','slots',coalesce(save.payload#>>'{profile,cabinets,selected}','0')];
 if slot is null or jsonb_typeof(slot->'ids') is distinct from 'array' or jsonb_array_length(slot->'ids')<>5 then raise exception 'Guarda un gabinete de cinco oradores en Colección.';end if;
 rating:=(save.payload#>>'{profile,elo}')::bigint;
 insert into public.hemicycle_online_rankings(user_id,elo) values(p_actor,rating) on conflict(user_id) do nothing;
 insert into public.hemicycle_online_rooms(host_id,request_id,mode,opponent_kind,expires_at)
 values(p_actor,p_request_id,'ranked','ai',now()+interval '2 hours') on conflict(host_id,request_id) do nothing;
 select * into r from public.hemicycle_online_rooms where host_id=p_actor and request_id=p_request_id;
 if r.opponent_kind<>'ai' then raise exception 'La operación ya pertenece a otra partida.';end if;
 return jsonb_build_object('id',r.id,'status','paired','kind','ai','mode','ranked','cabinet',coalesce((select request->'cabinet' from public.hemicycle_test_combat_operations where room_id=r.id and actor=p_actor and operation_id=p_request_id),jsonb_build_object('orators',slot->'ids','leader',slot->'leader','actions',coalesce(slot->'actions','[]'::jsonb))));
end $$;
revoke all on function public.hemicycle_ai_room(uuid,uuid) from public,anon,authenticated;
grant execute on function public.hemicycle_ai_room(uuid,uuid) to service_role;
create or replace function public.hemicycle_combat_load(p_room_id uuid,p_actor uuid,p_operation_id uuid default null,p_request jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.hemicycle_online_rooms; g public.hemicycle_test_combats; old jsonb; done boolean;
begin
 select * into r from public.hemicycle_online_rooms where id=p_room_id;
 if not found or r.cancelled or p_actor is null or (p_actor<>r.host_id and p_actor is distinct from r.guest_id) then raise exception 'Sala no disponible.';end if;
 if r.guest_id is null and r.opponent_kind<>'ai' then raise exception 'Falta el segundo jugador.';end if;
 select * into g from public.hemicycle_test_combats where room_id=p_room_id;
 if (g.state is null or g.state->>'status'='preparing') and r.expires_at<=now() then raise exception 'La sala ha caducado.';end if;
 select request into old from public.hemicycle_test_combat_operations where room_id=p_room_id and actor=p_actor and operation_id=p_operation_id;
 done:=found;
 if done and old is distinct from p_request then raise exception 'Operación reutilizada con otros datos.';end if;
 return jsonb_build_object('mode',r.mode,'opponentKind',r.opponent_kind,'rating',(select elo from public.hemicycle_online_rankings where user_id=p_actor),'side',case when p_actor=r.host_id then 0 else 1 end,'revision',coalesce(g.revision,0),'state',g.state,'processed',done,'now',floor(extract(epoch from clock_timestamp())*1000));
end $$;
create or replace function public.hemicycle_combat_commit(p_room_id uuid,p_actor uuid,p_expected_revision bigint,p_state jsonb,p_operation_id uuid,p_request jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
declare existing bigint; r public.hemicycle_online_rooms; old jsonb;
begin
 select * into r from public.hemicycle_online_rooms where id=p_room_id for update;
 if not found or r.cancelled or p_actor is null or (p_actor<>r.host_id and p_actor is distinct from r.guest_id) or (r.guest_id is null and r.opponent_kind<>'ai') then raise exception 'Sala no disponible.';end if;
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
  if not exists(select 1 from public.hemicycle_online_rankings where user_id=r.host_id) or (r.opponent_kind<>'ai' and not exists(select 1 from public.hemicycle_online_rankings where user_id=r.guest_id)) then raise exception 'Falta la vinculación de Elo.';end if;
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
   update public.hemicycle_online_rankings mm set elo=greatest(0,elo+case when mm.user_id=r.host_id then result.host_delta else result.guest_delta end),wins=wins+case when mm.user_id=result.winner then 1 else 0 end,losses=losses+case when result.winner is null or mm.user_id<>result.winner then 1 else 0 end from public.hemicycle_test_results result where result.room_id=r.id and mm.user_id in (r.host_id,r.guest_id);
   perform public.hemicycle_ranked_apply(r.host_id,(select elo from public.hemicycle_online_rankings where user_id=r.host_id),p_state->>'winner'='0');
   if r.opponent_kind<>'ai' then perform public.hemicycle_ranked_apply(r.guest_id,(select elo from public.hemicycle_online_rankings where user_id=r.guest_id),p_state->>'winner'='1');end if;
  end if;
 end if;

 return true;
end $$;
revoke all on function public.hemicycle_combat_load(uuid,uuid,uuid,jsonb),public.hemicycle_combat_commit(uuid,uuid,bigint,jsonb,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.hemicycle_combat_load(uuid,uuid,uuid,jsonb),public.hemicycle_combat_commit(uuid,uuid,bigint,jsonb,uuid,jsonb) to service_role;

commit;
