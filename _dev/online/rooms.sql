-- Fase de pruebas: salas privadas autenticadas, sin partidas, premios ni migraciones.
-- No ejecutar hasta preparar el servicio de pruebas. No cambia los respaldos existentes.
begin;
create table if not exists public.hemicycle_online_rooms (
 id uuid primary key default gen_random_uuid(),
 host_id uuid not null references auth.users(id),
 guest_id uuid references auth.users(id),
 invited_id uuid references auth.users(id),
 request_id uuid not null,
 code text unique not null default upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),
 expires_at timestamptz not null default now()+interval '30 minutes',
 unique(host_id,request_id),check(guest_id is null or guest_id<>host_id)
);
alter table public.hemicycle_online_rooms add column if not exists invited_id uuid references auth.users(id);
alter table public.hemicycle_online_rooms enable row level security;
revoke all on public.hemicycle_online_rooms from public,anon,authenticated;
create or replace function public.hemicycle_room_view(p_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.hemicycle_online_rooms; actor uuid:=auth.uid();
begin
 if actor is null then raise exception 'Inicia sesión.' using errcode='28000';end if;
 select * into r from public.hemicycle_online_rooms where id=p_id;
 if not found or (actor<>r.host_id and actor is distinct from r.guest_id) then raise exception 'Sala no disponible.' using errcode='42501';end if;
 return jsonb_build_object('id',r.id,'code',case when actor=r.host_id then r.code else null end,'role',case when actor=r.host_id then 'host' else 'guest' end,'status',case when r.expires_at<=now() then 'expired' when r.guest_id is null then 'waiting' else 'paired' end,'expiresAt',r.expires_at,'combatEnabled',false);
end $$;
create or replace function public.hemicycle_room_create(p_request_id uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); room_id uuid;
begin
 if actor is null then raise exception 'Inicia sesión.' using errcode='28000';end if;
 if p_request_id is null then raise exception 'Falta el identificador de operación.';end if;
 -- Serializa las creaciones de esta cuenta y limita las salas abiertas.
 perform pg_advisory_xact_lock(hashtextextended(actor::text,0));
 select id into room_id from public.hemicycle_online_rooms where host_id=actor and request_id=p_request_id;
 if found then return public.hemicycle_room_view(room_id);end if;
 if (select count(*) from public.hemicycle_online_rooms where host_id=actor and expires_at>now())>=3 then raise exception 'Ya tienes tres salas abiertas.';end if;
 insert into public.hemicycle_online_rooms(host_id,request_id) values(actor,p_request_id) returning id into room_id;
 return public.hemicycle_room_view(room_id);
end $$;
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
revoke all on function public.hemicycle_room_view(uuid),public.hemicycle_room_create(uuid),public.hemicycle_room_join(text) from public,anon;
grant execute on function public.hemicycle_room_view(uuid),public.hemicycle_room_create(uuid),public.hemicycle_room_join(text) to authenticated;
commit;
