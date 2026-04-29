# Backup y Seguridad (Sprint 8)

## Hardening aplicado

- `helmet` activo para headers de seguridad.
- CORS por ambiente con `CORS_ORIGINS` (lista separada por comas).
- Rate limit global en API con `express-rate-limit`:
  - `RATE_LIMIT_WINDOW_MS` (default 15 min)
  - `RATE_LIMIT_MAX` (default 300 req por IP)
- Logging con `morgan` en formato `combined`, priorizando respuestas 4xx/5xx.

## Variables relevantes (`backend/.env`)

```env
NODE_ENV=development
CORS_ORIGINS=http://localhost:8082,http://localhost:19006
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
```

## Backups de MongoDB

### 1) Generar backup

```powershell
cd backend
npm run backup:mongo
```

- Requiere `mongodump` disponible en PATH.
- Crea carpeta en `backend/backups/dump-<timestamp>/`.

### 2) Restaurar backup

```powershell
cd backend
npm run restore:mongo -- "backups/dump-AAAA-MM-DDTHH-mm-ss-sssZ"
```

- Requiere `mongorestore` en PATH.
- Usa `--drop` para reemplazar colecciones existentes.

## Prueba mínima recomendada

1. Crear backup con `backup:mongo`.
2. Insertar o modificar un registro de prueba.
3. Restaurar con `restore:mongo`.
4. Verificar que los datos vuelven al estado del backup.

## Nota de producción

- Mantener `.env` fuera de Git.
- Rotar `JWT_SECRET` periódicamente y ante incidentes.
- Restringir `CORS_ORIGINS` solo a dominios oficiales.
- Programar backup automatizado (Task Scheduler/cron o MongoDB Atlas backups).
