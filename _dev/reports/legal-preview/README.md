# Ventana legal y correo — revisión técnica antes de activar

Datos y decisiones confirmadas por Dooms: particular en España, dominio propio, sin compras reales/anuncios/analítica externa; desde 12 años con invitados para 12–13 y cuentas desde 14. Los retratos son ilustraciones generadas por prompts, con referencias visuales en algunos casos. Responsable: Sergey Veselkov. Regiones de Supabase (Irlanda) y Render (Frankfurt) confirmadas por Dooms. Conservación por criterios de finalidad y cuenta activa, sin prometer baja automática.

El paquete de esta rama prepara la versión documental 2026-10-29.1. Las pruebas de aceptación usan los documentos finales; la prueba de borradores emplea una copia desactivada solo en el navegador. No se ha activado en main ni aplicado SQL a Supabase. El nombre del responsable fue facilitado para su publicación.

## Verificación

- Borrador visible desde Opciones, sin aceptar ni bloquear la entrada; documentos y Opciones en tres tamaños y texto al 116 %.
- Con fixture: no hay aceptación premarcada; menos de 12 no permite continuar; 12–13 va a invitado sin inicializar Auth; 14+ permite cuenta. Volver devuelve la entrada, recargar conserva la elección y cambiar de documento solicita nueva aceptación.
- Reintento e idempotencia de sincronización simulada, sin bloquear por fallo de red. Consultas y licencias sin cuenta; dos plantillas con variables intactas, sin envío real.
- SQL real en PGlite: migración repetible, datos ajenos conservados, catálogo vacío por defecto, acceso anónimo denegado al recibo, versiones y declaración de edad validadas, actor autenticado, primer recibo estable, separación entre usuarios y sin escrituras directas de clientes.
- Google con PKCE, Perfil y siete tamaños, cierre de sesión e invitado; alta/recuperación con SDK real y transporte simulado, recarga, retorno antiguo, cambio de contraseña y progreso conservado.
- Actualización desde 095dc2a: 137 recursos, documento legal y licencias online/offline sin sustituir el HTML del juego en caché, arranque offline y progreso/Liga/audio conservados.
- 16 pruebas unitarias/SQL correctas, incluido el archivo SQL final repetido y su huella exacta; sintaxis y generador legal comprobados. Las vistas de email se probaron en Chromium, no en todos los programas de correo.

Evidencias: `verification.json`, capturas de borrador y fixture, emails, `accounts`, `pwa` y `validation.txt`. Los límites y pasos pendientes están en `_dev/legal/README.md`; la instalación de plantillas, en `_dev/email/README.md`.

## Repetir

Con servidor estático en 8055 sobre `/workspace` y NODE_PATH apuntando a las herramientas de Playwright/PGlite:

```sh
node _dev/legal/build.cjs --check
node _dev/checks/legal-preview.cjs
node _dev/checks/legal-pwa.cjs
node _dev/checks/legal-account-regression.cjs recovery
node _dev/checks/legal-account-regression.cjs profile
node --test tests/legal-receipts.test.cjs tests/account-redirect.test.cjs tests/changelog.test.cjs tests/menu-senate.test.cjs tests/menu-navigation.test.cjs
```
