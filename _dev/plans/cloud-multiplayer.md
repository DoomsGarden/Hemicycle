# Guardado en la nube y multijugador: orden de implementación

Documento de planificación, 21 de octubre de 2026. No configura ni publica servicios externos. El sitio actual sigue siendo una PWA en GitHub Pages; el mercado compartido existente es un servidor de demostración con cuentas e inventarios de prueba.

## 1. Proteger el progreso actual y crear cuentas

Antes de migrar: exportación del guardado local y copia recuperable. Crear un identificador local estable, un formato de respaldo con versión y una pantalla para vincularlo a una cuenta. Un ID identifica; no autoriza acceso. La recuperación necesita autenticación, por ejemplo enlace de acceso al correo, Google o contraseña. No se debe permitir restaurar una colección solo conociendo el ID público.

Propuesta de base: Supabase Auth y PostgreSQL para cuentas y datos; un servicio Node.js para la lógica del juego y las partidas. El ID de la cuenta autenticada será la identidad estable entre dispositivos. Los secretos privilegiados permanecen en el servidor. Cada jugador solo puede consultar su perfil y las vistas públicas previstas; el navegador no puede escribir directamente saldo, inventario, resultados ni clasificación.

Decisiones del propietario: métodos de acceso, alojamiento y presupuesto, plazo de migración y qué progreso puede conseguirse sin conexión. El proveedor de autenticación y la región de la base de datos deben elegirse antes de crear datos de jugadores reales.

## 2. Importar una sola vez los guardados del prelanzamiento

Cargar el respaldo, validar versión, catálogo, cantidades y coherencia de los datos; presentar lo que se conservará antes de vincularlo. Conservar colección (incluidas copias), estadísticas de victorias/derrotas y logros. Reiniciar Elo a 0, rango a Aprendiz de pasillo X y Liga a su estado de nuevo jugador. Reiniciar Fuerza Soberana a 1500 FS, el saldo de un jugador nuevo, según la regla acordada. Conservar los sobres ya ganados; archivar las marcas de temporadas importadas para impedir duplicaciones. Este reinicio se aplica únicamente al importar a la futura nube: actualizar el cliente o restaurar un archivo local no reinicia esos datos.

Registrar una migración idempotente por cuenta y por origen: repetir la misma solicitud no vuelve a añadir cromos. El inventario legado debe identificarse por su edición de prelanzamiento para distinguirlo de futuras ediciones, sin cambiar su propiedad.

Límite real: los guardados locales históricos pueden editarse. Ni un ID ni una firma creada por el propio navegador prueban que se obtuvieron legítimamente. Hace falta una política de aceptación para esos datos (límites, revisión o corte de migración). A partir de la vinculación, las operaciones económicas válidas serán las registradas por el servidor.

## 3. Guardado cloud sin pérdidas ni duplicados

Modelo mínimo: cuentas/perfiles, catálogo y ediciones, inventarios por cantidad, saldo con libro de movimientos, progreso, migraciones y respaldos. Incluir los estados de los tutoriales (actualmente en `hemiciclo_tutorial_v1` y `hemiciclo_menu_tutorial_v1`) para que una cuenta no tenga que repetirlos en otro dispositivo. Usar claves únicas, revisiones y transacciones. Cada operación lleva un identificador idempotente: reintentar por mala conexión no cobra, entrega ni premia dos veces.

La nube conserva la versión autoritativa. La copia del dispositivo sirve para lectura y recuperación, sin resolver conflictos sumando saldos o sustituyendo todo por «el último guardado». Al cambiar de móvil, se inicia sesión y se descarga el mismo perfil. Crear respaldos automáticos del servidor y probar una restauración en un entorno separado.

Validar con dos dispositivos y una cuenta: inicio, actualización, cierre de sesión, enlace de cuenta, reintentos, desconexión y recuperación. No borrar la copia local hasta verificar y confirmar la importación.

## 4. Convertir el mercado demo en servicio real

El prototipo Node/SQLite aporta reglas y pruebas de ventas, reservas, confirmación, caducidad e idempotencia. Sustituir las cuentas de demostración por sesiones autenticadas, migrar el almacenamiento a PostgreSQL y operar con el inventario/saldo real del servidor. Las entregas de ambos jugadores y los pagos deben confirmarse en una sola transacción.

Mantener protección de última copia, precios/rareza, compensaciones, tick de revisión y aceptación de cada participante. Añadir trazabilidad de operaciones y herramientas para investigar discrepancias. Las compras a otros jugadores no se habilitan públicamente hasta probar concurrencia, cancelaciones y recuperación de fallos con cuentas reales de prueba aisladas.

## 5. Separar reglas de pantalla y ejecutar el combate en servidor

Extraer del HTML un módulo de reglas independiente del DOM. Conservar los comportamientos comprobados: sorteo, costes, TdP, doctrinas y sus contrapartidas, daño, expulsiones, votos, cierre inmediato a 100, ausencia de límite de rondas, turnos de 60 segundos con abandono por inactividad, mano máxima de dos, reciclaje con un turno de espera y recompensas. Reutilizar las pruebas actuales y añadir reproducción determinista de partidas.

El cliente envía intenciones («presentar cromo», «atacar objetivo», «pasar turno»). El servidor verifica identidad, propiedad del gabinete, turno, recursos y legalidad. Sorteo, estado, resultado, FS, Elo y botín se calculan y guardan en el servidor. La finalización debe ser idempotente por partida para que una reconexión no repita recompensas.

Un juego por turnos puede comenzar con HTTP y consulta periódica; WebSocket facilita recibir acciones al instante. Cada jugador recibe únicamente su vista autorizada, sin revelar la mano o el mazo oculto del rival. Guardar estado y secuencia de acciones para reconectar después de cerrar la app.

Reglas ya acordadas: 60 segundos por turno, abandono por inactividad y victoria a 100 votos, sin límite de rondas. Pendiente de concretar para la red: tolerancia a desconexiones, emparejamiento y tratamiento de partidas sin conexión. El servidor fijará los vencimientos con su propio reloj.

## 6. Salas privadas, emparejamiento y despliegue gradual

Primero dos cuentas de prueba en una sala privada con código; después reconexión, tiempos y rendición. Probar acciones simultáneas, caducadas, repetidas o de otro usuario. Verificar que los dos dispositivos muestran el mismo resultado y que el saldo/cuadro de clasificación cambia una sola vez.

Después añadir cola de emparejamiento para normales y clasificatorias, cálculo central del Elo y supervisión de errores. Publicar primero a un grupo pequeño de probadores, con servidor y base de datos de pruebas separados de producción. Preparar exportación, respaldos, restauración y reversión antes de ampliar el acceso.

GitHub Pages puede seguir alojando el cliente. El backend se despliega por separado con HTTPS y, si se usa, WSS. Los servicios privilegiados necesitan configuración y credenciales del proveedor; este documento no crea cuentas ni activa alojamiento de pago.

## Primer hito recomendable

«Una misma cuenta recupera su colección en dos dispositivos, después de una importación única que conserva cromos, estadísticas y logros, y reinicia FS, Elo, rango y Liga conforme a la regla acordada». El siguiente hito es que dos cuentas disputen una partida privada gobernada por el servidor. Separar estos dos hitos permite comprobar la migración antes de introducir recompensas o intercambios entre personas.

## Implementación local disponible en v30.2.61

`js/player-backup.js` crea un UUID v4 local estable con prefijo HC, guardado aparte del inventario. Ayuda permite copiarlo, exportar un JSON versionado y restaurarlo con vista previa, tick y confirmación. Incluye las marcas de recompensas clasificatorias reclamadas y pendientes. La restauración valida todos los datos antes de escribir y revierte las claves anteriores si falla una escritura. No crea cuenta remota ni comprueba propiedad histórica.

`js/ranked-seasons.js` define temporadas comunes de 30 días civiles en Europe/Madrid desde el 21 de octubre de 2026. El cambio de hora no adelanta el fin de temporada. Se conserva la división romana al bajar un rango por periodo vencido; los ascensos repetidos no conceden recompensas dobles. Al conectar la nube, ese registro y su reloj deben pertenecer al servidor, con operaciones transaccionales e idempotentes.

## Actualización acordada en v31.0.0.2

El propietario decidió conservar FS, Elo y Liga durante el respaldo cloud del prelanzamiento y reservar su reinicio para el estreno multijugador. Esta decisión sustituye las referencias anteriores a un reinicio en la primera importación cloud. El respaldo actual es optativo, por cuenta, con revisiones y resolución explícita de conflictos; no convierte el estado local en resultados de juego autoritativos. La siguiente fase debe separar inventario/economía/combate del respaldo editable antes de habilitar interacciones reales entre jugadores. Detalles y pruebas en `_dev/releases/v31.0.0.2.md`.


## Continuación acordada: 24 de octubre de 2026

Para la jugabilidad online, la cuenta y el guardado del servidor serán obligatorios.
El progreso competitivo, inventario y saldo se modificarán mediante operaciones
validadas en el servidor, nunca aceptando un respaldo JSON del navegador como
resultado de una partida, compra o recompensa. Hacer obligatorio el respaldo actual
no lo convierte en un sistema resistente a la manipulación de datos.

El respaldo del prelanzamiento y sus RPC actuales seguirán separados del futuro
estado autoritativo. El acceso de invitado actual continúa disponible mientras se
construye esta fase; no se activan reinicios ni migraciones automáticas con este
ajuste. La importación del legado deberá ser única y transaccional, conservar lo
acordado y establecer una frontera tras la cual restaurar un archivo local no
pueda sustituir el inventario online. El servidor no puede demostrar por sí solo
la legitimidad de los guardados locales anteriores.

Primera entrega online: salas privadas entre dos cuentas, sin premios ni cambios
competitivos, con reglas actuales y turnos de 90 segundos (sustituye las referencias
anteriores a 60 segundos de este documento). Después: reconexión, autoridad sobre
la economía, migración y lanzamiento competitivo. Alojamiento del servidor aún
pendiente; Render es la propuesta, no un servicio ya desplegado.

La ventana de nube muestra estado y fecha de actualización, sin el número técnico
de revisión. Las revisiones se conservan en el protocolo y en los controles de
conflicto para evitar sobrescrituras y duplicaciones.


## Prototipo de acciones y salas privadas

Preparación en `_dev/online/README.md`, rama `codex/online-actions-foundation`.
El propietario confirma cinco oradores y dos acciones opcionales por gabinete.
Las acciones se activan desde la mano con animación hacia la zona superior de
la mesa: las reutilizables vuelven al mazo y las de una sola activación terminan
en un descarte visible sombreado, separado del pasillo. Se renueva la mano al
inicio de cada turno propio, con máximo una acción entre las dos cartas.

50 pruebas de prototipo y navegador en cuatro tamaños. Las salas prueban solo
creación/entrada autenticada y persistencia SQL; todavía no se puede disputar una
partida online. Ninguna migración alojada ni despliegue en Render se ha ejecutado.
