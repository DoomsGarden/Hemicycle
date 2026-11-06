# Correcciones de v32 preparadas para revisión

Estado: correcciones revisadas y publicación autorizada por el usuario. Se agrupan en un commit que conserva los cambios de los intentos #215 y #216; el resultado del despliegue debe verificarse por separado. La versión del juego sigue siendo v32.0.0; `fixes1` identifica los recursos y la caché corregidos.

## Sobres y recompensas

Las compras y las reclamaciones ya abonaban todos los cromos al confirmar la operación. El fallo observado en el código perdía la continuación visual de los sobres restantes al navegar. El nuevo registro conserva el contenido inmutable, el origen, el país y qué sobres se han mostrado; permite continuar desde la tienda o el buzón y revisar aperturas anteriores sin nuevas entregas ni cobros. No se ha inspeccionado ni modificado el inventario real del usuario.

El registro se separa por cuenta o identidad invitada. En compras/eventos locales se guarda junto con el inventario y el saldo; un fallo de almacenamiento revierte la operación local. Para cuentas verificadas, el resultado y su operación pendiente se conservan antes de reconciliar el perfil. Si el servidor confirmó la entrega pero falla la revisión local, el mensaje lo distingue y el mismo ID permite recuperar la operación. Navegar durante la animación no marca el sobre como visto. La sincronización de visualizaciones se divide en bloques de 500.

El servidor guarda los recibos nuevos en el estado económico existente y ofrece `/api/market/pack-openings`. También recupera hasta las 1.000 operaciones históricas más recientes con sobres de la cuenta autenticada; estas aparecen como historial porque no existe información fiable sobre cuáles se vieron. Una consulta histórica fallida no impide recuperar los recibos nuevos. No se añade SQL: se utiliza el JSONB y la tabla de operaciones existentes.

Para el comportamiento completo entre dispositivos debe actualizarse el servicio económico junto con la web. Los recibos antiguos eliminados por una política externa de retención no pueden reconstruirse con este cambio. Los contenidos se recuperan de entregas confirmadas, nunca se vuelven a sortear.

## Idiomas y presentación

Se amplía la cobertura es/en/fr de navegación, acciones, reglas, ayudas, perfiles, logros y abreviaturas. Se revisaron manualmente 67 párrafos completos de reglas en inglés y francés y un glosario del juego. El catálogo restante utiliza traducción automática local; quedan posibles ajustes editoriales que las pruebas funcionales no pueden descartar. Las frases originalmente inglesas conservan el inglés y los nombres/nicks no se traducen.

La llamada principal inglesa y francesa usa dos líneas con volumen y acabado dorado. Jardín del consenso y Gatitos diplomáticos incorporan marcos de nivel circulares con centro transparente. Se conservan las correcciones previas del icono de persona, contador de colección y superposición del contador del buzón.

Los textos legales canónicos mantienen versión `2026-11-06.1` y SHA-256 `32f0bdb37a0a02d3da0ca4d53aeb4040beda526216376ae743babf534e0fb072`. La traducción informativa dentro del juego permite volver al original español. Los manifests siguen identificando la misma aplicación.

## Verificación

La regresión previa completó 91 archivos sin fallos. La comprobación final previa a esta publicación completó los 93 archivos actuales de pruebas sin fallos. Después pasaron las pruebas dirigidas de diario de aperturas, servicio de recibos por cuenta, reconciliación, lotes, interfaz de sobres, cola de eventos, activación de cuenta, localización y metadatos. Las comprobaciones de documentos legales, motores offline y `git diff --check` también pasaron.

Chromium comprobó compras de cinco sobres y reclamaciones de tres, navegación, recarga, interrupción de animaciones y fallo de almacenamiento en 393×851, 412×915 y 851×393. La revisión de idiomas recorrió menú, tienda, colección, Liga, ayuda, buzón, ficha, perfil/editor, logros, desafíos y batalla. Se comprobó el cambio entre traducción legal y original, símbolos de cierre, estadísticas y marcos, y desbordamiento a 320/412/851 píxeles con texto al 116 %. Esto emula dimensiones móviles; no equivale a una prueba física en un Poco F7.

## Publicación pendiente

La última consulta mantiene #215 y #216 en cola; #214 es el último éxito comprobado. GitHub rechazó cancelación normal/forzada con 409 y borrado autorizado con 403; ninguna ejecución se eliminó. #210 también figura en cola, pero #211–214 tuvieron éxito después, por lo que su estado no demuestra que bloquee las demás.

El [candidato manual de Pages](pages-workflow-candidate.yml) está fuera de `.github/workflows` y permanece inactivo. [El diagnóstico](pages-recovery.md) explica el posible cambio a un workflow controlado, sus pasos y sus límites. Cambiar la versión del juego no resuelve por sí solo el estado de Pages.
