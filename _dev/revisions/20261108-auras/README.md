# Auras de estados · corrección de v32.0.0.2

Se sustituyen los contornos geométricos y los iconos grandes de las auras por
corrientes curvas de luz, volumen difuso y partículas. Se mantienen los iconos
pequeños como acceso a la explicación de las reglas.

- Resistencia y defensa: mantos azules envolventes, con doble corriente para resistencia.
- Fortaleza: energía ámbar ascendente y brasas alargadas.
- Regeneración: corrientes verdes y partículas curativas ascendentes.
- Plenitud y Sosiego: brillo lima cálido y ondas turquesas, respectivamente.
- Confusión: remolinos violeta y magenta alrededor de la cabeza.
- Debilidad, Desgaste y Desánimo: humo descendente, brasas de drenaje y niebla baja.
- Expuesto, Agotamiento y Silencio: desgarros rojos, corrientes magenta que se contraen y pulsos apagados.
- Precisión: trazos estrechos de luz fría con flujo más rápido.

La presentación no modifica el motor, sus potencias o sus duraciones. Los
apoyos temporales consultan el turno actual para no mantener una aura caducada.
Las fases son estables aunque se añada otro estado o se vuelva a pintar el
combate. Los oradores usados mantienen la saturación del aura. Con movimiento
reducido siguen visibles las formas estáticas.

La revisión en navegador detectó una dependencia cargada tarde: `action-status`
debe preceder a `attack-forecast` y `battle-status`. Se corrige el orden para que
la previsión y la consulta de efectos reconozcan los estados de acción. Los
indicadores agrupan estos estados en una posición con contador y conservan la
lista completa al pulsarlos, sin envolver iconos sobre el coste del cromo.

## Verificación

186 pruebas automatizadas superadas: action-state-visuals (6), action-visuals (4),
review-v321 (98), battle (68), metadata (3), stabilization-cache (2), changelog (5).
Se ejecutaron directamente con `node tests/<archivo>.test.cjs`.

`browser.cjs` abre el juego real con una partida local de prueba y comprueba:
14 diseños; 320×568, 393×851, 412×915 y 844×390, al 100 % y al 116 %; iconos
sobre el marco sin pisar el coste; consulta completa de estados simultáneos;
caducidad del motor; fases de animación distintas; lectura de datos y clics;
visibilidad en oradores usados y movimiento reducido sin animaciones activas.
Las capturas de las 14 auras, el combate compacto y los efectos simultáneos se
inspeccionaron visualmente. Es una emulación en Chromium, no una medición de
rendimiento en un Poco F7 físico.

Ejecutar con NODE_PATH y Chromium del entorno:
`node _dev/revisions/20261108-auras/browser.cjs`.
El servidor de prueba sirve la raíz del repositorio en `127.0.0.1:8038`.
`AURA_RECORD=1` habilita una grabación opcional, si Playwright tiene FFmpeg.

Se conserva la versión visible y el manifest de v32.0.0.2. Cambia la caché a
`hemiciclo-v32.0.0.2-auras1`; se actualizan las URLs de los recursos modificados
y la nota de corrección en español, inglés y francés. No cambia la edición
legal, el backend, las migraciones SQL, los guardados o los recursos de cuentas.
