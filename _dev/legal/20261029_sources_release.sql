begin;
do $$ begin if exists(select 1 from public.hemicycle_legal_documents where version='2026-10-29.2' and document_hash<>'13fb255ccbbebd0c18595f37be4a39c438626631a0c0dd1485ea21fa82c5798e') then raise exception 'La versión ya existe con otro contenido: utiliza una versión documental nueva.'; end if; end $$;
insert into public.hemicycle_legal_documents(version,document_hash,active) values ('2026-10-29.2','13fb255ccbbebd0c18595f37be4a39c438626631a0c0dd1485ea21fa82c5798e',true) on conflict(version) do nothing;
commit;
