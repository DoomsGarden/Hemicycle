# Acciones y salas online

Actualización de v31.0.1.3: las doce acciones se integran en sobres, colección,
gabinetes y combate local, con ilustraciones y tutoriales. El combate online
mantiene un catálogo común de pruebas y utiliza un motor autoritativo.
Normal y Rápida conservan el progreso; Clasificatoria enlaza el Elo existente.
La migración de inventario se ejecuta manualmente en Supabase. Consulta
[la ampliación verificada](../releases/v31.0.1.3-actions1.md).

A continuación se conserva el planteamiento inicial como referencia histórica.
Sus apartados pendientes quedan sustituidos por el estado de la ampliación.
Cinco oradores y dos acciones opcionales, confirmado por el propietario.

## Reglas propuestas

- Tres puestos en mesa; las acciones se activan desde la mano y nunca ocupan puesto.
- Una acción como máximo por mano y por turno propio. Consume TdP, no el ataque
  de un orador, salvo que su descripción lo exija.
- Animación: mano → zona superior de la mesa → mazo. El efecto se resuelve una
  sola vez; la animación no es la autoridad del resultado. Durante la animación
  se bloquean los clics repetidos y el cambio de turno de la vista de prueba.
- Las acciones de un solo uso (propuesta inicial: Moción de censura) terminan en
  una pila de acciones agotadas, separada del descanso de oradores. Se muestran
  como pequeñas cartas sombreadas y no se reciclan durante esa partida.
- Al inicio de cada turno propio, las cartas sin usar vuelven al mazo; se baraja
  y se roban hasta dos, nunca dos acciones. No se modifica la mano rival en ese
  momento. No se barajan los cromos en mesa ni los aún en descanso. Si solo
  quedan acciones, se roba una; no se inventa un segundo orador.
- Se propone conservar al líder en la mano inicial del combate; la renovación
  completa empieza después de esa mano inicial. La función `renew` es el robo
  de turnos posteriores, no el constructor de la mano inicial.
- Oradores expulsados: no regresan en el siguiente turno propio; al ser elegibles
  vuelven curados al mazo pendiente y participan en el barajado.
- Modificadores temporales de Zasca caducan; la defensa sigue reduciendo un golpe
  y caducando al comienzo del próximo turno propio. La victoria a 100 votos sigue
  siendo inmediata, incluso al inicio de un turno silenciado.

### Catálogo inicial de prueba

| Rareza | Acción | TdP | Efecto |
| --- | --- | ---: | --- |
| Común | Turno de palabra | 1 | +1 Zasca a un orador propio durante este turno |
| Común | Réplica | 1 | 2 de daño a un orador rival |
| Común | Receso | 1 | Cura 2 de Aguante a un orador propio |
| Raro | Disciplina de grupo | 2 | +1 Zasca a todos los propios durante este turno |
| Raro | Pregunta incómoda | 2 | 4 de daño a un orador rival |
| Raro | Pausa parlamentaria | 2 | Cura 2 a todos los oradores de ambos bandos |
| Especial | Escudo parlamentario | 3 | Defensa de un golpe para cada orador propio |
| Especial | Interpelación | 3 | 2 de daño a cada orador rival |
| Especial | Debate abierto | 3 | +2 Zasca a ambos bandos en su turno activo |
| Legendario | Moción de censura | 4 | Silencia las acciones del próximo turno rival |
| Legendario | Mayoría reforzada | 4 | +2 Zasca a todos los propios durante este turno |
| Legendario | Acuerdo de Estado | 4 | Cura 4 a todos los oradores propios |

Moción exige tres oradores propios listos y menos votos que el rival. Los tres
consumen su acción al activarla. El rival conserva el robo y los votos pasivos;
no podrá presentar cartas, usar acciones ni atacar, defender o curar. Después
recupera su turno normal; queda protegido contra otro silencio durante dos turnos
propios adicionales. Solo una activación por partida. El prototipo de reglas
entrega `silenced`; el motor completo todavía debe aplicar ese bloqueo a **todas**
las acciones de combate y hacer el pase automático tras mostrar lo sucedido.
Estas restricciones son una hipótesis de balance, no una garantía estadística.

Sobres: propuesta de un 20 % de probabilidad de sustituir **un** hueco por una
acción de la misma rareza, manteniendo cinco cartas y el precio. No se reduce
la rareza del hueco, pero sí cambia la probabilidad de obtener un orador de esa
rareza. Esta probabilidad debe revisarse antes de publicar. Acciones fuera de
portadas, también cuando son legendarias. Sin reescribir sobres ya comprados.

Gabinetes: conservar las cinco pestañas numeradas y el estado completo/incompleto;
abrir un editor con dos grupos: Oradores (5, selección de líder) y Acciones (0–2).
Editar solo desde Colección; antes del combate se elige el favorito y se ve un
resumen de los dos grupos. El prototipo muestra los grupos y permite probar dos
acciones; aún no reemplaza el editor real ni añade campos al respaldo existente.

## Probar la visual local

```sh
node _dev/online/preview-server.cjs
```

Abrir http://127.0.0.1:8031. No hay usuarios, compras ni inventario reales.
Elegir dos acciones diferentes → Probar gabinete → pulsar acción → objetivo,
si corresponde. Siguiente turno baraja. La vista prueba animación, cambios de
mano, tres puestos y descarte sombreado. No pretende simular un combate completo.

## Render: siguiente paso exacto

El inicio de sesión con Gmail en Render sirve. Para desplegar desde este repo,
autorizar GitHub como proveedor de código (no hace falta cambiar el acceso a
Render). Cuando esta rama esté subida:

1. Dashboard → New → Web Service → conectar GitHub → DoomsGarden/Hemicycle.
2. Elegir la rama de preparación `codex/online-actions-foundation`, no `main`.
3. Runtime Node; dejar Root Directory vacío.
4. Build Command: `node --check _dev/online/server.cjs`.
5. Start Command: `node _dev/online/server.cjs`.
6. Variables:
   - NODE_VERSION: `24`
   - SUPABASE_URL: URL del proyecto de Supabase de pruebas.
   - SUPABASE_PUBLISHABLE_KEY: clave pública publishable de ese proyecto.
   - ALLOWED_ORIGINS: `https://hemicycle.online,https://www.hemicycle.online,https://doomsgarden.github.io`
7. Health Check Path: `/health`.
8. Revisar el plan y el coste mostrado en Render. El archivo `render.yaml`
   propone free; su disponibilidad y límites dependen de Render. Un servicio
   que se duerme es útil para salas de prueba, no para turnos competitivos.
9. Crear en un proyecto Supabase de pruebas la autenticación y ejecutar
   `_dev/online/rooms.sql`. No toca tablas de guardados; no importa colecciones.
10. Comprobar la URL `https://<servicio>.onrender.com/health`: debe responder
    `configured: true`, `combatEnabled: false`. Compartir esa **URL pública**
    permite continuar con la conexión del cliente; no hacen falta contraseñas
    de Render, claves secretas ni claves service_role.

No cambies los DNS todavía. Primero verificaremos el servicio en onrender.com;
después podremos conectar `api.hemicycle.online` siguiendo el destino que Render
indique. El dominio del juego, cuentas y respaldos actuales siguen como están.

Este servicio implementa salas persistentes de dos cuentas: POST /rooms
(operationId UUID), POST /rooms/join (code), GET /rooms/:uuid. Requieren
Authorization: Bearer <sesión Supabase>. Supabase valida el JWT; el navegador
no elige su identidad. Código de 12 hexadecimales, caducidad de 30 minutos,
reintentos de creación/entrada sin duplicados y tercera cuenta rechazada.
No se registra el token ni se devuelve identidad privada del rival.

**Pendiente antes de jugar online:** motor completo independiente del HTML,
validación de gabinetes contra inventario del servidor, reloj de 90 segundos,
proyección privada de manos, reconexión y secuencias de acciones idempotentes,
pruebas de concurrencia con PostgreSQL desplegado, cliente de salas integrado,
y finalmente economía/migración. Las salas en estado paired todavía no arrancan
partida. El respaldo editable actual no sirve como inventario autoritativo.

## Verificación

```sh
NODE_PATH=/workspace/.hemicycle-tools/node_modules \
PGLITE_MODULE=/workspace/.hemicycle-tools/node_modules/@electric-sql/pglite \
node --test tests/online/*.test.cjs
NODE_PATH=/workspace/.hemicycle-tools/node_modules node _dev/checks/online-actions-preview.cjs
```

50 casos: 30 de reglas/mazos/sobres, 10 HTTP/autenticación y 10 SQL de salas
con PostgreSQL local PGlite. No sustituyen una partida real entre dos dispositivos
ni las pruebas de concurrencia de PostgreSQL alojado. Evidencias en
`_dev/reports/online-foundation/`. Chromium prueba 320×568, 393×851, 851×393 y
1280×900, con animación y movimiento reducido.

## Servicio arrancado y ventana para dos cuentas

El propietario confirma `/health` con `configured: true` y
`combatEnabled: false` en `https://hemicycle-w578.onrender.com`. También confirma
Success del SQL de salas. El entorno de Codex no puede consultar ese destino:
el proxy rechaza el túnel CONNECT (403); no se afirma una comprobación externa
que todavía no se ha realizado.

Esta rama añade una ventana de prueba en:
https://hemicycle-w578.onrender.com/rooms-test/

Render debe desplegar el último commit de la rama antes de abrirla. No cambia
la publicación de GitHub Pages. No ejecutar otra migración para esta ventana.

Para Google: Supabase → Authentication → URL Configuration → Redirect URLs →
Add URL → `https://hemicycle-w578.onrender.com/rooms-test/` → Save. Mantener el
Site URL y los retornos del juego. El callback de Google Cloud sigue siendo el
callback de Supabase; no añadir onrender como callback de Google Cloud.

La ventana usa el SDK oficial y guarda su sesión de pruebas separada de la del
juego. No pide ni guarda claves administrativas. Un navegador accede con una
cuenta y crea sala; otro navegador/dispositivo accede con una segunda cuenta y
pega el código. Ambos deben mostrar «Dos jugadores conectados». Una tercera
cuenta debe ser rechazada. Al recargar se recupera la sesión y la sala de esa
pestaña. Es una prueba de acceso y persistencia, todavía sin combate. Config y
SDK son recursos públicos; contienen solo URL y clave publishable. El backend
permite el origen propio que Render indica en RENDER_EXTERNAL_URL, además de
los orígenes explícitos del juego. Cerrar sesión de pruebas conserva el progreso
y la sesión que pudiera estar abierta en el dominio del juego.

Comprobación reproducible adicional:

```sh
NODE_PATH=/workspace/.hemicycle-tools/node_modules \
PGLITE_MODULE=/workspace/.hemicycle-tools/node_modules/@electric-sql/pglite \
node _dev/checks/online-lobby-browser.cjs
```

SDK real, tres contextos de Chromium y funciones PostgreSQL locales; transporte
de autenticación simulado, sin tocar usuarios alojados. Se comprueban creación,
entrada, rechazo de tercera cuenta, recarga, cierre de sesión aislado y ausencia
de cambios en progreso. Evidencias `lobby-browser.json` y capturas host/guest.
El acceso de Google real y las dos cuentas alojadas deben probarse en el servicio.

## Corrección del retorno de Google y lista de probadores

El propietario observó `{"error":"Inicia sesión."}` al volver a la ventana de
salas desde Google. Se encontró un fallo reproducible: el servidor comparaba
req.url entero con `/rooms-test/`, por lo que `?code=…` impedía servir el HTML y
se exigía un token antes de que el SDK pudiera canjear ese código. Ahora las
rutas se resuelven por pathname; se mantienen los parámetros para el SDK y una
redirección de `/rooms-test` a `/rooms-test/` conserva la query. Se prueba el
recorrido Google/PKCE con el SDK oficial y transporte OAuth simulado.

No hace falta crear primero una contraseña del juego para utilizar Google:
Supabase crea la cuenta en el primer acceso si el proveedor y el registro están
habilitados. En producción siguen siendo necesarias la URL de retorno exacta
en Supabase y la autorización de los correos en Google mientras la aplicación
OAuth permanezca en pruebas. La corrección no demuestra por sí sola que esos
ajustes alojados estén bien ni sustituye el acceso real del propietario.

**Nuevo SQL que debe ejecutar el propietario:**
`_dev/online/20261024_test_players.sql`, después del SQL inicial de salas.
Puede guardarlo como «Hemicycle — Jugadores e invitaciones de prueba».
Crea el directorio, añade destinatario a las salas y protege su aceptación.
Se puede reaplicar y no modifica perfiles, nicks, guardados ni inventarios.
El `rooms.sql` actual también mantiene la comprobación de destinatario para
nuevas instalaciones. Para reinstalar, aplicar siempre base y después migración;
evitar consultas guardadas de versiones anteriores que sustituyan esa función.

- Cada probador autenticado elige «Aparecer en la lista de pruebas».
- No se enumeran todas las cuentas de auth.users ni sus correos o metadatos.
  Se usa el nick del juego o un alias provisional de servidor. Este alias no
  consume el cambio anual de nick.
- El desplegable muestra conectados y desconectados. La presencia usa el reloj
  del servidor, latido de unos 25 segundos y vencimiento de 90 segundos. Cerrar
  sesión marca desconectado; cerrar pestaña o perder red puede tardar hasta
  ese vencimiento. Varias pestañas/dispositivos pueden actualizar el mismo
  registro, por lo que es un indicador aproximado, no una garantía de atención.
- Desmarcar la opción oculta al probador; desconectarse conserva su entrada.
- Al elegir un jugador visible se envía una invitación privada de 30 minutos.
  Solo esa cuenta puede aceptar, también después de desconectarse y volver.
  Saber el código no permite entrar a un tercero. Las salas por código siguen
  disponibles. Las invitaciones no arrancan combate ni conceden premios.
- La ventana consulta sala/lista cada cinco segundos mientras está visible;
  no crea una cuenta ni hace visible al usuario automáticamente.

Se añaden 12 pruebas SQL de privacidad/presencia/invitaciones (62 casos totales),
además de las comprobaciones de navegador del retorno Google, selector sin
correos, desconexión, envío a desconectado y aceptación al regresar. Se conserva
la cobertura de las salas por código y el rechazo a una tercera cuenta.

## Combate privado añadido

La siguiente entrega conecta las salas a partidas jugables con estado privado
persistente y reglas en el servidor. Ver **[COMBATE-PRIVADO.md](COMBATE-PRIVADO.md)**
para activar el nuevo SQL y jugar. Sustituye las referencias anteriores de esta
bitácora a «solo salas» o «combate deshabilitado». La preparación de las salas
sigue siendo compatible; el juego real conserva todo su progreso.
