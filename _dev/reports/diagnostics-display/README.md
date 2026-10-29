# Corrección del diagnóstico de conexión

29-10-2026, sobre 6030b1a. La captura aportada muestra las etiquetas HTML y un botón de descarga rojo: la llamada a showModal enviaba isDanger=true y omitía trustedHtml. Se corrige solo esa llamada, conservando el escape de los nombres, y se aclara que los tiempos son de operaciones completas. Se ajusta el singular de operación/error y se muestran las interrupciones por separado. Nueva caché v31.0.2.6-diagnostics1 para distribuir el documento corregido también en PWA.

Las cifras de la captura (media de 714 ms en 15 peticiones económicas; 1.743 ms en una operación de cuenta/directorio; 397 ms en cinco peticiones del Mercado) no miden RTT ni ping geográfico. Economía mide fetch y lectura JSON de una petición; la operación online puede incluir comprobaciones de nube y peticiones adicionales. No se ha medido red real desde España, separado el tiempo servidor/proveedor ni calculado una distribución representativa con esa única operación de cuenta. No se atribuye el coste al plan o a la distancia ni se modifica infraestructura con esa muestra. No se han optimizado consultas en esta corrección.

Validación: diez pruebas correctas de métricas y service worker. Navegador con ambas edades de invitado, prácticas y recorridos completos, perfil conservado, Opciones al 116 % en tres tamaños; se comprueba que la ventana tiene párrafos reales, no contiene etiquetas visibles, explica operaciones/ping y no asigna la clase danger a la descarga. Generador legal sin cambios: versión 2026-10-29.2 y mismo hash. No requiere SQL ni cambios de servicios.

Reproducir: node --test tests/stabilization-diagnostics.test.cjs tests/service-worker.test.cjs; node _dev/checks/stabilization-browser.cjs (Playwright/Chromium y servidor local 8055).
