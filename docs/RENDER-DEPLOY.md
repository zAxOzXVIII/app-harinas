# Desplegar backend en Render + Atlas

Guía para publicar la API en **Render** con **MongoDB Atlas** y conectar la **APK** y el **gateway Arduino USB**.

---

## Arquitectura

```
APK (teléfono) ──HTTPS──► Render (app-harinas.onrender.com)
Arduino gateway ──HTTPS──► Render /api/arduino/telemetry
                                │
                                └── MongoDB Atlas (cluster0.0jgv676)
```

---

## 1. Traer el repo (main)

```powershell
git clone https://github.com/zAxOzXVIII/app-harinas.git
cd app-harinas
git checkout main
git pull origin main
```

---

## 2. Crear servicio en Render

### Opción A — Blueprint (`render.yaml` en la raíz)

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Conecta el repo `app-harinas`
3. Render detecta `render.yaml` y crea el servicio `app-harinas`

### Opción B — Manual

| Campo | Valor |
|-------|-------|
| **Type** | Web Service |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/health` |

---

## 3. Variables de entorno en Render

En el servicio → **Environment** → agrega:

| Variable | Valor |
|----------|-------|
| `MONGODB_URI` | URI de Atlas (ver abajo) |
| `JWT_SECRET` | Secreto largo (ej. `super_secreto_nativa_2026_prod`) |
| `JWT_EXPIRES_IN` | `8h` |
| `NODE_ENV` | `production` |
| `TRUST_PROXY` | `1` |
| `CORS_ORIGINS` | `*` (examen) o tu dominio |
| `PUSH_NOTIFICATIONS_ENABLED` | `true` |

### `MONGODB_URI` — Atlas (cluster de examen)

**Opción recomendada en Render** (DNS SRV suele funcionar en la nube):

```env
mongodb+srv://mardenrosales44_db_user:TU_PASSWORD@cluster0.0jgv676.mongodb.net/app_harinas?retryWrites=true&w=majority
```

**Si falla SRV**, usa hosts directos:

```env
mongodb://mardenrosales44_db_user:TU_PASSWORD@ac-xmbqxbd-shard-00-00.0jgv676.mongodb.net:27017,ac-xmbqxbd-shard-00-01.0jgv676.mongodb.net:27017,ac-xmbqxbd-shard-00-02.0jgv676.mongodb.net:27017/app_harinas?ssl=true&authSource=admin&replicaSet=atlas-ymd1rc-shard-0&retryWrites=true&w=majority
```

### Atlas — Network Access

En Atlas → **Network Access** → **Add IP Address**, permite el origen de Render:

| CIDR | Uso |
|------|-----|
| `74.220.48.0/24` | Salida Render |
| `74.220.56.0/24` | Salida Render |

Si el servicio en Render **no llega a Atlas** tras limitar IPs, vuelve a `0.0.0.0/0` (plan gratis puede usar IPs distintas). Para `seed:demo` desde tu PC, añade también tu IP actual.

Esto **no despliega código**. El commit nuevo se monta con **Manual Deploy** en el servicio `app-harinas`.

---

## 4. Verificar deploy

Tras el primer deploy (puede tardar 2–5 min):

```text
GET https://app-harinas.onrender.com/api/health
```

Respuesta esperada: `"success": true`

> El plan gratis **se duerme** tras inactividad; la primera petición puede tardar ~30–60 s.

---

## 5. Sembrar datos en Atlas (una vez)

Desde tu PC (carpeta `backend`, con el mismo `MONGODB_URI` en un `.env` local **sin VPN**):

```powershell
cd backend
npm install
npm run verify:atlas
npm run seed:demo
```

O en Render → **Shell** del servicio:

```bash
npm run seed:demo
```

Credenciales demo:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Operador | `operador@nativa.com` | `operador123` |
| Gerente | `admin@nativa.com` | `admin123` |

---

## 6. Gateway Arduino (Uno por USB)

`firmware/arduino-uno-aht10-ds3231-hc05/gateway/.env`:

```env
SERIAL_PORT=COM3
SERIAL_BAUD=115200
API_URL=https://app-harinas.onrender.com/api/arduino/telemetry
API_INSECURE_TLS=0
```

```powershell
cd firmware\arduino-uno-aht10-ds3231-hc05\gateway
npm install
npm start
```

---

## 7. Nueva APK apuntando a Render

`frontend/.env`:

```env
EXPO_PUBLIC_API_URL=https://app-harinas.onrender.com
```

`frontend/eas.json` — perfil `preview` ya incluye la misma URL.

```powershell
cd frontend
eas build -p android --profile preview
```

Descarga la APK desde el enlace que devuelve Expo.

---

## 8. Probar login desde el teléfono

1. Backend en Render despierto (`/api/health` OK).
2. APK instalada (build con URL Render).
3. Login: `operador@nativa.com` / `operador123`.
4. Operador → **Iniciar secado** → ver telemetría.

---

## 9. Solución de problemas

| Síntoma | Acción |
|---------|--------|
| Health tarda mucho | Plan gratis despertando; espera y reintenta |
| 503 en Render | Revisa logs → **Logs** en el dashboard |
| Atlas no conecta en Render | Whitelist `74.220.48.0/24` y `74.220.56.0/24` (o `0.0.0.0/0`); revisa `MONGODB_URI` |
| Login 401 | `npm run seed:demo`; revisa `JWT_SECRET` |
| Gateway sin POST | `API_URL` debe ser HTTPS Render + gateway en marcha |

---

## 10. URL del servicio

Si cambias el nombre en Render, la URL será:

```text
https://<nombre-del-servicio>.onrender.com
```

Actualiza `EXPO_PUBLIC_API_URL`, `gateway/.env` y vuelve a compilar la APK.
