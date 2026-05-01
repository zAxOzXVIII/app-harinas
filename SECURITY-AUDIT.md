# Informe final de seguridad y cierre

Fecha de revision: 2026-05-01

## Alcance revisado

- Backend Express + MongoDB.
- Frontend Expo SDK 54 + TypeScript.
- Dependencias npm de `backend` y `frontend`.
- Documentacion de instalacion, seguridad y despliegue.

## Resultado ejecutivo

El proyecto queda en estado coherente para cierre de POC/produccion inicial:

- Backend sin vulnerabilidades reportadas por `npm audit --audit-level=moderate`.
- Frontend compila correctamente con TypeScript.
- Frontend conserva avisos moderados transitivos asociados a Expo; no se recomienda `npm audit fix --force` porque puede mezclar o bajar versiones del SDK.
- Se agrego rate limit especifico para login.
- Se reforzo el middleware HTTP del backend con limite de body JSON y ocultamiento de `X-Powered-By`.
- README y plan de despliegue quedan actualizados con validaciones, seguridad y publicacion para Google Play / EE.UU.

## Comandos ejecutados

Backend:

```powershell
cd backend
npm audit --audit-level=moderate
```

Resultado: `found 0 vulnerabilities`.

Frontend:

```powershell
cd frontend
npm audit fix
npm run typecheck
npm audit --audit-level=moderate
```

Resultado:

- `npm audit fix` sin `--force` elimino el hallazgo alto de `@xmldom/xmldom`.
- `npm run typecheck` finaliza sin errores.
- Quedan avisos moderados en dependencias transitivas de Expo (`postcss` / `uuid`).

## Cambios de seguridad aplicados

- `backend/src/middlewares/rateLimit.middleware.js`: se agrego `authRateLimiter`.
- `backend/src/routes/auth.routes.js`: `/api/auth/login` usa rate limit especifico.
- `backend/src/app.js`: `X-Powered-By` deshabilitado y `express.json({ limit: "1mb" })`.
- `backend/src/config/env.js`: nuevas variables `AUTH_RATE_LIMIT_WINDOW_MS` y `AUTH_RATE_LIMIT_MAX`.
- `backend/.env.example`: variables nuevas documentadas.

## Riesgos pendientes aceptados

Los avisos moderados del frontend dependen de la cadena interna de Expo SDK 54. Forzar el arreglo con:

```powershell
npm audit fix --force
```

no esta recomendado para este cierre porque npm propone cambios de SDK que pueden romper compatibilidad. La ruta correcta es una migracion controlada a un SDK Expo superior cuando se decida hacer esa tarea.

## Checklist antes de publicar

- Definir `JWT_SECRET` largo, unico y privado en produccion.
- Definir `MONGODB_URI` de Atlas o servidor MongoDB productivo.
- Restringir `CORS_ORIGINS` a dominios reales.
- Mantener `RATE_LIMIT_*` y `AUTH_RATE_LIMIT_*` activos.
- Configurar `EXPO_PUBLIC_API_URL` con HTTPS del backend publico.
- Ejecutar `npm run seed:admin` y `npm run seed:grupos` una sola vez por entorno.
- Ejecutar prueba manual de login, CRUD, telemetria y alertas.
- Ejecutar `npm run verify:backup-restore` en un entorno seguro.
- Para Google Play, generar AAB y habilitar United States en Play Console.
