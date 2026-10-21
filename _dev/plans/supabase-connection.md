# Supabase — acceso y perfil en v31.0.0.1

URL, clave publishable y retorno del sitio en `js/supabase-config.js`. Solo contiene datos públicos. No requiere secretos de administración en el cliente. El propietario ha configurado Site URL/Redirect URLs y Google en Supabase; ha creado un cliente OAuth web en Google Auth Platform con callback `https://fdotndyenfreqbmzqdzd.supabase.co/auth/v1/callback`. Mantiene Google en pruebas y debe añadir los correos de los probadores en Audiencia → Usuarios de prueba.

El propietario confirmó ejecución **Success** de `_dev/supabase/20261021_account_profiles.sql`, después de sustituir el antiguo DROP POLICY por una creación condicionada. Puede guardar la consulta como «Hemicycle — Perfil y nick anual»; su nombre de editor no afecta a los objetos SQL. La migración completa se puede repetir y conserva datos y nicks existentes. No ejecuta borrados de tablas o filas.

El SDK oficial supabase-js 2.118.0 está incluido localmente con licencia MIT, sin CDN. Persistencia de sesión y renovación automática, flujo OAuth PKCE, proveedores Google. Al pulsar INICIAR: una sesión ya disponible continúa; en otro caso aparece acceso o invitado. El invitado es una elección por apertura; no se presenta como una cuenta autenticada. Una cuenta guarda sesión en ese navegador y puede cerrarla explícitamente. Cambiar de dispositivo requiere volver a identificarse; no invalida automáticamente las otras sesiones.

Perfil: `js/player-profile.js`, ventana exterior al app inert, foco controlado y Escape. Botón cuadrado solo en Inicio, a la izquierda de V/D. Estadísticas de este dispositivo, con cuenta/nick aparte. El primer nick es gratuito; el siguiente lo será un año después del último, con reloj, permisos y bloqueo de fila en PostgreSQL. No existen pagos ni cambios adicionales de pago. Los nombres no son identificadores únicos; la identidad de cuenta es auth.users.id.

La caché PWA solo atiende al mismo origen y no guarda respuestas de Supabase ni otros proveedores. El caché local opcional de nick está separado por UUID y no autoriza cambios offline. Cerrar sesión utiliza el SDK y no borra colección ni progreso local.

**No hay aún guardado de colección en nube, migración ni multijugador de producción.** El perfil lo indica. Los reinicios de FS/Elo/Liga siguen reservados a la futura importación explícita. El siguiente hito será diseñar y probar esa importación/autoridad del servidor antes de convertir los datos de juego locales en cloud.

## Verificación

Pruebas PostgreSQL compatibles mediante PGlite 0.3.14: esquema auth mínimo aislado, roles anon/authenticated, RLS, permisos, primer nick, año de espera, reintentos y reaplicación sin pérdidas. Ejecutar con `PGLITE_MODULE=/ruta/a/@electric-sql/pglite node _dev/checks/account-sql.cjs`.

Playwright con el SDK oficial y endpoints simulados: autorización, PKCE y retorno, tokens persistentes, perfil/RPC, bloqueo anual, cierre de sesión, invitado, errores de SDK/perfil, guías y conservación del progreso. No sustituye una prueba manual de Google con una cuenta autorizada real.

Se intentó leer `/auth/v1/settings` real; el proxy del entorno rechaza ese destino antes de alcanzar Supabase (HTTP 403 de túnel). No se solicitó ninguna credencial privada. El propietario probará el acceso con su cuenta al publicar.
