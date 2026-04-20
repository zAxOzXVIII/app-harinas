# Plan de Sprints - App Harinas

Proyecto: **Nativa Superalimentos C.A**  
Stack: React Native (Expo) + TypeScript + Node.js + Express + MongoDB

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
- [x] App: navegacion por rol; **Gerente** tiene panel con **Equipo (CRUD)**, **Muro** (placeholder), preview Supervisor/Operador (placeholders); Supervisor y Operador ven pantalla base en blanco con cierre de sesion.

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
Dejar la app lista para pruebas internas y crecimiento, y preparar el salto al **modelo Arduino + roles Gerente/Supervisor/Operador** descrito en la seccion de especificaciones.

### Alcance sugerido
- Roles de usuario (`gerente`, `supervisor`, `operador`) alineados al producto: **Gerente** control total y equipo; **Supervisor** calibracion; **Operador** supervision.
- Mejoras UX (feedback, loaders, confirmaciones).
- Validaciones adicionales frontend/backend.
- Logging y manejo de errores mas robusto.
- Pruebas basicas de servicios y componentes criticos.
- Configuracion de build Android (Expo EAS) para distribucion interna.
- Documentar limitaciones actuales del modulo **harinas** frente al nuevo dominio **grupos de rubro** (para no mezclar conceptos en produccion).

---

## Sprint 5 - Roles Gerente/Supervisor/Operador + grupos de rubro + calibracion por pareja

### Contexto empresa
Nativa Superalimentos C.A. (Tucapé, Estado Táchira) requiere sustituir registros manuales por un sistema **Arduino + app** con trazabilidad y decisiones mas oportunas en despacho y proceso.

### Objetivo
Implementar el **modelo de datos y permisos** que refleja el negocio: parejas de materia prima como **grupos de rubro**, calibracion por Supervisor, lectura y alarmas por Operador, control total y registro de equipo por Gerente.

### Alcance
- **Seguridad y roles**:
  - roles en JWT: `gerente`, `supervisor`, `operador` (base de equipo y CRUD ya entregados para Gerente).
  - `supervisor`: CRUD de **calibraciones** y parametros globales (humedad comun); creacion de grupos de rubro.
  - `operador`: lectura de estado, historial de lecturas, alertas visuales; sin editar calibracion.
  - `gerente`: ya puede registrar equipo; extender permisos de negocio segun necesidad.
  - middleware `requireRole` y respuestas estandar (401/403/422/500).
- **Dominio “grupo de rubro”** (parejas fijas):
  1. Garbanzo + Lenteja  
  2. Platano + Cambur  
  3. Yuca + Batata  
  - cada grupo tiene **su propia calibracion** para: nivel de secado (ventilador), tiempo de secado, temperatura; humedad con **reglas globales** compartidas.
- **Persistencia de calibracion** (por grupo):
  - umbrales / escalas para **nivel de secado** (intensidad ventilador)
  - **tiempo de secado** (estimado o relativo: definir unidad en implementacion)
  - **temperatura** (min/max advertencia/critico segun politica)
  - **humedad**: parametros globales + lectura asociada (sensor unico o logica compartida)
- **Auditoria minima**: quien cambio calibracion y cuando.

### Entregables
- Backend: usuarios con rol, endpoints de calibracion por `grupoRubroId`, endpoint de config global de humedad.
- Frontend: navegacion **Gerente / Supervisor / Operador**; pantallas de calibracion (Supervisor) y monitoreo (Operador); Gerente con muro y vistas consolidadas cuando existan datos Arduino.

### Check de estado
- [x] Roles `gerente`/`supervisor`/`operador` en modelo y JWT (entrega base).
- [ ] Pantallas completas de Supervisor (grupos + calibracion T/HR) y Operador (alarmas, informes).
- [ ] Modelo `GrupoRubro` (o equivalente) con las tres parejas sembradas (seed).
- [ ] Calibracion persistida por grupo (secado, tiempo, temp) + humedad global.
- [ ] Auditoria de cambios de calibracion.

### Prompt listo para usar

```text
Iniciar Sprint 5 (roles + grupos de rubro + calibracion).
Implementa Supervisor vs Operador vs Gerente segun especificacion: Supervisor calibra T y HR y crea grupos; Operador supervision y alarmas; Gerente control total.
Modela tres grupos de rubro fijos (garbanzo/lenteja, platano/cambur, yuca/batata) con calibracion por grupo; humedad como configuracion global.
Expone API REST y actualiza la app con pantallas por rol.
Incluye auditoria de cambios de calibracion.
```

---

## Sprint 6 - Integracion Arduino (lecturas de proceso -> backend -> app)

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
- [ ] Contrato de telemetria definido y versionado en docs.
- [ ] Ingestion con validacion + anti-duplicados + rate limit.
- [ ] Telemetria asociada al `grupoRubro` correcto.
- [ ] UI operador muestra las cuatro dimensiones y estado vs calibracion.

### Prompt listo para usar

```text
Iniciar Sprint 6 (integracion Arduino + telemetria de proceso).
Define contrato Arduino->Backend para telemetria: nivel de secado (ventilador), tiempo de secado, temperatura, humedad; asociacion a grupo de rubro.
Implementa POST de ingestion con validacion, deduplicacion y rate limit.
Persiste ultimo estado e historial para la app operador.
Actualiza UI: vista por grupo y comparacion contra calibracion del Supervisor.
```

---

## Sprint 7 - Notificaciones y alertas (proceso + stock si aplica)

### Objetivo
Avisar al operador (y opcionalmente al Gerente) cuando las lecturas **salgan de los rangos calibrados** (temperatura, humedad, secado, tiempo) y mantener la linea de **stock critico** si el negocio sigue requiriendo inventario.

### Alcance
- **Algoritmo de monitoreo**:
  - evaluar telemetria vs calibracion por grupo (temp, nivel secado, tiempo)
  - humedad evaluada contra **politica global**
  - anti-spam: ultima alerta por tipo + ventana de tiempo
- **Notificaciones**:
  - POC con Expo Push Notifications
  - alertas in-app (lista/badges) como respaldo
- **UX**:
  - panel de alertas para operador; resumen para Gerente

### Entregables
- Alertas de proceso segun calibracion.
- Push POC + persistencia anti-spam.

### Check de estado
- [ ] Reglas de alerta alineadas a calibracion por grupo + humedad global.
- [ ] push notifications POC funcionando.
- [ ] anti-spam implementado y persistido.
- [ ] UI de alertas para operador (y opcional Gerente).

### Prompt listo para usar

```text
Iniciar Sprint 7 (alertas de proceso + push).
Implementa evaluacion de telemetria vs calibracion (temp, nivel secado, tiempo; humedad global) con anti-spam.
Integra Expo Push Notifications para operador.
Mantén o agrega alertas de stock minimo solo si el negocio lo sigue requiriendo; documenta la prioridad.
```

---

## Sprint 8 - Respaldo y seguridad de datos (backups + cifrado + hardening)

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
- [ ] Backup automatizado y rotacion configurada.
- [ ] Restore probado y documentado.
- [ ] Hardening aplicado (rate limit/CORS/headers/logs).
- [ ] Documentacion de seguridad y secretos.

### Prompt listo para usar

```text
Iniciar Sprint 8 (backups + cifrado + hardening).
Implementa una estrategia de backup automatizado (Atlas o mongodump) con retencion y pruebas de restauracion.
Asegura cifrado en transito y endurece la API (rate limit, CORS por ambiente, headers, logging seguro).
Documenta el proceso completo de backup/restore y politicas de secretos.
```

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

### Prompt listo para usar

```text
Iniciar Sprint 9 (deploy POC sin costos / costo minimo).
Despliega backend y conecta MongoDB Atlas free.
Gestiona variables de entorno y secretos en plataforma.
Documenta paso a paso el deploy y como configurar la app (EXPO_PUBLIC_API_URL) para pruebas.
Incluye advertencias y limitaciones del free tier.
```

---

## Preguntas abiertas (para cerrar implementacion hardware/red) — responder despues

Con las especificaciones de producto ya definidas (secado, tiempo, temperatura, humedad global, tres parejas de rubro, tres roles), faltan detalles tecnicos para cerrar contratos y firmware:

1) **Hardware exacto**: que sensores y actuadores usaran para **temperatura**, **humedad** y **ventilador** (modelo, rango, salida PWM o relé, etc.)?  
2) **Unidades y mapeo**: como se mide **nivel de secado** (0–100 % PWM, RPM, escalon fijo) y como se representa **tiempo de secado** (segundos desde inicio, ETA calculado, fase 1/2/3)?  
3) **Comunicacion Arduino ↔ backend**: protocolo y transporte (HTTP POST, MQTT, serial a gateway, etc.) y si el dispositivo elige el **grupo de rubro** por hardware fijo o por configuracion remota desde Supervisor/Gerente.

