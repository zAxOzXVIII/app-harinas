# Entrega — quitar grupos, roles claros y lecturas vía Render (laptop)

Documento para el feedback de **LeanHerz (17/8/2026)** en el monorepo App-Harinas.

**Estado:** pendiente de implementar (este archivo es el brief + respuestas).  
**No implementar todavía** salvo que se pida en otra sesión: primero alinear interpretación.

**Referencias:** [`GUIA-SISTEMA-COMPLETA.md`](GUIA-SISTEMA-COMPLETA.md) · [`AGENTE-ENTREGAS.md`](AGENTE-ENTREGAS.md) · [`AGENTE-ENTREGAS-COLA-GRUPOS.md`](AGENTE-ENTREGAS-COLA-GRUPOS.md) · [`MONTAJE-HARDWARE-UNO-ESP12F.md`](MONTAJE-HARDWARE-UNO-ESP12F.md) (Ruta B USB).

---

## 1. Palabras del cliente (fuente)

> Pq no le entiendo bien lo de los grupos, no encasilla los que el gerente hace, tipo, te creo que al crear un grupo te de el nombre y te salgan los paquetes que ha creado el gerente, pero eso no aplica aqui muy bien me parece, que lo que hizo el gerente lo vean los demás y se trabaje con eso nah e grupos que me imagino son los que ve el operador, es por eso que el operador tiene toda esa lista D':

> Ste no lo había pillado. Sí al poner Cambir se adjunta lo que creo el gerente con el nombre Cambir' xd te creo. pero naaa es mejor hacerlo directo,. No sé si le estoy poniendo más líneas o menos de code pero..

> Se calibra aquí directamente (lo que haya hecho el gerente)

> Y el Operador acciona

> De esto hablaremos cuando ste aquí, pero supongo que es cuando se termina el secado y se retira como lote listo y talfa

> La conexión al Arduino? Es aquí donde decimos que no usaremos WiFi v:

> Quite lo de grupos que sea directo y pillemos para acomodar esas lecturas, ya que no usaremos WiFi pq le saldrán hijos a nuestras cabezas..

---

## 2. Respuestas (para LeanHerz / el equipo)

### ¿Por qué hay “grupos” y por qué el operador ve una lista larga?

Hoy en código hay **dos cosas distintas** que se mezclan en la cabeza:

| En la app | Qué es de verdad | Ejemplo en tus capturas |
|-----------|------------------|-------------------------|
| **Harinas** (Inicio → Gestión de harinas) | Inventario: un producto que **creó el gerente** (nombre, tipo, kg, fecha) | Card **“Cambir”**, 20 kg, tipo Calidad |
| **Grupos de rubro** (Calibración / cola operador) | Receta de secado: pareja de rubros + T° + tiempo + cola FIFO | “Garbanzo y Lenteja”, “Nuevo grupo”, chip “Siguiente en la cola” |

LeanHerz creyó que **crear un grupo** = “lo que hizo el gerente (Cambir) lo ven los demás”.  
Eso **sí aplica a Harinas**, no a Grupos.

- **Cambir** no es un grupo: es una **harina** del inventario.  
- Los grupos son otra capa (garbanzo-lenteja, etc.) que el operador ve como **lista de qué hacer**. Por eso “el operador tiene toda esa lista”.

**Decisión de esta entrega:** quitar esa capa de grupos en la UX. Flujo **directo**:

1. Gerente registra / calibra lo que hay que secar (sobre lo que él creó).  
2. Operador **acciona** (iniciar / finalizar / marcar listo).  
3. No hay cola de “Nuevo grupo” ni chips “#N en la cola”.

### “Se calibra aquí directamente (lo que haya hecho el gerente)”

Sí. Calibración (T°, humedad, tiempo) debe aplicarse **al trabajo del gerente**, no a un grupo abstracto aparte.

Hoy: Calibración edita `GrupoRubro` (pareja fija o creada).  
Pedido: calibrar **directo** sobre el lote/producto que el gerente ya creó (p. ej. Cambir), y que supervisor/operador vean **eso**.

### “Y el Operador acciona”

El operador **no crea** recetas ni inventario. Solo:

- ver lecturas (T° / HR)  
- **Iniciar secado**  
- **Finalizar**  
- **Marcar como listo** (✓)

### “Cuando se termina el secado y se retira como lote listo”

Eso **ya existe** (entrega 11/7): operador ✓ listo → gerente ve papelera **Lotes pendientes** y archiva. No borra telemetría.  
Se deja como está; se habla en persona el copy (“talfa” / retirar lote).

### “La conexión al Arduino? no usaremos WiFi”

Correcto para esta etapa: **Ruta B**.

```
Sensores (AHT10 + DS3231)
    → Arduino Uno (USB)
    → laptop (gateway npm start)
    → POST https://app-harinas.onrender.com/api/arduino/telemetry
    → MongoDB Atlas
    → App (GET /api/telemetry/*)
```

- La app **nunca** habla con el Arduino ni con Wi‑Fi del ESP-12F.  
- La laptop debe estar encendida con el gateway.  
- El teléfono solo necesita internet a Render.  
- ESP-12F / Wi‑Fi de placa: **fuera de alcance** (evita el dolor de boot, 3.3 V, etc.).

### “Hacerlo directo: ¿más o menos código?”

**Menos UX, no necesariamente menos backend de golpe.**  
Quitar grupos de la UI es el corte. Unificar Harina + calibración + secado en un solo documento es el refactor (más adelante, por partes).  
No crear colección nueva por stock: misma base Atlas `app_harinas`.

---

## 3. Usuarios demo (hoy en código)

En JWT el rol técnico de “admin” es **`gerente`**. El email es `admin@nativa.com`.

| Cómo lo llama LeanHerz | Rol en código | Email | Contraseña |
|------------------------|---------------|-------|------------|
| **Admin / Gerente** | `gerente` | `admin@nativa.com` | `admin123` |
| **Gerente de piso / calibración** (hoy “Supervisor”) | `supervisor` | `supervisor@nativa.com` | `supervisor123` |
| **Usuario / Operador** | `operador` | `operador@nativa.com` | `operador123` |

Si se pide **solo tres nombres en UI** (Admin, Gerente, Usuario): mapear etiquetas, **sin** inventar un cuarto rol JWT todavía.

---

## 4. Qué hace cada uno (hoy vs pedido)

### Hoy (tres roles)

| Rol | Qué hace |
|-----|----------|
| **Gerente** (`admin@…`) | Inventario harinas (crear Cambir, etc.), equipo, muro, alertas, fluctuaciones HR, **crear grupos**, calibrar, humedad global, archivar lotes, preview de otras vistas |
| **Supervisor** | Calibrar grupos, humedad global, fluctuaciones HR. **No** crea harinas ni archiva |
| **Operador** | Lista de grupos → iniciar / timer / finalizar / ✓ listo. Ve lecturas. **No** calibra ni crea grupos |

### Pedido LeanHerz (directo, sin grupos)

| Quién | Qué debe hacer |
|-------|----------------|
| **Admin / Gerente** | Crear el producto/lote (nombre tipo Cambir). Calibrar **eso** (T°, HR, tiempo). Ver muro, alertas, archivar lote listo. Ver lecturas de Render |
| **Gerente de calibración** (si se mantiene un segundo usuario) | Calibrar **lo que el admin ya creó**, no una cola de grupos |
| **Usuario / Operador** | Una vista de **acción**: iniciar/parar/✓ sobre **ese** trabajo. Sin lista larga de grupos |

Objetivo de UI: **una sola línea de trabajo visible**, no “Garbanzo y Lenteja / #2 en cola / Nuevo grupo”.

---

## 5. ¿El sistema toma la data de Render? (laptop + sensores)

**Sí, por diseño.** La APK preview ya apunta a Render:

`frontend/eas.json` → `EXPO_PUBLIC_API_URL=https://app-harinas.onrender.com`

Cadena:

1. Gateway en la laptop: `API_URL=https://app-harinas.onrender.com/api/arduino/telemetry`  
2. Backend Render guarda `TelemetryEvent` en Atlas (`app_harinas`)  
3. App pide `GET /api/telemetry/latest` y `GET /api/telemetry/group/:id` (JWT)

**Health:** `GET https://app-harinas.onrender.com/api/health` → `{"success":true}`

### Cómo comprobar lecturas (sin Wi‑Fi de placa)

1. Uno + AHT10 + DS3231 por USB; **cerrar** Monitor serie.  
2. En la laptop:
   ```powershell
   cd firmware\arduino-uno-aht10-ds3231-hc05\gateway
   npm start
   ```
3. Debe verse `POST 201 | T=… HR=…` (no `Payload incompleto`).  
4. En la app (login gerente u operador): **Muro** y **Fluctuaciones HR**.  
5. Para alertas de anomalía: operador debe tener un secado **iniciado**.

Si el gateway dice `Payload incompleto`, Render está vivo pero **no guarda** esa línea (JSON sin `deviceId` + `lecturas.temperatura` + `lecturas.humedad`). Arreglar el JSON del Uno **antes** de culpar a la app.

Las pantallas **Calibración / Grupos** muestran **umbrales**, no la lectura en vivo. Las lecturas van a **Muro**, cards de operador y **Fluctuaciones HR**.

---

## 6. Alcance de implementación (cuando se ejecute)

### Quitar de la UX (pedido explícito)

- Pantalla **Nuevo grupo** y botón **Crear grupo**  
- Copy de cola FIFO (“Siguiente en la cola”, “#N en la cola”)  
- Lista larga de grupos como “qué hacer” del operador  
- Confusión Harina Cambir vs grupo “Platano y Cambur”

### Mantener

- Inventario **Harinas** (lo que el gerente crea: Cambir, kg, fecha)  
- Flujo ✓ listo + archivar lote  
- Telemetría Render + gateway USB (Ruta B)  
- Muro, alertas, fluctuaciones HR  
- Roles JWT actuales hasta que se renombren en UI

### Acomodar lecturas (sin Wi‑Fi)

- Operador ve T°/HR del **mismo** trabajo que calibró el gerente  
- Al **Iniciar**, refresh de telemetría (ya hay patrón en operador)  
- Empty states sin comandos `npm` ni ESP-12F  

### Fuera de esta entrega

- Firmware ESP-12F / Wi‑Fi  
- Push notifications  
- Rediseño total de inventario harinas  

---

## 7. Prompt para el agente (cuando se pida implementar)

```text
Proyecto App-Harinas. Lee docs/AGENTE-ENTREGAS-SIN-GRUPOS.md completo.

Pedido LeanHerz 17/8/2026:
- Quitar UX de "grupos de rubro" como cola de trabajo.
- Flujo directo: gerente crea/calibra el producto (Harina, ej. Cambir);
  operador solo acciona (iniciar / finalizar / marcar listo).
- No usar Wi-Fi ESP-12F. Telemetría = Uno USB + gateway laptop → Render.
- Verificar lecturas en Muro / Fluctuaciones / home operador contra
  https://app-harinas.onrender.com

Roles demo (no borrar):
- admin@nativa.com / admin123  (gerente)
- supervisor@nativa.com / supervisor123
- operador@nativa.com / operador123

Cambio mínimo. No nueva base de datos. No romper marcar-listo/archivar.
Tests: backend npm test. Frontend npx tsc --noEmit.
Actualizar GUIA-SISTEMA-COMPLETA.md al cerrar.
```

---

## 8. Checklist (tras implementar)

| # | Criterio | Estado |
|---|----------|--------|
| 1 | No hay “Nuevo grupo” / cola FIFO en UI operador | ⬜ |
| 2 | Lo que crea el gerente (Harina) es lo que ven los demás | ⬜ |
| 3 | Calibración sobre ese trabajo, no grupo abstracto | ⬜ |
| 4 | Operador solo acciona | ⬜ |
| 5 | Archivar lote listo intacto | ⬜ |
| 6 | Gateway USB → Render → app (sin Wi‑Fi placa) | ⬜ |
| 7 | Muro / fluctuaciones muestran T/HR reales | ⬜ |
| 8 | `npm test` + `tsc` OK | ⬜ |

---

*Creado: 17/8/2026 — feedback LeanHerz (grupos vs Cambir, calibrar directo, operador acciona, Arduino USB no Wi‑Fi).*
