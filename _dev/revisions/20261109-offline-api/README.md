# Corrección del servicio de partidas — v32.0.0.2

9 de noviembre de 2026. El cliente publicado solicita `offline11`. El registro de
motores y la migración SQL ya lo admitían, pero el controlador autenticado
`POST /offline/tickets` conservaba una lista duplicada que terminaba en
`offline10`. Se elimina esa lista: descarga y validación consultan el registro
compartido de motores. No cambia ningún motor ni se invalida ninguna preparación.

Los errores SQL conocidos por incompatibilidad de reglas, discrepancia de
vinculación, operación reutilizada, formato o cuenta tienen códigos y mensajes
específicos. Se mantiene HTTP 503 deliberadamente: el cliente publicado conserva
la operación pendiente y su identificador. No se borra ni se vuelve a ejecutar una
compra con un identificador nuevo. Los detalles SQL arbitrarios siguen ocultos.

El aviso de nube `GUARDADO-P0001` de la captura no permite determinar cuál de esos
rechazos se produjo. La coincidencia de los resúmenes y el estado «guardado» no
demuestran que se hayan sincronizado todas las operaciones. No se ha accedido a
la cuenta real ni se ha modificado su vinculación. El diagnóstico SQL adjunto es
solo de lectura; sus comprobaciones de formato y vinculación se verifican también
con datos sintéticos. No es una migración ni una reparación automática.

## Validación

70 pruebas pasan en siete archivos: guardado, activación, colas de evento, recibos
de sobres, transporte HTTP, migración offline11 y nuevo recorrido HTTP con SQL real
en PGlite. Este último aplica todas las migraciones hasta offline11, autentica una
cuenta sintética, descarga las once versiones soportadas, inicia y termina una
partida nueva y liquida su resultado por HTTP. Verifica reintentos sin premios
duplicados, rechazo de reglas desconocidas sin alterar recursos y conservación del
progreso frente a recibos distintos o identidades discordantes.

`node _dev/build-offline.cjs --check` y `git diff --check` pasan. La publicación
necesaria es la del servicio Render; no cambia el cliente, su caché, la versión
pública, el manifest ni el tratamiento de datos descrito en los textos legales.
La migración offline11 sigue siendo la del 8 de noviembre, ya confirmada por el
usuario; esta corrección del controlador no requiere otra migración.
