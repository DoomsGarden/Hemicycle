# Auditoría de metadatos · v31.0.2.12

3 de noviembre de 2026. Se mantiene la versión y su etiqueta; revisión de caché `hemiciclo-v31.0.2.12-meta6`, 234 recursos. No se ejecuta SQL ni se consultan cuentas o servicios de producción.

El manifest conserva `id`, `start_url` y `scope` como `./`; actualiza descripción, dirección de lectura, orientación y cuatro capturas reales. Los iconos y el vínculo Android conservan sus bytes. HTML incorpora URL canónica, Open Graph, Twitter y datos estructurados de la versión. `Readme.html` presenta el juego en lugar de redirigir a documentación externa.

README, prensa, capturas, ZIP y documentación online reflejan el código vigente. Las instrucciones iniciales de salas se archivan como históricas. `/health` y nuevas exportaciones de comprensión identifican v31.0.2.12; el protocolo del estudio conserva su identificador. El verificador general deriva versión y carpeta del juego. El índice de fuentes incorpora v31.0.2.11 y v31.0.2.12, ausentes hasta esta revisión.

Se conservan las versiones por recurso que no ha cambiado, los motores de partidas históricas, los informes anteriores y las versiones/hash de consentimiento y fuentes documentales. No son identificadores de la versión actual del juego.

## Verificación

- [20 pruebas locales](tests.log): coherencia de manifest/HTML/dominio/versión, rutas, precaché, iconos, hashes de capturas, historial, rechazo de instalación incompleta y servidor con transporte simulado.
- [Actualización PWA](pwa/pwa.json) desde `f2d70a1`: reemplazo de caché, 234 recursos disponibles, progreso, liga, audio y consentimiento conservados; fuentes, seis tapetes verticales y motor histórico sin conexión; Mercado en tres anchos y cuatro pestañas.
- La presentación y su banner funcionan sin conexión con parámetros en la URL; las cuatro capturas del manifest se decodifican con sus dimensiones declaradas. Sin errores JavaScript.
- Marketing: siete capturas reales con estado local aislado, cuatro WebP sin recorte ni redimensionado, siete PNG RGB 1080×1920 sin transparencia y ZIP íntegro. README: 42 destinos relativos, tres anclas, diez imágenes y ausencia de desbordamiento móvil. Se inspeccionan banner y captura horizontal.

Comandos reproducibles desde la raíz:

```sh
node --test tests/metadata.test.cjs tests/changelog.test.cjs tests/pwa-install.test.cjs tests/online/server.test.cjs
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/checks/metadata-v12-pwa.cjs
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/marketing/check-readme.cjs
```

## Pendiente nativo

`Hemiciclo.apk` y `Hemiciclo.aab` conservan la versión nativa `0.0.2.0`, paquete `io.github.doomsgarden.twa` y origen antiguo `https://doomsgarden.github.io/Hemicycle/`. No hay proyecto Gradle/configuración TWA reproducible en el repositorio. No se han reconstruido, firmado ni publicado. [Guía de regeneración](../../android/README.md). [Auditoría y hashes sin cambios](audit.json).
