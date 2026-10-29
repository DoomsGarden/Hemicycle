# Primera entrada, selectores y mesa de práctica

29-10-2026, sobre 552119c. Corrección solicitada por Dooms a partir de las capturas de un jugador nuevo y sus aclaraciones: el tutorial debe compartir toda la mesa de una partida normal, y la transparencia debe alcanzar también la selección de frases.

## Reproducción

En Chrome a 393×730 y texto al 116 %, el selector de edad anterior se abría debajo del botón con altura insuficiente. La opción «18 años o más» terminaba fuera del área visible; había desplazamiento pero la regla global ocultaba la barra. `before.json` registra menú entre y=549,98 y 728 y última opción hasta y=755,98. No se elimina ninguna edad ni se cambian los requisitos de acceso.

La captura de práctica 6/8 corresponde al tutorial breve vigente. La diferencia visual procedía de estilos que seguían comprimiendo la práctica y del Acta incrustada. En la misma reproducción el cromo rival medía 57×70,30 en práctica frente a 117,66×145,11 con el diseño normal; la fila se estrechaba de 365 a 255. La práctica tampoco mostraba el botón Acta. No se atribuye esta diferencia a que el jugador hubiera abierto una versión anterior.

## Cambios

- El selector mide el alto real de sus opciones y el espacio visible, abre hacia arriba cuando conviene y puede aprovechar el área de la pantalla si ninguna dirección basta. Los listados largos muestran barra y aviso de desplazamiento; el margen de scroll evita ocultar la opción activa bajo el aviso. Se conservan valor, eventos, teclado y foco del control original.
- Se retiran las reglas de tamaño/anchura exclusivas del tutorial. La práctica usa el mismo tablero, tribunas, marcadores, mano, mazo, distribución y controles de combate normal. Acta es flotante también en práctica y la guía completa la abre al explicar el registro, con aria-expanded actualizado. El sorteo guiado reutiliza la moneda de la cabecera.
- La práctica breve explica «Tiempo de Palabra (TdP)» antes de utilizar la abreviatura. Las barras de recursos incluyen su nombre accesible.
- Ayudas y selección de frases comparten fondo translúcido azul oscuro (alfa 0,80–0,74) y desenfoque ligero. La opacidad del texto permanece en 1. Los botones de frase tienen fondo parcial; el resaltado guiado usa resplandor exterior y movimiento reducido en lugar del marco de toque adicional.
- Si hay espacio junto al orador, el consejo se coloca a su lado. Al señalar una frase, la colocación considera la ventana completa para dejar visibles sus tres opciones.

Se mantienen los cromos prestados, la IA guiada, el reloj detenido y la ausencia de premios/pérdidas de la práctica. No cambia la economía, las reglas ni Elo. Los documentos legales siguen en 2026-10-29.2 con hash 13fb255ccbbebd0c18595f37be4a39c438626631a0c0dd1485ea21fa82c5798e; no hay SQL ni nueva aceptación.

## Verificación

- 623 pruebas de la suite correctas. Se incluyen reglas, premios de práctica, contratos históricos, temporadas, cuentas, economía y validación aislada.
- `new-player-polish.cjs`: entrada nueva a 320×568, 393×730, 393×851 y 844×390, texto 116 %, toque y teclado. Las cinco edades quedan dentro del menú; End/Enter selecciona 18+, después se entra como invitado 12–13 para comprobar la práctica.
- Práctica de ocho pasos y guía completa de 38 completadas en los cuatro tamaños. El perfil permanece idéntico. Medidas de cromos, tribunas, separación y relleno coinciden al alternar el indicador de práctica/normal sobre el mismo estado. Acta flotante y ayudas dentro de la pantalla. Se comprueban transparencia con texto opaco, expansión del registro y selección del último país de un filtro con scroll y aviso visible. Sin errores de página.
- `new-player-polish-guides.cjs`: recorridos de menús completos para invitados 12–13 y adultos, objetivos visibles y perfil intacto; práctica completa y Opciones en tres tamaños. Son los mismos controles compartidos que reciben el cambio de estilo/posición.
- `new-player-polish-pwa.cjs`: actualización desde caché diagnostics1 a onboarding1, 146 recursos, funcionamiento offline, partida/Liga y caché ajena conservadas. La elección legal existente no cambia ni vuelve a pedirse. Cuatro pestañas de Mercado en tres anchos.
- Generador legal, escala tipográfica y validadores offline correctos. Las capturas son locales de perfiles sintéticos; no se ha actuado sobre una cuenta real ni se certifica una prueba en un teléfono físico.

Comandos principales:

```sh
node --test --test-concurrency=2 tests/*.test.cjs tests/online/*.test.cjs
node _dev/checks/new-player-polish.cjs
node _dev/checks/new-player-polish-guides.cjs
node _dev/checks/new-player-polish-pwa.cjs
node _dev/legal/build.cjs --check
node _dev/build-offline.cjs --check
python3 _dev/scale-ui-text.py --check
```

Las comprobaciones de navegador necesitan Playwright, Chromium y el servidor local 8055 que sirve /workspace. Evidencias en before.json, after.json, guides/browser.json y pwa/pwa.json; se incluyen capturas representativas de antes/después.
