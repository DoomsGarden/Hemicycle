# Dominio propio — comprobaciones previas

La exportación DNS de Dooms ya apunta el dominio raíz y www a GitHub Pages con nube gris. Copia avanzada confirmada. Se prepara CNAME; la activación está pendiente de comprobar Site URL/Redirect URLs de Supabase y ALLOWED_ORIGINS de Render.

Comprobados con origen simulado y sin acceder a servicios reales: recursos en ruta raíz, acceso Google con PKCE, sesión, Perfil en siete tamaños, cierre de sesión/invitado, alta y recuperación con enlaces actuales y antiguos, recarga y preservación del progreso. La prueba PWA sirve desde `/` y valida los 137 recursos, legales/licencias sin contaminar la caché del juego y arranque offline.

No se ha comprobado el DNS vivo, HTTPS público ni los ajustes de los paneles. Evidencias en accounts, pwa y validation.txt. Plan y pasos de preservación del guardado en `_dev/domain/README.md`.
