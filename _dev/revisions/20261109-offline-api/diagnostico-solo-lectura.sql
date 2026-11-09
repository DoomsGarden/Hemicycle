-- Diagnóstico del aviso GUARDADO-P0001. Ejecutar en Supabase SQL Editor.
-- SOLO LECTURA: no llama RPC de escritura, no modifica datos ni permisos.
-- Devuelve comprobaciones de formato/vinculación y tipos de operaciones,
-- sin correos, claves, identificadores de cuenta ni contenido del respaldo.
begin transaction read only;
select jsonb_build_object(
 'offline11_habilitado',coalesce(position('''offline11''' in pg_get_functiondef(to_regprocedure('public.hemicycle_offline_download(uuid,text)')))>0,false),
 'economia_contexto_disponible',to_regprocedure('public.hemicycle_economy_context(uuid,uuid,jsonb)') is not null,
 'economia_commit_disponible',to_regprocedure('public.hemicycle_economy_commit(uuid,uuid,jsonb,bigint,jsonb,jsonb,jsonb)') is not null,
 'cuentas_coincidentes',(select count(*) from public.hemicycle_account_profiles where lower(nickname)='doomsgarden'),
 'guardados',(select coalesce(jsonb_agg(jsonb_build_object(
  'hay_respaldo',s.payload is not null,
  'identidad_coincide',s.source_id is not distinct from s.payload#>>'{identity,id}',
  'perfil_valido',jsonb_typeof(s.payload->'profile')='object',
  'revision',s.revision,
  'ultima_actualizacion',s.updated_at,
  'operaciones_recientes',(select coalesce(jsonb_agg(jsonb_build_object('tipo',r.request->>'type','fecha',r.created_at)),'[]'::jsonb)
    from(select o.request,o.created_at from public.hemicycle_economy_operations o where o.user_id=s.user_id order by o.created_at desc limit 8) r)
 )),'[]'::jsonb) from public.hemicycle_cloud_saves s join public.hemicycle_account_profiles n using(user_id) where lower(n.nickname)='doomsgarden')
) as diagnostico;
commit;
