# Nube automática y contador de resultados — v32.0.0.2

Corrección solicitada el 9 de noviembre. El usuario confirma que el inicio de
partidas y la sincronización vuelven a funcionar, pero observa «Premios pendientes:
1» sin ningún regalo para reclamar. Solicita además reducir los botones de Nube y
automatizar la sincronización.

## Causa y cambio

El contador representa registros de resultados guardados en IndexedDB, no regalos
del buzón. Al adoptar el respaldo confirmado, la ventana se repintaba antes de
retirar el registro local. La notificación posterior actualizaba el perfil, pero
no la ventana de Nube: podía permanecer un «1» obsoleto.

- Se actualiza la ventana cuando cambia el registro local, también al abrirla.
  Las notificaciones antiguas no pisan una lectura más reciente ni otra cuenta.
- Se sustituye «Premios pendientes» por «Resultados por sincronizar» y se explica
  cómo se confirman automáticamente. El contador baja al retirar el registro
  confirmado, sin reiniciar ni cerrar la ventana.
- La vista normal solo tiene el botón de cerrar. Reintentar aparece ante un error.
  Descargar respaldo, copias previas y exportar resultados rechazados permanecen
  disponibles en un apartado plegado; se mantienen las confirmaciones de recuperación.
- `account-sync.js` coordina entrada, regreso a la app, conexión y regreso a Inicio.
  Primero recupera operaciones con recibo pendiente, después confirma resultados y
  guarda preferencias. Una operación confirmada tras perder su respuesta puede
  reconciliarse antes de evaluar el conflicto de revisión. Un conflicto real sin
  recibos pendientes sigue requiriendo revisión de las copias.
- Las tareas simultáneas comparten la misma ejecución. La verificación de resultado
  y el envío automático comparten la petición de cada recibo. El servidor conserva
  su comprobación idempotente y su autoridad sobre las recompensas.
- Los fallos temporales se reintentan desde 15 segundos, con espera creciente hasta
  cuatro minutos. Los eventos de interfaz respetan esa espera. La aplicación oculta,
  sin conexión o durante una partida activa no inicia estas tareas de fondo. Los
  rechazos de vinculación, esquema o recibo no generan un bucle de solicitudes ni
  eliminan la operación pendiente.
- Las comprobaciones periódicas sanas se espacian un minuto; volver por los menús
  no genera nuevas peticiones durante ese intervalo si no hay resultados pendientes.

## Verificación

85 pruebas pasan en diez archivos: coordinador automático, nube, progreso canónico,
activación y diagnósticos, recibos de sobres, cola de eventos, presentación de
resultados, changelog, migración y recorrido HTTP/SQL de partidas descargadas.

El navegador usa IndexedDB real y las expresiones de configuración de `boot()`
extraídas del juego con una cuenta sintética. Confirma 1→0 con la ventana abierta,
abono único ante verificación y sincronización simultáneas, conservación tras un
fallo, reintento, foco y persistencia del desplegable de recuperación, tres idiomas
y seis combinaciones de tamaño/texto (320×568, 412×915, 844×390; 100/116 %).
Se prueba además el arranque del juego completo como invitado, Inicio, Colección y
Opciones en vertical/horizontal, sin errores de JavaScript ni recursos faltantes.

Pasan `git diff --check` y la comprobación de motores offline congelados. El caché y
las URL de los recursos modificados pasan a `32.0.0.2-cloud1`; la versión pública
sigue siendo v32.0.0.2. No requiere SQL nuevo ni cambia el tratamiento de datos o los
textos legales. No se ha accedido al guardado real del usuario ni se ha alterado su
inventario durante estas pruebas.
