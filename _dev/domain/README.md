# Migración a hemicycle.online

Preparación del 29-10-2026. El dominio se presenta sobre GitHub Pages; las cuentas y los guardados permanecen en el mismo Supabase y el servicio online permanece en Render.

## Hechos confirmados

- Dooms conserva una exportación de su partida avanzada.
- El archivo DNS aportado contiene cuatro A para el dominio raíz: 185.199.108.153, 185.199.109.153, 185.199.110.153 y 185.199.111.153. Todos con `cf-proxied:false`.
- `www` tiene CNAME hacia doomsgarden.github.io, también DNS only. No se necesitan cambios de los MX, SPF, DKIM, DMARC o registros de verificación del correo.
- El cliente reconoce https://hemicycle.online y https://www.hemicycle.online para sus retornos. Los recursos y el manifiesto son relativos; la aplicación puede vivir en `/`.
- Se prepara `CNAME` con hemicycle.online. No publicar en la rama fuente de Pages hasta comprobar los retornos de acceso y CORS.

## Paneles antes del cambio

Supabase → Authentication → URL Configuration: Site URL https://hemicycle.online/. Admitir como Redirect URLs las rutas de entrada y recuperación del dominio. Conservar durante la transición las URLs autorizadas de GitHub Pages. El cliente actual solicita `/` para acceso y `/?account=recovery` para recuperación. Si se admite `www`, comprobar sus retornos y su redirección al dominio canónico.

Render → Environment → ALLOWED_ORIGINS debe incluir los orígenes exactos https://hemicycle.online y https://www.hemicycle.online, conservando https://doomsgarden.github.io durante la transición y los demás orígenes que sigan siendo necesarios. Son orígenes sin ruta ni barra final. Este valor no contiene secretos; no compartir el resto de variables.

GitHub → DoomsGarden/Hemicycle → Settings → Pages: Custom domain hemicycle.online. Guardar si el archivo CNAME no ha actualizado ya ese ajuste. Esperar el resultado de DNS/certificado y activar Enforce HTTPS cuando esté disponible. La verificación del dominio en la cuenta de GitHub aporta protección frente a usos no autorizados; usar únicamente el TXT que indique su panel. Mantener la nube gris durante esa comprobación.

El callback del proveedor Google sigue siendo el endpoint de Supabase ya configurado. Cambiar el dominio de la interfaz no implica reemplazar ese callback por la portada del juego. Revisar los datos públicos de la pantalla de consentimiento y sus enlaces cuando corresponda.

## Progreso y cambio de origen

El almacenamiento de github.io y hemicycle.online es independiente. Antes del cambio, terminar las partidas y sincronizar los premios pendientes desde la dirección antigua. La exportación JSON conserva la identidad, colección, estadísticas, objetivos, gabinetes y otros campos declarados en el formato; no equivale a trasladar sesiones, toda la historia local ni la cola completa de partidas offline de IndexedDB.

En el dominio nuevo, acceder con la cuenta habitual avanzada, no con la cuenta de correo del juego usada para pruebas. Revisar los datos de Nube y recuperar la copia de esa cuenta. Confirmar ID, colección, FS y Elo antes de eliminar cualquier dato antiguo. Conservar el JSON por si hace falta revisar progreso más reciente; no importarlo a una cuenta de pruebas para duplicar inventario ni cambiar el UUID manualmente.

Mantener la cuenta de pruebas en otro navegador o perfil separado. Las pestañas normales de un mismo perfil comparten almacenamiento. La aplicación instalada desde el dominio nuevo es otra instalación/origen: verificar primero la partida y después decidir qué hacer con el acceso antiguo.

## Pruebas y límites

- `domain-auth.cjs profile`: origen HTTPS del dominio simulado, recursos locales y SDK real con transporte simulado. Google PKCE, sesión, nick, siete tamaños, logout, invitado y progreso.
- `domain-auth.cjs recovery`: alta y recuperación, enlaces PKCE e implícitos, retorno al dominio raíz, recarga, fallos, formulario y preservación del progreso.
- `domain-pwa.cjs`: servidor local en ruta raíz, 137 recursos, consulta legal y licencias, conservación de datos y uso sin conexión.

Las rutas HTTPS se cumplen desde archivos de prueba sin contactar el dominio. Estas pruebas no acreditan DNS público, certificado real ni la configuración desplegada de Supabase/Render. La política de red de este entorno no incluye el dominio nuevo; no se ha eludido esa restricción. Confirmar esos puntos en los paneles y en un navegador real antes de declarar completada la migración.

## Ajustes confirmados por Dooms

Render permite https://hemicycle.online, https://www.hemicycle.online y https://doomsgarden.github.io. La captura de Supabase confirma los retornos raíz de Pages, dominio principal y www, además de rooms-test en Render. Se ha solicitado cambiar Site URL (todavía Pages en la captura) al dominio principal y añadir los dos retornos explícitos de recuperación. Conservamos todas las entradas existentes.

## Activación autorizada

Dooms confirmó el cambio de Site URL a https://hemicycle.online/ y los dos retornos explícitos de recuperación, conservando las cuatro entradas previas. El valor de ALLOWED_ORIGINS también está confirmado. Se publica CNAME en main y se conservan las configuraciones de correo. Confirmar en Settings → Pages la asociación del dominio y el certificado HTTPS tras el build; no se ha comprobado el destino vivo desde este entorno.
