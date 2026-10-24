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

## Ampliación final de v31.0.1.3: Inicio, tres modos y Elo único

Esta sección sustituye los estados anteriores de «solo panel» y «sin Elo» para
Clasificatoria. El propietario pidió Normal, Rápida y Clasificatoria y eligió
60 segundos para Rápida; las otras mantienen 90 y todas ganan a 100 votos.

Inicio incorpora un botón Jugadores que abre una ventana dentro del juego.
Reutiliza la sesión de cuenta existente: no vuelve a identificar al jugador en
Render. Invitar/aceptar abre automáticamente la preparación en ambos clientes.
Normal y Rápida: invitaciones o cola, partidas amistosas sin modificar progreso.
Clasificatoria: solo cola; no se permite elegir rival mediante invitación/código.

Nuevo SQL adicional: `20261024_matchmaking.sql`, después de los tres SQL de
salas, jugadores y combates ya confirmados por el propietario. Crea cola,
clasificación autoritativa y recibos de resultados; conserva los datos existentes.
También actualiza las funciones de combate y protege el escritor de respaldos.
No ejecutar después copias antiguas de esas funciones. Para reinstalar, aplicar
los SQL en orden; el cloud_saves.sql actualizado conserva su guardia opcional.

Elo único: se descartó la propuesta inicial de un contador experimental separado.
Antes de entrar a Clasificatoria, Nube debe estar activada y sincronizada. El
servidor toma una vez el Elo del respaldo de ESA cuenta (no un número enviado
por el navegador). A partir de entonces el registro de clasificación es la fuente
canónica; los resultados actualizan Elo y V/D en la misma transacción que la
partida, con recibo único. El respaldo refleja ese mismo Elo con nueva revisión.
Las copias editables no pueden volver a sustituirlo después de vincularlo.
El cliente recupera la revisión nueva al finalizar y conserva FS, album y logros.
Los ascensos generan las recompensas habituales de la temporada 1, sin duplicar
las anteriores. El cliente autenticado deja de iniciar Clasificatoria contra IA.

Límite de procedencia: no es posible demostrar retroactivamente que un respaldo
local histórico era legítimo. Esta vinculación conserva el valor existente;
no certifica ese pasado. La autoridad nueva evita reemplazarlo después, no
convierte toda la economía local en autoritativa. El inventario/FS siguen siendo
respaldo del prelanzamiento y requieren su fase de servidor independiente.

Cola: una entrada por cuenta, tres modos separados; sin filtros por colección,
nivel o rango. Clasificatoria prioriza distancia de Elo y espera. Margen de cada
jugador: ±250 al inicio, ±500 a los 30 s, ±1000 a los 60 s, ±2500 a los 90 s y
sin límite desde 120 s. Deben admitir la diferencia los márgenes de AMBOS; no se
empareja a un recién llegado fuera de su margen porque otro lleve mucho tiempo.
Si solo hay una cuenta no se simula un rival. El latido vence a los 90 s para
candidatos ausentes. Cancelar libera la búsqueda; una preparación tiene dos
minutos para confirmar. Cancelarla invalida la sala de ambos. Una partida activa
se abandona desde el combate; su resultado y plazo no cambian por cerrar el menú.

Verificación adicional: 15 casos SQL de modos, cola, ampliación, cancelación,
importación sin reset, protección del Elo y resultado único. Dos navegadores
recorren el flujo nativo de Inicio con invitación; otro recorrido activa Nube,
vincula 5588 Elo, empareja, abandona y verifica 5570/5598 en la nube y ambos
perfiles locales, conservando FS, álbum y temporada 1. SDK real con transporte
OAuth simulado, PostgreSQL real local en PGlite. Evidencias native-browser.json y
ranked-browser.json; no son prueba contra las cuentas alojadas de los probadores.
