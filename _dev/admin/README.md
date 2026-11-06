> La ampliación v32 actualiza las listas admitidas de oradores y acciones mediante [`deploy.sql`](../releases/v32/deploy.sql). Debe aplicarse después de la activación inicial descrita aquí; no se vuelve a importar una cuenta ya vinculada.

# Importación inicial automática

La política `automatic-local-v1` está autorizada por el propietario: se acepta una primera copia local válida, aunque los respaldos antiguos no tienen firma del servidor. El progreso posterior sigue sujeto a la economía autoritativa.

Activación global, una sola vez en Supabase → SQL Editor: ejecutar completo [`20261031_automatic_legacy_import.sql`](../online/20261031_automatic_legacy_import.sql). El mismo archivo procesa las solicitudes pendientes. Es repetible y devuelve cantidades en `migration_summary`; nunca publica nicks, payloads ni correos.

El servicio valida cada respaldo con `HemicycleBackup.validate` antes de llamar al RPC. El SQL vuelve a comprobar formato, identidad, catálogo, tipos, intervalos numéricos y XP. Las solicitudes antiguas ya pasaron el validador del servicio al enviarse. La política acepta su origen local sin afirmar que acredita partidas o recursos anteriores.

Solo se importa si la cuenta aún no tiene una nube. Se usa un bloqueo transaccional para serializar importaciones; guardado, aprobación y auditoría se confirman juntos. Los reintentos no incrementan revisiones ni duplican recursos. La unicidad de `source_id` evita vincular el mismo progreso a dos cuentas. Una nube existente se recupera; no se sobrescribe ni mezcla. Las decisiones y respaldos son privados, sin acceso para `anon`/`authenticated`.

El resumen distingue aprobadas y omitidas: `existing_cloud`, `source_conflict`, `invalid`, `rejected` (rechazo administrativo previo) o `changed` (cambio concurrente de solicitud). Esas excepciones se conservan sin sustituir datos. Las aprobaciones anteriores no se repiten.

Las solicitudes nuevas se validan e importan durante la activación del jugador. Quienes ya estaban pendientes pueden entrar en Perfil → Cuenta y guardado → Nube, pulsar Comprobar y recuperar la copia disponible. Los clientes anteriores siguen pudiendo hacer esa recuperación. Si todavía aparece «Migración pendiente de activación», comprobar que el SQL global se ha ejecutado.

Este entorno de desarrollo no tiene credenciales administrativas de producción: las pruebas y capturas usan una base aislada. Publicar el código no ejecuta el SQL ni demuestra que las solicitudes reales ya estén aprobadas.

---

## Revisión manual excepcional (procedimiento anterior)

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
