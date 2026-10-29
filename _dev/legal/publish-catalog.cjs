'use strict';
// Produce SQL for review only. Never connects to Supabase or executes a mutation.
require('node:child_process').execFileSync(process.execPath,[require('node:path').join(__dirname,'build.cjs'),'--check'],{stdio:'ignore'});
const data=require('../../js/legal-documents.js');if(!data.published||data.issues.length)throw Error('Los borradores no se registran como condiciones publicadas.');
if(!/^[a-zA-Z0-9.\-]{1,48}$/.test(data.version))throw Error('Versión no válida.');
console.log("begin;\ndo $$ begin if exists(select 1 from public.hemicycle_legal_documents where version='"+data.version+"' and document_hash<>'"+data.hash+"') then raise exception 'La versión ya existe con otro contenido: utiliza una versión documental nueva.'; end if; end $$;\ninsert into public.hemicycle_legal_documents(version,document_hash,active) values ('"+data.version+"','"+data.hash+"',true) on conflict(version) do nothing;\ncommit;");
