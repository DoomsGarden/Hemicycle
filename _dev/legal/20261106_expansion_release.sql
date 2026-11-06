-- Registrar la edición legal de la ampliación; conserva recibos anteriores.
begin;
do $$ begin if exists(select 1 from public.hemicycle_legal_documents where version='2026-11-06.1' and document_hash<>'32f0bdb37a0a02d3da0ca4d53aeb4040beda526216376ae743babf534e0fb072') then raise exception 'La versión ya existe con otro contenido.';end if;end $$;
insert into public.hemicycle_legal_documents(version,document_hash,active) values ('2026-11-06.1','32f0bdb37a0a02d3da0ca4d53aeb4040beda526216376ae743babf534e0fb072',true) on conflict(version) do nothing;
commit;
