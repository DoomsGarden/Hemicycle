-- Estadísticas nuevas con conservación de las partidas descargadas anteriores.
begin;
create or replace function public.hemicycle_offline_download(p_actor uuid,p_rules text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare saved public.hemicycle_cloud_saves; n integer; tickets jsonb; context jsonb; total integer;
begin
 if p_rules not in ('offline1','offline2','offline3') then raise exception 'Reglas no compatibles.';end if;
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
notify pgrst,'reload schema';
commit;
