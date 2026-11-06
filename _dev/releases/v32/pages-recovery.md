# Publicación de Pages: diagnóstico y alternativa preparada

No se ha activado este candidato ni se ha publicado el juego.

La secuencia comprobada es #210 queued, #211–214 success, #215–216 queued. Esto demuestra que un registro antiguo en cola no siempre impide publicaciones posteriores; no demuestra que #210 cause los fallos recientes.

Para #215 y #216 se probaron cancelación normal y forzada con la API 2026-03-10. Ambas vías respondieron HTTP 409: `Cannot cancel a workflow re-run that has not yet queued.` El borrado, autorizado posteriormente por el usuario, fue rechazado para ambas con HTTP 403: `Could not delete the workflow run`. No se borró ninguna. Sus despliegues originales figuran como failure; no hay aprobaciones pendientes. #214 sigue siendo el último despliegue correcto comprobado.

La cancelación directa del despliegue de Pages respondió 403 `Resource not accessible by integration`. Los permisos de administrador del propietario del repositorio no amplían los permisos concedidos a la integración.

Los avisos de Node 20/24 y Ubuntu no causaron un fallo de construcción observado: el build y la subida de los artefactos terminaron correctamente. Cambiar la versión del juego a v32.0.0.1 no soluciona por sí mismo la publicación. Un commit nuevo sí crea una ejecución diferente.

## Candidato de publicación controlada

[pages-workflow-candidate.yml](pages-workflow-candidate.yml) conserva Jekyll y las exclusiones de `_config.yml`, usa Ubuntu 24.04 y acciones oficiales con runtimes actuales. Solo tiene activación manual y utiliza su propio grupo de concurrencia. No modifica datos de Supabase ni crea un dominio nuevo.

Cuando las correcciones estén revisadas y el usuario autorice una publicación:

1. Revisar el candidato y colocarlo en `.github/workflows/pages.yml`.
2. Guardar estos cambios en main, coordinando el cambio con la configuración de Pages para evitar un intento automático nativo adicional.
3. En Settings → Pages → Build and deployment, cambiar Source de Deploy from a branch a GitHub Actions. Conservar el dominio hemicycle.online y HTTPS; no eliminar ni desactivar el sitio.
4. Lanzar manualmente Publicar Hemiciclo desde main y comprobar build, deploy, commit y recursos servidos.
5. Si la API de Pages vuelve a rechazar el despliegue, conservar los logs y escalar a GitHub con las ejecuciones y los códigos recopilados.

Esto proporciona control sobre el workflow y evita depender del reintento del flujo nativo, pero no garantiza corregir un estado interno de Pages. No debe activarse a ciegas ni repetirse en bucle. La confirmación final requiere un despliegue satisfactorio y comprobación de la web.
