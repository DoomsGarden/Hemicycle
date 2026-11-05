# Reserva conjunta de España

Integra los [20 de la primera tanda](../espana-20/README.md), los [60 de la segunda](../espana-60-02/README.md), los [60 de la tercera](../espana-60-03/README.md) y los [60 de la cuarta](../espana-60-04/README.md) mediante una factoría común y el registro `batches.cjs`. Hay **200 cromos reservados con sus 200 retratos completos**; el catálogo interno permite revisar 320 oradores y 960 frases, mientras el publicado conserva 120 y 360. Los 16 retratos pendientes de la tercera tanda ya están recibidos y revisados.

`create-reserve.cjs` prepara copias de los módulos compartidos y una tabla de arte con claves distintas por tanda, sin sobrescribir archivos públicos. `prepare.cjs` reúne los registros y `preview-server.cjs` permite comprobar el render real en un origen local separado. Las reglas de producción, los motores offline históricos y el changelog no se modifican.

La reserva tiene activación deshabilitada. La vista interna representa el arte pendiente con un marcador explícito, sin solicitar archivos inexistentes ni reutilizar el retrato de otra persona. El manifiesto materializado cuenta esos pendientes y exige completarlos antes de activar. La publicación futura necesita su versión de reglas y las comprobaciones de compatibilidad online/offline antes de activarse; no se habilita por parámetro de URL ni localStorage.
