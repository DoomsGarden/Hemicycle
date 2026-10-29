-- Infraestructura de aceptación. No activa documentos: el catálogo empieza vacío.
-- Completar y revisar los textos antes de registrar una versión publicada.
begin;
create table if not exists public.hemicycle_legal_documents (
 version text primary key check (char_length(version) between 1 and 48),
 document_hash text not null check (document_hash ~ '^[0-9a-f]{64}$'),
 active boolean not null default false,
 published_at timestamptz not null default now(),
 unique(version,document_hash)
);
create table if not exists public.hemicycle_legal_receipts (
 user_id uuid not null references auth.users(id) on delete cascade,
 document_version text not null,
 document_hash text not null,
 client_receipt_id uuid not null,
 client_accepted_at timestamptz not null,
 received_at timestamptz not null default now(),
 declared_14_plus boolean not null check (declared_14_plus),
 primary key(user_id,document_hash),
 foreign key(document_version,document_hash) references public.hemicycle_legal_documents(version,document_hash)
);
alter table public.hemicycle_legal_documents enable row level security;
alter table public.hemicycle_legal_receipts enable row level security;
revoke all on public.hemicycle_legal_documents,public.hemicycle_legal_receipts from public,anon,authenticated;
grant select on public.hemicycle_legal_documents to anon,authenticated;
grant select on public.hemicycle_legal_receipts to authenticated;
drop policy if exists hemicycle_legal_published on public.hemicycle_legal_documents;
create policy hemicycle_legal_published on public.hemicycle_legal_documents for select to anon,authenticated using(active);
drop policy if exists hemicycle_legal_own_receipts on public.hemicycle_legal_receipts;
create policy hemicycle_legal_own_receipts on public.hemicycle_legal_receipts for select to authenticated using((select auth.uid())=user_id);
create or replace function public.hemicycle_accept_legal(p_version text,p_hash text,p_receipt_id uuid,p_accepted_at timestamptz,p_declared_14_plus boolean)
returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); receipt public.hemicycle_legal_receipts;
begin
 if actor is null then raise exception 'Inicia sesión.' using errcode='28000'; end if;
 if p_receipt_id is null or p_accepted_at is null or p_accepted_at<'2000-01-01'::timestamptz or p_accepted_at>clock_timestamp()+interval '5 minutes' or p_declared_14_plus is distinct from true then
  raise exception 'La aceptación no es válida.' using errcode='22023';
 end if;
 if not exists(select 1 from public.hemicycle_legal_documents where version=p_version and document_hash=p_hash and active) then
  raise exception 'La versión documental no está publicada.' using errcode='22023';
 end if;
 insert into public.hemicycle_legal_receipts(user_id,document_version,document_hash,client_receipt_id,client_accepted_at,declared_14_plus)
 values(actor,p_version,p_hash,p_receipt_id,p_accepted_at,true) on conflict(user_id,document_hash) do nothing;
 select * into receipt from public.hemicycle_legal_receipts where user_id=actor and document_hash=p_hash;
 return jsonb_build_object('user_id',receipt.user_id,'document_hash',receipt.document_hash,'version',receipt.document_version,'client_accepted_at',receipt.client_accepted_at,'received_at',receipt.received_at,'declared_14_plus',receipt.declared_14_plus);
end $$;
revoke all on function public.hemicycle_accept_legal(text,text,uuid,timestamptz,boolean) from public,anon;
grant execute on function public.hemicycle_accept_legal(text,text,uuid,timestamptz,boolean) to authenticated;
commit;
