# v31.0.2.3 — Mesa despejada y acta desplegable

## Cambios

Se elimina el contorno de bancada activa; se conservan los marcos individuales de rareza y el foco accesible. El pie de los cromos queda recortado con esquinas redondeadas sin recortar los indicadores externos. Los pilotos superiores se ciñen al ancho del cromo. Fuerte e intervención utilizada comparten una posición interior derecha, en la parte baja del retrato.

Acta aparece a la izquierda de Pasar turno y abre un panel parcial sobre los controles. Tiene cierre propio y Escape; el foco vuelve al botón. No hay fondo inerte ni pausa de reglas o reloj. Las actualizaciones de la partida conservan el panel abierto, el foco y el desplazamiento cuando corresponda. Se muestra el registro disponible completo, con desplazamiento. En prácticas guiadas se conserva el acta integrada para mantener visibles los pasos existentes, sin añadir pasos al tutorial.

El espacio liberado se utiliza para ampliar los cromos en vertical. Se mantiene la distribución horizontal compacta. No se cambian reglas, recompensas, Elo o guardados.

## Verificación

- 594 pruebas automatizadas correctas.
- Chromium a 320×568, 320×640, 393×851 y 844×390, texto 116 %: controles visibles, acta parcial, abrir/cerrar/Escape, estado local intacto al abrirla, foco restituido, marco de bancada ausente, esquinas redondeadas y barra de estados dentro del ancho de la carta.
- Tres oradores con nueve pilotos sin intersección, bancada estable al presentar cartas, estados apagados/activos, movimiento reducido, consulta por puntero y fuerte/hecho compartiendo ubicación.
- Instantáneas online: el acta permanece abierta y conserva foco al actualizar; el reloj sigue el estado recibido, sin conceder un turno nuevo.
- Tutoriales de menú y combate completos, sin cambios económicos.
- PWA desde d584e3f: 113 recursos, actualización, arranque offline y progreso/Liga/audio preservados. Build offline y diff correctos.

Pruebas locales con proyecciones canónicas; no se accede a cuentas ni operaciones económicas de producción. Sin SQL ni reinicios.
