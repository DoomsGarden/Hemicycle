# Estabilización v31.0.2.6

Revisión del 29 de octubre de 2026 sobre `405537e`, publicada con autorización de Dooms. Implementa las acciones técnicas del contraste de Venice conservando la escalera de Clasificatoria. Las pruebas usan perfiles sintéticos; no realizan compras, envían correos ni modifican cuentas de jugadores.

## Cambios y comprobaciones

| Área | Resultado |
|---|---|
| Primera entrada | Ocho pasos: moneda, votos/TdP, presentar líder, seleccionar, ataque, objetivo, turno y cierre. No encadena el recorrido de menús ni el aviso de objetivos. La aceptación legal permanece separada. |
| Aprendizaje opcional | Guía completa de 38 pasos y prácticas tácticas desde Ayuda; recorrido de menús opcional. Consejos de acciones, curación y fuerte cuando corresponden, descartables y fuera del retrato. Mercado conserva su guía contextual. |
| Invitados de 12–13 | Recorrido de 21 pasos visibles, sin los cuatro objetivos de cuenta/online que no les corresponden. Para adultos, los 25 pasos; los selectores estilizados reciben el foco visible. No se amplía el acceso a cuentas. |
| Online | Fases de comprobación del guardado, preparación y búsqueda. Aviso de demora desde cinco segundos. Cerrar durante la comprobación no inicia una partida al terminar. Si una respuesta de cola llega tras cerrar, cancela la espera o recuerda el emparejamiento sin abrirlo. Un reintento de creación de partida conserva su operación. |
| Diagnóstico | Ayuda permite exportar tiempos agregados de esta sesión. No contiene identidad, URL, fechas ni contenido; no persiste al recargar ni se envía solo. En el servidor, histogramas acotados por ruta y límites superiores aproximados de p50/p95. Véase operaciones. |
| Mercado | Distingue sin ofertas de otros jugadores, sin ofertas del tipo, sin coincidencias y fallo de conexión. Acceso para limpiar filtros y vender. Inventarios, precios, reservas y recibos mantienen sus reglas; no se simula liquidez. |
| Carga y offline | Entrada estática inmediata y animación posterior en reposo; asistentes del Senado tras entrar. Instalación atómica de código esencial, reutilización de medios existentes y preparación adicional en segundo plano. Opciones permite completar expresamente los recursos offline. Se respeta movimiento reducido y se evita la preparación automática con ahorro de datos. |
| Mantenimiento | 496 líneas de estilos base extraídas a `css/app.css`, conservando cascada y aspecto. Cuatro selectores de marco dependen de `data-rarity`, presente en los tres renderizadores. Fórmulas locales de defensa, curación, recuperación y fuerte extraídas a `js/battle-rules.js`. |
| Clasificatoria | Barra e indicación de puntos restantes hasta la siguiente subdivisión. No cambia el valor de ningún umbral, concesión de Elo, ascenso o premio. |
| Independencia y dominio | Descripciones del HTML/manifiesto identifican el juego como independiente y no oficial. Se repiten regresiones de cuenta y recuperación con origen hemicycle.online y transporte local simulado. Los guardados de Pages y del dominio siguen siendo distintos por origen. |

## Evidencia automatizada

- **621/621 pruebas correctas**, incluidos contratos de reglas, tutorial, economía, recibos, nube, recuperación, mercado, temporadas, SQL aislado y límites de carga. El resumen se guarda en `test-summary.txt`.
- `browser.json`: primera práctica de ocho pasos, recorrido de menús completo para ambos tramos de edad, práctica completa de 38, progreso intacto, cuatro marcos de rareza y Opciones al 116 % en 320×568, 393×851 y 844×390. Sin errores de página. Capturas de muestra junto al informe.
- `network.json`: cierre y reapertura durante comprobación de nube; cancelación de respuesta de cola tardía; emparejamiento tardío recuperable sin abrir; reintento con el mismo ID tras perder la respuesta. No se anula ni se declara fallida una transacción por cerrar una ventana.
- `pwa/pwa.json`: actualización desde `hemiciclo-v31.0.2.5-domain1`, 143 URLs preparadas, caché ajena conservada, partida y Liga preservadas; documentos legales y licencia offline sin sustituir el documento del juego; cuatro pestañas de Mercado en tres anchos.
- `accounts/verification.json`: recuperación PKCE e implícita, enlaces anteriores, validación temprana/tardía, recarga, reintento, enlace inválido/caducado y cuenta ordinaria preservada. También se comprueban Google PKCE, sesión, nick, salida, invitado, foco y Perfil en siete tamaños. SDK real con transporte sintético; no acredita una nueva configuración del proveedor ni envía correo.
- `protected-hashes.json`: escalera y seis fuentes autoritativas/históricas siguen idénticas byte a byte. El bloque local de cálculo de Elo y liquidación `calcRankedEloDelta…SCREENS.result` coincide con la base. Los estilos extraídos coinciden salvo URL relativa y selectores explícitos. Documentos legales conservan versión y hash; `build-offline --check` y escala tipográfica correctos.

El conjunto de precarga tiene 142 rutas físicas únicas, unos 17,32 MiB sin compresión HTTP; el código esencial suma aproximadamente 1,16 MiB. No se reduce artificialmente el tamaño del arte: cambia su prioridad de descarga. Son tamaños locales, no latencia ni tráfico real de un móvil. Los retratos individuales se cargan bajo demanda y no forman parte de ese total. Véase `loading.json`.

## Simulación exploratoria de equilibrio

`balance-sample.json` conserva los resultados de **1.184 partidas terminadas**, con la misma política de IA en ambos lados, semillas reproducibles y ambas iniciativas:

- 864 casos: seis doctrinas, dos recetas de rareza y las nueve combinaciones de 0/1/2 acciones por bando, cuatro semillas y ambos inicios.
- 288 casos adicionales: gabinetes de coste bajo/alto, combinaciones de acciones, ambos inicios y etiquetas Normal, Rápida, Clasificatoria y Liga.
- 32 casos adicionales: líder normal/dorado frente al mismo gabinete sin edición dorada, en esas cuatro etiquetas y ambos inicios.

En el bloque principal, el primer jugador gana 635/864 (73,5 %); la duración media es de 8,02 turnos del bando que más turnos completó. **Es una señal para investigar la iniciativa, no una estimación del porcentaje de victorias humano.** Solo hay cuatro semillas por combinación y mucha dependencia entre fixtures. Tampoco demuestra que equipar más acciones mejore o empeore cualquier gabinete. Los casos adicionales por etiqueta usan el motor común: no simulan emparejamiento humano, la campaña de Liga ni sus premios. La suite también conserva las comparaciones existentes de doctrinas y variantes. No se modifica ningún parámetro de combate ni Elo con estos datos.

## Seguimiento que precisa uso real

1. Durante un ciclo de estabilización, priorizar fallos del recorrido actual. Posponer monedas, modos y expansión de sistemas. Las correcciones siguen permitidas.
2. Observar cinco primeras sesiones de personas nuevas: tiempo hasta la primera partida, dudas sobre votos/TdP, capacidad de atacar y deseo de repetir. No interpretar las pruebas de navegador como retención.
3. Reunir voluntariamente unas cien partidas humanas diversas y separar IA/PvP y modalidad; comparar iniciativa, gabinete, rarezas, acciones y edición dorada. Historial ya ofrece exportación de balance sin identidad/fechas. Revisar la señal de iniciativa antes de proponer cambios de coste o daño; mantener la escalera de Elo.
4. Para demoras reales, correlacionar la operación descrita y el diagnóstico voluntario con rutas y tiempos de Render. El servicio de pago no debe etiquetarse como dormido sin evidencia. Las métricas locales y PGlite no certifican capacidad del despliegue.
5. Comprobar primer uso, caché caliente y batería en un móvil modesto físico; comparar entrada, primera partida y preparación offline. La automatización de escritorio no mide esas condiciones.

## Inventario para la siguiente extracción gradual

Las fórmulas puras de disponibilidad y apoyo ya están separadas y comparadas con referencias. Robo, recuperación de acciones, efectos, iniciativa y final de turno aún tienen representación local y autoritativa; sus casos permanecen protegidos por la suite. El controlador de entrada y el render local continúan en index.html. Extraerlos por bloques con fixtures de estado/eventos, sin reescribir todos los motores a la vez ni regenerar los validadores históricos. El refactor de esta versión es el primer tramo de esa reducción de acoplamiento.

## Reproducir

Desde la raíz del repositorio, con Node, Chromium y Playwright disponibles:

```sh
node --test --test-concurrency=2 tests/*.test.cjs tests/online/*.test.cjs
node _dev/checks/stabilization-browser.cjs
node _dev/checks/stabilization-network.cjs
node _dev/checks/stabilization-pwa.cjs
node _dev/checks/stabilization-accounts.cjs recovery
node _dev/checks/stabilization-accounts.cjs profile
node _dev/stabilization/balance-sample.cjs
node _dev/legal/build.cjs --check
node _dev/build-offline.cjs --check
python3 _dev/scale-ui-text.py --check
```

Las comprobaciones de navegador usan Chromium en `/usr/bin/chromium`; el recorrido principal usa el servidor local en puerto 8055 que sirve `/workspace`. Los scripts de cuenta interceptan el origen del dominio: no consultan DNS ni cambian configuración de Supabase, Render o Cloudflare. El informe no certifica revisión jurídica, derechos de imagen ni publicación en una tienda. No requiere migración SQL ni cambios de credenciales.
