-- SOLO TRAS REVISAR una solicitud legítima. No ejecutar como migración general.
-- Sustituir el UUID; comprobar el SELECT y obtener la conformidad antes de aprobarlo.
-- No publica, no suma inventarios y no sustituye un respaldo existente.
begin;
do $$
declare actor uuid := '00000000-0000-0000-0000-000000000000'; incoming public.hemicycle_legacy_import_requests;
begin
 select * into incoming from public.hemicycle_legacy_import_requests where user_id=actor and approved_at is null for update;
 if not found then raise exception 'No existe una solicitud pendiente.';end if;
 if exists(select 1 from public.hemicycle_cloud_saves where user_id=actor and payload is not null) then raise exception 'Ya hay un respaldo vinculado. No se sobrescribe.';end if;
 insert into public.hemicycle_cloud_saves(user_id,source_id,payload,revision,last_operation_id)
 values(actor,incoming.payload#>>'{identity,id}',incoming.payload,1,gen_random_uuid())
 on conflict(user_id) do update set source_id=excluded.source_id,payload=excluded.payload,revision=1,last_operation_id=excluded.last_operation_id where public.hemicycle_cloud_saves.payload is null;
 update public.hemicycle_legacy_import_requests set approved_at=now() where user_id=actor;
end $$;
commit;
