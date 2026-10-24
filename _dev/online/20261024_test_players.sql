-- Ejecutar DESPUÉS de rooms.sql. Lista optativa y presencia de probadores.
-- No modifica colecciones, saldo, clasificación, nicks ni logros.
begin;
create table if not exists public.hemicycle_test_players (
 id uuid primary key default gen_random_uuid(),
 user_id uuid unique not null references auth.users(id) on delete cascade,
 visible boolean not null default false,
 last_seen timestamptz not null default now()
);
alter table public.hemicycle_test_players enable row level security;
revoke all on public.hemicycle_test_players from public,anon,authenticated;
alter table public.hemicycle_online_rooms add column if not exists invited_id uuid references auth.users(id);
create or replace function public.hemicycle_test_directory()
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); players jsonb; invitations jsonb; me jsonb; nicks jsonb:='{}'::jsonb;
begin
 if actor is null then raise exception 'Inicia sesión.' using errcode='28000';end if;
 -- Los nicks de cuenta se leen si existe el esquema de perfiles del juego.
 -- Nunca se utilizan el correo ni los metadatos personales de Google.
 if to_regclass('public.hemicycle_account_profiles') is not null then
  execute 'select coalesce(jsonb_object_agg(a.user_id::text,a.nickname),''{}''::jsonb) from public.hemicycle_account_profiles a join public.hemicycle_test_players p on p.user_id=a.user_id where p.visible and a.nickname is not null' into nicks;
 end if;
 select jsonb_build_object('id',id,'visible',visible) into me from public.hemicycle_test_players where user_id=actor;
 select coalesce(jsonb_agg(x.item order by x.online desc,x.name,x.id),'[]'::jsonb) into players from (
  select p.id,p.last_seen>now()-interval '90 seconds' as online,coalesce(nicks->>p.user_id::text,'Jugador #'||upper(left(p.id::text,6))) as name,
   jsonb_build_object('id',p.id,'nickname',coalesce(nicks->>p.user_id::text,'Jugador #'||upper(left(p.id::text,6))),'online',p.last_seen>now()-interval '90 seconds') as item
  from public.hemicycle_test_players p
  where p.visible and p.user_id<>actor order by p.last_seen>now()-interval '90 seconds' desc,coalesce(nicks->>p.user_id::text,'Jugador #'||upper(left(p.id::text,6))),p.id limit 200
 ) x;
 select coalesce(jsonb_agg(x.item order by x.expires_at),'[]'::jsonb) into invitations from (
  select r.expires_at,jsonb_build_object('id',r.id,'nickname',coalesce(nicks->>p.user_id::text,'Jugador #'||upper(left(p.id::text,6))),'expiresAt',r.expires_at) as item
  from public.hemicycle_online_rooms r join public.hemicycle_test_players p on p.user_id=r.host_id
 
  where r.invited_id=actor and r.guest_id is null and r.expires_at>now() order by r.expires_at limit 20
 ) x;
 return jsonb_build_object('self',me,'players',players,'invitations',invitations);
end $$;
create or replace function public.hemicycle_test_presence(p_visible boolean,p_online boolean)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();
begin
 if actor is null then raise exception 'Inicia sesión.' using errcode='28000';end if;
 if p_visible is null or p_online is null then raise exception 'Estado no válido.';end if;
 insert into public.hemicycle_test_players(user_id,visible,last_seen) values(actor,p_visible,case when p_online then now() else now()-interval '2 minutes' end)
 on conflict(user_id) do update set visible=excluded.visible,last_seen=excluded.last_seen;
 return public.hemicycle_test_directory();
end $$;
create or replace function public.hemicycle_test_invite(p_player_id uuid,p_request_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); target_id uuid; result jsonb; r public.hemicycle_online_rooms;
begin
 if actor is null then raise exception 'Inicia sesión.' using errcode='28000';end if;
 select user_id into target_id from public.hemicycle_test_players where id=p_player_id and visible;
 if target_id is null or target_id=actor then raise exception 'Jugador no disponible.';end if;
 if not exists(select 1 from public.hemicycle_test_players where user_id=actor and visible) then raise exception 'Activa tu presencia en la lista.';end if;
 result:=public.hemicycle_room_create(p_request_id);
 select * into r from public.hemicycle_online_rooms where id=(result->>'id')::uuid for update;
 if r.guest_id is not null or r.expires_at<=now() then raise exception 'Sala no disponible.';end if;
 if r.invited_id is not null and r.invited_id<>target_id then raise exception 'La operación ya pertenece a otra invitación.';end if;
 update public.hemicycle_online_rooms set invited_id=target_id where id=r.id;
 return public.hemicycle_room_view(r.id);
end $$;
create or replace function public.hemicycle_test_accept(p_room_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); r public.hemicycle_online_rooms;
begin
 if actor is null then raise exception 'Inicia sesión.' using errcode='28000';end if;
 select * into r from public.hemicycle_online_rooms where id=p_room_id for update;
 if not found or actor is distinct from r.invited_id or r.expires_at<=now() then raise exception 'Invitación no disponible.';end if;
 if r.guest_id is not null and r.guest_id<>actor then raise exception 'Sala completa.';end if;
 update public.hemicycle_online_rooms set guest_id=actor where id=r.id;
 return public.hemicycle_room_view(r.id);
end $$;
-- Un código compartido no permite saltarse el destinatario de una invitación.
create or replace function public.hemicycle_room_join(p_code text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.hemicycle_online_rooms; actor uuid:=auth.uid();
begin
 if actor is null then raise exception 'Inicia sesión.' using errcode='28000';end if;
 if p_code is null or upper(p_code)!~'^[0-9A-F]{12}$' then raise exception 'Código no válido.';end if;
 select * into r from public.hemicycle_online_rooms where code=upper(p_code) for update;
 if not found or r.expires_at<=now() then raise exception 'Sala no disponible.';end if;
 if actor=r.host_id then raise exception 'Usa otra cuenta para unirte a tu sala.';end if;
 if r.invited_id is not null and r.invited_id<>actor then raise exception 'Invitación para otro jugador.';end if;
 if r.guest_id is not null and r.guest_id<>actor then raise exception 'La sala está completa.';end if;
 update public.hemicycle_online_rooms set guest_id=actor where id=r.id;
 return public.hemicycle_room_view(r.id);
end $$;
revoke all on function public.hemicycle_test_directory(),public.hemicycle_test_presence(boolean,boolean),public.hemicycle_test_invite(uuid,uuid),public.hemicycle_test_accept(uuid) from public,anon;
grant execute on function public.hemicycle_test_directory(),public.hemicycle_test_presence(boolean,boolean),public.hemicycle_test_invite(uuid,uuid),public.hemicycle_test_accept(uuid) to authenticated;
commit;
