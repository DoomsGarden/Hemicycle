# Correos automáticos de Hemiciclo

Plantillas listas para instalar manualmente en Supabase; todavía no se han cambiado los mensajes del proyecto.

- `confirmar-cuenta.html`: confirmación de alta. Asunto: **Confirma tu cuenta de Hemiciclo**.
- `recuperar-acceso.html`: recuperación. Asunto: **Recupera el acceso a Hemiciclo**.
- Los `.txt` son versiones de lectura y revisión; no sustituyen el cuerpo HTML de Supabase.

## Instalación

Supabase → Authentication → Email → Templates (o Email Templates, según el panel): pegar la plantilla de confirmación en **Confirm signup** y la de recuperación en **Reset password**. Conservar exactamente `{{ .ConfirmationURL }}`: Supabase genera su enlace. No sustituirlo por SiteURL ni por la portada del juego. No pegar estas plantillas en una campaña de Brevo ni enviar campañas a los jugadores.

No cambiar las credenciales SMTP, que ya funcionan. El remitente sigue siendo `Hemiciclo <cuentas@hemicycle.online>`. Las respuestas a esa dirección deben recibirse mediante la regla de Cloudflare ya preparada. El pie ofrece el contacto de soporte; no depende de un encabezado Reply-To que el panel de Supabase quizá no permita configurar.

Revisar en Brevo las opciones de seguimiento transaccional y desactivar aperturas y clics para estos mensajes de autenticación. No se necesitan para confirmar una cuenta y pueden reescribir enlaces o recoger información adicional. La entrega y los registros técnicos del proveedor son otra función.

Crear una cuenta de prueba y solicitar una recuperación nueva después de guardar las plantillas. Revisar remitente, contenido, spam, botón y cambio efectivo de contraseña. No reutilizar un enlace ya consumido ni compartir códigos, tokens o contraseñas. Las pruebas locales solo simulan el transporte: no acreditan recepción real en todos los clientes de correo.

## Compatibilidad y diseño

Tablas de presentación, CSS en línea, colores azul oscuro y dorado, tipografía de sistema y marca legible incluso sin imágenes. Sin scripts, fuentes remotas, formularios, píxeles de seguimiento o recursos externos. La apariencia exacta de degradados y esquinas puede variar en Outlook; el botón conserva color y texto de respaldo. Vistas móviles comprobadas en Chromium; confirmar Gmail y los clientes reales al instalar.

## Recepción y organización

Comprobar que Cloudflare ya terminó de sincronizar y que `cuentas`, `soporte`, `legal` y `privacidad` llegan a `hemicycle.online@gmail.com`. Se pueden crear etiquetas y filtros por dirección destinataria en Gmail. Recibir por reenvío no configura automáticamente el envío como `soporte@hemicycle.online`: no afirmar que esa función está lista hasta configurar y probar «Enviar como» con un SMTP compatible.

## Responder desde las direcciones del dominio en Gmail

Después de comprobar la recepción, registrar en Brevo los remitentes de soporte, legal y privacidad que se vayan a usar. Crear una clave SMTP dedicada a Gmail, distinta de la de Supabase, para poder revocarlas por separado.

En la versión de escritorio de Gmail → Configuración → Ver todos los ajustes → Cuentas e importación → Enviar como → Añadir otra dirección: indicar el nombre visible y, por ejemplo, `soporte@hemicycle.online`. Usar el servidor y usuario SMTP que proporciona Brevo, puerto 587 si lo ofrece y TLS/STARTTLS; contraseña: la nueva clave dedicada. Completar la verificación recibida por Cloudflare. Repetir solo para las direcciones desde las que se necesite responder y elegir responder desde la dirección a la que llegó el mensaje.

Esta configuración es manual y aún no se ha aplicado ni probado desde este entorno. Revisar que el plan y las condiciones del proveedor permiten ese uso. Si aparece un rechazo, consultar el registro transaccional y no cambiar los MX que mantienen la recepción. No compartir las claves en el chat.
