# Localización de las correcciones de v32

Los textos canónicos españoles, los IDs y las reglas no cambian. La traducción se aplica a la presentación, incluidas las frases al mostrarse; las frases originales inglesas listadas en `english-quotes-v32.json` conservan su idioma en todas las localizaciones.

`extract-v32.cjs` extrae literales de interfaz, catálogo y contexto. `translate-local-v32.py` utiliza modelos locales Argos/CTranslate2 es→en y en→fr; no envía textos ni datos de jugadores a un servicio de traducción. Los modelos y el entorno Python se encuentran fuera del repositorio y no forman parte de la web. `refine-game-terms-v32.py` corrige terminología de cartas, turnos y rarezas; `review-help-v32.py` construye el catálogo de 67 párrafos de ayuda revisados en ambos idiomas.

Orden de prioridad: catálogo generado `js/localization-data.js`, diccionario base, `localization-extra.js`, glosario editorial `localization-reviewed.js` y ayuda revisada `localization-gameplay.js`. La revisión humana cubre el glosario, las reglas indicadas y las pantallas recorridas en las pruebas. El resto del catálogo parte de traducción automática local y puede necesitar ajustes de estilo; no debe describirse como una revisión lingüística humana integral.

Los símbolos sin letras nunca se traducen. Los nombres de oradores y nicks de jugadores se preservan. Las unidades se adaptan: TdP/STP/PP, FS/SF/FS y Z-A/R-S/R-E en español/inglés/francés. Los documentos legales originales, versión y hash permanecen intactos; dentro del juego puede consultarse una traducción informativa y alternar al original español.

Comprobaciones reproducibles:

```bash
node tests/localization.test.cjs
node _dev/checks/locales-and-badges-v32.cjs
```

La segunda requiere Playwright, Chromium y el repositorio servido únicamente en `http://127.0.0.1:8024/`. Los resultados visuales y la auditoría se guardan en `_dev/reports/v32-fixes/`.
