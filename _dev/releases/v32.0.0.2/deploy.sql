-- v32.1.0: gabinetes 8+4, motor offline10, evento independiente y ventaja de racha.
-- Aplicar después de deploy.sql de v32.0.0. Reejecutable, sin reinicios.
begin;
do $$ begin
 if to_regprocedure('public.hemicycle_put_cloud_save_before_review321(jsonb,bigint,uuid)') is null then
  alter function public.hemicycle_put_cloud_save(jsonb,bigint,uuid) rename to hemicycle_put_cloud_save_before_review321;
 end if;
 if to_regprocedure('public.hemicycle_combat_commit_progress_before_review321(uuid,uuid,bigint,jsonb,uuid,jsonb,jsonb)') is null then
  alter function public.hemicycle_combat_commit_progress(uuid,uuid,bigint,jsonb,uuid,jsonb,jsonb) rename to hemicycle_combat_commit_progress_before_review321;
 end if;
 if to_regprocedure('public.hemicycle_combat_load_before_review321(uuid,uuid,uuid,jsonb)') is null then
  alter function public.hemicycle_combat_load(uuid,uuid,uuid,jsonb) rename to hemicycle_combat_load_before_review321;
 end if;
end $$;
revoke all on function public.hemicycle_put_cloud_save_before_review321(jsonb,bigint,uuid),public.hemicycle_combat_commit_progress_before_review321(uuid,uuid,bigint,jsonb,uuid,jsonb,jsonb),public.hemicycle_combat_load_before_review321(uuid,uuid,uuid,jsonb) from public,anon,authenticated,service_role;

-- El cliente solo conserva estos campos; el servicio liquida sus cambios.
create or replace function public.hemicycle_put_cloud_save(p_payload jsonb,p_expected_revision bigint,p_operation_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare saved public.hemicycle_cloud_saves; proposed jsonb; key text;
begin
 if auth.uid() is null then raise exception 'Inicia sesión.' using errcode='28000';end if;
 select * into saved from public.hemicycle_cloud_saves where user_id=auth.uid() for update;
 if saved.payload is null then raise exception 'Inicializa el progreso desde el servicio de cuenta.';end if;
 if saved.last_operation_id=p_operation_id then return jsonb_build_object('status','saved','save',public.hemicycle_get_cloud_save());end if;
 if saved.revision<>p_expected_revision then return jsonb_build_object('status','conflict','save',public.hemicycle_get_cloud_save());end if;
 proposed:=p_payload->'profile';
 foreach key in array array['revisionEvent','victoryBoost'] loop
  if proposed ? key and proposed->key is distinct from saved.payload->'profile'->key then raise exception 'Los eventos y ventajas se validan en el servidor.' using errcode='22023';end if;
  if saved.payload->'profile' ? key then proposed:=proposed||jsonb_build_object(key,saved.payload->'profile'->key);end if;
 end loop;
 return public.hemicycle_put_cloud_save_before_review321(jsonb_set(p_payload,'{profile}',proposed),p_expected_revision,p_operation_id);
end $$;
revoke all on function public.hemicycle_put_cloud_save(jsonb,bigint,uuid) from public,anon;
grant execute on function public.hemicycle_put_cloud_save(jsonb,bigint,uuid) to authenticated;

-- Se conservan cinco ranuras de favoritos; cambia el contenido de cada una.
do $format$ declare definition text; begin
 definition:=pg_get_functiondef('public.hemicycle_put_cloud_save_before_xp11(jsonb,bigint,uuid)'::regprocedure);
 if position('jsonb_array_length(item->''ids'') not in (0,5)' in definition)>0 then
  definition:=replace(definition,'jsonb_array_length(item->''ids'') not in (0,5)','jsonb_array_length(item->''ids'') not in (0,5,8)');
  definition:=replace(definition,'jsonb_array_length(item->''actions'')>2','jsonb_array_length(item->''actions'')>4');
  execute definition;
 elsif position('jsonb_array_length(item->''ids'') not in (0,5,8)' in definition)=0 then raise exception 'Revisa el validador de gabinetes antes de aplicar v32.1.0.';end if;
end $format$;
-- Cinco sigue siendo importable para clientes antiguos. El servicio solo inicia
-- partidas nuevas con ocho oradores y cuatro acciones distintos y poseídos.
create or replace function public.hemicycle_offline_download(p_actor uuid,p_rules text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare saved public.hemicycle_cloud_saves; n integer; tickets jsonb; context jsonb; total integer;
begin
 if p_rules not in ('offline1','offline2','offline3','offline4','offline5','offline6','offline7','offline8','offline9','offline10') then raise exception 'Reglas no compatibles.';end if;
 select * into saved from public.hemicycle_cloud_saves where user_id=p_actor for update;
 if saved.payload is null then raise exception 'Activa primero la nube.';end if;
 context:=jsonb_build_object('leagueDiv',coalesce((saved.payload#>>'{league,div}')::integer,3),'album',(select jsonb_agg(id order by id) from(select distinct value as id from jsonb_array_elements(saved.payload#>'{profile,album}')) x),'actionAlbum',coalesce((select jsonb_agg(id order by id) from(select distinct value as id from jsonb_array_elements(coalesce(saved.payload#>'{profile,actionAlbum}','[]'))) x),'[]'),'elo',saved.payload#>'{profile,elo}','dtGoldActive',saved.payload#>'{profile,dtGoldActive}','dtGoldUnlocked',saved.payload#>'{profile,dtGoldUnlocked}');
 if saved.payload#>'{profile,leaderMastery}' is not null then context:=context||jsonb_build_object('leaderMastery',saved.payload#>'{profile,leaderMastery}');end if;
 select count(*) into n from public.hemicycle_offline_tickets where user_id=p_actor and result is null and expires_at>now() and profile=context and rules=p_rules;
 select count(*) into total from public.hemicycle_offline_tickets where user_id=p_actor and result is null and expires_at>now();
 if n<10 then
  insert into public.hemicycle_offline_tickets(id,user_id,seed,profile,rules)
   select gen_random_uuid(),p_actor,floor(random()*4294967296)::bigint,context,p_rules from generate_series(1,10-n);
 end if;
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'seed',seed,'profile',profile,'rules',rules,'expires',floor(extract(epoch from expires_at)*1000)) order by issued_at desc,id),'[]') into tickets from public.hemicycle_offline_tickets where user_id=p_actor and result is null and expires_at>now() and profile=context and rules=p_rules;
 return tickets;
end $$;

revoke all on function public.hemicycle_offline_download(uuid,text) from public,anon,authenticated;
grant execute on function public.hemicycle_offline_download(uuid,text) to service_role;
create or replace function public.hemicycle_ai_room(p_actor uuid,p_request_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare save public.hemicycle_cloud_saves; r public.hemicycle_online_rooms; slot jsonb; rating bigint;
begin
 if p_actor is null or p_request_id is null then raise exception 'Cuenta no válida.';end if;
 select * into save from public.hemicycle_cloud_saves where user_id=p_actor;
 if not found or save.payload is null then raise exception 'Sincroniza primero tu progreso en la nube.';end if;
 slot:=save.payload#>array['profile','cabinets','slots',coalesce(save.payload#>>'{profile,cabinets,selected}','0')];
 -- La preparación sigue admitiendo favoritos históricos durante el intervalo
 -- entre aplicar este SQL y actualizar el servicio/web. El motor balance-v4
 -- exige 8+4 antes de confirmar una partida nueva.
 if slot is null or jsonb_typeof(slot->'ids') is distinct from 'array' or jsonb_typeof(coalesce(slot->'actions','[]'::jsonb)) is distinct from 'array' then raise exception 'Guarda un gabinete en Colección.';end if;
 if not ((jsonb_array_length(slot->'ids')=5 and jsonb_array_length(coalesce(slot->'actions','[]'::jsonb))<=2) or (jsonb_array_length(slot->'ids')=8 and jsonb_array_length(coalesce(slot->'actions','[]'::jsonb))=4)) then raise exception 'Guarda un gabinete de ocho oradores y cuatro acciones en Colección.';end if;
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

alter table public.hemicycle_ranked_rewards add column if not exists boost jsonb;
alter table public.hemicycle_ranked_rewards drop constraint if exists hemicycle_ranked_rewards_fs_check;
alter table public.hemicycle_ranked_rewards add constraint hemicycle_ranked_rewards_fs_check check(fs between 20 and 150);

-- El progreso, la tirada guardada y ambos bonus se confirman en una transacción.
-- La función anterior mantiene comprobaciones de identidad/revisión y recibo único.
create or replace function public.hemicycle_combat_commit_progress(
 p_room_id uuid,p_actor uuid,p_expected_revision bigint,p_state jsonb,p_operation_id uuid,p_request jsonb,p_progress jsonb
) returns boolean language plpgsql security definer set search_path='' as $$
declare r public.hemicycle_online_rooms; item jsonb; owner uuid; prior boolean[]:=array[false,false]; i integer; ok boolean; bonus_xp integer; percent integer; base_fs integer; bonus_fs integer; receipt jsonb;
begin
 select * into r from public.hemicycle_online_rooms where id=p_room_id for update;
 if not found then raise exception 'Sala no disponible.';end if;
 for i in 0..1 loop
  owner:=case when i=0 then r.host_id else r.guest_id end;
  prior[i+1]:=exists(select 1 from public.hemicycle_combat_progress where room_id=r.id and user_id=owner);
  item:=p_progress->i;
  if item is null or item='null'::jsonb then continue;end if;
  bonus_xp:=coalesce((item->>'boostXPGain')::integer,0);percent:=coalesce((item#>>'{boost,appliedPercent}')::integer,0);
  if bonus_xp not between 0 and 50 or (percent<>0 and percent not between 25 and 50) then raise exception 'Ventaja no válida.';end if;
  if r.mode<>'ranked' and (bonus_xp<>0 or item->'boost' is not null and item->'boost'<>'null'::jsonb) then raise exception 'Partida amistosa sin ventaja.';end if;
 end loop;
 ok:=public.hemicycle_combat_commit_progress_before_review321(p_room_id,p_actor,p_expected_revision,p_state,p_operation_id,p_request,p_progress);
 if not ok then return false;end if;
 for i in 0..1 loop
  owner:=case when i=0 then r.host_id else r.guest_id end;item:=p_progress->i;
  if prior[i+1] or owner is null or item is null or item='null'::jsonb or r.mode<>'ranked' or item->'boost' is null or item->'boost'='null'::jsonb then continue;end if;
  if jsonb_typeof(item->'victoryBoost') is distinct from 'object' then raise exception 'Falta el estado de racha.';end if;
  select fs into strict base_fs from public.hemicycle_ranked_rewards where room_id=r.id and user_id=owner;
  percent:=coalesce((item#>>'{boost,appliedPercent}')::integer,0);bonus_fs:=floor(base_fs*percent/100.0)::integer;bonus_xp:=coalesce((item->>'boostXPGain')::integer,0);
  receipt:=(item->'boost')||jsonb_build_object('baseFS',base_fs,'bonusFS',bonus_fs,'fs',base_fs+bonus_fs);
  update public.hemicycle_cloud_saves set payload=jsonb_set(jsonb_set(jsonb_set(payload,'{profile,victoryBoost}',item->'victoryBoost'),'{profile,fs}',to_jsonb((payload#>>'{profile,fs}')::bigint+bonus_fs)),'{profile,xp}',to_jsonb(least(2008644,coalesce((payload#>>'{profile,xp}')::bigint,0)+bonus_xp))) where user_id=owner;
  update public.hemicycle_ranked_rewards set fs=base_fs+bonus_fs,boost=receipt where room_id=r.id and user_id=owner;
 end loop;
 return true;
end $$;
revoke all on function public.hemicycle_combat_commit_progress(uuid,uuid,bigint,jsonb,uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.hemicycle_combat_commit_progress(uuid,uuid,bigint,jsonb,uuid,jsonb,jsonb) to service_role;

create or replace function public.hemicycle_combat_load(p_room_id uuid,p_actor uuid,p_operation_id uuid default null,p_request jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; boost jsonb;
begin
 result:=public.hemicycle_combat_load_before_review321(p_room_id,p_actor,p_operation_id,p_request);
 select r.boost into boost from public.hemicycle_ranked_rewards r where r.room_id=p_room_id and r.user_id=p_actor;
 if boost is not null then result:=jsonb_set(result,'{result}',(result->'result')||jsonb_build_object('boost',boost));end if;
 return result;
end $$;
revoke all on function public.hemicycle_combat_load(uuid,uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.hemicycle_combat_load(uuid,uuid,uuid,jsonb) to service_role;
notify pgrst,'reload schema';
commit;
