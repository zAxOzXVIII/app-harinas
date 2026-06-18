# Sprint 14 — Temporizador de secado del operador + ciclo de vida del grupo

Estado: **implementado** (jun 2026).

Objetivo: cerrar el flujo operativo real de la planta. Hoy el operador solo **ve** telemetría y chips informativos (secado %, minutos, hora), pero **no puede iniciar el secado**. Sin ese “time set” no arranca la medición en tiempo real con sentido de proceso, las alertas no se evalúan en contexto y los grupos se estancan en pantalla.

---

## Prompt listo para usar

```text
Iniciar Sprint 14 — Temporizador de secado del operador y cierre de ciclo de grupo.

## Contexto de negocio (feedback cliente — LeanHerz, 15/6/2026)

Flujo esperado en planta:
1. Se crea / configura el grupo (pareja de rubros).
2. El **supervisor** calibra (temperatura, nivel de secado, tiempo estimado).
3. El **operador** hace su único trabajo interactivo: **dar inicio al secado** y **ver transcurrir el tiempo** mientras espera que sequen los productos.
4. Durante el secado activo, si ocurren anomalías (T, HR, nivel, tiempo excedido), las **alertas ya implementadas** deben notificar — pero eso solo tiene sentido cuando el proceso está **en marcha**.
5. Al **finalizar el temporizador**, el lote debe registrarse como **tarea realizada** en:
   - listado de **alertas** (tipo informativo / éxito, distinto de warning/critical)
   - **muro de notificaciones del gerente**
6. Los grupos **no deben estancarse** en la vista operador: al completar el ciclo deben **salir solos** de la lista activa o quedar claramente etiquetados como **revisado / empaquetado**, para evitar que alguien vuelva a “actualizar” un grupo que ya terminó (paradoja operativa).

Problema actual en APK (Vista Operador):
- En cada card de grupo, al pie hay chips: `Secado X%`, `N min`, `hora`.
- **Falta el botón de inicio** junto a esos chips — es la única interacción que necesita el operador.
- Sin inicio de secado no hay ciclo de medición en tiempo real útil para evaluar la app “en todo su esplendor”.
- Gestión de harinas / grupos activos no distingue lotes ya terminados → riesgo de editar productos ya empaquetados.

## Stack y archivos de referencia

- Monorepo App-Harinas (backend Express + Mongoose, frontend Expo 54 + Paper + Zustand).
- Vista operador: `frontend/src/screens/OperadorHomeScreen.tsx` (chips en `lastRow`, sin acción).
- Calibración supervisor: `GrupoRubro.calibracion.tiempoSecado.estimadoMin` en `backend/src/models/GrupoRubro.js`.
- Alertas proceso: `backend/src/models/ProcessAlert.js`, `processAlert.service.js` (tipos actuales: temp_*, humedad_*, nivel_secado_fuera, tiempo_secado_exceso).
- Muro gerente: `frontend/src/screens/MuroGerenteScreen.tsx`.
- Telemetría: `POST /api/arduino/telemetry`, evaluación en `evaluateTelemetryEvent`.
- Roles: operador inicia secado; supervisor calibra; gerente ve muro + alertas.

## Alcance funcional

### A) Modelo de sesión de secado (backend)

Crear entidad `ProcesoSecado` (o extensión documentada en `GrupoRubro`) con al menos:

| Campo | Descripción |
|-------|-------------|
| `grupoRubroId` | ref GrupoRubro |
| `estado` | `pendiente` \| `en_secado` \| `completado` \| `revisado_empaquetado` |
| `iniciadoPor` | ref User (operador) |
| `iniciadoEn` | Date |
| `duracionMin` | copiado de calibración al iniciar (snapshot) |
| `finalizaEn` | calculado: iniciadoEn + duracionMin |
| `completadoEn` | Date cuando termina |
| `telemetryEventIdInicio` | opcional, primera lectura tras inicio |

Reglas:
- Solo **un secado activo** (`en_secado`) por `grupoRubroId` a la vez.
- `duracionMin` toma `grupo.calibracion.tiempoSecado.estimadoMin` al pulsar Inicio (si supervisor cambia calibración después, no afecta la sesión abierta).
- Al llegar `finalizaEn`, transición automática a `completado` (job/cron ligero o chequeo en lectura de API).

### B) API REST

| Método | Ruta | Rol | Acción |
|--------|------|-----|--------|
| POST | `/api/procesos-secado/:grupoRubroId/iniciar` | operador | Crea sesión `en_secado`, devuelve timer |
| GET | `/api/procesos-secado/activos` | operador, supervisor, gerente | Lista sesiones en curso + tiempo restante |
| GET | `/api/procesos-secado/:grupoRubroId/actual` | autenticado | Estado actual del grupo |
| POST | `/api/procesos-secado/:id/completar` | operador (o sistema) | Marca completado si aún en curso |
| POST | `/api/procesos-secado/:id/marcar-empaquetado` | operador o supervisor | `revisado_empaquetado` |
| GET | `/api/grupos-rubro` | — | **Filtrar** por query `?activos=true` excluyendo `revisado_empaquetado` en vista operador |

Validaciones:
- No iniciar si ya hay `en_secado` para ese grupo.
- No iniciar si último estado es `revisado_empaquetado` (409 + mensaje claro).
- Requiere calibración válida (`tiempoSecado.estimadoMin > 0`).

### C) UI Operador (`OperadorHomeScreen`)

En la fila de chips del pie de cada card (junto a secado %, minutos, hora):

**Estado `pendiente` (sin sesión activa):**
- Botón primario **「Iniciar secado」** (única interacción del operador).
- Texto auxiliar: duración estimada según calibración (ej. «90 min»).

**Estado `en_secado`:**
- Reemplazar botón por **temporizador en vivo** (countdown o elapsed + restante).
- Chips existentes siguen mostrando telemetría.
- Indicador visual «Secando…» (chip o banner sutil).
- Opcional: deshabilitar segundo inicio.

**Estado `completado` / `revisado_empaquetado`:**
- **No mostrar** la card en lista principal del operador (preferido), O
- Mostrar con chip **「Revisado / Empaquetado」** en gris y sin botón de inicio (fallback si gerente quiere historial).

Polling: refrescar timer cada 1s en cliente + re-sync con API cada 30s.

### D) Integración alertas y muro (al completar)

Nuevo tipo de alerta (o evento de muro):

- `tipo`: `secado_completado` (o `tarea_realizada`)
- `severidad`: `info` / `success` (extender enum si hace falta; hoy solo critical/warning)
- `mensaje`: ej. «Garbanzo y Lenteja: secado finalizado — listo para revisión/empaquetado»
- Visible en **AlertsList** del operador y gerente.
- Push notification al gerente (reutilizar `notifyNewProcessAlert` o canal de muro).
- Entrada en **MuroGerenteScreen** como evento positivo de ciclo cerrado (no mezclar con alertas críticas).

**Importante:** las alertas de anomalía (T, HR, etc.) solo deben evaluarse / mostrarse con prioridad cuando `estado === en_secado` para ese grupo (o al menos no spamear antes de inicio). Documentar decisión en código.

### E) Ciclo de vida y anti-paradoja

Evitar que un grupo ya terminado vuelva a editarse sin querer:

1. Al completar temporizador → auto `revisado_empaquetado` **o** paso intermedio `completado` + acción explícita «Marcar empaquetado».
2. Vista operador: **ocultar** grupos `revisado_empaquetado` de «Grupos calibrados».
3. Vista supervisor (calibración): si grupo empaquetado, mostrar banner **「Lote cerrado»** y bloquear `PUT calibracion` hasta nuevo ciclo (o botón gerente «Reabrir lote» — fuera de MVP si complica).
4. Gestión de harinas (si aplica al mismo lote): no permitir edición/borrado confuso en ítems ligados a grupo empaquetado — al menos warning en UI.

Cliente pidió explícitamente: «en vez de buscar y borrarlos, que se desplieguen por sí solos».

### F) Telemetría y tiempo real

- Tras `iniciar`, las lecturas Arduino siguen entrando igual; `evaluateTelemetryEvent` compara contra calibración.
- El chip `tiempoSecado` de telemetría (si viene del sensor) es **informativo**; el **timer de app** es la fuente de verdad del operador para el ciclo de planta.
- Mostrar coherencia: «Tiempo app: 45:00 restantes» vs «Sensor: 45 min» si ambos existen.

### G) Seeds y pruebas

- `seed:demo`: al menos un grupo `pendiente`, uno `en_secado` a mitad, uno `revisado_empaquetado`.
- Tests backend:
  - iniciar secado OK (operador)
  - doble inicio → 409
  - iniciar en empaquetado → 409
  - completar → crea alerta `secado_completado`
  - listado operador excluye empaquetados
- `npm run typecheck` frontend sin errores.

## Criterios de aceptación (checklist)

- [x] Operador ve botón **Iniciar secado** junto a chips de hora/secado/tiempo en cada card activa.
- [x] Al iniciar, temporizador visible y actualizado en tiempo real hasta `duracionMin`.
- [x] Durante `en_secado`, alertas de anomalía siguen funcionando (T, HR, etc.) — solo si hay secado activo.
- [x] Al finalizar timer: alerta/muro de **tarea realizada** para gerente y operador (`secado_completado`).
- [x] Grupo sale de lista activa del operador (`?activos=true`).
- [x] No se puede iniciar secado en grupo ya empaquetado.
- [x] Supervisor no puede recalibrar grupo cerrado (409 + banner en UI).
- [x] Tests backend + typecheck verdes.
- [ ] QA manual en APK: flujo completo crear → calibrar → iniciar → esperar → completar → ver muro/alertas.

> **Sprint 15** extiende el cierre con calificación `listo` / `poco_optimo`. Ver [SPRINT-15-OPERADOR-CALIFICACION.md](./SPRINT-15-OPERADOR-CALIFICACION.md).

## Fuera de alcance (MVP)

- Pausar / reanudar secado.
- Múltiples lotes paralelos del mismo grupo de rubro (solo una sesión activa por grupo).
- Integración PWM ventilador desde app (fase firmware posterior).

## Referencia visual

Capturas QA (jun 2026):
- Vista Operador: cards con chips `Secado %`, `N min`, `hora` — **añadir botón Inicio en esa misma fila**.
- Gestión de Harinas: listado CRUD separado; no confundir con grupos de rubro, pero alinear reglas de «lote cerrado» si hay vínculo futuro harina↔grupo.

## Orden sugerido de implementación

1. Modelo + migración `ProcesoSecado` + servicio + rutas.
2. Extender `ProcessAlert` (tipo `secado_completado`, severidad info).
3. Hook/store frontend `useProcesoSecado` + API client.
4. UI `OperadorHomeScreen` (botón + timer).
5. Filtro grupos activos + etiqueta empaquetado.
6. Muro + push al completar.
7. Tests + seed + QA APK.
```

---

## Diagrama de flujo

```
Supervisor calibra grupo
        │
        ▼
Operador ve card (pendiente)
        │
        ├── [Iniciar secado] ──► estado: en_secado
        │         │
        │         ├── telemetría + alertas anomalía (ya existente)
        │         │
        │         └── timer llega a 0
        │                   │
        │                   ▼
        │         secado_completado → Alertas + Muro gerente
        │                   │
        │                   ▼
        └── grupo oculto o etiqueta «Revisado/Empaquetado»
```

## Archivos probables a tocar

| Capa | Archivos |
|------|----------|
| Backend modelo | `backend/src/models/ProcesoSecado.js` (nuevo) |
| Backend | `services/procesoSecado.service.js`, `controllers/`, `routes/` |
| Alertas | `ProcessAlert.js`, `processAlert.service.js`, `pushNotification.service.js` |
| Frontend store | `store/procesoSecado.store.ts` (nuevo) |
| Frontend UI | `OperadorHomeScreen.tsx`, posible `SecadoTimerChip.tsx` |
| Gerente | `MuroGerenteScreen.tsx`, `AlertsListScreen.tsx` |
| Tipos | `frontend/src/types/procesoSecado.ts`, `alert.ts` |
| Docs | `SPRINTS.md`, `00-CONTEXTO.md` (rol operador) |
