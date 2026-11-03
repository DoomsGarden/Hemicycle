# Instalación web y paquetes Android

Auditoría del 3 de noviembre de 2026, con la aplicación web en v31.0.2.12.

La PWA vigente se instala desde `https://hemicycle.online/`. Su manifest conserva la identidad `./`, el punto de entrada `./` y el ámbito `./`, e incorpora descripción actual, capturas reales y orientación vertical/horizontal. La versión web se actualiza mediante sus recursos y su service worker.

## Binarios existentes

`Hemiciclo.apk` y `Hemiciclo.aab` declaran el paquete `io.github.doomsgarden.twa`, versión nativa `0.0.2.0`, y referencias a `https://doomsgarden.github.io/Hemicycle/` y a su manifest. Son envoltorios del origen anterior. La versión del envoltorio Android es independiente de la del juego web; cambiar el manifest web no reconstruye esos binarios ni cambia su origen de lanzamiento.

La revisión conserva ambos archivos firmados sin modificarlos y no los presenta como una compilación nueva de v31.0.2.12. El repositorio no contiene el proyecto Gradle ni una configuración TWA reproducible con la que regenerarlos. No se han solicitado ni leído claves privadas de firma.

## Regeneración de una actualización nativa

1. Recuperar el proyecto Android original o preparar un envoltorio TWA con `https://hemicycle.online/manifest.json` mediante PWABuilder/Bubblewrap.
2. Conservar el identificador de paquete y la firma de la aplicación existente para actualizar la misma ficha. Revisar el `versionCode` publicado antes de elegir uno superior; no asumir que coincide con la versión web.
3. Configurar lanzamiento y ámbito para `https://hemicycle.online/`, junto con orientación y metadatos actuales. Un envoltorio antiguo puede imponer su propia orientación.
4. Firmar con el procedimiento de la ficha existente y contrastar el certificado con `.well-known/assetlinks.json`. Ese vínculo no se cambia por una actualización de metadatos.
5. Probar actualización sobre la instalación anterior, navegación, acceso con Google, guardado y transición desde el origen antiguo. Los guardados locales de ambos orígenes son independientes; conservar respaldo y recuperar la nube habitual.

La regeneración requiere el proyecto/configuración y el proceso de firma originales. Esta auditoría actualiza la PWA y documenta la situación nativa; no publica una aplicación Android ni una ficha de tienda.
