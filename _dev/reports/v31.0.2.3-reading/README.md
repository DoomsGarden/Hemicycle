# v31.0.2.3 — Escala real de lectura

## Causa y solución

El ajuste anterior solo alcanzaba algunos selectores de texto secundario. Muchos tamaños absolutos, tamaños adaptativos y abreviaturas font seguían fijos. La navegación reducía la altura reservada a la etiqueta y desplazaba los iconos al desaparecer.

Se aplica el factor de lectura a las declaraciones de tamaño absoluto de los 19 estilos públicos y al estilo integrado del HTML, incluidos clamp y abreviaturas font. Los tamaños heredados siguen heredándose, sin duplicar el factor. El cuerpo aporta la base para texto sin tamaño explícito. El 100 % conserva los valores de cada regla; el 116 % los multiplica por 1,16. `_dev/scale-ui-text.py --check` detecta declaraciones absolutas sin integrar en el factor y su ejecución normal aplica la transformación de forma idempotente.

Las etiquetas inferiores tienen un espacio fijo de 12 px: disminuyen su fuente y opacidad gradualmente, sin alterar la geometría del icono o del botón. Sus nombres accesibles se conservan. La preferencia mantiene la clave anterior y se aplica también al arrancar de nuevo. No hay cambio de cuenta o progreso.

## Comprobaciones

- 594 pruebas automatizadas correctas.
- Chromium a 320×568, 393×851 y 844×390: medición de font-size antes/después del ajuste, con razón entre 1,15 y 1,17 para cada selector revisado. Incluye descripción y título de Inicio, modos de juego, cabecera, colección, nombres y estadísticas de cromos, ficha, frases, recursos, reloj, botones y acta de combate, Opciones y explicación de lectura.
- Geometría de los cinco iconos inferiores exactamente igual al 100 % y al 116 % en los tres tamaños. Etiqueta de 0 px al 116 % y de 2 px al 112 %, dentro del hueco fijo.
- Cambio real del deslizador, porcentaje y persistencia tras recargar.
- Combate al máximo en 320×568, 320×640, 393×851 y 844×390: frases, controles, acta parcial, nueve estados, instantáneas canónicas y resultados accesibles. Sin errores de página ni desbordamiento horizontal.
- Guías completas de menú y combate al 116 %, sin cambios económicos.
- PWA desde 0f349cb: 113 recursos, todos los estilos con URL nueva, actualización, arranque offline y progreso/Liga/audio preservados.
- Build offline, revisión de tamaños sin escalar y diff correctos.

Pruebas locales de interfaz y estado canónico; no se ejecutan operaciones económicas en cuentas reales. Sin SQL ni reinicios.
