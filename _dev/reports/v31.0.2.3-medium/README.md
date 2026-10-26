# v31.0.2.3 — Revisión de prioridades medias

## Incluido en esta corrección

- Estados públicos consultables en cada orador: defensa y caducidad, Zasca temporal con turno de vencimiento y recuperación de curación. Estado de silencio pendiente e inmunidad del equipo. Se muestran para juego local y para snapshots canónicos online/descargados; no se revelan manos o mazos rivales.
- Los grupos de animaciones llegan separados por 160 ms, con retraso máximo 600 ms para su presentación. Las reglas, reloj y controles no esperan la animación. Movimiento reducido muestra el resultado inmediatamente; salir de partida, ocultar la página o cambiar de tamaño cancela presentaciones pendientes.
- Exportación voluntaria desde Historial: métricas sin nick, cuenta, identificador de partida, fecha ni nombres de cromos. No hay envío automático. Los recibos privados nuevos incluyen doctrina, distribución de rarezas y uso de acciones. Los registros antiguos con datos insuficientes no se reconstruyen ni se inventan.
- Herramienta administrativa en `_dev/admin/`: listar solicitudes, validar y preparar una decisión revisable, comprobar que la solicitud siga siendo la misma y conservar cualquier nube distinta. Aprobación/rechazo y motivo quedan registrados al ejecutar el SQL preparado. No hay aprobación automática, ruta pública ni revisión ejecutada en producción. No se ha tocado el caso particular de Gmail.
- Escenas realistas optimizadas: 8.560.658 → 4.510.214 bytes entre victoria y derrota (47,3 % menos). 480×720, 48 fotogramas, duración 4.799 ms, bucle continuo. Se conservan imágenes estáticas, confeti y condiciones de Siguiente/verificación. Fuente original en Git y arte maestro intactos. `_dev/optimize-result-media.py --output /tmp/review-media` reproduce los derivados desde la revisión anterior.

## Balance: medido, todavía abierto

1.152 partidas deterministas de IA; cuatro rarezas, seis doctrinas de líder, sin acciones/solo un equipo/ambos con Réplica y Receso, doce semillas. Mismos gabinetes de oradores entre rivales. Todas terminan. Para rarezas con menos de cinco oradores de una doctrina, se completa el gabinete con otros oradores de esa rareza; no son siempre gabinetes monodoctrina.

| Rareza del gabinete | Partidas | Victorias de quien empieza |
| --- | ---: | ---: |
| Común | 288 | 181 (62,8 %) |
| Raro | 288 | 214 (74,3 %) |
| Especial | 288 | 212 (73,6 %) |
| Legendario | 288 | 81 (28,1 %) |

Esto desaconseja declarar equilibrio o aumentar la compensación inicial de forma general. El efecto cambia con rareza, coste, IA y acciones. En los espejos comunes con acciones frente a ninguna, el equipo con acciones gana 121/144; tampoco demuestra la tasa entre personas. Cambiar acciones modifica el consumo de RNG; no es una atribución causal aislada. No se cambian reglas, estadísticas impresas, Elo, probabilidades de sobres ni motores de partidas antiguas en esta corrección.

Los archivos exportados permiten contrastar con jugadores. Pedir una única muestra por jugador/periodo y distinguir IA/persona/verificación; no sumar exportaciones repetidas o tratar perspectivas de la misma partida como independientes. Son muestras voluntarias limitadas al historial, no telemetría representativa ni una prueba de destreza humana. La recepción no es automática.

## Comprobaciones

- 585 pruebas automatizadas correctas: regresión, privacidad, estados y exportación; SQL administrativo aislado con solicitud modificada, repetición, rechazo, motivo con caracteres especiales, permisos y conservación de otra nube.
- Chromium a 320×568, 320×640, 393×851 y 844×390: consulta de efectos, pop-up con tres frases, controles visibles y sin desbordamiento horizontal. En horizontal, el estado del equipo se compacta para no tapar los cromos.
- Snapshot canónico: mismos apoyos públicos; descarga del archivo de balance sin identificadores; ráfaga visual de tres acciones escalonada con controles disponibles y estado intacto.
- Ambas escenas optimizadas decodifican en Chromium; Siguiente espera a la verificación y al ciclo inicial.
- PWA desde 1cdfa65: 108 recursos, medios con URL nueva, progreso/Liga/audio conservados, Mercado a tres tamaños y navegación offline. La comprobación espera expresamente la activación y los medios, no solo la creación de la caché.
- Replayer histórico intacto; build offline comprobado; no migración SQL necesaria para jugar.

## Límites y lo que queda pendiente

El equilibrio requiere aún partidas humanas y decisiones posteriores de ajuste. No se afirma resuelto con simulaciones. La revisión administrativa es una herramienta lista y probada, no una aprobación de solicitudes reales ni notificaciones automáticas al jugador. No hay cambio en producción de cuentas ni SQL ejecutado por el agente. Antes de ampliar la audiencia siguen pendientes las mediciones de carga y supervisión de producción descritas en la revisión de prioridad alta; las restricciones de red impiden consultar Render/Supabase desde aquí. Gmail permanece apartado por acuerdo.

Se conserva v31.0.2.3 y todo su changelog anterior. No se reinician progreso ni temporada.
