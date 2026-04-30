# Plan de despliegue en servidor - App Harinas

Este documento es la guia practica para montar el proyecto en un entorno real (POC/produccion inicial) y dejar la app movil consumiendo una API publica estable.

---

## 1) Arquitectura recomendada (simple y estable)

- **Base de datos:** MongoDB Atlas (free tier para POC).
- **Backend API:** Render (o Railway) desplegado desde GitHub.
- **Frontend movil:** APK/AAB con EAS Build apuntando a la URL publica del backend.
- **Dominio (opcional):** subdominio propio (`api.tudominio.com`) apuntando al backend.

---

## 2) Pre-requisitos

- Repositorio actualizado en GitHub (rama `main`).
- Cuenta en MongoDB Atlas.
- Cuenta en Render (o Railway).
- Cuenta en Expo/EAS.
- Variables de entorno definidas correctamente.

---

## 3) Fase A - Preparar base de datos (MongoDB Atlas)

1. Crear cluster (M0 free).
2. Crear usuario de BD con password segura.
3. En `Network Access`, permitir IPs necesarias (en POC puedes usar `0.0.0.0/0` temporalmente).
4. Copiar `MONGODB_URI` de Atlas.
5. Ajustar nombre de base final en la URI (ejemplo: `app_harinas`).

Resultado esperado: tener una URI tipo:

```env
MONGODB_URI=mongodb+srv://<usuario>:<clave>@<cluster>/<db>?retryWrites=true&w=majority
```

---

## 4) Fase B - Desplegar backend

## Opcion recomendada: Render

1. Crear servicio **Web Service** conectado al repo.
2. Configurar:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Variables de entorno en Render:

```env
PORT=4000
MONGODB_URI=...atlas...
JWT_SECRET=<secreto_largo_y_unico>
JWT_EXPIRES_IN=8h
NODE_ENV=production
CORS_ORIGINS=https://tu-dominio-app-o-expo,https://expo.dev
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
```

4. Deploy inicial.
5. Verificar salud:
   - `GET https://<tu-backend>/api/health` -> `success: true`.

Resultado esperado: backend publico operativo por HTTPS.

---

## 5) Fase C - Inicializar datos productivos

Con backend ya desplegado:

1. Ejecutar seed de gerente (en entorno donde apunte a Atlas):
   - `npm run seed:admin`
2. Ejecutar seed de grupos:
   - `npm run seed:grupos`
3. Validar login:
   - `POST /api/auth/login` con cuenta gerente.

Nota: estos seeds se ejecutan una vez por entorno.

---

## 6) Fase D - Configurar app movil para servidor

En frontend define:

```env
EXPO_PUBLIC_API_URL=https://<tu-backend-publico>
```

### Para build EAS (recomendado)

1. Crear variable en EAS:
   - `EXPO_PUBLIC_API_URL=https://<tu-backend-publico>`
2. Compilar:
   - `eas build -p android --profile preview` (APK)
3. Instalar y probar login desde telefono.

---

## 7) Fase E - Seguridad minima obligatoria

- Usar `JWT_SECRET` largo y distinto por entorno.
- No subir `.env` al repo.
- Restringir `CORS_ORIGINS` a orígenes reales (no dejar abierto permanentemente).
- Mantener `RATE_LIMIT_*` activo.
- Habilitar HTTPS siempre (Render/Atlas ya lo usan).
- Rotar credenciales de BD si se exponen accidentalmente.

---

## 8) Fase F - Backups y restore

En `backend` ya existen:

- `npm run backup:mongo`
- `npm run restore:mongo -- <ruta_dump>`
- `npm run verify:backup-restore`

Recomendacion:

1. Programar backup periodico (cron/Task Scheduler o backup administrado Atlas).
2. Probar restore al menos 1 vez por mes en base temporal.
3. Documentar fecha de ultimo backup y ultima prueba de restore.

---

## 9) Checklist final (Go-live)

- [ ] Backend responde `/api/health` por HTTPS.
- [ ] Login gerente funciona contra servidor.
- [ ] CRUD harinas funciona desde APK.
- [ ] Modulo grupos/calibracion funciona.
- [ ] Telemetria y alertas se guardan/consultan.
- [ ] CORS restringido a orígenes validos.
- [ ] Backup y restore verificados.
- [ ] Variables sensibles fuera de Git.

---

## 10) Plan de ejecucion sugerido (1-2 dias)

**Dia 1**
- Atlas + deploy backend + variables.
- Seed inicial + prueba de endpoints.

**Dia 2**
- Build APK con URL productiva.
- Pruebas funcionales end-to-end.
- Validacion de backup/restore.

---

## 11) Comandos clave (resumen rapido)

```bash
# Backend local
cd backend
npm install
npm run seed:admin
npm run seed:grupos
npm start

# Verificacion backup/restore
npm run verify:backup-restore

# Frontend build
cd ../frontend
eas build -p android --profile preview
```

