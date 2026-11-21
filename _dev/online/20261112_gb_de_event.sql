-- Preparación del recibo de ampliación GB/DE. No activa ni concede el evento.
-- Aplicar antes del servicio que active el catálogo revisado. Reejecutable.
begin;
do $$ begin
 if to_regprocedure('public.hemicycle_put_cloud_save(jsonb,bigint,uuid)') is null then
  raise exception 'Falta la instalación de guardado en la nube; no se ha modificado nada.';
 end if;
 if to_regprocedure('public.hemicycle_put_cloud_save_before_gbde_event(jsonb,bigint,uuid)') is null then
  alter function public.hemicycle_put_cloud_save(jsonb,bigint,uuid) rename to hemicycle_put_cloud_save_before_gbde_event;
 end if;
end $$;
revoke all on function public.hemicycle_put_cloud_save_before_gbde_event(jsonb,bigint,uuid) from public,anon,authenticated,service_role;

-- Solo el servicio de economía concede premios y escribe sus recibos. Los
-- clientes anteriores que omitan el campo no pueden borrar entregas recogidas.
create or replace function public.hemicycle_put_cloud_save(p_payload jsonb,p_expected_revision bigint,p_operation_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare saved public.hemicycle_cloud_saves; proposed jsonb;
begin
 if auth.uid() is null then raise exception 'Inicia sesión.' using errcode='28000';end if;
 select * into saved from public.hemicycle_cloud_saves where user_id=auth.uid() for update;
 if saved.payload is null then raise exception 'Inicializa el progreso desde el servicio de cuenta.';end if;
 if saved.last_operation_id=p_operation_id then return jsonb_build_object('status','saved','save',public.hemicycle_get_cloud_save());end if;
 if saved.revision<>p_expected_revision then return jsonb_build_object('status','conflict','save',public.hemicycle_get_cloud_save());end if;
 proposed:=p_payload->'profile';
 if proposed ? 'gbdeExpansionEvent' and proposed->'gbdeExpansionEvent' is distinct from saved.payload->'profile'->'gbdeExpansionEvent' then
  raise exception 'Las entregas del evento se validan en el servidor.' using errcode='22023';
 end if;
 if saved.payload->'profile' ? 'gbdeExpansionEvent' then
  proposed:=proposed||jsonb_build_object('gbdeExpansionEvent',saved.payload->'profile'->'gbdeExpansionEvent');
 end if;
 return public.hemicycle_put_cloud_save_before_gbde_event(jsonb_set(p_payload,'{profile}',proposed),p_expected_revision,p_operation_id);
end $$;
revoke all on function public.hemicycle_put_cloud_save(jsonb,bigint,uuid) from public,anon,service_role;
grant execute on function public.hemicycle_put_cloud_save(jsonb,bigint,uuid) to authenticated;
notify pgrst,'reload schema';
commit;
