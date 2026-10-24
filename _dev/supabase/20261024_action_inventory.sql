-- Compatibilidad de inventario de acciones: ejecutar después de los SQL ya instalados.
-- No crea una temporada, no reinicia Elo ni borra datos. Protege acciones frente a clientes antiguos.
begin;
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
revoke all on function public.hemicycle_put_cloud_save(jsonb,bigint,uuid) from public,anon;
grant execute on function public.hemicycle_put_cloud_save(jsonb,bigint,uuid) to authenticated;
commit;
