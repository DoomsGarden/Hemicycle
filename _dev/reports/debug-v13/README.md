# v31.0.2.13 · Verificación del parche

Fecha: 04-11-2026. Base publicada: `9a88ae7` (`hemiciclo-v31.0.2.12-auto8`). Caché nueva: `hemiciclo-v31.0.2.13-debug1`.

## Correcciones

Las dos regresiones de nube se reprodujeron antes de modificar `js/cloud-save.js`: el inicio quedaba en `preparing` al competir con un guardado sin vínculo, y un guardado en cola podía subir tras desechar su instancia. [Resultado anterior](cloud-before.log) y [resultado corregido](cloud-after.log). Se omite el guardado innecesario antes de la preparación y se coteja la generación al obtener el bloqueo.

## Resultados

- [1.872 pruebas del juego aprobadas](root-tests.log), incluidas las dos nuevas regresiones.
- [169 pruebas online aprobadas](online-tests.log), con SQL aislado mediante PGlite.
- [Actualización PWA en Chromium](pwa/pwa.json): 234 recursos, conservación de progreso, aceptación legal, liga y preferencias; nueva caché; carga sin conexión; instalación y capturas; motores offline históricos; mercado a 320/393/768 px. [Ejecución](pwa.log). Herramienta: `_dev/checks/debug-v13-pwa.cjs`.

En la suite online existía una expectativa anterior al guardado automático: suponía que Clasificatoria nunca preparaba una nube sin vínculo. También falla en la base publicada con el código antiguo, como muestra [la reproducción de referencia](preflight-baseline.log). Se actualizó el caso para comprobar la protección que sigue siendo necesaria: al reemplazar expresamente el progreso local, la preparación automática queda pausada y Clasificatoria no lo sube por su cuenta. No se cambió el comportamiento del preflight para satisfacer la prueba.

Los metadatos de app, health, README y exportación de pruebas identifican v31.0.2.13. Los manifiestos de medios siguen identificando la versión realmente capturada, v31.0.2.12; se comprueba su coherencia y sus hashes sin relabelar imágenes antiguas. Los paquetes Android y la identidad de instalación se conservan.

La preparación editorial reservada tiene su [informe independiente](../../expansions/espana-20/README.md). No forma parte de los anuncios del parche ni del catálogo público. Se validó con 164 pruebas adicionales y render de navegador; el juego publicado sigue limitado a 120 oradores y 360 frases.
