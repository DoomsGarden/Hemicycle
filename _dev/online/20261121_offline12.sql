-- Permite preparar partidas offline12 y conserva los formatos anteriores.
-- Reejecutable. No modifica guardados, inventarios, partidas ni recibos.
begin;
do $migration$
declare
 definition text;
 previous_rule text := quote_literal('offline11');
 new_rule text := quote_literal('offline12');
begin
 definition := pg_get_functiondef('public.hemicycle_offline_download(uuid,text)'::regprocedure);
 if position(new_rule in definition)=0 then
  if position(previous_rule in definition)=0 or
     length(definition)-length(replace(definition,previous_rule,''))<>length(previous_rule)
  then
   raise exception 'Revisa la migración de offline11 antes de habilitar offline12.';
  end if;
  execute replace(definition,previous_rule,previous_rule||','||new_rule);
 end if;
end $migration$;
revoke all on function public.hemicycle_offline_download(uuid,text) from public,anon,authenticated;
grant execute on function public.hemicycle_offline_download(uuid,text) to service_role;
notify pgrst,'reload schema';
commit;
