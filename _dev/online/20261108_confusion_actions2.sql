-- Confundido revisado: habilita offline11 sin invalidar tickets ni registros anteriores.
-- Ejecutar tras 20261107_review_v321.sql. Idempotente; no modifica cuentas ni premios.
begin;
do $migration$
declare definition text;
begin
 definition:=pg_get_functiondef('public.hemicycle_offline_download(uuid,text)'::regprocedure);
 if position('''offline11''' in definition)=0 then
  if position('''offline10''' in definition)=0 then raise exception 'Falta la migración anterior de gabinetes/offline10.';end if;
  definition:=replace(definition,'''offline10''','''offline10'',''offline11''');
  execute definition;
 end if;
end $migration$;
revoke all on function public.hemicycle_offline_download(uuid,text) from public,anon,authenticated;
grant execute on function public.hemicycle_offline_download(uuid,text) to service_role;
commit;
