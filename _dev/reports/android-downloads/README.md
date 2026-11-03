# Publicación de descargas Android

3 de noviembre de 2026. Se incorporan los APK/AAB corregidos enviados por el usuario: Android 0.0.3.0, código 3, paquete `io.github.doomsgarden.twa` y certificado original. El juego web conserva v31.0.2.12.

## Archivos y rutas

- `Hemiciclo.apk` y `Hemiciclo.aab` sustituyen las copias antiguas en la raíz.
- `.well-known/assetlinks.json` coincide byte por byte con el archivo enviado; no requiere cambiar el certificado ni el identificador.
- `downloads/Readme-PWABuilder.html` conserva la guía recibida sin reemplazar `Readme.html` de presentación.
- `downloads/index.html` muestra APK y otros archivos; `downloads/android.json` recoge versiones y hashes SHA-256.
- `_config.yml` conserva la exclusión de `_dev` e incluye `.well-known` expresamente para GitHub Pages.

La distribución copia los archivos firmados sin modificarlos. No se incorporan claves privadas. No se sube una ficha a Google Play ni se cambian la versión web, la etiqueta publicada o la caché del juego. Los binarios no forman parte de la precarga.

## Verificación

[Resultado de navegador](check.json): cuatro archivos por HTTP local con hashes y tamaños exactos; descarga real con nombre `Hemiciclo.apk`; enlaces internos válidos; sin desbordamiento a 320, 393, 844 y 1280 píxeles; sin errores JavaScript. `assetlinks.json` coincide con el paquete y certificado, y Pages tiene su carpeta incluida.

[Nueve pruebas locales](tests.log): metadatos, historial y conservación de instalación atómica. El comprobador README valida enlaces, anclas, imágenes y estructura, sin desbordamiento móvil.

```sh
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/checks/android-downloads.cjs
node --test tests/metadata.test.cjs tests/changelog.test.cjs tests/pwa-install.test.cjs
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/marketing/check-readme.cjs
```

Las comprobaciones criptográficas previas validaron el APK con apksig 8.7.3 y el AAB con bundletool 1.18.2, CMS y hashes de 461 entradas. Esta publicación vuelve a comprobar que sus bytes son idénticos a los recibidos. La prueba de actualización sobre un dispositivo y el HTTP de producción no se sustituyen por las verificaciones locales.
