# Plan de Sprints - App Harinas

Proyecto: **Nativa Superalimentos C.A**  
Stack: React Native (Expo) + TypeScript + Node.js + Express + MongoDB

> **Prompts para Cursor:** centralizados en [`docs/prompts/`](docs/prompts/README.md). Este archivo conserva producto, estado y checks; los bloques largos de prompt ya no se duplican aquí.

---

## Especificaciones del producto (Arduino + app) — vigente

### Vision general
El proyecto es un **sistema Arduino monitoreado desde una app movil**: el hardware captura y/o controla variables de proceso; la app muestra estado, historial y permite **calibracion y supervision** segun el rol.

### Roles y responsabilidades (tres niveles — vigente en negocio)

> **Nota terminologica:** en documentacion anterior se uso “Administrador”; en operacion corresponde al rol **Supervisor** (calibracion). El rol **Gerente** es la cuenta maestra de la empresa.

- **Gerente** (cuenta unica, no eliminable por API)
  - Acceso total: puede hacer todo lo que Supervisor y Operador, mas **registro inicial** de supervisores y operadores (CRUD de equipo).
  - **Muro** (fase siguiente): vision tipo feed con datos en tiempo real de procesos y sitios.
  - En desarrollo y demo se usa **rol Gerente** para probar todas las pantallas; las vistas de Supervisor y Operador son lienzos aparte hasta completar modulos.
- **Supervisor** (por contratacion / crecimiento futuro)
  - Crea **grupos de rubros** y **calibra** la lectura de componentes: en la practica del MVP se acota a **temperatura y humedad** (porcentajes y umbrales).
  - El **tiempo de secado** en horno no tiene medicion automatica: se apoya en **alarmas** y registro manual / atencion del operador.
- **Operador** (por contratacion / crecimiento futuro)
  - Recibe **alarmas**, puede enviar **informes** a Supervisor y Gerente, mantiene registro de **fluctuaciones** y produccion.
  - Interfaz mayormente **informativa** en primera iteracion.

### Enfoque MVP acordado (hardware / negocio)
- Prioridad inmediata en sensores: **temperatura** y **humedad** (resto de variables — ventilador, calefactor, tiempo de secado, reglas derivadas calor/frio — queda documentado para fases posteriores).
- Alarmas esperadas en producto: cambios de humedad, exceso o subida de temperatura, tiempo de secado (atencion humana), y en el futuro logica de intensidad (ventilador / calefactor) derivada de T y HR.

### Entrega base ya implementada en el repositorio (roles + equipo Gerente)
- [x] Campo `rol` en usuario: `gerente` | `supervisor` | `operador`.
- [x] JWT y login devuelven `rol`; middleware enriquece tokens antiguos leyendo la BD.
- [x] Seed `npm run seed:admin`: crea o migra la **cuenta Gerente** (`ADMIN_EMAIL`) y asigna `rol` a usuarios legacy sin rol.
- [x] API **solo Gerente**: `GET/POST/PUT/DELETE /api/users` para alta/baja de **supervisores y operadores** (no se puede crear ni borrar Gerente por API).
- [x] App: navegacion por rol; **Gerente** panel con **Equipo (CRUD)**, **Muro** (lecturas + alertas), **Alertas** y vistas previas; **Supervisor** calibracion; **Operador** monitoreo + alertas.

### Variables de control (por grupo de rubro)
Cada **grupo de rubro** tiene su propia calibracion y visualizacion de:

| Variable | Notas |
|----------|--------|
| **Nivel de secado** | Asociado a la **intensidad del ventilador** (PWM / porcentaje / escala interna — definir unidad en implementacion). |
| **Tiempo de secado** | Valor **estimado o relativo** (p. ej. temporizador, fase de proceso, o duracion esperada segun receta). |
| **Temperatura** | Por grupo de rubro (con umbrales calibrables por Supervisor). |
| **Humedad** | **Igual para todos los grupos** (configuracion global; lectura puede ser unica o compartida, pero la **politica de umbral** es comun). |

### Materia prima por parejas (rubros fijos)
La materia prima viene **agrupada en parejas** por similitud; **cada pareja es un grupo de rubro** con calibracion propia:

1. **Garbanzo** y **Lenteja**  
2. **Platano** y **Cambur**  
3. **Yuca** y **Batata**

La app y el backend deben modelar **grupo de rubro** (no solo “harina” suelta) para que Arduino y calibracion apunten al mismo contexto.

### Implicaciones para los sprints siguientes
- Los sprints **5 en adelante** priorizan: modelo de **grupos de rubro**, **calibracion por Supervisor** (T + HR en MVP), **vista Operador** (alarmas, informes, fluctuaciones), **ingestion Arduino** (telemetria real), **muro Gerente**, y **alertas** alineadas a umbrales calibrados.

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

### Prompt

Ver [`docs/prompts/completados/sprint-02-frontend-base.md`](docs/prompts/completados/sprint-02-frontend-base.md).

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

### Prompt

Ver [`docs/prompts/completados/sprint-03-crud-harinas.md`](docs/prompts/completados/sprint-03-crud-harinas.md).

---

## Sprint 4 - Endurecimiento y preparacion de release (recomendado)

### Objetivo
Dejar la app lista para pruebas internas y crecimiento, y preparar el salto al **modelo Arduino + roles Gerente/Supervisor/Operador** descrito en la seccion de especificaciones.

### Prompt

Ver [`docs/prompts/completados/sprint-04-hardening.md`](docs/prompts/completados/sprint-04-hardening.md).

### Alcance sugerido
- Roles de usuario (`gerente`, `supervisor`, `operador`) alineados al producto: **Gerente** control total y equipo; **Supervisor** calibracion; **Operador** supervision.
- Mejoras UX (feedback, loaders, confirmaciones).
- Validaciones adicionales frontend/backend.
- Logging y manejo de errores mas robusto.
- Pruebas basicas de servicios y componentes criticos.
- Configuracion de build Android (Expo EAS) para distribucion interna.
- Documentar limitaciones actuales del modulo **harinas** frente al nuevo dominio **grupos de rubro** (para no mezclar conceptos en produccion).

---

## Sprint 5 - Roles Gerente/Supervisor/Operador + grupos de rubro + calibracion por pareja (completado ✅)

### Contexto empresa
Nativa Superalimentos C.A. (Tucapé, Estado Táchira) requiere sustituir registros manuales por un sistema **Arduino + app** con trazabilidad y decisiones mas oportunas en despacho y proceso.

### Objetivo
Implementar el **modelo de datos y permisos** que refleja el negocio: parejas de materia prima como **grupos de rubro**, calibracion por Supervisor, lectura y alarmas por Operador, control total y registro de equipo por Gerente.

### Alcance ejecutado
- **Backend**:
  - Modelo `GrupoRubro` con sub-doc `calibracion` (temperatura min/max + criticos, nivelSecado min/max, tiempoSecado estimadoMin) y campos de auditoria `actualizadoPor`/`actualizadoEn`.
  - Modelo `HumedadConfig` singleton (scope `global`) con min/max + criticos.
  - Services `grupoRubro.service` (list, getById, updateCalibracion con validacion logica min<=max) y `humedadConfig.service` (getOrCreate, update).
  - Controllers `grupoRubro.controller` y `humedadConfig.controller` con respuestas estandar.
  - Rutas:
    - `GET /api/grupos-rubro` (autenticado)
    - `GET /api/grupos-rubro/:id` (autenticado)
    - `PUT /api/grupos-rubro/:id/calibracion` (gerente / supervisor)
    - `GET /api/config/humedad` (autenticado)
    - `PUT /api/config/humedad` (gerente / supervisor)
  - Validaciones con `express-validator` en cada endpoint editable.
  - Script `npm run seed:grupos` que siembra las 3 parejas y la `HumedadConfig` global con valores por defecto.
- **Frontend**:
  - Tipos TS para `GrupoRubro`, `Calibracion`, `HumedadConfig` y payloads.
  - `gruposService` y `humedadService` en `services/grupos.service.ts`.
  - `useGruposStore` con `fetchAll`, `updateCalibracion`, `updateHumedad`.
  - Componente reutilizable `GrupoRubroCard` con chips de items y resumen de calibracion.
  - Pantallas:
    - `GruposListScreen` (lista + tarjeta de humedad global).
    - `CalibracionFormScreen` (editor por grupo: temperatura, nivel secado, tiempo).
    - `HumedadFormScreen` (editor de la politica global).
    - `SupervisorHomeScreen` (home real con accesos).
    - `OperadorHomeScreen` (vista read-only de grupos + humedad global).
  - `RootNavigator` actualizado: stack Gerente con `GruposList`/`CalibracionEdit`/`HumedadEdit`, stack Supervisor real, stack Operador real.
  - Acceso a `GruposList` desde el Panel Gerente del `DashboardScreen`.
  - Eliminados `SupervisorPlaceholderScreen` y `OperadorPlaceholderScreen` (reemplazados por las pantallas reales).
- **Auditoria minima**: cada update de calibracion y de humedad guarda `actualizadoPor` (id del usuario JWT) y `actualizadoEn`.

### Check de estado
- [x] Roles `gerente`/`supervisor`/`operador` en modelo y JWT (entrega base).
- [x] Modelo `GrupoRubro` y seed con las tres parejas (`seed:grupos`).
- [x] Calibracion persistida por grupo (secado, tiempo, temp) + humedad global (`HumedadConfig`).
- [x] Pantallas completas de Supervisor (grupos + calibracion + humedad global).
- [x] Pantalla Operador read-only con grupos y umbrales calibrados.
- [x] Validacion logica `min <= max` y rangos 0–100 en humedad / nivel secado.
- [x] Auditoria de cambios de calibracion (`actualizadoPor`/`actualizadoEn`).
- [x] `npx tsc --noEmit` y `node --check` sin errores.

### Prompt

Ver [`docs/prompts/completados/sprint-05-grupos-calibracion.md`](docs/prompts/completados/sprint-05-grupos-calibracion.md).

---

## Sprint 6 - Integracion Arduino (lecturas de proceso -> backend -> app) (completado ✅)

### Contexto
El Arduino monitorea el proceso de secado; la app consume el estado y las alertas segun la **calibracion** definida por el Supervisor (y politicas del Gerente).

### Objetivo
Recibir **telemetria de proceso** desde Arduino alineada a las variables por grupo: nivel de secado (ventilador), tiempo de secado, temperatura, humedad (global).

### Alcance
- **Contrato Arduino -> Backend (POC)**:
  - payload minimo sugerido: `deviceId`, `grupoRubroId` o codigo de pareja, `timestamp`, lecturas `{ nivelSecado, tiempoSecado, temperatura, humedad }` (ajustar nombres y unidades en doc de contrato).
  - anti-duplicados (eventId o ventana + hash) y rate limiting.
- **Backend**:
  - endpoint de ingestion (ej. `POST /api/arduino/telemetry`)
  - validacion estricta; correlacion con grupo de rubro
  - persistencia de **serie temporal** o ultimo estado + historial corto para la app
- **Frontend (operador)**:
  - dashboard por grupo: valores actuales vs umbrales de calibracion
  - historial reciente / pull-to-refresh / polling en POC

### Entregables
- Ingestion estable con documentacion del contrato JSON.
- Simulador de Arduino o script que envie telemetria de prueba.

### Check de estado
- [x] Contrato de telemetria definido y versionado en docs (`backend/docs/arduino-telemetry-contract.md`).
- [x] Ingestion con validacion + deduplicacion por `eventId` + rate limit por `deviceId`.
- [x] Telemetria asociada al `grupoRubro` correcto por `grupoRubroId` o `codigoGrupo`.
- [x] API de consulta para app: `GET /api/telemetry/latest` y `GET /api/telemetry/group/:grupoRubroId`.
- [x] UI Operador muestra las cuatro dimensiones y estado (`OK` / `ALERTA` / `CRITICO`) vs calibracion/humedad.
- [x] Simulador de carga para pruebas: `npm run simulate:telemetry`.

### Prompt

Ver [`docs/prompts/completados/sprint-06-telemetria.md`](docs/prompts/completados/sprint-06-telemetria.md).

---

## Sprint 7 - Notificaciones y alertas (proceso + stock si aplica) (completado ✅ in-app; push pendiente)

### Objetivo
Avisar al operador (y opcionalmente al Gerente) cuando las lecturas **salgan de los rangos calibrados** (temperatura, humedad, secado, tiempo) y mantener la linea de **stock critico** si el negocio sigue requiriendo inventario.

### Alcance ejecutado (in-app + backend)
- **Algoritmo de monitoreo** (tras cada `POST /api/arduino/telemetry` exitoso, no deduplicado):
  - temperatura critica vs `calibracion.temperatura.criticoMin/Max` → alerta `temp_critico`
  - temperatura fuera de rango operativo `min/max` (si no hubo critico) → `temp_fuera_rango`
  - humedad critica vs `HumedadConfig.criticoMin/Max` → `humedad_critico`; si no, fuera de `min/max` global → `humedad_fuera`
  - nivel de secado fuera de `calibracion.nivelSecado.min/max` → `nivel_secado_fuera`
  - tiempo de secado mayor que `calibracion.tiempoSecado.estimadoMin` → `tiempo_secado_exceso`
- **Anti-spam**: no se crea otra alerta del mismo `tipo` para el mismo `grupoRubroId` dentro de **5 minutos** (persistido consultando `ProcessAlert`).
- **API** (`requireAuth`):
  - `GET /api/alerts`, `GET /api/alerts/count`, `PATCH /api/alerts/:id/read`, `POST /api/alerts/mark-all-read`
- **Frontend**:
  - `AlertsListScreen` + `alertsService` + `useAlertsStore`
  - **Operador**: boton a alertas + contador sin leer; lista con marcar leida / todas
  - **Gerente**: acceso desde panel + **Muro** con ultimas lecturas y alertas (polling 15s + pull-to-refresh)
- **Notificaciones push (Expo)**: **pendiente** (siguiente iteracion; requiere `expo-notifications`, tokens en backend y envio desde servidor).

### Entregables
- Alertas de proceso segun calibracion (persistidas en MongoDB).
- Anti-spam persistido por ventana de tiempo.
- UI in-app para Operador y Gerente (Muro).

### Check de estado
- [x] Reglas de alerta alineadas a calibracion por grupo + humedad global.
- [ ] push notifications POC funcionando (pendiente — fase 7b).
- [x] anti-spam implementado y persistido.
- [x] UI de alertas para operador y resumen en Muro Gerente.

### Prompt

Ver [`docs/prompts/completados/sprint-07-alertas.md`](docs/prompts/completados/sprint-07-alertas.md).

---

## Sprint 8 - Respaldo y seguridad de datos (backups + cifrado + hardening) (completado ✅)

### Objetivo
Garantizar integridad y disponibilidad de la informacion ante fallos de hardware o accesos no autorizados.

### Alcance
- **Backups automatizados**:
  - estrategia segun entorno: MongoDB Atlas (backups gestionados) o `mongodump` programado
  - rotacion, retencion y prueba de restauracion
- **Cifrado y seguridad**:
  - cifrado en transito (TLS) en entornos de nube
  - hardening API: rate limit, CORS por ambiente, logs seguros, revisiones de `helmet`
  - politicas de manejo de secretos (no `.env` en git, rotacion de JWT_SECRET)

### Entregables
- Backups documentados + prueba de restore.
- Checklist de seguridad y configuracion por ambiente (dev/qa/prod).

### Check de estado
- [x] Backup script con `mongodump` (`npm run backup:mongo`) y carpeta dedicada `backend/backups/`.
- [x] Restore validado: `npm run verify:backup-restore` ejecutado y completado con verificacion logica JSON (exporta colecciones a BD temporal, compara conteos exactos, limpia). Modo `mongodump`/`mongorestore` activable cuando se instalen MongoDB Database Tools.
- [x] Hardening aplicado (rate limit + CORS por ambiente + `helmet` + logging de errores HTTP).
- [x] Documentacion de seguridad y secretos (`backend/docs/BACKUP-SECURITY.md`, `.env.example`, README).

### Prompt

Ver [`docs/prompts/completados/sprint-08-seguridad.md`](docs/prompts/completados/sprint-08-seguridad.md).

---

## Sprint 9 - Deploy POC en la nube (sin costos o costo minimo) + documentacion

### Objetivo
Publicar un entorno de pruebas accesible para demos y para usar la app desde multiples equipos/dispositivos sin montaje local.

### Alcance
- **Base de datos**:
  - MongoDB Atlas Free Tier (POC)
- **Hosting backend (opciones POC)**:
  - Render (free tier con sleep)
  - Railway (planes/promos; puede requerir tarjeta segun periodo)
  - alternativa sin hosting: tunel (ngrok) exponiendo backend local para demos puntuales
- **Variables por ambiente**:
  - secretos gestionados por la plataforma
  - `EXPO_PUBLIC_API_URL` apuntando a URL publica de la API
- **Documentacion**:
  - guia `DEPLOY-POC.md` con pasos exactos y limitaciones del free tier

### Entregables
- URL publica del backend y DB en Atlas.
- App configurada para consumir API publica en modo POC.
- Documento de deploy y troubleshooting.

### Check de estado
- [ ] Backend desplegado en free tier o alternativa de tunel.
- [ ] MongoDB Atlas configurado y conectado.
- [ ] Variables por ambiente definidas y seguras.
- [ ] Documentacion `DEPLOY-POC.md` lista.

### Prompt

Ver [`docs/prompts/SPRINT-09-DEPLOY.md`](docs/prompts/SPRINT-09-DEPLOY.md) y [`DEPLOY-PLAN.md`](DEPLOY-PLAN.md).

---

## Sprint 10 - UI azul corporativa + PDF por modulos (siguiente)

### Objetivo
Alinear la app con identidad **NATIVA — Control de planta** (referencia visual: login con fondo navy y tarjeta clara), paleta **azul** corporativa, y exportar **PDF** en apartados clave: harinas, calibracion, alertas, muro/telemetria y equipo.

### Sub-fases (ejecutar de a poco)
- **10A** — Tema azul + rediseño Login
- **10B0** — Servicio PDF (`expo-print` + `expo-sharing`)
- **10B1–10B5** — PDF por modulo
- **10C** — Pulido visual pantallas por rol
- **10D** — `trust proxy` para ngrok/deploy

### Prompt y backlog de mejoras
- Prompt completo: [`docs/prompts/SPRINT-10-VISUAL-PDF.md`](docs/prompts/SPRINT-10-VISUAL-PDF.md)
- **PDF (datos BD, orden, diseño):** [`docs/prompts/PDF-DATOS-Y-DISENO.md`](docs/prompts/PDF-DATOS-Y-DISENO.md)
- Analisis del sistema: [`docs/prompts/MEJORAS-SISTEMA.md`](docs/prompts/MEJORAS-SISTEMA.md)
- Indice general: [`docs/prompts/README.md`](docs/prompts/README.md)

### Check de estado
- [x] 10A tema + login azul
- [x] 10B0 infra PDF (`expo-print`, `pdfTemplates`, `pdf/reports.ts`)
- [x] 10B1–10B5 botones Exportar PDF (harinas, calibración, alertas, muro, equipo)
- [x] 10C pulido UI (ScreenHero, headers azules, dashboard/supervisor/operador/muro)
- [x] 10D trust proxy (`TRUST_PROXY=1` en `.env.example`)

---

## Preguntas abiertas (para cerrar implementacion hardware/red) — responder despues

Con las especificaciones de producto ya definidas (secado, tiempo, temperatura, humedad global, tres parejas de rubro, tres roles), faltan detalles tecnicos para cerrar contratos y firmware:

1) **Hardware exacto**: que sensores y actuadores usaran para **temperatura**, **humedad** y **ventilador** (modelo, rango, salida PWM o relé, etc.)?  
2) **Unidades y mapeo**: como se mide **nivel de secado** (0–100 % PWM, RPM, escalon fijo) y como se representa **tiempo de secado** (segundos desde inicio, ETA calculado, fase 1/2/3)?  
3) **Comunicacion Arduino ↔ backend**: protocolo y transporte (HTTP POST, MQTT, serial a gateway, etc.) y si el dispositivo elige el **grupo de rubro** por hardware fijo o por configuracion remota desde Supervisor/Gerente.

