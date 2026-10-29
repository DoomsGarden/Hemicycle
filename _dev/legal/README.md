# Información legal — paquete preparado para activación

Estado del 29-10-2026: España, responsable particular Sergey Veselkov, dominio propio. Sin compras reales, publicidad o analítica externa de uso. Edad mínima 12; 12–13 invitados; cuentas desde 14. El creador confirma que todos los retratos son ilustraciones generadas mediante prompts, algunos con referencias visuales. El correo transaccional de alta y recuperación ya funciona con Brevo y Supabase, incluida la corrección de la pantalla de recuperación.

## Qué está construido

Ventana entre Iniciar y la entrada a la cuenta/menú, documentos desplegables, acceso desde Opciones, consulta pública sin cuenta, fuentes y licencias documentadas, elección de edad y aceptación no premarcada. El consentimiento opcional no se mezcla con las condiciones ni con la lectura de privacidad. Los documentos tienen versión y huella SHA-256. Se conserva un recibo local y se prepara su sincronización autenticada sin bloquear por red; las horas del cliente y del servidor se distinguen.

En las pruebas con documentos publicados ficticios, la opción 12–13 no inicializa Supabase Auth y no ofrece alta ni acceso con Google. Es una declaración de tramo y una restricción de la interfaz, no verificación documental de edad ni una garantía absoluta contra el falseamiento o el acceso directo a APIs. Debe revisarse si resulta proporcionada para el servicio y su público. No se recoge fecha de nacimiento completa.

`legal/documents.json` es la fuente editable. `node _dev/legal/build.cjs` genera `js/legal-documents.js` y la huella. `published:true` prepara la aceptación en esta rama. SQL completo aplicado por Dooms con resultado Success; activación preparada para su subida a main. La modalidad de borrador sigue disponible y probada para futuras revisiones. El generador rechaza publicar con datos o apartados pendientes. Dooms ha confirmado Success al ejecutar el SQL completo en Supabase. Las plantillas de correo todavía deben instalarse manualmente en su panel.

## Datos incorporados y comprobaciones operativas

1. Responsable confirmado: Sergey Veselkov, España, con los correos del dominio. Para esta etapa particular y gratuita sin monetización se prepara el aviso sin DNI ni domicilio particular. Revisar los requisitos de identificación si la actividad adquiere carácter económico o pasa a empresa; la gratuidad de una función por sí sola no determina todas las obligaciones de LSSI.
2. Confirmar recepción real de los alias de soporte, legal y privacidad. La entrega SMTP de cuentas no prueba la recepción de consultas mediante Cloudflare.
3. Regiones confirmadas: Supabase en Irlanda (EU West), Render en Frankfurt (Alemania). Mantener revisadas las condiciones contratadas de Supabase, Render, Brevo, Cloudflare, Google/Gmail y alojamiento, roles de cada proveedor y garantías de transferencias cuando procedan. No confundir país de la empresa con ubicación efectiva de todos los datos.
4. Conservación por criterios de finalidad y cuenta activa, sin prometer baja automática por inactividad. Aplicar los criterios al atender cuentas, operaciones, historial, logs, copias y correo. No inventar una eliminación automática o un plazo que no se haya aplicado. El exportador local no es una exportación completa de toda la cuenta.
5. Revisar las referencias de los retratos y la atribución/contexto de las frases. `art-provenance.json` registra la declaración del creador para los 120 oradores; no reconstruye URLs desconocidas ni garantiza permisos, derechos de imagen o ausencia de similitudes con obras ajenas. Consultar términos del generador y condiciones de las referencias aportadas o consultadas. Las capturas también forman parte de esa revisión.
6. Revisar los textos finales y su aplicación real, especialmente menores, derechos de imagen y la posible aplicación de LSSI. El objetivo es informar y documentar, no prometer inmunidad frente a reclamaciones.

## Operaciones de privacidad

Usar `privacidad@hemicycle.online` como canal atendido. Registrar recepción y respuesta, verificar la relación con la cuenta de forma proporcionada y no pedir contraseñas ni documentos completos de forma rutinaria. Para una supresión, inventariar los registros y dependencias del usuario antes de ejecutar cambios administrativos; comprobar inventario, operaciones pendientes, historial, copias y proveedores. No prometer que borrar localStorage o solo un perfil elimina todo lo alojado en servidores. Las instrucciones concretas de borrado/exportación deben cerrarse antes de ofrecerlas como automatizadas.

Los datos de juego no deben utilizarse para atribuir ideología política a los jugadores. El modo invitado evita vincular una cuenta, pero servir la aplicación por Internet sigue implicando peticiones y datos técnicos de conexión: no prometer ausencia absoluta de tratamiento.

## Activación cuando esté completo

El archivo para SQL Editor es `_dev/legal/20261029_legal_release.sql`: reúne la infraestructura y el registro exacto de la versión y huella final. El generador `_dev/legal/publish-catalog.cjs` produce la parte del catálogo sin conectarse al servidor. Aplicar el archivo completo antes de activar la entrada en main. Cambiar el texto requiere regenerar y actualizar también el SQL: no registrar una huella que no corresponda al contenido. Si una versión ya publicada cambia sustancialmente, asignar nueva versión documental.

El servidor autentica con `auth.uid()`, no con un ID enviado por el cliente; valida el catálogo activo; las tablas tienen RLS y el recibo inicial no se sobrescribe al reintentar. Este registro prueba recepción autenticada de una declaración, no la identidad física de quien pulsó ni la exactitud de una fecha offline.

## Referencias normativas para revisión

- RGPD, información y contacto del responsable: https://eur-lex.europa.eu/eli/reg/2016/679/oj?locale=es
- LOPDGDD, especialmente consentimiento de menores: https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673
- LSSI, ámbito e identificación del prestador: https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758
- AEPD: https://www.aepd.es/

Son referencias para revisar los borradores, no una afirmación de haber obtenido un dictamen jurídico.
