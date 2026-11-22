# Contexto y fuentes de los oradores

Abre un cromo desde **Cromos** y despliega **Contexto y trayectoria**. El panel incluye el contexto documental y el enlace **Ver las referencias de sus frases**. El archivo abre ese orador con tres entradas, una para ataque normal, ataque fuerte y defensa o curación.

- Las fichas con extractos conservan su atribución, licencia y fecha de consulta.
- Los 868 oradores incorporados con Gran Bretaña y Alemania muestran el cargo comprobado durante la revisión editorial y enlazan su fuente. La fecha, cuando está disponible, corresponde a la referencia del cargo. El texto del cargo conserva el idioma de la referencia revisada.

El catálogo publicado tiene **1.767 oradores, 5.301 entradas de citas y 2.498 referencias distintas**. El archivo distingue fragmentos, traducciones y adaptaciones. Consulta el [archivo de los oradores](https://hemicycle.online/fuentes/) y la [información legal](https://hemicycle.online/legal/).

Los contextos se sirven desde `js/orator-context.js`. El archivo de citas se genera a partir de `docs/fuentes-frases-actuales.json`. Se puede verificar la cobertura con `node _dev/legal/build-sources.cjs --check`.
