# v31.0.2.4 — Moneda en relieve e iconos ajustables

## Cambios

Moneda con hemiciclo claro en relieve, laureles de hojas finas, cinco estrellas y corona en la base. Cara dorada y reflectante; Cruz sombreada y menos saturada con el mismo diseño. Conserva el giro y añade barrido de reflejo. La presentación transparente muestra solo moneda y resultado durante dos segundos, sin título, miniaturas o botón.

Las partidas locales comienzan al finalizar la presentación. Si la página queda oculta, se espera al regreso y a otro intervalo visible para no iniciar un turno sin verlo. La salida/cambio de partida cancela el temporizador y una respuesta antigua no inicia otro debate. En partidas online el aviso no bloquea controles ni pausa el reloj del servidor.

El registro temporal de sorteos valida arrays y elementos. Datos inesperados no hacen fallar el aviso; no se toca inventario o progreso. Opciones añade iconos al 100–116 %, independientes del texto, para botones y navegación. Se conservan ambas preferencias. El tamaño de cromos y el bloqueo de zoom del navegador se mantienen por decisión de Dooms.

## Resultado de la revisión

- R1, zoom: se mantiene desactivado expresamente; la alternativa entregada son ajustes independientes de texto e iconos, no una habilitación silenciosa del zoom.
- R2, registro de sorteos inesperado: corregido y probado con objeto, null, número, cadena, JSON inválido y array mixto; sin avisos duplicados para la misma partida.
- R3, claridad del sorteo: nuevo diseño y presentación corta según las revisiones de Dooms.
- Continúan como seguimiento la observación de balance humano, capacidad de producción y el reintento del jugador Gmail. No se inventan métricas ni se aprueban cuentas automáticamente. No hay ajuste de estadísticas, temporada o Elo.

## Verificación

597 pruebas automatizadas correctas. Incluyen temporizador local cancelable, pestaña oculta, almacenamiento temporal inesperado, reglas de iniciativa, premios y privacidad. Chromium: ambos resultados a 320×568, 393×851 y 844×390, texto al 116 %, sin marco o botones y comienzo automático tras dos segundos.

Lectura e iconos: ajuste real del icono activo de navegación a 31,32 px (27 × 1,16), texto independiente y persistencia de ambos valores tras recargar; Opciones y controles accesibles en los tres tamaños. Combate a cuatro tamaños (también 320×640), pilotos, Acta parcial, instantáneas canónicas y resultados correctos. Guías de menú y combate completas al 116 %, sin cambios económicos.

PWA desde 75850f2: reemplazo por caché v31.0.2.4, 113 recursos, navegación offline y progreso/Liga/audio conservados. El changelog conserva todas las versiones anteriores y la fuente histórica registra v31.0.2.3. Build offline, escala tipográfica y diff correctos.

Los tests usan autenticación/SQL aislados y proyecciones canónicas. No se accede a cuentas privadas, OAuth real ni Render/Supabase de producción. No se certifican dispositivos físicos o carga pública. No requiere migración SQL ni reinicio de cuenta.
