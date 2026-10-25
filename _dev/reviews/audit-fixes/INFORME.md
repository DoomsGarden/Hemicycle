# Correcciones de la auditoría — base aprobada para v31.0.2.0

**Base:** v31.0.1.4, `7f439a9`.

**Actualización de publicación:** el usuario ha aprobado v31.0.2.0. El paquete ha superado 510 pruebas y la actualización PWA de 85 recursos con la versión nueva. La migración de Supabase real sigue pendiente; consultar `_dev/releases/v31.0.2.0.md`. El informe que sigue documenta la revisión previa.

**Estado durante la revisión:** **Estado:** cambios locales, sin commit ni push, sin despliegue de Render/Pages y sin ejecutar SQL en Supabase real. Se conserva el número de versión visible y el changelog publicado.

## Qué está preparado

| Auditoría | Cambio | Comprobación |
| --- | --- | --- |
| A1. Guardado económico manipulable | Los respaldos vinculados dejan de admitir cambios directos de saldo, colección, victorias, Elo, objetivos y desbloqueos. El servidor ejecuta compras, ventas y reclamaciones sobre el respaldo canónico. Las operaciones llevan un identificador persistente y se liquidan con control de revisión y transacción. | PostgreSQL aislado: ocho alteraciones de progreso rechazadas, antigua RPC de escritura revocada, preferencias permitidas, datos existentes conservados y SQL reaplicable. Compras, ventas, mercado y reproducción de partidas comprobados por HTTP y navegador. |
| A2. Estancamiento atacando huecos | Máximo **3 votos restados por turno propio**, compartidos por todos los oradores de ese bando. Se recupera al comenzar su siguiente turno. No se limita el número de rondas ni cambia la victoria a 100 votos. La IA evita gastar Aguante en un fuerte que no retire más votos. | La secuencia de estancamiento de la auditoría ahora termina en ambos motores mediante jugadas válidas. El límite no consume una acción rechazada. Las partidas remotas que ya estaban comenzadas conservan sus reglas anteriores. |
| A3. Efectos online ausentes | Eventos estructurados de presentar, atacar, dañar, defender, curar, expulsar y cambiar de turno. Secuencias para no repetir efectos al recibir el mismo estado o reconectar. | Dos clientes Chromium: efectos de carta, ataque, defensa y curación registrados en ambos. La música conserva las mismas fuentes durante las acciones; una partida nueva crea sus propias fuentes. |
| A4. Perfil en pantalla baja | Distribución de dos columnas en pantallas estrechas y muy bajas. La información de partidas descargadas se consulta desde Nube para no volver a recargar el perfil. | Sin exceso de contenido en los siete tamaños del arnés, incluido 393×350. |

También se han completado las carencias funcionales del informe:

- **Mercado compartido:** servicio autenticado en el mismo backend, con inventarios reales de cuenta y reservas en PostgreSQL. Publicar/retirar ofertas, comprar, proponer, aceptar, cancelar y caducar intercambios. Se conserva una copia; precios y diferencias por rareza se calculan en el servidor. La transacción confirma ambas entregas y ambos pagos. La aparición en el listado de intercambios es voluntaria y muestra únicamente nick y repetidos; no publica respaldos ni correos. Sigue existiendo el mercado local para invitados.
- **Acciones repetidas:** pueden venderse y utilizarse en el mercado con las reglas de su rareza. Se conserva una copia y se registran sus recibos. La ficha de una acción incorpora Anterior/Siguiente y mantiene la navegación del sobre cuando procede.
- **Correo:** crear cuenta con confirmación, solicitar recuperación, volver desde el enlace PKCE y cambiar contraseña. Se ha corregido el solapamiento entre la recuperación y la pantalla «Iniciar». Las credenciales no se incluyen en respaldos ni registros de pruebas.
- **Preferencias:** la conciliación económica conserva los favoritos y la apariencia elegida en este dispositivo y vuelve a guardar esas preferencias cuando corresponde; no puede convertirlas en recursos o desbloqueos nuevos.

## Premios sin conexión: compromiso elegido

Se ha implementado la opción acordada: **jugar sin red y validar los premios al reconectar**.

1. Al sincronizar se preparan diez partidas con semilla y un contexto de colección emitidos por el servidor. Se conserva el contexto mínimo necesario, sin tokens ni correos. Hay un tope de cien partidas emitidas aún vigentes por cuenta para no acumular descargas indefinidamente.
2. La partida descargada usa el mismo motor y el mismo azar que su reproducción en el servidor. Registra las jugadas en IndexedDB y permite recuperarse tras recargar. Cuando hay una partida disponible comienza sin esperar otra petición de red. Una segunda pestaña no puede tomar simultáneamente la misma partida en navegadores con Web Locks.
3. Al terminar, el registro queda pendiente. Sus FS, cromos, Elo y premios **todavía no forman parte del saldo o inventario disponibles**.
4. Si hay conexión se envía inmediatamente para validar; si no, se conserva y reintenta al reconectar. El servidor reproduce las jugadas y concede el resultado una sola vez. Se puede reintentar desde **Perfil → Nube → Sincronizar partidas**.
5. La victoria y sus premios positivos también se comprobaron en SQL: abono de FS, Elo, cromo y progreso, sin modificar los importes por una petición del cliente.

Las partidas descargadas caducan a los **siete días**. Es necesario conservar el almacenamiento del dispositivo hasta sincronizar: exportar el respaldo normal no incluye el registro de jugadas de IndexedDB. En Liga se valida una jornada antes de iniciar la siguiente, para no disputar varias veces una jornada aún pendiente de liquidación. Se mantienen las doce jornadas, la simulación de los demás equipos y los premios de cierre.

Las invitaciones y la cola continúan usando el servicio de combate remoto. Se mantienen los modos amistosos de pruebas y el Elo unificado de Clasificatoria. **No hay reinicio de cuentas ni arranque de la temporada 2.**

Esta solución evita aceptar saldos o inventarios inventados y verifica que el resultado procede de jugadas legales. **No certifica que un dispositivo offline no haya repetido simulaciones, automatizado decisiones o alterado su reloj.** Es el compromiso para conservar juego y premios sin conexión; no equivale a la garantía de un combate ejecutado íntegramente por un servidor.

## Escena de resultado

Se han preparado **dos escenas realistas en WebP animado** del mismo hemiciclo: victoria con luz cálida y confeti, y derrota con iluminación nocturna sin celebración. Incorporan movimiento suave de cámara y un ciclo de aproximadamente 4,8 segundos. Tras la comprobación del resultado y del guardado, se habilita **Siguiente**, situado abajo. La escena no se cierra automáticamente: al pulsar ese botón se muestran los resultados habituales.

La escena aparece mientras se verifica el resultado, no después de terminar la comprobación. Se espera el ciclo inicial de presentación además de la verificación; el estado indica «Finalizando escena» cuando el guardado ya está comprobado. No se habilita Siguiente usando un respaldo antiguo en caché si falla la consulta de la nube. Tampoco se habilita si falla la lectura del guardado local. El modo de movimiento reducido utiliza fotografías WebP estáticas y una transición breve.

Si no hay conexión, el registro pendiente se conserva y la escena ofrece reintentar; al reconectar vuelve a comprobarlo. **No se permite avanzar a los resultados como si el guardado estuviese verificado.** Cerrar la aplicación no elimina el registro pendiente.

Es arte realista generado para el juego, no una grabación de un senado real. Los originales y el generador de las animaciones quedan bajo `_dev/art/result-scenes/` y `_dev/build-result-scenes.cjs`; los jugadores solo reciben los WebP finales. Las imágenes animadas pesan aproximadamente 4,8 y 3,35 MiB, respectivamente, y se incluyen en la caché PWA.

- [Victoria](scenes2/victory-realistic.png).
- [Derrota](scenes2/defeat-realistic.png).
- [Vídeo de ambas escenas y Siguiente](scenes2/victory-defeat.webm).
- [Previsualización: victoria, derrota, verificación lenta y reintento](PREVISUALIZACION.html).

- [Mercado conectado](browser/real-market.png).
- [Resultado sin conexión, aún pendiente](browser/offline-pending.png).
- [Resultado verificado al reconectar](browser/offline-verified.png).
- [Clasificatoria validada por el servidor](browser/ranked-verified.png).
- [Perfil compacto](profile/perfil-393x350.png).

La confirmación no puede prometerse instantánea: depende de la conexión y del servidor. La instancia gratuita de Render puede tardar en despertar tras un periodo de inactividad; la escena permanece visible y Siguiente sigue bloqueado durante esa espera.

## Conservación del progreso anterior

- **Cuentas que ya tienen respaldo:** la migración conserva exactamente sus datos como punto de partida. No intenta decidir retrospectivamente qué parte se obtuvo legítimamente, ni reinicia FS, cromos, estadísticas, logros, Elo o Liga.
- **Cuenta nueva sin progreso jugado:** el servidor entrega la colección inicial y los FS iniciales habituales.
- **Progreso anterior que solo esté en el dispositivo:** se conserva y se envía una solicitud privada para revisar su migración. No se sustituye automáticamente por una colección nueva ni se suma a otro respaldo. Su copia local y de recuperación permanecen disponibles. La solicitud requiere revisión del propietario antes de incorporarse a la economía compartida.

Esta última política debe revisarse antes de desplegar. Aprobar automáticamente cualquier archivo local reabriría la alteración de recursos que se pretende corregir. Se incluye [una plantilla de importación revisada](IMPORTAR-PROGRESO-LOCAL.sql), que no se ha ejecutado y que impide sobrescribir un respaldo ya vinculado.

## Verificaciones y límites

- **510 pruebas Node superadas**, sin fallos ni omisiones: reglas, acciones, pasivas, progreso, mercado, nube, Elo, recibos, tutoriales, PWA y nuevas regresiones.
- **SQL real en PostgreSQL aislado:** migración repetible, datos preservados, denegación de alteraciones y accesos indebidos, preferencias, compras por lotes, venta de acciones, compra e intercambio, reproducción y consumo único de partidas, victoria con premios positivos.
- **Chromium + HTTP + PostgreSQL + SDK oficial:** recuperar respaldo, compra canónica, dos cuentas en el mercado, iniciar/recargar una partida descargada, finalizar sin red, premios pendientes, reconectar y validar una sola vez; Clasificatoria contra IA con nube protegida.
- **Correo con SDK oficial y transporte simulado:** alta, confirmación requerida, recuperación PKCE y actualización autenticada de contraseña. No se han enviado correos reales.
- **PWA desde la versión publicada:** 85 recursos en caché; progreso, Liga, audio, gabinetes, registro pendiente en IndexedDB y cachés ajenas conservados. Navegación offline y fallback cuando la red no responde. Tutorial completo de 38 pasos.
- **Cromos:** 132 × tres vistas × cuatro tamaños; 1.584 comprobaciones de texto sin recorte.
- **Perfil:** siete tamaños, incluido 393×350, sin desplazamiento interno.
- **Audio remoto:** dos clientes, efectos semánticos presentes y música continua.
- **Escenas:** victoria y derrota en cuatro tamaños, bloqueo antes de verificar, fallo de lectura del guardado, reintento, reconexión, movimiento reducido y apertura de resultados exclusivamente al pulsar Siguiente. Ambos WebP contienen 62 fotogramas codificados (el codificador combina los iguales) y un ciclo de 4.799 ms.

El entorno sigue sin permitir acceder directamente al dominio, a Render o a Supabase reales. Por ello estos resultados **no prueban el futuro despliegue del backend ni la entrega real de correos**. Tampoco se ha hecho una prueba de carga, ni una certificación de equilibrio humano, ni una prueba de las APK en teléfonos físicos. El mercado compartido utiliza una transacción con revisión global, adecuada para revisar el prelanzamiento; deberá medirse su concurrencia antes de ampliarlo a gran escala.

## Qué revisaría contigo ahora

1. Si el límite de **3 votos por turno propio** resulta suficiente o demasiado restrictivo en partidas reales.
2. El aspecto y duración de la escena de resultado, incluido el comportamiento con red lenta.
3. La migración revisada de los jugadores que todavía solo tienen progreso local.
4. La diferencia visible entre premios pendientes y ya verificados, y la caducidad de las partidas descargadas.

Las ideas de campaña, nuevos arquetipos, compensación por empezar y renovación general del arte quedan como propuestas de diseño. Esta candidata no añade una campaña improvisada, no introduce telemetría y no atribuye a las simulaciones una certificación de equilibrio. La renovación audiovisual concreta de esta entrega es la escena de resultado y la coherencia de efectos en combate.

Los cambios siguen pendientes de aprobación. No hay una publicación nueva ni cambios en el changelog público. Se ha dejado [un borrador de novedades](NOVEDADES-PENDIENTES.md) conservando las notas ya publicadas y sin desvelar logros ocultos.
