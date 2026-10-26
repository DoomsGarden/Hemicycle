-- v31.0.2.3: conserva progreso y preparaciones anteriores. Sin reinicios.
begin;
alter table public.hemicycle_offline_tickets add column if not exists rules text not null default 'offline1';
create or replace function public.hemicycle_economy_context(p_actor uuid,p_operation_id uuid default null,p_request jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare market public.hemicycle_economy_state; old public.hemicycle_economy_operations; accounts jsonb; peers uuid[]; ticket public.hemicycle_offline_tickets;
begin
 if p_actor is null or not exists(select 1 from auth.users where id=p_actor) then raise exception 'Cuenta no válida.';end if;
 select * into old from public.hemicycle_economy_operations where user_id=p_actor and operation_id=p_operation_id;
 if found then
  if old.request is distinct from p_request then raise exception 'Operación reutilizada con otros datos.';end if;
  return jsonb_build_object('processed',true,'result',old.result);
 end if;
 if p_request->>'type'='offline-settle' then
 select * into ticket from public.hemicycle_offline_tickets where id=(p_request->>'ticketId')::uuid and user_id=p_actor;
 if not found or ticket.expires_at+interval '30 days'<=now() then raise exception 'Partida descargada no disponible.';end if;
 end if;
 select * into market from public.hemicycle_economy_state where id;
 -- Solo perfiles implicados en ofertas, propuestas o participantes que han aceptado aparecer.
 select array_agg(distinct id::uuid) into peers from (
  select p_actor::text as id union all select p_request->>'recipient'
  union all select x->>'id' from jsonb_array_elements(market.data->'players') x where (x->>'visible')::boolean
  union all select x->>'seller' from jsonb_array_elements(market.data->'listings') x where x->>'status'='active'
  union all select x->>'proposer' from jsonb_array_elements(market.data->'trades') x where x->>'status'='pending'
  union all select x->>'recipient' from jsonb_array_elements(market.data->'trades') x where x->>'status'='pending'
 ) x where id is not null;
 select coalesce(jsonb_object_agg(s.user_id::text,jsonb_build_object('revision',s.revision,'payload',s.payload,'name',coalesce(n.nickname,'Jugador #'||upper(left(s.user_id::text,6))))),'{}') into accounts
 from public.hemicycle_cloud_saves s left join public.hemicycle_account_profiles n on n.user_id=s.user_id where s.user_id=any(peers) and s.payload is not null;
 return jsonb_build_object('ticket',case when ticket.id is not null then jsonb_build_object('id',ticket.id,'seed',ticket.seed,'profile',ticket.profile,'rules',ticket.rules,'expires',floor(extract(epoch from ticket.expires_at)*1000),'result',ticket.result) else null end,'version',market.revision,'market',market.data,'accounts',accounts,'now',floor(extract(epoch from clock_timestamp())*1000));
end $$;
create or replace function public.hemicycle_economy_commit(p_actor uuid,p_operation_id uuid,p_request jsonb,p_version bigint,p_market jsonb,p_updates jsonb,p_result jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
declare m public.hemicycle_economy_state; old public.hemicycle_economy_operations; u jsonb; stored public.hemicycle_cloud_saves;
begin
 select * into m from public.hemicycle_economy_state where id for update;
 select * into old from public.hemicycle_economy_operations where user_id=p_actor and operation_id=p_operation_id;
 if found then if old.request is distinct from p_request then raise exception 'Operación reutilizada con otros datos.';end if;return true;end if;
 if m.revision<>p_version then return false;end if;
 if p_operation_id is null or jsonb_typeof(p_updates)<>'array' or jsonb_typeof(p_market)<>'object' then raise exception 'Operación no válida.';end if;
 if p_request->>'type'='offline-settle' then
 perform 1 from public.hemicycle_online_rankings where user_id=p_actor for update;
 perform 1 from public.hemicycle_offline_tickets where id=(p_request->>'ticketId')::uuid and user_id=p_actor for update;
 if not found or exists(select 1 from public.hemicycle_offline_tickets where id=(p_request->>'ticketId')::uuid and (result is not null or expires_at+interval '30 days'<=now())) then raise exception 'Partida descargada ya procesada o caducada.';end if;
 end if;
 perform 1 from public.hemicycle_cloud_saves where user_id in(select (value->>'userId')::uuid from jsonb_array_elements(p_updates)) order by user_id for update;
 for u in select value from jsonb_array_elements(p_updates) loop
  select * into stored from public.hemicycle_cloud_saves where user_id=(u->>'userId')::uuid;
  if not found or stored.revision<>(u->>'revision')::bigint then return false;end if;
  if stored.source_id is distinct from u#>>'{payload,identity,id}' then raise exception 'El ID vinculado no coincide.';end if;
 end loop;
 for u in select value from jsonb_array_elements(p_updates) loop
  update public.hemicycle_cloud_saves set payload=u->'payload',revision=revision+1,last_operation_id=p_operation_id,updated_at=now() where user_id=(u->>'userId')::uuid;
 end loop;
 if p_request->>'type'='offline-settle' then
 update public.hemicycle_offline_tickets set result=p_result where id=(p_request->>'ticketId')::uuid and user_id=p_actor;
 if p_result->>'mode'='ranked' then
 insert into public.hemicycle_online_rankings(user_id,elo,wins,losses) values(p_actor,(p_result->>'eloAfter')::bigint,case when (p_result->>'win')::boolean then 1 else 0 end,case when (p_result->>'win')::boolean then 0 else 1 end) on conflict(user_id) do update set elo=excluded.elo,wins=public.hemicycle_online_rankings.wins+excluded.wins,losses=public.hemicycle_online_rankings.losses+excluded.losses;
 end if;
 end if;
 update public.hemicycle_economy_state set revision=revision+1,data=p_market where id;
 insert into public.hemicycle_economy_operations(user_id,operation_id,request,result) values(p_actor,p_operation_id,p_request,p_result);
 return true;
end $$;
create or replace function public.hemicycle_offline_download(p_actor uuid,p_rules text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare saved public.hemicycle_cloud_saves; n integer; tickets jsonb; context jsonb; total integer;
begin
 if p_rules not in ('offline1','offline2') then raise exception 'Reglas no compatibles.';end if;
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

-- Old applications retain their historical engine.
create or replace function public.hemicycle_offline_download(p_actor uuid)
returns jsonb language sql security definer set search_path='' as $$select public.hemicycle_offline_download(p_actor,'offline1')$$;
revoke all on function public.hemicycle_offline_download(uuid,text) from public,anon,authenticated;
grant execute on function public.hemicycle_offline_download(uuid,text) to service_role;
notify pgrst,'reload schema';
commit;
