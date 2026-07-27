# Entregas cliente — cola de grupos (prioridad por creación)

Documento para ejecutar el feedback de **LeanHerz (22/7/2026)** en el monorepo App-Harinas.

**Estado:** Partes 1–4 **implementadas** (jul 2026).

**Referencia del sistema:** [`GUIA-SISTEMA-COMPLETA.md`](GUIA-SISTEMA-COMPLETA.md) (§1 flujo, §5 pantallas, §6 modelos, §8 secado).  
**Entrega previa (✓ listo / papelera / fluctuaciones):** [`AGENTE-ENTREGAS.md`](AGENTE-ENTREGAS.md) — ya implementada; **no reabrir** ese alcance salvo bugs.

---

## Cómo usar este documento

1. Ejecuta **una parte por sesión** (no mezclar Parte 1 + Parte 2 en el mismo diff).
2. En cada sesión: pega **Parte 0** + la **Parte N** correspondiente.
3. Al terminar cada parte: corre la verificación de esa parte antes de pasar a la siguiente.
4. No modifiques firmware, `.env` reales ni credenciales en commits.
5. Cambio mínimo: reutilizar `GrupoRubro` + `ProcesoSecado` + telemetría existente (una sola “base”, datos distintos por stock).

### Orden obligatorio

| Orden | Parte | Qué hace | Depende de |
|-------|-------|----------|------------|
| 0 | Contexto | Lee el repo y el feedback | — |
| 1 | Backend cola + crear grupos | Modelo, orden FIFO, API crear, cola activa | Parte 0 |
| 2 | UI Gerente (Admin) | Crear grupo + lista en orden de creación | Parte 1 |
| 3 | UI Supervisor + Operador | Cascada “qué hacer”; calibra → inicia | Parte 1 |
| 4 | UX saludos + gráficas al iniciar | Quitar “Hola…”; gráficas al arrancar secado | Partes 2–3 |

> Parte 4 es independiente del modelo de cola, pero conviene hacerla al final para no mezclar diffs de API con polish de UI.

---

## Palabras del cliente (fuente)

> Grupo creado por el admin, grupo que los demás verán, orden de creación, no el más reciente, pero que una vez trabajado se borre, se quite de la lista del qué haceres, que se desplace y ponga el que sigue, según el orden con el que el admin los va creando, puede ser en cascada, o el primero como en los chats de face, pero grupo creado, grupo que se trabaja. Supervisor calibra, Operador despacha.
>
> Así no está creando base de datos para cada uno y solo pasa la función con los datos para cada stock.
>
> Los grupos Admin > Sup > Op
>
> Y que el Operador dé "iniciar" y todo comience a funcionar (que se muestre en las gráficas, no en la terminal).
>
> En las vistas quitar el "Hola 'Admin/Sup/Op'!" — o nada o solo el prefijo.

### Interpretación acordada (para el agente)

| Pedido | Significado técnico |
|--------|---------------------|
| Admin crea, los demás ven | Gerente `POST` grupo; Supervisor y Operador lo listan |
| Orden de creación, **no** el más reciente | `createdAt` **ascendente** (FIFO / más viejo arriba, como chat Face: el primero de la cola es el más antiguo pendiente) |
| Una vez trabajado → sale del “qué hacer” | Tras ciclo operativo (marcar ✓ listo, coherente con entrega previa) el grupo **deja de aparecer** en la cola activa; el siguiente sube |
| Cascada / Face | UI: el primero de la lista es el **siguiente a trabajar**; al salir uno, el resto se “desplaza” |
| No DB por stock | **Misma** colección `GrupoRubro` + mismos services; cada documento = un stock/lote de trabajo con sus datos |
| Admin > Sup > Op | Gerente crea → Supervisor calibra → Operador inicia/despacha |
| Iniciar → gráficas | Al `iniciar` secado, la app debe mostrar telemetría/tendencias en UI (Muro/cards), no depender de mirar terminal |
| Quitar “Hola …” | Sin saludo personal; o nada, o solo el prefijo de rol (`Gerente` / `Supervisor` / `Operador`) |

---

## Parte 0 — Contexto (pegar siempre al inicio)

```text
Proyecto: App Harinas — Nativa Superalimentos C.A.
Repo: monorepo App-Harinas.

ANTES DE CODIFICAR: lee docs/GUIA-SISTEMA-COMPLETA.md (§1, §5, §6, §8)
y docs/AGENTE-ENTREGAS-COLA-GRUPOS.md (este documento completo).

Stack:
- backend/  → Node.js + Express 5 + Mongoose + MongoDB
- frontend/ → Expo SDK 54 + React Native + TypeScript + Paper + Zustand

Roles JWT: gerente | supervisor | operador
Jerarquía de esta entrega: Gerente (Admin) crea → Supervisor calibra → Operador inicia/despacha

── Entorno oficial demo (Modo B — Venezuela) ──
- API:     https://app-harinas.onrender.com
- Health:  GET /api/health
- APK:     EXPO_PUBLIC_API_URL en frontend/eas.json (profile preview)
- Telemetría: POST /api/arduino/telemetry (ESP32 o gateway Uno)
- MongoDB: Atlas (solo backend; la app NO conecta directo a Atlas)
- NO usar ngrok en Venezuela

── Desarrollo local (Modo A) ──
- API: http://localhost:4000
- Telemetría prueba: cd backend && npm run simulate:telemetry
- App: EXPO_PUBLIC_API_URL en frontend/.env

── Estado ACTUAL del repo (antes de esta entrega) ──
- Solo 3 grupos fijos por seed: garbanzo-lenteja | platano-cambur | yuca-batata
- Modelo GrupoRubro.codigo tiene enum cerrado a esos 3
- NO existe POST crear grupo; solo GET + PUT calibración
- listGrupos ordena por nombre A→Z (NO por createdAt)
- Cola operador: GET /api/grupos-rubro?activos=true
  (oculta grupos ya confirmados listos por operador — entrega LeanHerz 11/7)
- Homes muestran: title={`Hola, ${user?.nombre}`} + roleLabel
- Gráficas en cards/Muro usan historial TelemetryEvent; no están gated al iniciar

── Ya implementado (NO romper) ──
- marcar-listo / archivar / pendientes-archivo
- fluctuaciones humedad + PDF
- Alertas solo si ProcesoSecado.estado === "en_secado"
- Archivar = soft delete; NO borrar TelemetryEvent ni ProcessAlert

── Credenciales demo ──
- Gerente:    admin@nativa.com / admin123
- Supervisor: supervisor@nativa.com / supervisor123
- Operador:   operador@nativa.com / operador123

── Convenciones ──
- Cambio mínimo; reutilizar services/stores existentes
- UNA sola colección GrupoRubro (no crear DB/colección por stock)
- Tests backend: npm test (en backend/)
- Types frontend: npx tsc --noEmit (en frontend/)
- No crear commits salvo que el usuario lo pida
- Actualizar docs/GUIA-SISTEMA-COMPLETA.md al cerrar cada parte relevante
```

---

## Parte 1 — Backend: grupos dinámicos + orden FIFO + cola

**Objetivo:** el gerente puede crear grupos; listados salen en orden de creación (viejo → nuevo); la cola “qué hacer” es esa cola FIFO filtrada por pendientes de trabajo.

```text
[Parte 0 ya pegada arriba]

Implementar Parte 1/4 — Backend: crear grupos + prioridad por orden de creación (FIFO).

## Feedback cliente (22/7/2026)
- Grupo creado por admin = grupo que ven los demás.
- Orden de creación: NO el más reciente primero → más viejo primero (FIFO / cascada).
- Una vez trabajado, sale del “qué hacer” y sube el siguiente.
- No crear base de datos por stock: mismo modelo/servicios, distintos documentos.

## Cambios de modelo (GrupoRubro)
1) Quitar (o ampliar) el enum rígido de `codigo` para permitir grupos creados por gerente.
   - Mantener códigos seed existentes como válidos.
   - Nuevo código: slug único derivado de nombre/items (o uuid corto) — unique.
2) Campos sugeridos al crear (mínimos):
   - nombre (requerido)
   - items: exactamente 2 rubros (mismo contrato actual) O documentar si se flexibiliza a 1–N
   - calibracion: defaults seguros (igual que seed)
   - createdBy (ObjectId User gerente) opcional pero útil
3) NO crear colección nueva por stock.
4) Seed: sigue siendo idempotente para los 3 demo; no debe borrar grupos creados por admin.

## API
1) POST /api/grupos-rubro
   - Rol: solo gerente
   - Body: { nombre, items: [a,b] } (+ calibración opcional)
   - Crea documento; respuesta 201

2) GET /api/grupos-rubro
   - Orden OBLIGATORIO: createdAt ASC (viejo → nuevo). Nunca sort por nombre como default de cola.
   - Roles: gerente, supervisor, operador (según rutas actuales)

3) GET /api/grupos-rubro?activos=true  (cola “qué hacer” operador)
   - Mismo orden FIFO createdAt ASC
   - Filtrar fuera los ya “trabajados” según regla vigente:
     * coherente con entrega previa: ocultar si hay ProcesoSecado confirmado listo
       (confirmadoListoPorOperador) aún no archivado, O el criterio de cola activa
       que ya usa getEmpaquetadoGrupoIds — NO inventar un segundo soft-delete.
   - Tras marcar listo, ese grupo sale; el siguiente en createdAt ASC queda primero.

4) PUT calibración: sin cambio de roles (supervisor + gerente).

## Services
- grupoRubro.service.js: createGrupo, listGrupos (sort createdAt: 1)
- Validar duplicados razonables (mismo nombre+items → 409 o permitir con código distinto — elige una y documenta)
- Tests:
  - crear como gerente OK
  - operador/supervisor POST → 403
  - list orden: A creado antes que B → A aparece primero aunque B se cree después
  - activos=true: tras marcar-listo, grupo sale; el siguiente queda primero
  - seed sigue OK; telemetría/archivar no se rompen

## Archivos probables
- backend/src/models/GrupoRubro.js
- backend/src/services/grupoRubro.service.js
- backend/src/controllers/grupoRubro.controller.js
- backend/src/routes/grupoRubro.routes.js
- backend/src/scripts/seedGrupos.js (no borrar grupos admin)
- backend/tests/grupos*.test.js (crear o extender)

## Verificación
- [x] npm test en backend/ — verde
- [x] POST grupo gerente → 201
- [x] GET lista orden createdAt ASC
- [x] GET ?activos=true FIFO y oculta trabajados
- [x] Sin colección nueva por stock

## Fuera de alcance
- UI (Partes 2–4)
- Cambiar firmware
- Notificaciones push
```

---

## Parte 2 — Frontend Gerente: crear grupo + lista FIFO

**Objetivo:** el admin crea el grupo; lo ve en lista ordenada de viejo a nuevo; supervisor/operador lo heredan vía API.

```text
[Parte 0 ya pegada arriba]

Implementar Parte 2/4 — UI Gerente: crear grupos (Admin → resto).

## Depende de
Parte 1 (POST /api/grupos-rubro + orden createdAt ASC).

## UI Gerente
1) En GruposListScreen (o pantalla “Nuevo grupo” modal):
   - FAB / botón “Crear grupo”
   - Form: nombre + 2 rubros (items) — alinear al contrato backend
   - onSuccess → refresh lista
2) Lista gerente: orden = orden del API (FIFO). NO re-ordenar por nombre en cliente.
3) Copy corto: “Orden de trabajo: del más antiguo al más nuevo.”
4) Acceso desde Dashboard si hace falta (solo si no hay ruta clara hoy).

## Capa datos
- services/grupos.service.ts → createGrupo
- store/grupos.store.ts → create + fetch sin sort local inverso
- types de GrupoRubro actualizados (codigo dinámico)

## Verificación
- [x] npx tsc --noEmit en frontend/
- [x] Gerente crea grupo → aparece al final de la cola (más nuevo abajo / último)
- [x] Supervisor ve el grupo nuevo al refrescar (sin poder crearlo)
- [x] Operador ve el grupo en cola activos cuando corresponda

## Fuera de alcance
- Cascada visual operador (Parte 3)
- Quitar “Hola” (Parte 4)
```

---

## Parte 3 — Frontend Supervisor + Operador: cascada “qué hacer”

**Objetivo:** Superv calibra → Op despacha; la lista se comporta como cola (Face / cascada): el primero pendiente es el foco; al terminar/trabajar, se desplaza y entra el siguiente.

```text
[Parte 0 ya pegada arriba]

Implementar Parte 3/4 — UI cola Supervisor + Operador (cascada FIFO).

## Depende de
Parte 1 (orden + activos). Parte 2 preferible (hay grupos que crear en demo).

## Flujo roles (Admin > Sup > Op)
1) Gerente ya creó el grupo (Parte 2).
2) Supervisor:
   - Ve lista FIFO
   - Calibra el grupo (PUT existente)
   - Copy: calibración antes de que el operador inicie
3) Operador:
   - Lista ?activos=true en orden FIFO (viejo primero)
   - El PRIMERO de la cola es el “siguiente a trabajar” (resaltar card / chip “Siguiente”)
   - Botón Iniciar secado → despacha el ciclo (timer, alertas, etc. ya existentes)
   - Tras completar + marcar listo (entrega previa): el grupo SALE de la lista;
     la UI al refresh muestra el siguiente como primero (cascada / Face)

## Reglas UX
- NO reordenar en cliente por nombre ni por “más reciente”.
- Pull-to-refresh en homes.
- Empty state operador: “No hay grupos pendientes. El gerente debe crear el siguiente.”
- No mostrar papelera al operador (regla ya vigente).

## Archivos probables
- SupervisorHomeScreen.tsx / GruposListScreen.tsx
- OperadorHomeScreen.tsx
- GrupoRubroCard.tsx (chip “Siguiente” opcional)
- grupos.store.ts / procesoSecado.store.ts

## Verificación
- [x] npx tsc --noEmit
- [x] Tres grupos A→B→C por createdAt: operador ve A primero
- [x] Tras marcar listo A: B queda primero
- [x] Supervisor calibra; operador inicia sin 403/errores

## Fuera de alcance
- Saludos (Parte 4)
- PDF / fluctuaciones (ya hechos)
```

---

## Parte 4 — UX: quitar “Hola…” + gráficas al iniciar

**Objetivo:** limpiar heroes de rol y que al pulsar Iniciar se note actividad en gráficas/UI (no en terminal).

```text
[Parte 0 ya pegada arriba]

Implementar Parte 4/4 — UX saludos + telemetría visible al iniciar.

## Feedback cliente
- Quitar "Hola 'Admin/Sup/Op'!" — o nada, o solo el prefijo (roleLabel).
- Operador da Iniciar y “todo comience a funcionar” en gráficas (no sacarles la terminal).

## Saludos (obligatorio)
En DashboardScreen, SupervisorHomeScreen, OperadorHomeScreen (ScreenHero):
- Quitar title={`Hola, ${user?.nombre ?? "..."}`}
- Opción A (preferida): title = texto de sección (“Inicio”, “Grupos en cola”, “Operación”)
  y mantener solo roleLabel (Gerente | Supervisor | Operador)
- Opción B: title vacío / omitir título y dejar solo roleLabel + subtitle útil
- NO mostrar el nombre del usuario en el hero salvo que ya exista en otro sitio (perfil)

## Gráficas al iniciar (obligatorio, cambio mínimo)
Al POST iniciar secado exitoso en OperadorHomeScreen:
1) Refresh inmediato de telemetría del grupo (latest + historial corto)
2) Si hay simulate:telemetry o hardware enviando, las cards/Muro deben actualizarse
   sin que el usuario mire consola del backend
3) Empty state de chart: copy claro tipo “Esperando lecturas del sensor…” 
   (no mencionar comandos npm al operador)
4) Muro gerente: si el empty state menciona `simulate:telemetry`, dejarlo solo
   en modo dev o suavizar copy para demo cliente

## Verificación
- [x] npx tsc --noEmit
- [x] Ningún home dice “Hola, …”
- [x] Prefijo de rol visible O título de sección sin saludo
- [x] Tras Iniciar, UI refresca gauges/tendencias (con telemetría activa)

## Fuera de alcance
- Cambiar contrato Arduino
- Push notifications
```

---

## Checklist final (todas las partes)

| # | Criterio | Parte | Estado |
|---|----------|-------|--------|
| 1 | Gerente puede crear grupo (POST) | 1–2 | ✅ |
| 2 | Lista orden `createdAt` ASC (viejo → nuevo) | 1–3 | ✅ |
| 3 | Cola “qué hacer”: al trabajar/✓ sale y sube el siguiente | 1, 3 | ✅ |
| 4 | Misma colección/servicios (no DB por stock) | 1 | ✅ |
| 5 | Flujo Admin crea → Sup calibra → Op inicia | 2–3 | ✅ |
| 6 | Sin saludo “Hola …” en homes | 4 | ✅ |
| 7 | Iniciar refleja actividad en gráficas/UI | 4 | ✅ |
| 8 | `npm test` backend verde | 1 | ✅ 47/47 |
| 9 | `npx tsc --noEmit` frontend OK | 2–4 | ✅ |
| 10 | Docs GUIA actualizada (grupos ya no “solo 3 fijos”) | 1–2 | ✅ |

### Pendiente operativo (después del código)

- [ ] Recompilar APK EAS para demo en teléfono
- [ ] Verificar Render tras push a `main`
- [ ] QA demo: crear 3 grupos en orden → calibrar → iniciar → ✓ → ver cascada

---

## Decisiones tomadas (Parte 1)

El cliente no aclaró estos puntos en el mensaje original; se implementó la opción **A** (default) de cada uno:

| Tema | Opción elegida |
|------|-----------------|
| ¿Cuántos items por grupo? | Se mantiene **2** rubros (mismo contrato que los 3 grupos seed) |
| ¿Qué es “trabajado” para salir de cola? | Tras **marcar ✓ listo** el operador (`confirmadoListoPorOperador`), igual que la entrega previa |
| ¿Reaparece el grupo tras archivar? | Sí: al archivar, el `GrupoRubro` vuelve a estar disponible para un nuevo `iniciar` (mismo documento, nuevo `ProcesoSecado`) |
| Orden visual | Más viejo **arriba** (estilo cola/Face); chip “Siguiente en la cola” en la primera tarjeta |
| Código de grupos nuevos | Slug generado del nombre (`buildUniqueCodigo`), con sufijo numérico si hay colisión |

## Resumen de implementación

### Parte 1 — Backend
- `GrupoRubro.js`: `codigo` ya no usa `enum` cerrado (permite grupos nuevos); nuevo campo `creadoPor`.
- `grupoRubro.service.js`: `listGrupos` ordena por `createdAt: 1` (antes por `nombre`); nuevo `createGrupo` con slug único.
- `grupoRubro.controller.js` / `routes`: `POST /api/grupos-rubro` (solo gerente), validaciones `nombre` + `items` (2).
- Tests: `grupos.test.js` — crear, rechazo por rol (403 operador/supervisor), validación (400), orden FIFO.
- `tests/helpers/testApp.js` y `setupAfterEnv.js`: se agregó `loginAsSupervisor` y seed de usuario supervisor para tests.

### Parte 2 — Frontend Gerente
- `GrupoFormScreen.tsx`: formulario nombre + 2 rubros → `POST` crear grupo.
- `GruposListScreen.tsx`: botón “Crear grupo” (solo gerente), copy de orden FIFO, chip de posición en cola.
- `grupos.service.ts` / `grupos.store.ts`: `create` / `createGrupo` (nuevo grupo se agrega al final de la cola en el store).
- Rutas: `GrupoCreate` en `GerenteStackParamList` y `GruposStackParamList`; registrada en `RootNavigator.tsx`.

### Parte 3 — Frontend Supervisor + Operador
- `GrupoRubroCard.tsx`: prop `queuePosition`, chip “Siguiente en la cola” / `#N en la cola`.
- `OperadorHomeScreen.tsx`: sección “Grupos por trabajar” con chip de posición por card; empty state sin mencionar comandos.

### Parte 4 — UX
- Quitado `Hola, {nombre}` de `DashboardScreen`, `SupervisorHomeScreen`, `OperadorHomeScreen`; ahora `title` es el nombre de la sección (“Inicio”, “Cola de grupos”, “Operación de secado”) y `roleLabel` sigue mostrando el rol.
- `handleIniciarSecado` (Operador) refresca telemetría/historial/activos de inmediato tras iniciar, para que las gráficas reaccionen sin mirar la terminal.
- `MuroGerenteScreen.tsx`: empty state de telemetría sin mencionar `npm run simulate:telemetry` (copy apto para cliente).

---

## Documentos relacionados

| Archivo | Uso |
|---------|-----|
| [`GUIA-SISTEMA-COMPLETA.md`](GUIA-SISTEMA-COMPLETA.md) | Arquitectura, pantallas, API |
| [`AGENTE-ENTREGAS.md`](AGENTE-ENTREGAS.md) | Entrega previa ✓ / papelera / fluctuaciones |
| [`OPERACION-LOCAL.md`](OPERACION-LOCAL.md) | Arranque Modo A |
| [`RENDER-DEPLOY.md`](RENDER-DEPLOY.md) | Deploy Modo B |

---

*Creado: julio 2026 — feedback LeanHerz 22/7/2026 (cola de grupos + UX).*
