# Reserva conjunta de España

Integra los [20 de la primera tanda](../espana-20/README.md), los [60 de la segunda](../espana-60-02/README.md) y las [60 fichas de la tercera](../espana-60-03/README.md) mediante una factoría común y el registro `batches.cjs`. Hay 140 fichas reservadas; el catálogo interno permite revisar 260 oradores y 780 frases, mientras el publicado conserva 120 y 360. De los 140 reservados, 124 tienen retrato y 16 de la tercera tanda siguen pendientes de arte tras rechazos/interrupciones del generador.

`create-reserve.cjs` prepara copias de los módulos compartidos y una tabla de arte con claves distintas por tanda, sin sobrescribir archivos públicos. `prepare.cjs` reúne los registros y `preview-server.cjs` permite comprobar el render real en un origen local separado. Las reglas de producción, los motores offline históricos y el changelog no se modifican.

La reserva tiene activación deshabilitada. La vista interna representa el arte pendiente con un marcador explícito, sin solicitar archivos inexistentes ni reutilizar el retrato de otra persona. El manifiesto materializado cuenta esos pendientes y exige completarlos antes de activar. La publicación futura necesita su versión de reglas y las comprobaciones de compatibilidad online/offline antes de activarse; no se habilita por parámetro de URL ni localStorage.
