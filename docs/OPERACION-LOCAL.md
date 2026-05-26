# Operación local — App Harinas / Nativa

Guía rápida para desarrollo, ngrok, APK y MongoDB Atlas.

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

## 3) ngrok (API pública temporal)

1. Backend en marcha en puerto **4000**.
2. En `backend/.env`:

```env
TRUST_PROXY=1
```

3. Túnel con dominio reservado:

```powershell
npx ngrok http --domain=TU_DOMINIO.ngrok-free.app 4000
```

4. En `frontend/.env`:

```env
EXPO_PUBLIC_API_URL=https://TU_DOMINIO.ngrok-free.app
```

5. Reiniciar Expo: `npx expo start -c`

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

---

## 7) Exportar PDF desde la app

En pantallas Harinas, Calibración, Alertas, Muro y Equipo → botón **Exportar PDF**.

---

## 8) Solución de problemas

| Problema | Acción |
|----------|--------|
| Login 401 con ngrok | `TRUST_PROXY=1`, reiniciar backend |
| Expo `fetch failed` al iniciar | `EXPO_NO_DOCTOR=1` o `EXPO_OFFLINE=1` |
| Rate limit ngrok | Reiniciar backend tras activar trust proxy |
| Telemetría vacía | `npm run simulate:telemetry` en backend |
