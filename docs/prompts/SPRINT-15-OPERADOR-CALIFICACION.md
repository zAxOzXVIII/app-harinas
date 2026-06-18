# Sprint 15 — Control operador, alertas en secado y calificación de cierre

Estado: **implementado** (jun 2026).

Objetivo: completar el **nivel Operador** con control real del temporizador, alertas de temperatura/humedad **solo durante el secado activo**, y cierre del lote etiquetado como **listo** o **poco óptimo** según alertas no atendidas — retirando el grupo de pendientes en ambos casos.

Depende de: **Sprint 14** (`ProcesoSecado`, iniciar secado, ciclo de grupo).

---

## Prompt listo para usar

```text
Sprint 15 — Operador: control temporizador, alertas en secado y calificación de cierre.

## Contexto (feedback cliente — LeanHerz, jun 2026)

Correcciones necesarias en nivel Operador:

1. **Control del temporizador** — no solo ver chips informativos; el operador debe controlar el ciclo (inicio, seguimiento, cierre).
2. **Alertas según temperatura en tiempo real** durante el periodo de secado — las anomalías solo tienen sentido con secado en marcha.
3. **Etiquetar como listo o retirar de pendientes** los lotes gestionados; si hubo fallas de alerta **sin atender a tiempo**, describirlos (humedecido, quemado, tiempo excedido, producto poco óptimo).

## Alcance implementado

### A) Control del temporizador (UI)

- Countdown **restante** + tiempo **transcurrido** + meta (`duracionMin`).
- Botón **「Finalizar secado」** → `POST /api/procesos-secado/:id/completar`.
- Cierre automático al vencer `finalizaEn` (igual que Sprint 14).
- Polling **10 s** en vista operador mientras hay `en_secado` (telemetría + alertas).

Componentes: `SecadoTimer.tsx`, `OperadorHomeScreen.tsx`.

### B) Alertas en tiempo real durante secado

- `evaluateTelemetryEvent` solo emite si existe `ProcesoSecado` con `estado: en_secado`.
- Cada alerta de anomalía guarda `procesoSecadoId` del secado activo.
- En la card del grupo: `GrupoSecadoAlerts` — lista alertas no leídas del proceso con botón **「Atendida」** (`PATCH /api/alerts/:id/read`).
- Filtro API: `GET /api/alerts?grupoRubroId=&procesoSecadoId=&limit=`.

### C) Cierre inteligente: listo vs poco óptimo

Campos nuevos en `ProcesoSecado`:

| Campo | Descripción |
|-------|-------------|
| `resultado` | `listo` \| `poco_optimo` |
| `calificacion` | `quemado`, `humedecido`, `tiempo_excedido`, `temperatura_irregular`, `secado_irregular`, `alerta_sin_atender` |
| `descripcionCierre` | Texto legible para operador/gerente |
| `alertasPendientesAlCierre` | Conteo de alertas sin atender al cerrar |

**Regla de negocio al completar** (`completeProceso`):

- Busca alertas de anomalía (`temp_*`, `humedad_*`, `nivel_secado_fuera`, `tiempo_secado_exceso`) con `leida: false` vinculadas al proceso o creadas entre `iniciadoEn` y el cierre.
- **0 alertas pendientes** → `resultado: listo`, alerta `secado_completado` severidad `info`.
- **≥ 1 alerta pendiente** → `resultado: poco_optimo`, `calificacion` = peor tipo (prioridad: temp_critico > humedad_critico > tiempo_exceso > …), alerta `secado_completado` severidad `warning`.
- En ambos casos: `estado: revisado_empaquetado` → grupo sale de `GET /api/grupos-rubro?activos=true`.

**Mapa tipo alerta → calificación:**

| Tipo alerta | Calificación |
|-------------|--------------|
| `temp_critico` | quemado |
| `temp_fuera_rango` | temperatura_irregular |
| `humedad_critico` / `humedad_fuera` | humedecido |
| `tiempo_secado_exceso` | tiempo_excedido |
| `nivel_secado_fuera` | secado_irregular |

Utilidad backend: `backend/src/utils/calificacionSecado.js`  
Utilidad frontend: `frontend/src/utils/calificacionSecado.ts`

### D) UX operador al cerrar

Diálogo nativo tras cierre (timer o botón Finalizar):

- **Listo:** «Producto listo — secado sin incidencias».
- **Poco óptimo:** descripción con calificación (ej. «Posible quemado (1 alerta sin atender)»).

### E) Extra: reapertura de lote (gerente)

Incluido en la misma entrega para no bloquear nuevos ciclos:

- `POST /api/procesos-secado/grupo/:grupoRubroId/reabrir` (solo gerente).
- Archiva lote anterior (`estado: archivado`) y permite nuevo inicio.
- UI: acción **「Reabrir lote」** en banner de `CalibracionFormScreen` (lote cerrado).

## Criterios de aceptación (checklist)

- [x] Temporizador muestra restante + transcurrido + botón Finalizar secado.
- [x] Alertas de T/HR/nivel/tiempo solo durante `en_secado`.
- [x] Card operador muestra alertas activas con marcar Atendida.
- [x] Cierre sin alertas pendientes → `resultado: listo`.
- [x] Cierre con alertas sin atender → `poco_optimo` + calificación descriptiva.
- [x] Grupo retirado de lista activa tras cierre.
- [x] Tests `procesos-secado.test.js` (11 casos) + `npm run typecheck` frontend.
- [ ] QA manual APK: secado con telemetría fuera de rango → no atender → finalizar → ver poco óptimo.

## Fuera de alcance

- Pausar / reanudar temporizador.
- Clasificación ML o reglas custom por tipo de harina.
- Historial visible de lotes poco óptimos en pantalla operador (solo cierre + alertas/muro).

## Archivos clave

| Capa | Archivos |
|------|----------|
| Backend modelo | `ProcesoSecado.js` (+ resultado, calificacion, descripcionCierre) |
| Backend lógica | `procesoSecado.service.js`, `calificacionSecado.js` |
| Backend alertas | `processAlert.service.js` (procesoSecadoId, filtros list) |
| Backend API | `processAlert.routes.js`, `processAlert.controller.js` |
| Frontend UI | `SecadoTimer.tsx`, `GrupoSecadoAlerts.tsx`, `OperadorHomeScreen.tsx` |
| Frontend store | `procesoSecado.store.ts` (`completarSecado`) |
| Tests | `backend/tests/procesos-secado.test.js` |

## Diagrama de cierre

```
Secado en_secado
    │
    ├── Telemetría → alertas (si fuera de rango)
    │       └── Operador marca「Atendida」
    │
    └── Timer 0 o「Finalizar secado」
            │
            ├── Sin alertas pendientes → listo → sale de pendientes
            │
            └── Con alertas pendientes → poco_optimo + calificación
                    → sale de pendientes + alerta warning en muro
```

## Relación con Sprint 14

| Sprint 14 | Sprint 15 |
|-----------|-----------|
| Iniciar secado | Control timer + finalizar manual |
| Timer countdown básico | Restante + transcurrido + meta |
| Cierre → siempre «listo» | Cierre → listo **o** poco_optimo |
| Alertas siempre evaluadas | Alertas solo con secado activo |
| Chips informativos | Bloque alertas + atender en card |
```

---

## Checklist de cierre

- [x] Modelo `ProcesoSecado` extendido con resultado/calificación.
- [x] `completeProceso` evalúa alertas pendientes.
- [x] Alertas ligadas a `procesoSecadoId`.
- [x] Filtro `GET /api/alerts?grupoRubroId`.
- [x] `SecadoTimer` con finalizar + transcurrido.
- [x] `GrupoSecadoAlerts` en vista operador.
- [x] Diálogo de cierre listo / poco óptimo.
- [x] Reabrir lote (gerente).
- [x] Tests backend 11/11.
- [ ] QA manual en dispositivo.
