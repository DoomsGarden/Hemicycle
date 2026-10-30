-- XP confirmada y preferencias visuales. Compatible con clientes anteriores.
-- Ejecutar después de 20261030_clarity_balance_v10.sql. No recalcula ni reinicia partidas.
begin;
do $$ begin
 if to_regprocedure('public.hemicycle_put_cloud_save_before_xp11(jsonb,bigint,uuid)') is null then
  alter function public.hemicycle_put_cloud_save(jsonb,bigint,uuid) rename to hemicycle_put_cloud_save_before_xp11;
 end if;
 if to_regprocedure('public.hemicycle_combat_commit_progress_before_xp11(uuid,uuid,bigint,jsonb,uuid,jsonb,jsonb)') is null then
  alter function public.hemicycle_combat_commit_progress(uuid,uuid,bigint,jsonb,uuid,jsonb,jsonb) rename to hemicycle_combat_commit_progress_before_xp11;
 end if;
end $$;
revoke all on function public.hemicycle_put_cloud_save_before_xp11(jsonb,bigint,uuid),public.hemicycle_combat_commit_progress_before_xp11(uuid,uuid,bigint,jsonb,uuid,jsonb,jsonb) from public,anon,authenticated,service_role;

create or replace function public.hemicycle_put_cloud_save(p_payload jsonb,p_expected_revision bigint,p_operation_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare saved public.hemicycle_cloud_saves; proposed jsonb; choice jsonb; response jsonb; stored_xp bigint;
begin
 if auth.uid() is null then raise exception 'Inicia sesión.' using errcode='28000';end if;
 select * into saved from public.hemicycle_cloud_saves where user_id=auth.uid() for update;
 if saved.payload is null then raise exception 'Inicializa el progreso desde el servicio de cuenta.' using errcode='22023';end if;
 if saved.last_operation_id=p_operation_id then return jsonb_build_object('status','saved','save',public.hemicycle_get_cloud_save());end if;
 if saved.revision<>p_expected_revision then return jsonb_build_object('status','conflict','save',public.hemicycle_get_cloud_save());end if;
 proposed:=p_payload->'profile';stored_xp:=coalesce((saved.payload#>>'{profile,xp}')::bigint,0);
 if proposed ? 'xp' and (jsonb_typeof(proposed->'xp') is distinct from 'number' or (proposed->>'xp') !~ '^[0-9]+$' or (proposed->>'xp')::numeric<>stored_xp) then raise exception 'La experiencia se valida en el servidor.' using errcode='22023';end if;
 choice:=proposed->'cosmetics';
 if choice is not null then
  if jsonb_typeof(choice) is distinct from 'object' then raise exception 'Selección visual no válida.' using errcode='22023';end if;
  if (select count(*) from jsonb_object_keys(choice))<>4
   or coalesce(choice->>'menu','') not in ('classic','senate','parchment','book','orbital','hologram')
   or coalesce(choice->>'mat','') not in ('classic','marble','imperial','orbital','garden','cats')
   or coalesce(choice->>'back','') not in ('classic','marble','imperial','orbital','garden','cats')
   or coalesce(choice->>'coin','') not in ('classic','marble','imperial','orbital','garden','cats') then raise exception 'Selección visual no válida.' using errcode='22023';end if;
 end if;
 -- El guardado anterior compara el resto del progreso sin permitir editar recursos.
 proposed:=proposed-'xp'-'cosmetics';
 if saved.payload#>'{profile,xp}' is not null then proposed:=proposed||jsonb_build_object('xp',saved.payload#>'{profile,xp}');end if;
 if saved.payload#>'{profile,cosmetics}' is not null then proposed:=proposed||jsonb_build_object('cosmetics',saved.payload#>'{profile,cosmetics}');end if;
 response:=public.hemicycle_put_cloud_save_before_xp11(jsonb_set(p_payload,'{profile}',proposed),p_expected_revision,p_operation_id);
 if response->>'status'='saved' and choice is not null then
  update public.hemicycle_cloud_saves set payload=jsonb_set(payload,'{profile,cosmetics}',choice) where user_id=auth.uid();
  response:=jsonb_build_object('status','saved','save',public.hemicycle_get_cloud_save());
 end if;
 return response;
end $$;
revoke all on function public.hemicycle_put_cloud_save(jsonb,bigint,uuid) from public,anon;
grant execute on function public.hemicycle_put_cloud_save(jsonb,bigint,uuid) to authenticated;

create or replace function public.hemicycle_combat_commit_progress(
 p_room_id uuid,p_actor uuid,p_expected_revision bigint,p_state jsonb,p_operation_id uuid,p_request jsonb,p_progress jsonb
) returns boolean language plpgsql security definer set search_path='' as $$
declare r public.hemicycle_online_rooms; item jsonb; owner uuid; prior boolean[]:=array[false,false]; i integer; gain integer; ok boolean;
begin
 select * into r from public.hemicycle_online_rooms where id=p_room_id for update;
 if not found then raise exception 'Sala no disponible.';end if;
 for i in 0..1 loop
  owner:=case when i=0 then r.host_id else r.guest_id end;
  prior[i+1]:=exists(select 1 from public.hemicycle_combat_progress where room_id=r.id and user_id=owner);
  item:=p_progress->i;
  if item is not null and item<>'null'::jsonb and item ? 'xpGain' and (coalesce(item->>'xpGain','') !~ '^[0-9]+$' or (item->>'xpGain')::numeric>100) then raise exception 'Experiencia no válida.';end if;
 end loop;
 ok:=public.hemicycle_combat_commit_progress_before_xp11(p_room_id,p_actor,p_expected_revision,p_state,p_operation_id,p_request,p_progress);
 if not ok then return false;end if;
 for i in 0..1 loop
  item:=p_progress->i;owner:=case when i=0 then r.host_id else r.guest_id end;
  if prior[i+1] or item is null or item='null'::jsonb or owner is null then continue;end if;
  gain:=coalesce((item->>'xpGain')::integer,0);
  if gain>0 then update public.hemicycle_cloud_saves set payload=jsonb_set(payload,'{profile,xp}',to_jsonb(least(2008644,coalesce((payload#>>'{profile,xp}')::bigint,0)+gain))) where user_id=owner;end if;
 end loop;
 return true;
end $$;
revoke all on function public.hemicycle_combat_commit_progress(uuid,uuid,bigint,jsonb,uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.hemicycle_combat_commit_progress(uuid,uuid,bigint,jsonb,uuid,jsonb,jsonb) to service_role;
commit;
