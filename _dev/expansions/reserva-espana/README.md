# Reserva conjunta de España

Integra los [20 de la primera tanda](../espana-20/README.md) y los [60 de la segunda](../espana-60-02/README.md) mediante una factoría común. Hay 80 reservados; el catálogo interno permite revisar 200 oradores y 600 frases, mientras el publicado conserva 120 y 360.

`create-reserve.cjs` prepara copias de los módulos compartidos y una tabla de arte con claves distintas por tanda, sin sobrescribir archivos públicos. `prepare.cjs` reúne los registros y `preview-server.cjs` permite comprobar el render real en un origen local separado. Las reglas de producción, los motores offline históricos y el changelog no se modifican.

La reserva tiene activación deshabilitada. La publicación futura necesita su versión de reglas y las comprobaciones de compatibilidad online/offline antes de activarse; no se habilita por parámetro de URL ni localStorage.
