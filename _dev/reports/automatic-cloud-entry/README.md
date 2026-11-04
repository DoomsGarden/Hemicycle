# Guardado automático al entrar · v31.0.2.12

La sesión de correo o Google inicia la preparación de la nube sin abrir su panel, marcar el tick ni pulsar Activar. También se aplica a sesiones persistentes y a jugadores existentes que no habían vinculado el progreso de este dispositivo. La versión y su etiqueta se conservan; caché `hemiciclo-v31.0.2.12-auto8`, 234 recursos.

## Comportamiento

- Sin nube: la cuenta usa la inicialización o importación inicial del servidor existente. El progreso local y un respaldo de recuperación se conservan. La misma operación no duplica inventarios.
- Con nube: se recupera la copia de la cuenta y se respalda el progreso local anterior. Si ya estaba vinculada y tiene cambios locales, se conserva la comprobación de revisiones. Los conflictos reales siguen requiriendo revisar qué copia recuperar.
- Cambio de cuenta: un inventario con propietario diferente no se envía a la nueva cuenta; se solicita una colección inicial independiente. La identidad de esa inicialización se conserva para reintentar.
- Red interrumpida: se reintenta al reconectar, volver a la ventana o tras 15 segundos en fallos temporales. Las importaciones rechazadas no se repiten en un bucle. Una respuesta tardía de otra cuenta o posterior a cerrar sesión no restaura ni vincula datos.
- La preparación espera a completar la entrada de cuenta y la recuperación no interrumpe debates ni guías. La sesión de restablecimiento de contraseña espera a terminar ese proceso. Reemplazar un archivo local pausa el automatismo durante esa entrada; no se deshace inmediatamente una importación explícita.

La primera nube se prepara antes de continuar con la recuperación de partidas y la guía de entrada. Las consultas de la pantalla Nube muestran el estado y permiten reintentar; la activación normal no requiere confirmación manual. Se actualizan las ayudas y los avisos de partida mientras la cuenta está preparando el guardado.

## Verificación

- [Suite raíz: 1.870 pruebas, cero fallos](tests.log), incluidas SQL aisladas y casos de nube. Se añaden casos de inicio automático, cuenta existente, concurrencia, cambio de cuenta, respuesta perdida, recuperación durante un debate, pausa tras reemplazo local, error temporal con reloj simulado, rechazo definitivo y cierre de sesión durante una importación.
- [Navegador y base aislada](browser.json): seis cuentas con proveedores correo/Google, dos inicializaciones nuevas, importación pendiente de una cuenta antigua, recuperación de nube existente y de respuesta perdida y recarga. Tres aprobaciones iniciales únicas y **cero clics de activación**. Sin errores JavaScript. El 503 del registro se inyecta para probar la pérdida de respuesta.
- Capturas del estado sincronizado: [correo](email-automatic.png), [Google](google-automatic.png), [copia existente recuperada](existing-cloud.png) e [importación pendiente](pending.png).
- [Actualización PWA](pwa/pwa.json) desde `c7b9a1c`: cuatro módulos de nube actualizados en caché, 234 recursos, carga sin conexión, progreso, liga, audio y consentimiento conservados; motores históricos, fuentes, ilustraciones y disposición del Mercado conservados.
- README: comprobador de enlaces, anclas, imágenes y estructura, sin desbordamiento móvil. Los hashes de las fuentes verificadas están en [source-hashes.json](source-hashes.json).

```sh
NODE_PATH=/workspace/.hemicycle-tools/node_modules node --test --test-concurrency=2 tests/*.test.cjs
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/checks/automatic-cloud-entry.cjs
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/checks/automatic-cloud-entry-pwa.cjs
```

No se consultan cuentas de producción ni se ejecuta SQL en servicios alojados. La prueba de integración usa las migraciones existentes en PGlite y transporte simulado. No se añade una migración: la activación depende de los endpoints de economía y de la importación `automatic-local-v1` ya existentes. No cambian reglas, estadísticas, inventario, premios ni las firmas o paquetes Android.
