# v31.0.2.3 — Indicadores fijos encima del marco

Tres pilotos visibles al presentar al orador: recuperación de curación, defensa y apoyo temporal de Zasca. Apagados sin estado y con pulso al activarse; el apoyo conserva su brillo radial. La defensa recupera el escudo con 50 %. Su texto reserva ancho incluso apagado. La fila está encima del marco; huecos sin orador reservan el espacio sin mostrar iconos. No hay cambios de reglas ni estados reales. La consulta muestra también qué significa un piloto apagado. Movimiento reducido mantiene todos los pilotos estáticos.

El registro se compacta en pantallas verticales de menos de 600 px y conserva su desplazamiento para mantener accesibles los controles. Se reserva altura de bancada en horizontal. Se conserva la ubicación lateral inferior del fuerte/intervención utilizada para dejar la cara libre.

## Verificación

- 594 pruebas automatizadas correctas, incluida activación/caducidad de los tres pilotos sin mutar la partida.
- Chromium, texto al 116 %, 320×568, 320×640, 393×851 y 844×390. Nueve indicadores simultáneos sin intersección, fuera del retrato y dentro de pantalla. Misma altura y posición de bancada vacía/ocupada; caducidad mantiene iconos apagados, sin retirar huecos. Consulta por puntero y escudo con 50 %.
- Animación según movimiento reducido, controles y ventanas accesibles, instantánea online canónica, logros/desafíos y seis envoltorios conservados.
- Guías de menú y combate completas, sin cambios económicos.
- PWA desde 0607ecd: 113 recursos, arranque offline y progreso/Liga/audio preservados.
- Build offline y diff comprobados. Sin SQL ni reinicios.

Se usan datos y servidor local de pruebas; no se entra en cuentas de producción ni se reclaman premios reales.
