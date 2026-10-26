# v31.0.2.3 — Fiabilidad y mano táctica

## Alcance

Se corrigen los cinco hallazgos reproducidos en la auditoría de 028239a y se ajustan robo, recuperación de acciones, iniciativa, Vieja Guardia y selección de rival de IA. No se reinician cuentas, colecciones, FS, Elo, Liga ni temporada. El caso de Gmail indicado por Dooms se deja pendiente de su reintento; no se atribuye a una causa no comprobada.

## Decisiones de balance

- Dos huecos reservados a oradores y un hueco adicional para una acción disponible. Llevar dos acciones sigue sin permitir recibir dos a la vez. Si no quedan dos oradores disponibles no se inventan cartas.
- Una acción reutilizable jugada en el turno T puede volver a robarse en T+3: T+1 y T+2 completos de espera. El mazo muestra el tiempo restante y permite consultar sus reglas. Moción mantiene su descarte y límite único.
- Quien empieza segundo tiene +1 TdP solo en su primer turno. No se modifica su máximo permanente.
- Vieja Guardia gana Zasca al cerrar turno, con máximo +3; deja de añadirlo inmediatamente al entrar. Se reduce la presión temprana sin modificar los valores base impresos de los cromos.
- La IA prioriza presentar cuando necesita bancada. Normal y Rápida usan rarezas acordes al gabinete; Clasificatoria combina Elo y un mínimo de rarezas equivalente al gabinete. Liga conserva sus recetas por división.
- Réplica y Receso pueden recogerse gratis desde Colección si faltan. Las comprobaciones del servidor impiden acumular copias mediante reclamaciones repetidas. El filtro por país se combina con rareza/doctrina.

## Fiabilidad

1. Instalación PWA: se exige completar HTML/JS/CSS esenciales antes de activar. Si falla un módulo esencial no se activa el worker nuevo. Los medios con URL sin cambios se copian de la caché anterior para evitar descargarlos otra vez.
2. Descargas: el cupo por contexto se conserva, pero preparaciones antiguas ya no agotan un cupo global. La respuesta ofrece el contexto actual; el dispositivo conserva aparte partidas activas y resultados pendientes.
3. Caducidad: treinta días adicionales para validar resultados de una preparación que ya no puede iniciarse desde la interfaz. Los rechazos explícitamente definitivos se apartan de la cola, conservando registro y preparación para exportar; las operaciones independientes continúan. Los fallos de red permanecen pendientes.
4. Nube puede cerrarse durante una activación. Cerrar no cancela ni repite la operación; su respuesta se sigue comprobando.
5. Perfil compacto a 320×568, con desplazamiento interno seguro si fuera necesario.

Las reglas nuevas son `actions2` y `offline2`. Los bundles históricos de `offline1` se conservan byte por byte. Las partidas online ya guardadas con `actions1` siguen con esas reglas. La descarga negocia la versión y la liquidación escoge el replayer del ticket. No se borra una preparación activa al cambiar de versión.

## Validación

- 572 pruebas automatizadas correctas, incluidas 3.456 simulaciones emparejadas de doctrinas, idempotencia, privacidad, compras, recompensas, conservación de datos y compatibilidad histórica.
- SQL en PostgreSQL PGlite: negociación de versiones, nuevo contexto tras acumular preparaciones anteriores y reaplicación idempotente. Dooms confirmó ejecución correcta en Supabase.
- Chromium con SDK y HTTP/SQL locales: alta, Rápida, compras canónicas, intercambio entre cuentas, historial, animación de premios, recarga/reanudación, resultado sin conexión y liquidación única al volver.
- Guías completas; ayudas actualizadas; reclamación gratuita sin duplicados; filtro por país; tres cartas en una fila a 320×568, 320×640, 393×851 y 844×390; perfil en siete tamaños.
- Cola: un rechazo permanente se conserva para exportación, la partida posterior se valida y se refrescan descargas. Nube: cerrar durante petición pendiente mantiene controles disponibles y la respuesta no reabre la ventana.
- PWA desde 028239a, progreso/Liga/audio preservados, 106 recursos y arranque offline. Una prueba específica rechaza una instalación con módulo esencial indisponible.

## Lectura de la simulación de iniciativa

Comparación de 240 espejos deterministas por variante, seis doctrinas, con/sin dos acciones comunes y veinte semillas. Publicado: 177 victorias del primero; candidato: 165. Terminan todas. Es una mejora del conjunto, no una estimación de jugadores ni una atribución a una sola regla. No se declara equilibrio perfecto. Los recibos nuevos guardan iniciativa y turnos propios/rivales para facilitar estudiar resultados reales posteriormente.

## Límites

Las pruebas de cuentas simulan la autenticación sobre SDK real y usan PostgreSQL/HTTP aislados. Render y Supabase de producción no pueden consultarse desde la política de red del entorno. La publicación se verifica por los archivos servidos por Pages, sin utilizar cuentas privadas.

Las propuestas de dirección de arte, ampliar retos tácticos, ampliar la colección y una separación general del catálogo/HTML son líneas de trabajo posteriores, no cambios automáticos de reglas ni promesas de una reescritura en este parche. Se entrega la fiabilidad, el aprendizaje inicial y la lectura táctica necesaria para probar este ajuste.

## Corrección posterior en la misma versión: supervisión y concurrencia

La revisión ops1 incorpora registros operativos sin datos personales, cola económica limitada, conservación de operaciones ante fallos temporales y recuperación del recibo canónico entre instancias. Batería final: 580 pruebas correctas y PWA con 106 recursos. Evidencias y límites en `_dev/reports/v31.0.2.3-operations/README.md`; uso en `_dev/operations/README.md`. La capacidad en producción sigue pendiente de medición.
