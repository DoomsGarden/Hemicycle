# Acciones y países — preparado, sin publicar

## Cambios

Las doce acciones conservan la animación de salida de la mano y añaden respuesta en la mesa según su efecto: impactos y estelas para daño; auras verdes para curación; escudos azules; impulsos y cifras doradas para Zasca; sello violeta de micrófono silenciado y aviso explícito del próximo turno para Moción de censura. La intensidad diferencia efectos comunes y potentes. No se bloquean controles ni se aplazan reglas o temporizadores. Se respeta movimiento reducido.

El adaptador consume los eventos existentes de los motores local, online y descargado. Para daño, curación y defensa utiliza los destinatarios de esos eventos, incluso conservando temporalmente la posición de un cromo expulsado. Para un impulso individual del protocolo anterior solo señala un destinatario si su mejora actual lo identifica sin ambigüedad; en otro caso muestra una indicación de bancada y no inventa un destinatario. No se modifican reglas descargadas ni comandos pendientes.

Las cartas en vuelo se retiran al salir de la partida, cambiar de mesa, ocultar o redimensionar; una acción nueva sustituye la anterior. No se genera una carta en vuelo sobre la escena final. La curación de cero no produce un indicador ficticio.

Los 120 oradores incorporan `country` con código ISO de dos letras, preparado para un futuro filtro. 97 ES, 6 US, 3 FR, 2 DE, 2 GB, 2 IT, 2 AR y un representante de RU, TR, HU, CA, VE y MX. El criterio es país de representación política, no lugar de nacimiento: Echenique y Álvarez de Toledo ES, Johnson GB, von der Leyen DE y Lagarde FR. Las acciones no tienen país. Un nuevo orador sin asignación falla la prueba de cobertura en lugar de recibir España automáticamente.

Ficha: bandera y país antes del nombre. Cromo, combate y zoom: bandera compacta antes del nombre. Son trece SVG locales, sin depender de banderas emoji del dispositivo. Las miniaturas pequeñas adaptan el texto para mantener estadísticas y nombre dentro del marco.

## Verificación

- 563 pruebas automatizadas correctas. Después de la limpieza de vuelos, 146 pruebas focalizadas y una última comprobación de acciones/países correctas.
- Chromium real a 393×851, 320×640 y 844×390: las doce acciones locales con sus efectos, costes normales, controles accesibles, perfil intacto y sin errores JS.
- Eventos reales del motor de servidor para las doce acciones, desde ambas perspectivas; eventos reales de las doce acciones del motor descargado ya publicado. Se simulan estados de combate controlados, sin cuentas de producción.
- Receptor expulsado, impulso del rival, limpieza, movimiento reducido y compatibilidad con los eventos anteriores.
- País y zoom de distintos países/nombres largos. Los 120 nombres, banderas y estadísticas permanecen dentro del marco a anchos de 64, 100, 140 y 300 px.
- PWA desde 37487f1: 105 recursos precacheados, progreso/Liga/audio conservados y arranque offline. Banderas y CSS entre los recursos comprobados.
- `node _dev/build-offline.cjs --check`: correcto. El empaquetador excluye el metadato visual de país para mantener idénticos los dos bundles de reglas descargadas existentes.

No requiere SQL. Este trabajo está preparado localmente; no se ha publicado ni se ha resuelto por ello el rechazo de activación cloud de la cuenta pendiente de diagnóstico.
