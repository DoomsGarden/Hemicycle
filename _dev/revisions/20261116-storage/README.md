# Corrección del registro local y presentación

El navegador podía cerrar IndexedDB y el cliente retenía para siempre esa conexión. El registro ahora invalida las conexiones cerradas o con cambio de versión y reabre la base existente. Solo reintenta la creación de una transacción que aún no ha empezado; no repite escrituras ejecutadas, compras ni abonos de premios. Las lecturas esperan al cierre correcto de su transacción y una apertura fallida puede reintentarse. No borra bases ni cambia su esquema.

Se incluyen los ajustes preparados de sobres y cartel/abanico de Inicio en horizontal, los marcos y desplazamiento de Logros/Desafíos, el aviso de regalos al completar la entrada y Escape en los selectores de Opciones. El catálogo público, los motores de partidas emitidas y los documentos legales mantienen sus bytes. Gran Bretaña y Alemania siguen en el trabajo privado de expansión. No requiere SQL. Se conserva v32.0.0.2 con una revisión de caché nueva.

Validación: 102 pruebas (incluidas siete con IndexedDB real), 240 disposiciones de objetivos y 12 combinaciones de Inicio/sobres en Chromium. Los informes JSON y el registro están en qa/. Publicar mediante el workflow manual de Pages y verificar después los archivos públicos.
