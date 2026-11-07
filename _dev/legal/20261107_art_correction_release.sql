begin;
do $$ begin if exists(select 1 from public.hemicycle_legal_documents where version='2026-11-07.1' and document_hash<>'4e3e2c353cdcf5c54f82be89b072efc610700e9e94dee5e05aca127e80c0e76c') then raise exception 'La versión ya existe con otro contenido: utiliza una versión documental nueva.'; end if; end $$;
insert into public.hemicycle_legal_documents(version,document_hash,active) values ('2026-11-07.1','4e3e2c353cdcf5c54f82be89b072efc610700e9e94dee5e05aca127e80c0e76c',true) on conflict(version) do nothing;
commit;
