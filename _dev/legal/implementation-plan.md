# Infraestructura legal y correo — propuesta pendiente de datos del titular

Fecha: 2026-10-28. No publicada; no cambia el juego ni crea cuentas externas.

## Hechos comprobados

- Supabase Auth gestiona acceso con Google, alta por correo y recuperación de contraseña (`js/player-profile.js`). El SMTP transaccional debe configurarse en Supabase.
- `js/launch-screen.js` controla el paso de Iniciar al juego; es el punto de integración del nuevo acceso legal, coordinado con la entrada al perfil y los tutoriales.
- Opciones se construye en `js/game-audio.js`, con estilo en `css/audio.css`. Debe admitir desplazamiento interior antes de añadir enlaces.
- La configuración admite hemicycle.online y GitHub Pages; esto no confirma la propiedad del dominio ni su DNS.
- El texto externo sobre Sellos es una propuesta ajena, no un requisito ni una descripción comprobada del juego. No incorporar moneda de pago ni renuncias de devolución por ese texto.

## Propuesta de interfaz

Después de Iniciar y antes de dar acceso al menú: panel con marca, aviso destacado de independencia y documentos desplegables. Condiciones con aceptación explícita no premarcada; aviso legal y privacidad disponibles para consulta, sin convertir toda información en consentimiento. Tratamientos opcionales, si existen, con elección independiente.

Acceso permanente desde Opciones a Información legal y Contacto. Documentos también mediante URLs públicas sin cuenta, para poder consultarlos antes del registro. Diseño del juego, texto ampliable, teclado, lectores de pantalla y alturas pequeñas.

Versión documental separada de la versión del juego. Registro de versión, huella del contenido y fecha, local para invitados y offline, con sincronización idempotente autenticada al conectar. La fecha del servidor es la de recepción; no presentarla como hora comprobada de una aceptación offline. No bloquear el juego esperando al servidor. Cambios sustanciales de condiciones pueden exigir nueva aceptación; un cambio visual no. Opción de volver a la entrada sin aceptar.

## Documentación a redactar tras confirmar el alcance

1. Aviso legal, identidad y contacto del responsable, independencia de partidos e instituciones y canal de reclamaciones de contenido.
2. Condiciones de uso: reglas, cuentas, mercado virtual, moderación, interrupciones, propiedad intelectual y límites compatibles con derechos legales.
3. Privacidad: datos realmente usados, finalidades y bases, proveedores, destinatarios y transferencias cuando procedan, conservación, derechos, contacto y menores.
4. Almacenamiento del dispositivo y tecnologías utilizadas, separando lo necesario de cualquier uso opcional.

Política de compras únicamente si existen pagos reales. No afirmar que una casilla elimina por sí sola derechos de desistimiento, reembolso o conformidad. Un aviso de no afiliación no concede derechos sobre imágenes, marcas, fotografías o retratos: revisar procedencia y licencias por separado.

## Correo propuesto

- `cuentas@DOMINIO`: remitente transaccional, con respuesta dirigida a soporte.
- `soporte@DOMINIO`: atención a jugadores.
- `legal@DOMINIO`: reclamaciones y avisos.
- `privacidad@DOMINIO`: ejercicio de derechos y consultas de datos.

Los tres últimos pueden ser alias de un buzón atendido, con clasificación de mensajes. Separar el proveedor de buzón del transporte SMTP. El titular contrata/valida las cuentas y aplica los registros DNS proporcionados por el proveedor; preparar instrucciones para SPF, DKIM y DMARC sin duplicar SPF ni inventar valores. Secretos SMTP solo en Supabase o almacenes secretos del servidor, nunca en GitHub/frontend/chat. Probar confirmación, recuperación y respuesta, con envío de pruebas autorizado por el titular.

## Datos pendientes

- País del responsable y si actúa como particular o entidad; identidad y domicilio de contacto adecuados para su publicación, revisados según las obligaciones aplicables. No pedir documentación de identidad en el chat.
- Dominio bajo su control, proveedor de correo existente y acceso al DNS.
- Pagos reales, anuncios, analítica y público menor de edad previsto; confirmar también regiones/condiciones de los servicios antes de cerrar privacidad.

## Reparto y validación

Ágora prepara interfaz, borradores identificados como tales, registro de aceptación, enlaces públicos, configuración documentada y pruebas de primer acceso/reapertura/offline/móviles y recuperación de cuenta. Dooms confirma datos y alcance, contrata correo/dominio y completa verificaciones personales, aplica secretos en sus paneles y revisa los textos con asesoramiento jurídico especialmente sobre imágenes y marcas. No publicar datos inventados ni documentos con huecos como si fueran definitivos.

## Actualización del 29-10-2026

Confirmados España, titular particular y dominio propio; Gmail dedicado, Cloudflare para recepción y Brevo SMTP integrado con Supabase. Alta y recuperación verificadas por Dooms tras la corrección 095dc2a. Sin pagos, anuncios ni analítica externa. Mínimo 12 años, 12–13 invitados, cuentas desde 14. El creador confirma generación por IA de todos los retratos, algunos con referencias visuales. No se inventan fuentes web.

Interfaz, borradores, plantillas y registro técnico preparados y probados. `published:false`: pendientes nombre del responsable, identificación que corresponda según actividad y revisión operativa de privacidad. Estado y activación: `_dev/legal/README.md`.

Estado final de preparación: Sergey Veselkov y regiones Supabase Irlanda/Render Frankfurt incorporados. Versión documental 2026-10-29.1. Archivo SQL completo legal_release.sql para aplicar antes de activar; main y las plantillas del proyecto aún no se han cambiado.
