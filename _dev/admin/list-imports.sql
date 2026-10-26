-- Solo lectura, para el administrador en SQL Editor. Contiene datos privados;
-- exportar a un archivo local de revisión, no publicarlo en GitHub ni en el chat.
select jsonb_build_object(
 'userId',r.user_id,'nickname',p.nickname,'submittedAt',r.submitted_at,
 'payloadHash',md5(r.payload::text),'approvedAt',r.approved_at,
 'cloudExists',s.payload is not null,'payload',r.payload
) as review
from public.hemicycle_legacy_import_requests r
left join public.hemicycle_account_profiles p on p.user_id=r.user_id
left join public.hemicycle_cloud_saves s on s.user_id=r.user_id
where r.approved_at is null order by r.submitted_at limit 50;
