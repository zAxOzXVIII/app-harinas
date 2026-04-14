# Plan de Sprints - App Harinas

Proyecto: **Nativa Superalimentos C.A**  
Stack: React Native (Expo) + TypeScript + Node.js + Express + MongoDB

---

## Sprint 1 - Backend base (completado)

### Objetivo
Construir API REST segura y escalable para autenticacion y CRUD de harinas.

### Alcance ejecutado
- Estructura modular en `backend/src`:
  - `config/`, `controllers/`, `models/`, `routes/`, `middlewares/`, `services/`, `scripts/`
- JWT para autenticacion.
- Endpoints implementados:
  - `POST /api/auth/login`
  - `GET /api/harinas`
  - `POST /api/harinas`
  - `PUT /api/harinas/:id`
  - `DELETE /api/harinas/:id`
- Validaciones con `express-validator`.
- Manejo global de errores.
- Variables de entorno con `.env`.
- Seed de administrador y pruebas funcionales de endpoints.

### Entregables
- Backend funcional en `http://localhost:4000`.
- Coleccion Postman en `backend/docs/postman/App-Harinas.postman_collection.json`.

---

## Sprint 2 - Frontend base + Login + Dashboard inicial (completado ✅)

### Objetivo
Inicializar app Android con Expo + TypeScript, implementar autenticacion y dashboard inicial conectado al backend.

### Check de estado
- [x] Expo + TypeScript inicializado en `frontend/`.
- [x] Arquitectura `src/` creada (`components`, `screens`, `navigation`, `services`, `store`, `hooks`).
- [x] Navegacion y autenticacion implementadas.
- [x] Persistencia de sesion con AsyncStorage (Zustand persist).
- [x] Dashboard inicial consumiendo `GET /api/harinas`.
- [x] Validacion de compilacion TypeScript (`npx tsc --noEmit`).
- [x] Metro Bundler levantando correctamente (`expo start`, `Waiting on http://localhost:8081`).

### Prompt listo para usar

```text
Iniciar Sprint 2 frontend.

Actúa como desarrollador senior React Native + Expo + TypeScript.
Con base en el backend ya creado y funcional en http://localhost:4000, construye el frontend por fases, archivo por archivo, explicando cada archivo.

Objetivo de esta fase:
1) Inicializar app Expo con TypeScript.
2) Configurar arquitectura escalable en `src/`:
   - components/
   - screens/
   - navigation/
   - services/
   - store/
   - hooks/
3) Instalar y configurar:
   - React Navigation
   - Zustand (manejo de estado)
   - AsyncStorage (persistencia de sesión)
   - libreria UI recomendada (elige una y justifica brevemente)
4) Implementar autenticacion completa:
   - pantalla Login (email, contraseña, validaciones y errores)
   - llamada a POST /api/auth/login
   - guardar token y usuario en AsyncStorage + store
   - restaurar sesion al abrir la app
5) Configurar navegacion protegida:
   - si hay token: Dashboard
   - si no hay token: Login
6) Crear Dashboard inicial mostrando:
   - total de harinas
   - ultimos registros (consumiendo GET /api/harinas)
   - boton para ir al modulo de gestion

Requisitos:
- TypeScript obligatorio.
- Codigo limpio, modular y escalable.
- No generar todo de una vez: avanzar por fases y confirmar cada fase.
- En cada fase: mostrar comandos, archivos creados y explicacion breve.
- Usar `EXPO_PUBLIC_API_URL` para la URL del backend en variables de entorno.
```

---

## Sprint 3 - CRUD de Harinas en app movil (completado ✅)

### Objetivo
Implementar modulo completo de gestion de harinas desde el frontend.

### Check de estado
- [x] `harinasService` extendido con `createHarina`, `updateHarina`, `deleteHarina`.
- [x] `HarinaPayload` agregado a tipos.
- [x] `harinasStore` con acciones CRUD (`createHarina`, `updateHarina`, `deleteHarina`, `isMutating`).
- [x] Componente reutilizable `HarinaForm` con validaciones completas.
- [x] `HarinasListScreen`: FlatList + pull-to-refresh + eliminar con confirmacion + FAB.
- [x] `HarinaFormScreen`: pantalla de crear y editar reutilizando `HarinaForm`.
- [x] `RootNavigator` actualizado con rutas `HarinasList`, `HarinaCreate`, `HarinaEdit`.
- [x] `DashboardScreen` con `useFocusEffect` para refrescar datos al regresar del CRUD.
- [x] Validacion TypeScript (`npx tsc --noEmit`) sin errores.
- [x] Sin errores de linter en `src/`.

### Prompt listo para usar

```text
Iniciar Sprint 3 frontend (CRUD de harinas).

Con el login y dashboard ya implementados, desarrolla el modulo de gestion de harinas completo en React Native + Expo + TypeScript.

Requerimientos funcionales:
1) Pantalla de listado de harinas:
   - consumir GET /api/harinas
   - mostrar nombre, tipo, cantidad, unidad y fecha_registro
   - mostrar estados de carga, error y lista vacia
2) Crear harina:
   - formulario con validaciones
   - consumir POST /api/harinas
3) Editar harina:
   - formulario precargado
   - consumir PUT /api/harinas/:id
4) Eliminar harina:
   - confirmacion previa
   - consumir DELETE /api/harinas/:id
5) Refrescar dashboard al crear/editar/eliminar.

Requerimientos tecnicos:
- Mantener arquitectura modular en `src/`.
- Reutilizar componentes de formulario y tarjetas.
- Centralizar llamadas API en `services/`.
- Manejar estado global con Zustand.
- Manejar token expirado (cerrar sesion y redirigir a Login).
- Explicar archivo por archivo sin generar todo en un solo paso.
```

---

## Sprint 4 - Endurecimiento y preparacion de release (recomendado)

### Objetivo
Dejar la app lista para pruebas internas y crecimiento.

### Alcance sugerido
- Roles de usuario (`admin` y `operador`).
- Mejoras UX (feedback, loaders, confirmaciones).
- Validaciones adicionales frontend/backend.
- Logging y manejo de errores mas robusto.
- Pruebas basicas de servicios y componentes criticos.
- Configuracion de build Android (Expo EAS) para distribucion interna.

