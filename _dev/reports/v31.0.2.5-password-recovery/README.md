# v31.0.2.5 — Recuperación de contraseña

Corrección del 29 de octubre de 2026. Sin SQL ni cambios SMTP.

## Problemas revisados

El formulario dependía exclusivamente de PASSWORD_RECOVERY y de las restricciones normales para abrir Perfil. Una respuesta tardía podía quedar detrás de la entrada o ser rechazada durante otro recorrido. El cliente configurado con PKCE rechazaba los enlaces antiguos con sesión implícita en el fragmento. Una recarga después de consumir el enlace tampoco conservaba el paso de nueva contraseña.

Se captura la intención antes de que el SDK consuma la URL y se da prioridad al formulario de recuperación. Los enlaces implícitos se validan con `auth.setSession`, manteniendo PKCE para Google. El paso pendiente se recuerda únicamente en sessionStorage con el identificador de cuenta, sin copiar contraseñas o tokens, y se limpia al terminar o cancelar. Los campos se conservan en memoria durante los repintados del perfil.

Un marcador `account=recovery` y una sesión guardada no acreditan la validez del enlace. El SDK también puede emitir SIGNED_IN al restaurar una sesión existente: solo se acepta como retorno de recuperación cuando el código de la URL ya ha sido consumido. Si falta el verificador PKCE, el enlace caducó o no permite validación, se ofrece pedir otro y abrirlo en el mismo navegador. No se intenta eludir esa comprobación.

## Validación

- SDK oficial incluido en el juego, con transporte de autenticación simulado: no se envían correos ni se modifican cuentas reales.
- Alta con confirmación y recuperación PKCE; retorno actual con marcador y enlace anterior sin él; cambio autenticado de contraseña y progreso conservado.
- Enlace implícito sin verificador previo, validación antes y después de desaparecer la entrada, incluso si el acceso ordinario a Perfil está bloqueado.
- Recarga de la pestaña antes de guardar; conservación de lo escrito durante consultas del perfil; fallo del cambio y reintento.
- Formulario con texto al 116 % en 320×568, 393×851 y 844×390, sin desbordamiento horizontal.
- Enlace caducado, marcador aislado y código sin verificador con otra sesión ya guardada: nunca muestran un cambio de contraseña para esa sesión. Permiten solicitar otro enlace o salir sin bloqueo.
- Google con PKCE, sesión persistida, edición y bloqueo anual del nick, siete tamaños de Perfil, cierre de sesión, invitado, foco y progreso conservado.
- Actualización desde `11fa0de`, 128 recursos precargados, sustitución de caché, arranque offline y conservación de perfil, Liga y audio.
- 13 pruebas unitarias de redirección, changelog, navegación y escena; sintaxis, escala de texto, precarga y diferencias comprobadas.

Evidencias: `verification.json`, capturas del formulario y las subcarpetas `profile` y `pwa`. Los correos de alta y recuperación llegaron correctamente en la prueba real comunicada por Dooms; el enlace final deberá repetirse en su dispositivo tras recibir esta actualización. No se afirma haber probado el envío real desde este entorno.

## Repetición

Servidor estático en 8055 con raíz `/workspace`; Playwright disponible mediante NODE_PATH:

```sh
node _dev/checks/v31.0.2.5-password-recovery.cjs
node _dev/checks/v31.0.2.5-auth-profile.cjs
node _dev/checks/v31.0.2.5-auth-pwa.cjs
node --test tests/account-redirect.test.cjs tests/changelog.test.cjs tests/menu-senate.test.cjs tests/menu-navigation.test.cjs
```

La versión visible sigue siendo v31.0.2.5 y las notas anteriores se conservan. Caché `hemiciclo-v31.0.2.5-auth1`. No se espera ni consulta el despliegue de Pages.
