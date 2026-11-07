# Revisión solicitada el 7 de noviembre de 2026

Trabajo autorizado: revisión artística y de tiers, corrección de sobres y borde flotante, repetición independiente del premio de ampliación (10.000 FS y 3 sobres de cada uno de los cuatro tipos de pago), revisión documental y publicación comprobada mediante Actions.

Ampliaciones solicitadas durante el trabajo: gabinetes de 8 oradores y 4 acciones, escaños 1/2/3/4, suelo protegido de 8 oradores únicos y 4 acciones únicas ante derrotas; revisión de acciones parecidas y arte repetido; animaciones persistentes propias de cada estado.

Restricción posterior: conservar los legendarios originales; revisar puntualmente los otros 108 originales, priorizando ascensos bien justificados. No eliminar ni duplicar identidades. No alterar partidas descargadas antiguas: nuevo motor offline10 para reglas nuevas.

- [ ] Revisión de tiers con criterios comunes y fuentes para los 899.
- [ ] Arte: proporciones compartidas sin deformación, encuadre equivalente al original, cero miradas a cámara y contextos documentados.
- [ ] Nuevas ilustraciones necesarias y registro de prompts/referencias.
- [ ] Regla compartida 8+4, migración de perfiles/gabinetes, IA, UI y servidor.
- [ ] Suelo de colección por categoría y pruebas de derrotas repetidas.
- [ ] Nuevo motor versionado y conservación de hashes de los nueve anteriores.
- [ ] Diferenciar acciones y sus ilustraciones; animaciones persistentes por estado.
- [ ] Evento independiente con recibos preservados y sin duplicación por cuenta.
- [ ] SQL necesario, si los validadores de Supabase precisan adaptación.
- [ ] Traducciones es/en/fr, README, manifest, legal, changelog y caché.
- [ ] Pruebas funcionales, móvil/116%, revisión visual y publicación Actions exitosa.

Diagnóstico inicial: las portadas de atlas usan background-size 200% 200% sobre una ventana con distinta proporción, deformando el retrato. Se está sustituyendo por SVG con recorte proporcional compartido. Muchos atlas también parten de planos demasiado cerrados. Primer atlas rehecho (Uxue Barkos, Ander Gil, Manuel Cruz, Guillermo Fernández Vara), /workspace/generated_images/exec-b20f84e6-fae4-412d-aa42-e4b3af4ed28e.png, conserva identidades y añade contexto político/institucional, menor tamaño y mirada desviada natural. Pendiente de integración general y revisión del resto.

Racha añadida: 5 victorias con premio, porcentaje entero uniforme +25…50% de FS/XP de partidas durante una hora, reposo de 30 minutos desde caducidad. No acumula activaciones durante efecto/reposo. Quinta victoria sin bonus; siguientes partidas sí. Regalos, Mercado, hitos y premios separados de temporada excluidos. Partidas descargadas se cuentan al validar en servidor, con reloj y recibo únicos. Pruebas puras, transacción PGlite (incluye reintento/conflicto/protección cliente) y navegador es/en/fr quinto/sexto resultado pasan. Popup semirrealista nuevo sin cofre, accesible con movimiento reducido. Pendiente regresión conjunta.

Acciones: 6 atlas nuevos, 92 paneles exclusivos (sin duplicados de posición/archivo), metáforas visuales por mecánica, asignados en js/action-art.js. Se conserva la identidad y cantidad de todas las acciones. Auditoría de miradas completa sobre 14 hojas de atlas y 6 de originales: 74 casos directos o ambiguos seleccionados de forma conservadora para rehacer; 19 atlas específicos en gaze-art-jobs.json. El resto conserva mirada natural desviada y se reencuadra proporcionalmente. No se debe afirmar finalizado antes de revisar e integrar los 19.

Corrección artística posterior del usuario: eliminar textos largos explicativos, evitar llamar partido «grupo», usar emblemas fieles con las siglas/texto que pertenecen al diseño real. Retirados rótulos SVG añadidos del cromo. Se han obtenido referencias oficiales de PP, Senado, Congreso, Sénat y Assemblée (brands/references.json); PSOE se contrasta en Wikimedia porque la web oficial devuelve un control automatizado. Hay que rehacer los banners de los atlas ya generados que inventan textos/logos y adaptar los prompts pendientes ANTES de seguir generando. Los archivos de referencia no se publican como assets del juego.

Estado posterior: 21 atlas dirigidos a 74 miradas y cinco atlas iniciales revisados con emblemas de referencia; ya integrados en orator-art.js (783 entradas, incluidas cuatro sustituciones de originales). SVG proporcional compartido, sin rótulos SVG inventados. OCR de apoyo de 222 atlas antiguos no detectó rótulos partidarios legibles; no certifica ausencia de texto, se combina con la revisión visual. Las 92 acciones pasan equivalencia local/servidor y tienen paneles gráficos exclusivos. Dos eventos: prueba de diez entregas independientes y 24 sobres, sin perder recibos. Regresión global todavía en curso: NO publicar hasta cerrar fallos y SQL.

Verificación final: 93 retratos ilustrados de nuevo/corregidos y 92 acciones con paneles exclusivos. Género de prueba de doctrinas aislado de la revisión editorial mediante estadísticas/costes iguales; 3.456 partidas emparejadas dan agregados 47,9–51,6 %, con cada dirección de contradoctrina >50 %. Se conserva la fórmula de doctrinas. Tutorial prestado conserva líder de coste1 y resto como máximo2, independiente del ascenso de los oradores reales.

Cierre de arte:0–6 reconstruidos/corregidos con fotografías individuales;0–5 llevan Senado y no emblemas inferidos de grupos. Fondos de Pierre Laurent/Jean-Vincent Placé→Sénat; David Cormand/Thierry Breton→referencia europea; Philippe Baptiste→contexto ministerial/académico sin emblema de cámara incorrecto. Inspección visual de las últimas once láminas realizada, hashes y paneles93validados, geometría+orator-art+archivo fuentes regenerados. Chromium vuelve a pasar; pruebas posteriores de arte/fuentes/metadatos103PASS. Regresión previa2160PASS y revisión de compatibilidad994PASS (solapadas, no sumarlas). Pendiente aplicarSQLenproducción antes de publicar.
