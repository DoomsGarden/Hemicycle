-- Hemicycle: perfiles de cuenta y nick. Ejecutar completo en SQL Editor de Supabase.
-- No importa ni modifica colecciones, FS, Elo, estadísticas o logros existentes.
begin;
create table if not exists public.hemicycle_account_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 nickname text,
 nickname_changed_at timestamptz,
 created_at timestamptz not null default now(),
 constraint hemicycle_nickname_state check ((nickname is null) = (nickname_changed_at is null)),
 constraint hemicycle_nickname_length check (nickname is null or char_length(nickname) between 3 and 20)
);
alter table public.hemicycle_account_profiles enable row level security;
revoke all on public.hemicycle_account_profiles from public, anon, authenticated;
grant select on public.hemicycle_account_profiles to authenticated;
do $$
begin
 if not exists (select 1 from pg_policies where schemaname = 'public'
  and tablename = 'hemicycle_account_profiles' and policyname = 'hemicycle_read_own_profile') then
  create policy hemicycle_read_own_profile on public.hemicycle_account_profiles
   for select to authenticated using ((select auth.uid()) = user_id);
 end if;
end $$;

create or replace function public.hemicycle_get_profile()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); p public.hemicycle_account_profiles;
begin
 if actor is null then raise exception 'Debes iniciar sesión.' using errcode = '28000'; end if;
 insert into public.hemicycle_account_profiles(user_id) values(actor) on conflict do nothing;
 select * into p from public.hemicycle_account_profiles where user_id = actor;
 return jsonb_build_object('user_id',p.user_id,'nickname',p.nickname,
  'nickname_changed_at',p.nickname_changed_at,
  'next_nickname_change_at',p.nickname_changed_at + interval '1 year',
  'can_rename',p.nickname_changed_at is null or now() >= p.nickname_changed_at + interval '1 year');
end $$;

create or replace function public.hemicycle_set_nickname(p_nickname text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid(); p public.hemicycle_account_profiles; clean text;
begin
 if actor is null then raise exception 'Debes iniciar sesión.' using errcode = '28000'; end if;
 clean := btrim(normalize(p_nickname, NFC));
 if clean is null or char_length(clean) not between 3 and 20
  or clean !~ '^[[:alnum:]ÁÉÍÓÚÜÑáéíóúüñ ._-]+$' then
  raise exception 'Usa entre 3 y 20 caracteres: letras, números, espacios, punto, guion o guion bajo.' using errcode = '22023';
 end if;
 insert into public.hemicycle_account_profiles(user_id) values(actor) on conflict do nothing;
 select * into p from public.hemicycle_account_profiles where user_id = actor for update;
 if clean = p.nickname then return public.hemicycle_get_profile(); end if;
 if p.nickname_changed_at is not null and now() < p.nickname_changed_at + interval '1 year' then
  raise exception 'Ya has utilizado el cambio gratuito. Podrás volver a cambiarlo al cumplirse un año.' using errcode = 'P0001';
 end if;
 update public.hemicycle_account_profiles set nickname = clean, nickname_changed_at = now() where user_id = actor;
 return public.hemicycle_get_profile();
end $$;
revoke all on function public.hemicycle_get_profile() from public, anon;
revoke all on function public.hemicycle_set_nickname(text) from public, anon;
grant execute on function public.hemicycle_get_profile() to authenticated;
grant execute on function public.hemicycle_set_nickname(text) to authenticated;
commit;
