# App Harinas — Nativa Superalimentos C.A

Aplicación móvil (Expo + React Native + TypeScript) y API REST (Node.js + Express + MongoDB) para Nativa Superalimentos: inventario de harinas (modulo actual), **roles Gerente / Supervisor / Operador** y CRUD de equipo para el Gerente; evolucion hacia monitoreo Arduino (temperatura y humedad en MVP).

## Estructura del repositorio

```
App-Harinas/
├── backend/          # API REST (Express + Mongoose)
├── frontend/       # App móvil (Expo SDK 54)
├── SPRINTS.md      # Plan por sprints
└── README.md       # Este archivo
```

## Requisitos previos

| Herramienta | Uso |
|-------------|-----|
| **Node.js** (LTS recomendado) | Backend y frontend |
| **MongoDB** | Base de datos local o URI remota |
| **Git** | Clonar y versionar |
| **Android Studio** (opcional) | Emulador Android |
| **Expo Go** (opcional) | Probar en teléfono físico sin compilar APK |

---

## Variables de entorno

**No subas archivos `.env` a Git.** Copia los ejemplos y rellénalos en cada máquina.

### Backend (`backend/.env`)

Copia desde `backend/.env.example`:

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (por defecto `4000`) |
| `MONGODB_URI` | Cadena de conexión MongoDB |
| `JWT_SECRET` | Secreto para firmar tokens (obligatorio en producción) |
| `JWT_EXPIRES_IN` | Duración del token (ej. `8h`) |
| `NODE_ENV` | Entorno (`development` / `production`) |
| `CORS_ORIGINS` | Orígenes permitidos por CORS (csv) |
| `RATE_LIMIT_WINDOW_MS` | Ventana de rate limit en ms |
| `RATE_LIMIT_MAX` | Máximo de requests por IP en la ventana |

Opcional para el script de usuario inicial:

| Variable | Descripción |
|----------|-------------|
| `ADMIN_EMAIL` | Email de la **cuenta Gerente** (por defecto `admin@nativa.com`) |
| `ADMIN_PASSWORD` | Contraseña del seed |
| `ADMIN_NOMBRE` | Nombre mostrado |

### Frontend (`frontend/.env`)

Copia desde `frontend/.env.example`:

| Variable | Descripción |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | URL base de la API **tal como la ve el dispositivo** |

**Referencia rápida:**

- **Emulador Android** (misma máquina que el backend): `http://10.0.2.2:4000`
- **Teléfono físico** (misma red WiFi que el PC): `http://IP_DE_TU_PC:4000` (sustituye `IP_DE_TU_PC`; abre el puerto 4000 en el firewall si hace falta)
- **Backend en internet** (VPS, Railway, etc.): URL HTTPS del servidor

---

## Arranque paso a paso (desarrollo local)

### 1) MongoDB

Asegúrate de que MongoDB esté en marcha en el host y puerto definidos en `MONGODB_URI` (por ejemplo `127.0.0.1:27017`).

**Windows (ejemplo manual):**

```powershell
& "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db" --bind_ip 127.0.0.1 --port 27017
```

Si la carpeta de datos no existe:

```powershell
mkdir C:\data\db
```

### 2) Backend

```powershell
cd backend
copy .env.example .env
npm install
npm run seed:admin
npm run dev
```

Comprueba: [http://localhost:4000/api/health](http://localhost:4000/api/health) → debe responder `{"success":true,"message":"API activa"}`.

### 3) Frontend (Expo)

En **otra terminal**:

```powershell
cd frontend
copy .env.example .env
npm install
npm run start
```

Metro queda por defecto en el **puerto 8082** (scripts en `package.json`).

- Pulsa **`a`** para abrir en emulador Android (con el emulador ya iniciado).
- O escanea el QR con **Expo Go** en el móvil (ajusta `EXPO_PUBLIC_API_URL` si usas dispositivo físico).

### Credenciales de prueba (tras `seed:admin`)

El script crea o migra la **cuenta Gerente** (`rol: gerente`). Si no cambiaste `ADMIN_EMAIL` / `ADMIN_PASSWORD` en `.env`:

- **Email:** `admin@nativa.com`
- **Contraseña:** `admin123` (o la que definas en `ADMIN_PASSWORD`)

Desde esa cuenta puedes registrar **Supervisores** y **Operadores** en la app (Equipo).

---

## Scripts útiles

### Backend (`backend/`)

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor con nodemon (desarrollo) |
| `npm start` | Servidor sin recarga automática |
| `npm run seed:admin` | Crea o migra la cuenta **Gerente** y roles en usuarios legacy |
| `npm run backup:mongo` | Genera backup con `mongodump` en `backend/backups/` |
| `npm run restore:mongo -- <ruta_dump>` | Restaura backup con `mongorestore --drop` |

### Frontend (`frontend/`)

| Comando | Descripción |
|---------|-------------|
| `npm run start` | Expo + Metro en puerto **8082** |
| `npm run android` | Expo y abre Android |
| `npm run ios` | Expo y abre iOS (macOS) |
| `npm run web` | Versión web en el mismo puerto |

---

## API REST (resumen)

Base URL local: `http://localhost:4000`

| Método | Ruta | Auth |
|--------|------|------|
| `POST` | `/api/auth/login` | No |
| `GET` | `/api/harinas` | Bearer JWT |
| `POST` | `/api/harinas` | Bearer JWT |
| `PUT` | `/api/harinas/:id` | Bearer JWT |
| `DELETE` | `/api/harinas/:id` | Bearer JWT |
| `GET` | `/api/users` | Bearer JWT (**solo rol gerente**) |
| `POST` | `/api/users` | Bearer JWT (**solo gerente**; cuerpo: supervisor u operador) |
| `PUT` | `/api/users/:id` | Bearer JWT (**solo gerente**; no modificar cuenta gerente) |
| `DELETE` | `/api/users/:id` | Bearer JWT (**solo gerente**; no eliminar cuenta gerente) |

Colección Postman: `backend/docs/postman/App-Harinas.postman_collection.json` (actualizar con `/api/users` si usas la coleccion en equipo).

---

## Subir el proyecto a GitHub

1. Confirma que `.gitignore` en la raíz ignora `.env`, `node_modules/`, `.expo/`, etc.
2. En la raíz del proyecto:

```powershell
git init
git branch -M main
git add .
git status
```

Revisa que **no** se vayan a subir `backend/.env` ni `frontend/.env` con secretos reales.

```powershell
git commit -m "Initial commit: App Harinas"
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

### En otro equipo

```powershell
git clone https://github.com/TU_USUARIO/TU_REPO.git
cd TU_REPO
```

Repite los pasos de **variables de entorno**, `npm install` en `backend/` y `frontend/`, MongoDB y arranque.

---

## Instalar en otros dispositivos

### Opción A — Desarrollo con Expo Go

1. Instala [Expo Go](https://expo.dev/go) en el Android.
2. Mismo WiFi que el PC (o usa túnel; ver documentación de Expo).
3. `EXPO_PUBLIC_API_URL` debe ser alcanzable desde el móvil (IP local del PC o URL pública del backend).
4. `npm run start` en `frontend/` y escanea el QR.

### Opción B — APK para distribución (EAS Build)

1. Cuenta en [expo.dev](https://expo.dev).
2. Instala EAS CLI y entra:

```powershell
npm install -g eas-cli
cd frontend
eas login
eas build:configure
```

3. Para un **APK** instalable fuera de Play Store, en `eas.json` usa un perfil con `"android": { "buildType": "apk" }` y ejecuta:

```powershell
eas build -p android --profile preview
```

4. Descarga el artefacto desde el enlace que devuelve Expo cuando termine el build.

Para **Google Play** suele usarse **AAB** (`app-bundle`), no APK.

Configura variables de entorno del build (por ejemplo `EXPO_PUBLIC_API_URL` apuntando a tu API en producción) según la [documentación de EAS](https://docs.expo.dev/build-reference/variables/).

---

## Solución de problemas

| Síntoma | Acción |
|---------|--------|
| `ECONNREFUSED 127.0.0.1:27017` | Inicia MongoDB y revisa `MONGODB_URI`. |
| Expo: no hay dispositivo Android | Abre un AVD en Android Studio o conecta el móvil con depuración USB y `adb devices`. |
| La app no llega al API desde el emulador | Usa `http://10.0.2.2:4000` en `EXPO_PUBLIC_API_URL`. |
| La app no llega al API desde el móvil | Usa la IP LAN del PC y puerto 4000; firewall y misma red. |
| Login 401 en rutas protegidas | Token expirado o inválido: cierra sesión y vuelve a iniciar sesión. |

---

## Documentación adicional

- Plan de trabajo y prompts por sprint: `SPRINTS.md`
- Guía rápida Postman: `backend/docs/postman/USO-RAPIDO.md`
- Seguridad y backups (Sprint 8): `backend/docs/BACKUP-SECURITY.md`

---

## Licencia y empresa

Proyecto orientado a **Nativa Superalimentos C.A** (San Cristóbal, Táchira). Ajusta licencia y datos legales según políticas internas.
