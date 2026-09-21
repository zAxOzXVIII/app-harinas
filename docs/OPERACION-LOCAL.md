# Operación local — App Harinas / Nativa

Arranque en PC, APK preview y MongoDB Atlas. Telemetría real: Uno USB + gateway → Render ([`COMO-EJECUTAR-GATEWAY-ARDUINO.md`](COMO-EJECUTAR-GATEWAY-ARDUINO.md)).

---

## 1) Arranque diario

**Terminal 1 — MongoDB** (si es local):

```powershell
mongod --dbpath C:\data\db --bind_ip 127.0.0.1 --port 27017
```

**Terminal 2 — Backend:**

```powershell
cd backend
npm run dev
```

Comprobar: http://localhost:4000/api/health

**Terminal 3 — Frontend:**

```powershell
cd frontend
npx expo start -c --port 8082
```

---

## 2) Credenciales demo

Tras `npm run seed:admin`:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Gerente | `admin@nativa.com` | `admin123` (o `ADMIN_PASSWORD` en `.env`) |

---

## 3) API pública — Render (recomendado en Venezuela)

Backend desplegado en **Render**:

```text
https://app-harinas.onrender.com
```

En `frontend/.env`:

```env
EXPO_PUBLIC_API_URL=https://app-harinas.onrender.com
```

Health: `GET https://app-harinas.onrender.com/api/health`

Guía completa: [`RENDER-DEPLOY.md`](RENDER-DEPLOY.md)

---

## 4) MongoDB Atlas (producción / demo remota)

1. Crear cluster M0 en [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Usuario + contraseña + Network Access (IP del hosting o `0.0.0.0/0` solo pruebas).
3. En `backend/.env`:

```env
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/app_harinas?retryWrites=true&w=majority
```

4. Una vez conectado:

```powershell
cd backend
npm run seed:admin
npm run seed:grupos
```

La **APK** solo necesita `EXPO_PUBLIC_API_URL` apuntando al backend HTTPS (no a Atlas directamente).

---

## 4b) Telemetría Uno USB → gateway → Render

```
Arduino Uno ──USB──► gateway (laptop) ──HTTPS──► Render ──► APK
```

Guía corta: [`COMO-EJECUTAR-GATEWAY-ARDUINO.md`](COMO-EJECUTAR-GATEWAY-ARDUINO.md)  
Cableado: [`MONTAJE-HARDWARE-UNO-USB.md`](MONTAJE-HARDWARE-UNO-USB.md)

---

## 5) Generar APK (EAS)

```powershell
npm install -g eas-cli
cd frontend
eas login
eas build -p android --profile preview
```

Configura `EXPO_PUBLIC_API_URL` en EAS con la URL pública del backend.

---

## 6) Tests backend

```powershell
cd backend
npm test
```

Usa MongoDB en memoria (no requiere MongoDB local instalado para tests).

Cobertura actual: health, login, push-token, harinas CRUD, grupos/calibración, ingesta telemetría, alertas, procesos-secado (marcar-listo/archivar), fluctuaciones humedad.

### Endpoints nuevos (LeanHerz, jul 2026)

| Método | Ruta | Rol |
|--------|------|-----|
| POST | `/api/procesos-secado/:id/marcar-listo` | operador |
| POST | `/api/procesos-secado/:id/archivar` | gerente |
| GET | `/api/procesos-secado/pendientes-archivo` | gerente |
| GET | `/api/telemetry/fluctuaciones/humedad` | supervisor, gerente |

En cada push a `main`, GitHub Actions ejecuta los tests automáticamente.

---

## 7) Notificaciones push (alertas de proceso)

Cuando el backend detecta una alerta nueva (telemetría fuera de rango), envía push a usuarios **operador** y **gerente** con token registrado.

**Backend** (`backend/.env`):

```env
PUSH_NOTIFICATIONS_ENABLED=true
```

**App móvil:**

1. Requiere **dispositivo físico** (no emulador) y build con EAS o `expo run:android` tras añadir `expo-notifications`.
2. Tras iniciar sesión, la app pide permiso y registra el token en `PUT /api/auth/push-token`.
3. En EAS, sube credenciales FCM (Android) según [documentación Expo Push](https://docs.expo.dev/push-notifications/push-notifications-setup/).
4. Prueba: `npm run simulate:telemetry` en backend con valores fuera de umbral; el gerente/operador con la app abierta o en segundo plano debería recibir la notificación.

---

## 8) Exportar PDF desde la app

En pantallas Harinas, Calibración, Alertas, Muro, Equipo y **Fluctuaciones humedad** → botón **Exportar PDF**.

---

## 9) Solución de problemas

| Problema | Acción |
|----------|--------|
| Expo `fetch failed` al iniciar | `EXPO_NO_DOCTOR=1` o `EXPO_OFFLINE=1` |
| Telemetría vacía | Gateway `npm start` o `npm run simulate:telemetry` |
