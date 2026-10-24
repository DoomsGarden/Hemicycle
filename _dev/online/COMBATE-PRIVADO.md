# Primera partida privada operativa

24 de octubre de 2026. Servicio de pruebas en Render, sin efectos sobre el juego real.

## Activación en Supabase y Render

1. El propietario confirmó haber añadido `SUPABASE_SERVICE_ROLE_KEY` en
   Render → Environment. Es la clave service_role, solo del servidor. No pegar
   su valor en GitHub, consultas, capturas o conversación. Nunca se devuelve
   en `/rooms-test/config`, HTML ni JavaScript.
2. Ejecutar completo `_dev/online/20261024_private_combat.sql` en SQL Editor,
   después del SQL de salas y de jugadores/invitaciones ya instalados.
   Guardar como «Hemicycle — Combates privados de prueba» si se desea.
   Crea dos tablas y dos funciones exclusivas de service_role. No toca tablas
   de progreso ni migra perfiles. Reaplicación comprobada sin perder partidas.
3. Render debe desplegar el commit nuevo de la rama de preparación. La URL
   del panel y los retornos de Google se conservan. No cambiar los DNS.
4. Abrir https://hemicycle-w578.onrender.com/rooms-test/ en dos navegadores o
   dispositivos, con cuentas diferentes. Crear/unirse a sala o aceptar invitación.
5. Ambos pulsan **Abrir partida de prueba**, eligen cinco oradores distintos
   (el primero es líder) y de cero a dos acciones distintas, y pulsan **Listo**.
6. Cuando los dos están listos, el servidor sortea y comienza el turno. El panel
   muestra el sorteo, votos y reloj. Pulsar Presentar en la mano; después
   Intervenir sobre un orador en mesa permite escoger las tres frases, con
   defensa/curación dentro del mismo panel. Las acciones tienen botón Activar.

El catálogo de prueba es el mismo para ambos. No se importa el gabinete del
juego ni se exige poseer esas cartas en la colección real. Esta separación
permite probar antes de implantar el inventario autoritativo. El editor principal
con cinco favoritos y las acciones en sobres reales siguen pendientes de integrar.

## Qué funciona

- Motor sin DOM ejecutado en Node; no se acepta un estado de partida del navegador.
- Sortear primero; tres puestos; mano inicial líder y otro orador, después mano
  renovada cada turno propio, hasta dos cartas y máximo una acción.
- Ataque normal; fuerte 150 % redondeado, cada tercer turno desde entrada, coste
  de 1 Aguante y mínimo 2; defensa de un golpe; curación y su espera.
- Doctrinas y contrapartidas circulares, expulsión y descanso. Buffs temporales
  y las doce acciones de prueba. Una acción por turno; reutilizables al mazo,
  Moción agotada al descarte. Moción salta acciones pero conserva robo y votos.
- Victoria inmediata a 100 votos, sin límite de rondas. Turnos de 90 segundos;
  rendición y vencimiento. El silencio no impide ganar por votos pasivos.
- Consulta cada dos segundos y actualización tras cada intención. Reconectar
  recupera mano, mesa, turno y vencimiento desde PostgreSQL. El reloj continúa
  si se abandona la página: no hay pausa ni extensión al reconectar.
- Resultado compartido y persistente. Sin premios, Elo, estadísticas, logros,
  cambios de colección ni cobros del juego real.

## Privacidad y concurrencia

El navegador presenta su JWT al servidor. El servidor verifica la identidad con
Supabase Auth antes de cargar el combate. Las funciones de combate solo están
concedidas a service_role; authenticated/anon no pueden consultarlas, confirmar
estados ni leer tablas completas. Un UUID de cuenta recibido del navegador nunca
autoriza acceso. La clave administrativa queda exclusivamente en Render.

La carga devuelve el participante 0/1 al servidor. La proyección al navegador
oculta mano y mazo rivales y el orden del mazo propio. Los cromos ya jugados,
expulsados y acciones agotadas son públicos. No se serializan tokens en el estado.

Escritura con revisión esperada y bloqueo de la fila de sala; si hay contención,
el servidor vuelve a cargar y valida de nuevo. Cada intención lleva operationId;
el reintento devuelve el estado vigente sin repetir daños ni costes. Reutilizar
el ID con otros datos se rechaza. Un fallo al recibir respuesta conserva el ID
en la ventana para Reintentar. No hay SQLite ni estado de partida solo en RAM.
El reloj procede de PostgreSQL; las consultas también finalizan partidas vencidas.

Se persiste la causa de finalización. El reinicio del proceso no reinicia el
plazo. Las salas caducadas no empiezan combates, pero una partida ya iniciada
puede consultarse después de la caducidad del enlace de sala.

## Verificación

- 22 casos del motor y 10 de servicio/SQL: reglas, proyecciones privadas,
  permisos, reintentos, contención de confirmaciones, reinicio, timeout,
  reaplicación de SQL y ausencia de clave privada.
- Prueba en dos Chromium: acceso, sala, selección de gabinete, sorteo, presentar,
  ataque con popup, acción con animación y regreso, recarga, desconexión y partida
  completa de más de siete turnos hasta 100 votos. UI móvil 393 y 320 px sin
  desbordamiento horizontal. Se usan fixtures para hacer disponible una acción
  concreta; no se afirma que un robo aleatorio la garantice.
- SDK real, OAuth/transporte de tokens simulado; funciones PostgreSQL reales
  en PGlite local. No se tocan cuentas alojadas ni se ha comprobado el servicio
  Render desde Codex, cuyo proxy bloquea ese destino. La prueba real entre dos
  dispositivos será la siguiente comprobación del propietario tras ejecutar SQL.
- Toda la batería de Node pasa: 425 casos. Evidencias en
  `_dev/reports/private-combat/`. La PWA del juego se comprueba por separado.

```sh
NODE_PATH=/workspace/.hemicycle-tools/node_modules \
PGLITE_MODULE=/workspace/.hemicycle-tools/node_modules/@electric-sql/pglite \
node _dev/checks/online-combat-browser.cjs
```

## Decisiones de lanzamiento

Habilitar multijugador de pruebas **no** autoriza resets. Se conserva todo hasta
el lanzamiento oficial con catálogo 1200–1500 y presencia en Google Play, según
la instrucción del propietario. La temporada clasificatoria 1 permanece abierta
sin fecha final; T2 solo se inicia cuando se configure ese lanzamiento oficial.
Después se retoma el calendario de 30 días civiles. Desafíos y Liga no cambian.

El motor online todavía no es el motor de producción de Pages: la página de
salas es el lugar de esta prueba. Antes de conectar al juego real se necesitan
inventario de servidor, migración única del progreso y su política de aceptación,
pruebas alojadas de concurrencia, observabilidad y alojamiento sin suspensión
para partidas competitivas. El plan gratuito puede tardar al primer acceso.
