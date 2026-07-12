# Entregas cliente — prompts para implementación por partes

Documento para ejecutar cambios solicitados por **LeanHerz (11/7/2026)** en el monorepo App-Harinas.

**Referencia del sistema:** [`GUIA-SISTEMA-COMPLETA.md`](GUIA-SISTEMA-COMPLETA.md) (§1 flujo, §2 entornos, §6 modelos, §8 secado).

---

## Cómo usar este documento

1. Ejecuta **una parte por sesión** (no mezclar Parte 1 + Parte 2 en el mismo diff).
2. En cada sesión: pega **Parte 0** + la **Parte N** correspondiente.
3. Al terminar cada parte: corre verificación de esa parte antes de pasar a la siguiente.
4. No modifiques firmware, `.env` reales ni credenciales en commits.

### Orden obligatorio

| Orden | Parte | Qué hace | Depende de |
|-------|-------|----------|------------|
| 0 | Contexto | Lee el repo y entornos | — |
| 1 | Backend ✓ listo + 🗑 archivar | API y modelo | Parte 0 |
| 2 | UI operador + gerente | Pantallas y store | Parte 1 |
| 3 | API fluctuaciones humedad | Agregación diaria | Parte 0 |
| 4 | Panel supervisor | Pantalla + gráficos | Parte 3 |

> Las Partes 1–2 y 3–4 son independientes entre sí; puedes hacer 3–4 en paralelo solo si 1–2 ya están estables.

---

## Parte 0 — Contexto (pegar siempre al inicio)

```text
Proyecto: App Harinas — Nativa Superalimentos C.A.
Repo: monorepo App-Harinas.

ANTES DE CODIFICAR: lee docs/GUIA-SISTEMA-COMPLETA.md (§1, §2, §8).

Stack:
- backend/  → Node.js + Express 5 + Mongoose + MongoDB
- frontend/ → Expo SDK 54 + React Native + TypeScript + Paper + Zustand

Roles JWT: gerente | supervisor | operador
Grupos fijos (seed): garbanzo-lenteja | platano-cambur | yuca-batata

── Entorno oficial demo (Modo B — Venezuela) ──
- API:     https://app-harinas.onrender.com
- Health:  GET /api/health
- APK:     EXPO_PUBLIC_API_URL en frontend/eas.json (profile preview)
- Telemetría: POST /api/arduino/telemetry (ESP32 o gateway Uno)
- MongoDB: Atlas (solo backend; la app NO conecta directo a Atlas)
- Requiere internet en teléfono y hardware
- NO usar ngrok en Venezuela (ERR_NGROK_9040)

── Desarrollo local (Modo A) ──
- API: http://localhost:4000
- Telemetría prueba: cd backend && npm run simulate:telemetry
- App: EXPO_PUBLIC_API_URL en frontend/.env

── Reglas de negocio ──
- App móvil NUNCA habla con Arduino; solo REST + JWT al backend
- TelemetryEvent se guarda siempre que llegue al API (24/7 si hay gateway/ESP)
- Alertas de anomalía SOLO si ProcesoSecado.estado === "en_secado"
- Archivar/retirar lotes = soft delete; NO borrar TelemetryEvent ni ProcessAlert

── Estado actual secado (antes de Parte 1) ──
- Operador: iniciar → en_secado → finalizar → revisado_empaquetado
- Grupo oculto al operador vía GET /api/grupos-rubro?activos=true
- Gerente puede reabrir lote (archiva el anterior)
- NO existe aún: confirmación explícita operador (✓) ni papelera gerente

── Credenciales demo ──
- Gerente:    admin@nativa.com / admin123
- Supervisor: supervisor@nativa.com / supervisor123
- Operador:   operador@nativa.com / operador123

── Convenciones ──
- Cambio mínimo; reutilizar services/stores existentes
- Tests backend: npm test (en backend/)
- Types frontend: npx tsc --noEmit (en frontend/)
- No crear commits salvo que el usuario lo pida
```

---

## Parte 1 — Backend: operador marca listo + gerente archiva

**Objetivo:** separar “secado terminado” de “operador confirmó listo” y permitir al gerente archivar sin perder historial.

```text
[Parte 0 ya pegada arriba]

Implementar Parte 1/4 — Backend: flujo operador ✓ listo → gerente archiva lote.

## Feedback cliente
- Operador marca el lote con ✓ (listo para empaquetar).
- Gerente ve papelera solo en lotes ya confirmados por operador.
- Archivar NO elimina telemetría ni alertas (solo estado archivado).

## Cambios backend

### Modelo ProcesoSecado (backend/src/models/ProcesoSecado.js)
Agregar campos:
- confirmadoListoPorOperador: Boolean, default false
- confirmadoListoEn: Date
- confirmadoListoPor: ObjectId ref User

### Endpoints nuevos (procesoSecado.routes.js + service + controller)

1) POST /api/procesos-secado/:id/marcar-listo
   - Rol: operador
   - Precondición: estado revisado_empaquetado (secado ya cerrado)
   - Acción: confirmadoListoPorOperador=true, confirmadoListoEn=now, confirmadoListoPor=userId
   - 409 si ya confirmado; 403 si no es operador

2) POST /api/procesos-secado/:id/archivar  (o DELETE con soft archive)
   - Rol: gerente
   - Precondición: confirmadoListoPorOperador === true
   - Acción: estado → archivado (NO deleteMany en TelemetryEvent/ProcessAlert)
   - 409 si no confirmado por operador

3) GET /api/procesos-secado/pendientes-archivo
   - Rol: gerente
   - Lista: revisado_empaquetado + confirmadoListoPorOperador + estado !== archivado

### Ajustar filtros
- getEmpaquetadoGrupoIds / listGrupos activos=true:
  ocultar al operador cuando confirmadoListoPorOperador (no solo revisado_empaquetado)
- Revisar coherencia con reabrir lote existente (gerente)

## Archivos probables
- backend/src/models/ProcesoSecado.js
- backend/src/services/procesoSecado.service.js
- backend/src/services/grupoRubro.service.js
- backend/src/controllers/procesoSecado.controller.js
- backend/src/routes/procesoSecado.routes.js
- backend/tests/procesos-secado.test.js

## Verificación (obligatoria antes de cerrar)
- [ ] npm test en backend/ — verde
- [ ] Test: marcar-listo OK como operador
- [ ] Test: archivar OK como gerente tras chulito
- [ ] Test: archivar sin chulito → 409
- [ ] Test: operador no puede archivar → 403
- [ ] Confirmar que TelemetryEvent no se borra al archivar

## Fuera de alcance
- Cambios de UI (Parte 2)
- Fluctuaciones humedad (Partes 3–4)
```

---

## Parte 2 — Frontend: ✓ operador + 🗑 gerente

**Objetivo:** UI del flujo definido en Parte 1.

```text
[Parte 0 ya pegada arriba]

Implementar Parte 2/4 — UI: chulito operador + papelera gerente.

## Depende de
Parte 1 desplegada (endpoints marcar-listo, archivar, pendientes-archivo).

## UI Operador (OperadorHomeScreen.tsx)
Cuando proceso.estado === revisado_empaquetado Y !confirmadoListoPorOperador:
- Chip "Secado finalizado" + resultado (listo / poco_optimo)
- Botón icon check-circle: "Marcar como listo"
- onPress → POST marcar-listo → Alert éxito → refresh (activosOnly: true)
- Tras confirmar, la card desaparece de la lista operador

Operador NO debe ver icono de papelera.

## UI Gerente
Nueva sección en DashboardScreen.tsx O pantalla LotesPendientesArchivoScreen.tsx:
- GET pendientes-archivo al focus
- Lista: grupo, resultado, fecha confirmación, operador
- Botón delete-outline con confirmación:
  "Archivar lote. Los registros históricos se conservan."
- onPress → POST archivar → quitar de lista

Registrar ruta en RootNavigator si creas pantalla nueva.

## Capa datos frontend
- types/procesoSecado.ts — campos confirmación
- services/procesoSecado.service.ts — marcarListo, fetchPendientesArchivo, archivarLote
- store/procesoSecado.store.ts — acciones anteriores

## Verificación
- [ ] npx tsc --noEmit en frontend/ — sin errores
- [ ] Flujo manual: finalizar secado → marcar listo (operador) → ver papelera (gerente) → archivar
- [ ] Gerente no ve papelera antes del chulito
- [ ] Operador no ve papelera

## Fuera de alcance
- Partes 3–4 (fluctuaciones)
```

---

## Parte 3 — Backend: fluctuaciones de humedad por día

**Objetivo:** API de registro agregado diario para el panel supervisor (humedad 24/7).

```text
[Parte 0 ya pegada arriba]

Implementar Parte 3/4 — API fluctuaciones de humedad por día.

## Feedback cliente
- Mantener registro de fluctuaciones 24/7 (humedad determinante; horno manual fuera de MVP).
- Datos persisten aunque se archive un lote (Parte 1).

## Endpoint nuevo
GET /api/telemetry/fluctuaciones/humedad
Auth: supervisor, gerente

Query:
- from (ISO date, default: hoy - 7 días)
- to   (ISO date, default: hoy)
- grupoRubroId (opcional)

Respuesta por día + grupo:
{
  grupoRubroId, nombreGrupo, fecha,
  lecturas, humedadMin, humedadMax, humedadPromedio,
  fueraRango, critico,
  umbrales: { min, max, criticoMin, criticoMax }  // HumedadConfig
}

## Implementación
- Agregación MongoDB sobre TelemetryEvent
- Agrupar por $dateToString(timestamp) + grupoRubroId
- fueraRango: lecturas fuera de HumedadConfig min/max
- critico: fuera de criticoMin/criticoMax
- Índice si falta: { grupoRubroId: 1, timestamp: -1 }

## Archivos probables
- backend/src/services/telemetry.service.js
- backend/src/controllers/telemetry.controller.js
- backend/src/routes/telemetry.routes.js
- backend/tests/telemetry.test.js
- backend/docs/arduino-telemetry-contract.md (nota ingesta continua 24/7)

## Verificación
- [ ] npm test en backend/ — casos agregación
- [ ] Con simulate:telemetry devuelve buckets diarios
- [ ] Archivar ProcesoSecado no altera conteos históricos

## Fuera de alcance
- UI supervisor (Parte 4)
```

---

## Parte 4 — Frontend: panel supervisor fluctuaciones

**Objetivo:** pantalla visual del registro diario de humedad.

```text
[Parte 0 ya pegada arriba]

Implementar Parte 4/4 — Panel Supervisor: fluctuaciones humedad por día.

## Depende de
Parte 3 (GET /api/telemetry/fluctuaciones/humedad).

## Pantalla nueva
FluctuacionesHumedadScreen.tsx

Entrada desde SupervisorHomeScreen.tsx:
- Card "Registro de fluctuaciones" icon chart-timeline-variant o water-percent
- navigate → FluctuacionesHumedad

Contenido:
- Selector rango: Hoy | 7 días | 30 días (mapea from/to)
- Filtro opcional por grupo de rubro
- Cards por día (reciente arriba):
  - Fecha legible
  - Min / Max / Promedio %RH
  - Chips: N lecturas | X fuera de rango | Y críticas
  - Mini sparkline o banda umbral (reutilizar ChartTrendBlock si encaja)
- Pull-to-refresh
- Empty state: "Activa el gateway o ESP32 para registrar humedad 24/7"

Solo roles supervisor y gerente (Preview gerente OK).

## Capa datos
- services/telemetry.service.ts → fetchFluctuacionesHumedad
- types/telemetry.ts → tipos respuesta
- RootNavigator: ruta en stack supervisor

## Copy UI (demo)
"Registro continuo de humedad — referencia diaria para calibración y trazabilidad."

## Verificación
- [ ] npx tsc --noEmit en frontend/
- [ ] Datos coinciden con API Parte 3
- [ ] Operador NO accede a esta pantalla
- [ ] Contraste legible (useContrastStyles)

## Opcional MVP+
- Botón export PDF (pdf/reports.ts) — solo si queda tiempo
```

---

## Checklist final (todas las partes)

| # | Criterio | Parte |
|---|----------|-------|
| 1 | Operador marca ✓ listo tras secado cerrado | 1–2 |
| 2 | Gerente ve 🗑 solo tras ✓ operador | 1–2 |
| 3 | Archivar conserva TelemetryEvent y ProcessAlert | 1 |
| 4 | Grupo vuelve disponible tras archivar/reabrir | 1–2 |
| 5 | API fluctuaciones devuelve buckets diarios | 3 |
| 6 | Supervisor ve registro por día con umbrales | 4 |
| 7 | `npm test` backend verde | 1, 3 |
| 8 | `npx tsc --noEmit` frontend OK | 2, 4 |
| 9 | Funciona contra Render (Modo B) sin cambiar URLs hardcodeadas incorrectas | todas |

---

## Documentos relacionados

| Archivo | Uso |
|---------|-----|
| [`GUIA-SISTEMA-COMPLETA.md`](GUIA-SISTEMA-COMPLETA.md) | Arquitectura, entornos, pantallas, API |
| [`OPERACION-LOCAL.md`](OPERACION-LOCAL.md) | Arranque Modo A |
| [`RENDER-DEPLOY.md`](RENDER-DEPLOY.md) | Deploy Modo B |
| [`MONTAJE-HARDWARE-UNO-ESP12F.md`](MONTAJE-HARDWARE-UNO-ESP12F.md) | Gateway Uno → Render |

---

*Última actualización: julio 2026 — feedback LeanHerz, alineado a GUIA §2 (Render + Atlas).*
