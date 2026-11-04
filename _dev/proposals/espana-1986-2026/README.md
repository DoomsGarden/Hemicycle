# España · 20 propuestas de cromos · 1986–2026

Propuesta visual del 4 de noviembre de 2026. El catálogo activo conserva sus 120 oradores. Ninguna de estas personas está ya en él; se han contrastado nombres, IDs y variantes del nombre. Cada persona conserva un único ID aunque se generen otras poses.

[Ver el dossier de seis páginas](propuestas-espana-20.pdf) · [Abrir galería con filtros y fichas](galeria.html) · [Vista conjunta de los veinte](resumen-20-cromos.png)

## Reparto y estadísticas

La tanda añade 8 comunes, 6 raros, 4 especiales y 2 legendarios: 40 / 30 / 20 / 10 %. El catálogo completo pasaría de 120 a 140, con 56 comunes, 42 raros, 28 especiales y 14 legendarios. España pasaría de 97 a 117 personas. La propuesta mantiene también el patrón de costes: comunes 3 de coste 1 y 5 de coste 2; raros 2 de coste 2 y 4 de coste 3; especiales 2 de coste 3 y 2 de coste 4; legendarios uno de coste 4 y uno de coste 5.

Los números se toman de `statsFor()` del catálogo actual. Son estadísticas base, sin bonificaciones de líder. Los escaños son 2 / 3 / 4 / 5 por rareza. La clasificación editorial considera trayectoria y peso institucional; las habilidades son opciones de juego existentes, pendientes de probar con estas combinaciones.

| Orador | Rareza | TdP | Z | A | Escaños | Fondo / grupo de referencia | Etapa |
|---|---|---:|---:|---:|---:|---|---|
| Adolfo Suárez | Legendario | 5 | 7 | 14 | 5 | CDS | 1989–1991 |
| Manuel Fraga | Legendario | 4 | 7 | 11 | 5 | AP · Coalición Popular | 1986–1987 |
| Alfredo Pérez Rubalcaba | Especial | 4 | 6 | 8 | 4 | PSOE | 2008–2011 |
| Francina Armengol | Especial | 4 | 6 | 8 | 4 | Congreso · Presidencia | 2023 |
| Josep Borrell | Especial | 3 | 5 | 8 | 4 | PSC · Grupo Socialista | 2000–2004 |
| Margarita Robles | Especial | 3 | 5 | 8 | 4 | Grupo Socialista | 2023 |
| José Bono | Raro | 3 | 4 | 7 | 3 | Congreso · Presidencia | 2008–2011 |
| Aitor Esteban | Raro | 2 | 4 | 6 | 3 | EAJ-PNV | 2019–2023 |
| Juanma Moreno | Raro | 3 | 4 | 7 | 3 | PP | 2011–2012 |
| Pedro Solbes | Raro | 3 | 4 | 7 | 3 | Grupo Socialista | 2008–2009 |
| Rosa Díez | Raro | 2 | 4 | 6 | 3 | UPyD | 2011–2015 |
| José Blanco | Raro | 3 | 4 | 7 | 3 | PSOE | 2008–2011 |
| Cristina Narbona | Común | 2 | 2 | 5 | 2 | PSOE | 2011–2012 |
| Ana Oramas | Común | 1 | 2 | 4 | 2 | Coalición Canaria | 2019–2023 |
| Rosa Aguilar | Común | 2 | 2 | 5 | 2 | Grupo Socialista | 2011–2015 |
| Elena Salgado | Común | 1 | 2 | 4 | 2 | Grupo Socialista | 2008–2011 |
| Félix Bolaños | Común | 2 | 2 | 5 | 2 | PSOE | 2023 |
| Oskar Matute | Común | 2 | 2 | 5 | 2 | EH Bildu | 2023 |
| José Antonio Labordeta | Común | 1 | 2 | 4 | 2 | CHA | 2004–2008 |
| Magdalena Álvarez | Común | 2 | 2 | 5 | 2 | Grupo Socialista | 2008–2009 |

## Ventana temporal y referencias

Se exige actividad parlamentaria dentro del periodo 1986–2026, y se representa la etapa indicada. Suárez es el diputado del CDS de 1989–1991; Fraga, el diputado de AP/Coalición Popular de 1986–1987. Sus cargos anteriores a esa ventana no se utilizan como época del retrato.

Las veinte fichas oficiales y sus retratos se consultaron individualmente en la web del Congreso. Las referencias y sus hashes están en `propuesta.json`. Se revisaron antes de generar pelo, entradas, gafas, vello facial y rasgos de cada persona. No se incluyen las fotografías originales en las descargas de arte.

## Dirección de arte

La plantilla aportada para Cristina Fernández de Kirchner y la ilustración de Trump guían el retrato de pecho hacia arriba, la luz de estudio, el detalle semirrealista y el espacio para la interfaz. Hay 20 retratos originales, diez con micrófono y diez sin él, con vistas frontales y de tres cuartos y gestos diferentes. Los borradores se generan en cinco láminas de cuatro retratos; la galería compone veinte cromos individuales con nombres y estadísticas en texto, sin hornear números inventados en la ilustración.

Tras la corrección del usuario, los fondos corresponden al grupo/formación de la época o al Congreso: CDS, AP/Coalición Popular, PP, PSOE/PSC/PSIB, PNV, UPyD, Coalición Canaria, EH Bildu, CHA y presidencia del Congreso. El fondo común de bandera española se sustituye. La banderita pequeña de la interfaz identifica el país.

En perfiles independientes se muestra el grupo parlamentario en lugar de atribuir una militancia personal. Rosa Aguilar se representa en su etapa del Grupo Socialista; Fraga no utiliza una marca posterior del PP. Los fondos son interpretaciones artísticas, con motivos de grupo y contexto institucional.

`prompts-por-persona.json` permite regenerar cinco poses por identidad, manteniendo su etapa, rasgos y fondo. Esas variantes no cuentan como nuevas personas ni como nuevas rarezas. `prompts-fondos.json` conserva las instrucciones de la revisión de fondos. No se han inventado citas reales para completar frases de juego.

## Archivos y comprobación

- `cromos/`: veinte PNG individuales de 543 × 724, relación 3:4.
- `galeria.html`: galería autónoma con búsqueda, filtros de rareza, fichas y referencias.
- `propuestas-espana-20.pdf`: cinco láminas de cuatro cromos y una página de listado.
- `lista-propuestas.csv`: tabla UTF-8 para hoja de cálculo.
- `propuesta.json`: identidades, estadísticas, rasgos, periodo, fondo y referencias.
- `verificacion.json`: conteos, ausencia de duplicados, estadísticas y comprobaciones de navegador.

Se comprueban 20 IDs y personas distintos, 20 referencias oficiales, reparto de rarezas y costes, estadísticas iguales a los tiers actuales y ausencia de cambios en los archivos del juego. La galería se revisa a 320, 393, 844 y 1440 píxeles, con filtros, búsqueda y vínculos de ficha. No hay errores JavaScript ni colisiones entre nombres y estadísticas.

Estos archivos son propuestas de arte y diseño; su incorporación al juego queda pendiente de revisión y pruebas de equilibrio.
