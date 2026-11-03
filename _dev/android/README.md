# Instalación web y paquetes Android

Auditoría del 3 de noviembre de 2026, con la aplicación web en v31.0.2.12.

La PWA vigente se instala desde `https://hemicycle.online/`. Su manifest conserva la identidad `./`, el punto de entrada `./` y el ámbito `./`, e incorpora descripción actual, capturas reales y orientación vertical/horizontal. La versión web se actualiza mediante sus recursos y su service worker.

## Paquetes publicados

El usuario proporciona nuevos `Hemiciclo.apk` y `Hemiciclo.aab`, generados con PWABuilder y su clave original. Tras corregir el identificador inicialmente cambiado, ambos conservan `io.github.doomsgarden.twa`, versión nativa **0.0.3.0**, código **3**, y abren `https://hemicycle.online/`. Admiten orientación libre, Android 7 o posterior (`minSdk 24`) y declaran `targetSdk 36`. La versión nativa es independiente de la versión web.

- [Descargar APK](https://hemicycle.online/Hemiciclo.apk).
- [Descargar AAB](https://hemicycle.online/Hemiciclo.aab).
- [Página de descargas y otros archivos](https://hemicycle.online/downloads/).
- [Versiones y hashes SHA-256](../../downloads/android.json).

La firma APK v2/v3 valida con Android apksig 8.7.3 sin errores ni advertencias. El AAB valida con bundletool 1.18.2; se verifican la firma CMS y los hashes de 461 entradas. El certificado SHA-256 en ambos archivos coincide con el original y con `.well-known/assetlinks.json`:

`FC:68:5B:B4:7C:3C:7E:5D:70:03:4A:CE:F5:D4:66:CB:02:85:6D:16:CC:5D:54:0F:69:97:58:B0:0B:7A:68:F0`

El archivo de asociación recibido coincide con el que ya estaba en el repositorio. `_config.yml` incluye explícitamente `.well-known` para publicarlo en Pages. Los paquetes permanecen fuera de la precarga del juego. La guía generada `Readme.html` se conserva en `downloads/Readme-PWABuilder.html`; la presentación web sigue en su ruta original.

El código 3 supera al 1 del paquete anterior revisado. Para Google Play debe superar el máximo usado en la ficha; si Play firma las instalaciones con otro certificado, la asociación del dominio debe incluir su huella de firma de aplicación. Esta publicación pone los archivos a disposición para descarga; no sube una ficha a Google Play.

Queda pendiente la prueba de actualización sobre un dispositivo original y la comprobación HTTP de la asociación publicada. La revisión de firmas y metadatos no sustituye esas pruebas. El cambio del antiguo origen GitHub Pages a `hemicycle.online` requiere conservar respaldo y recuperar la nube habitual, porque los guardados locales son independientes.

## Regeneración de una actualización nativa

1. Recuperar el proyecto Android original o preparar un envoltorio TWA con `https://hemicycle.online/manifest.json` mediante PWABuilder/Bubblewrap.
2. Conservar el identificador de paquete y la firma de la aplicación existente para actualizar la misma ficha. Revisar el `versionCode` publicado antes de elegir uno superior; no asumir que coincide con la versión web.
3. Configurar lanzamiento y ámbito para `https://hemicycle.online/`, junto con orientación y metadatos actuales. Un envoltorio antiguo puede imponer su propia orientación.
4. Firmar con el procedimiento de la ficha existente y contrastar el certificado con `.well-known/assetlinks.json`. Ese vínculo no se cambia por una actualización de metadatos.
5. Probar actualización sobre la instalación anterior, navegación, acceso con Google, guardado y transición desde el origen antiguo. Los guardados locales de ambos orígenes son independientes; conservar respaldo y recuperar la nube habitual.

La regeneración requiere el proyecto/configuración y el proceso de firma originales. Los archivos recibidos se distribuyen tal como fueron firmados, sin recompilarlos ni modificar sus bytes. No se publica una ficha de tienda.
