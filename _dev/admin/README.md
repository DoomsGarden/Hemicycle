# Revisión manual de importaciones

Solo para el propietario del proyecto. No hay ruta pública ni aprobación automática; no resuelve ni aprueba por sí sola la incidencia particular de Gmail.

1. Ejecutar `list-imports.sql` en SQL Editor (solo lectura). Localizar al jugador por su UUID/nick y contrastar su progreso con él. Cada fila `review` contiene datos privados: guardarla localmente como JSON, nunca subirla al repositorio ni al chat.
2. Revisar colección, FS, Elo, victorias y derrotas. La validación de formato no demuestra que un progreso local sea legítimo. La decisión sigue siendo administrativa. No aprobar importaciones si existe otra nube que debe recuperarse.
3. Preparar SQL concreto, sin ejecutarlo todavía:

```sh
node _dev/admin/review-import.cjs /ruta/revision.json approve "Progreso contrastado con el jugador" > /tmp/revision.sql
```

Se imprime el resumen en stderr y el SQL en el archivo. Para dejar constancia de un rechazo usar `reject` y un motivo; no borra la solicitud ni su respaldo. Una nueva revisión requiere una nueva solicitud con contenido distinto o intervención administrativa separada sobre el registro de decisión.

4. Leer el SQL y el resumen. Si la decisión es correcta, ejecutarlo completo en SQL Editor. Bloquea la solicitud, exige el mismo hash revisado, conserva cualquier nube diferente y registra decisión, motivo, fecha y rol administrador en una tabla privada. Una aprobación repetida no duplica progreso. Si aparece un error, la transacción no modifica el guardado.
5. Tras una aprobación, pedir al jugador recuperar su guardado desde Nube. El cliente existente ya contempla esa recuperación. No borrar su copia local.

No hace falta ejecutar estos archivos para utilizar la actualización del juego. La tabla privada de decisiones se crea al ejecutar una revisión real; el prototipo y las pruebas utilizan bases aisladas. Para rechazos no hay todavía una notificación automática al cliente: comunicar el motivo al jugador por el canal habitual, sin enviar nada desde esta herramienta.
