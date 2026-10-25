# v31.0.2.2 — Alta y migración cloud

## Hallazgos

Jugar como invitado antes de vincular la cuenta conduce a `/economy/import-request`, no a crear un perfil inicial nuevo. El cliente anterior mostraba un error de migración genérico para cualquier rechazo SQL. Incluso cuando la solicitud era aceptada, Nube volvía a mostrar «pendiente de activar» y permitía intentar preparar partidas de cuenta sin respaldo validado.

La comprobación del administrador confirmó que las tres funciones de activación, descarga y solicitud existen, son SECURITY DEFINER y permiten ejecución a service_role. Esto NO verifica la clave usada por Render ni el error concreto de la petición real. La causa de producción sigue pendiente de su referencia tras desplegar esta corrección. No se atribuye el incidente a una función ausente.

## Cambios

- Respuestas de economía distinguen funciones ausentes, permiso del servicio, respaldo ausente y copia ya vinculada. Los errores incluyen referencias de operación y SQLSTATE/HTTP, sin mensajes arbitrarios de base de datos ni datos privados.
- Solo después de confirmarse la solicitud de migración se conserva su estado por cuenta e identidad. Un rechazo no se presenta como solicitud enviada. Se mantienen copia local y copia de recuperación.
- Iniciar una partida con cuenta sin vincular ofrece ir a Nube. La sincronización de partidas solo se ofrece una vez vinculada.
- Health identifica versión del servicio y commit de Render para distinguir frontend publicado de backend desplegado.
- Misma versión visible v31.0.2.2, novedades previas intactas, caché PWA y consultas de JS renovadas. No añade SQL ni aprueba migraciones automáticamente.

## Validación

402 pruebas generales más 155 online: 557 correctas. Comprobación final focalizada: 45 correctas. Chromium real con SDK, HTTP y PostgreSQL PGlite: cuenta nueva Google → activar → Rápida; progreso previo → fallo de función simulado → error preciso sin borrar datos; reintento correcto → solicitud pendiente persistente; aprobación separada simulada → recuperar copia → Rápida con FS y estadísticas preservados. OAuth se simula; no se usan cuentas de producción.

Actualización PWA desde 9668570, 91 recursos, progreso/Liga/audio conservados, funcionamiento sin red. Producción Render/Supabase no accesible desde la política de red del entorno. La publicación en Pages se comprueba comparando sus archivos.
