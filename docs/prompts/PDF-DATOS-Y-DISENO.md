# PDF — Datos de BD, orden y diseño visual

Referencia para implementar reportes bonitos con `expo-print`. Los prompts de **10B0–10B5** en `SPRINT-10-VISUAL-PDF.md` deben seguir este documento.

---

## 1) Mapa de colecciones MongoDB

| Colección | Modelo | Uso en PDF |
|-----------|--------|------------|
| `harinas` | `Harina` | Inventario |
| `gruporubros` | `GrupoRubro` | Calibración por pareja |
| `humedadconfigs` | `HumedadConfig` | Política global HR |
| `processalerts` | `ProcessAlert` | Bitácora de alertas |
| `telemetryevents` | `TelemetryEvent` | Muro / snapshot proceso |
| `users` | `User` | Equipo (sin password) |

---

## 2) Orden oficial por reporte

### 2.1 Inventario de harinas (10B1)

**Fuente:** `GET /api/harinas` → `Harina.find().sort({ fecha_registro: -1 })`.

| Orden | Campo | Dirección | Motivo |
|-------|--------|-----------|--------|
| 1 | `fecha_registro` | DESC | Lo más reciente primero (igual que la app) |
| 2 | `nombre` | ASC | Desempate legible en PDF |

**Columnas (orden en tabla):**

| # | Campo BD | Etiqueta PDF | Formato |
|---|----------|--------------|---------|
| 1 | `nombre` | Producto | Texto |
| 2 | `tipo` | Tipo | Texto |
| 3 | `cantidad` | Cantidad | Número con separador miles |
| 4 | `unidad` | Unidad | Texto |
| 5 | `fecha_registro` | Fecha registro | `dd/MM/yyyy HH:mm` (locale `es-VE`) |

**Bloque resumen (encima de tabla):**

- Total registros
- Suma de `cantidad` agrupada por `unidad` (si hay varias unidades, mostrar subtotales por unidad, no mezclar)
- Fecha de generación del PDF

---

### 2.2 Calibración + humedad global (10B2)

**Grupos:** `GrupoRubro.find().sort({ nombre: 1 })` — en la práctica coincide con orden de negocio:

1. `garbanzo-lenteja` — Garbanzo y Lenteja  
2. `platano-cambur` — Platano y Cambur  
3. `yuca-batata` — Yuca y Batata  

**Preferir orden fijo por `codigo`** (no solo nombre) para PDF:

```ts
const ORDEN_GRUPOS = ["garbanzo-lenteja", "platano-cambur", "yuca-batata"];
```

**Por cada grupo (sección en PDF, una página o bloque con salto suave):**

| Bloque | Campos | Presentación |
|--------|--------|--------------|
| Cabecera grupo | `nombre`, `items[]` | Título H2 + chips "Garbanzo · Lenteja" |
| Temperatura | `calibracion.temperatura` | Tabla: Operativo min–max, Crítico min–max, unidad `C` |
| Nivel secado | `calibracion.nivelSecado` | Rango min–max % |
| Tiempo secado | `calibracion.tiempoSecado.estimadoMin` | "Estimado: X min" |
| Auditoría | `actualizadoEn`, `actualizadoPor` | Pie de sección; si hay populate de User, mostrar `nombre`; si no, "—" |

**Humedad global (después de los 3 grupos, sección destacada con fondo `#E8EEF4`):**

| Campo | Etiqueta |
|-------|----------|
| `scope` | Política global (siempre "global") |
| `min` / `max` | Rango operativo %RH |
| `criticoMin` / `criticoMax` | Umbrales críticos |
| `unidad` | %RH (default) |
| `actualizadoEn` | Última actualización |

**Orden dentro de cada tabla de umbrales:** filas fijas: Operativo → Crítico → Unidad.

---

### 2.3 Alertas de proceso (10B3)

**Fuente:** `GET /api/alerts?limit=100` → `sort({ createdAt: -1 })`, `populate grupoRubroId (nombre, codigo)`.

**Orden en PDF:**

| Prioridad | Campo | Dirección |
|-----------|--------|-----------|
| 1 | `severidad` | `critical` antes que `warning` |
| 2 | `createdAt` | DESC |
| 3 | `grupoRubroId.nombre` | ASC |

**Columnas:**

| # | Campo | Etiqueta | Formato |
|---|--------|----------|---------|
| 1 | `createdAt` | Fecha/hora | `dd/MM/yyyy HH:mm` |
| 2 | `grupoRubroId.nombre` | Grupo | Texto |
| 3 | `tipo` | Tipo | Etiqueta humana (ver mapa abajo) |
| 4 | `severidad` | Severidad | Badge color |
| 5 | `mensaje` | Detalle | Texto wrap |
| 6 | `leida` | Estado | "Leída" / "Pendiente" |

**Mapa `tipo` → etiqueta español:**

| `tipo` | Etiqueta PDF |
|--------|----------------|
| `temp_critico` | Temperatura crítica |
| `temp_fuera_rango` | Temperatura fuera de rango |
| `humedad_critico` | Humedad crítica |
| `humedad_fuera` | Humedad fuera de rango |
| `nivel_secado_fuera` | Nivel de secado fuera |
| `tiempo_secado_exceso` | Tiempo de secado excedido |

**Resumen encabezado:**

- Total alertas en el reporte
- Pendientes (`leida === false`)
- Críticas vs advertencias (conteo)
- Opcional filtro PDF: solo pendientes (mismo criterio que `unreadOnly`)

**Colores badge severidad:**

- `critical`: fondo `#FFEBEE`, texto `#C62828`, borde `#C62828`
- `warning`: fondo `#FFF3E0`, texto `#EF6C00`, borde `#EF6C00`

---

### 2.4 Muro / telemetría (10B4)

**Último estado por grupo:** `getLatestByGroup()` → orden `grupo.nombre` ASC. **Usar orden por `codigo`** como en 10B2.

**Por grupo, tabla "Lectura actual":**

| Campo `lecturas` | Etiqueta | Unidad | Comparar con |
|------------------|----------|--------|--------------|
| `temperatura` | Temperatura | °C | `grupo.calibracion.temperatura` |
| `humedad` | Humedad | %RH | `HumedadConfig` global |
| `nivelSecado` | Nivel secado | % | `grupo.calibracion.nivelSecado` |
| `tiempoSecado` | Tiempo secado | min | `grupo.calibracion.tiempoSecado.estimadoMin` |
| `timestamp` | Última lectura | datetime | — |
| `deviceId` | Dispositivo | texto | pie pequeño |

**Estado calculado (misma lógica que la app):** `OK` | `ALERTA` | `CRITICO` — columna con badge verde/naranja/rojo.

**Historial (sparkline en PDF):** `GET /api/telemetry/group/:id?limit=30` → orden **cronológico ASC** (`timestamp` ASC) para la mini-tabla "Últimos N puntos":

| Columnas mini-historial | |
|-------------------------|--|
| Hora | `HH:mm` |
| T °C | 1 decimal |
| HR % | 1 decimal |

Máximo **10 filas** en PDF (últimos 10 del array ya ordenado DESC en API: tomar `.slice(0, 10).reverse()`).

**Resumen global del muro:**

- Grupos en alerta (estado ≠ OK)
- Total alertas no leídas (opcional, desde store alerts)

---

### 2.5 Equipo (10B5)

**Fuente:** `GET /api/users` → `rol in [supervisor, operador]`, `sort({ createdAt: -1 })`.

**Orden en PDF (más útil para lectura):**

| 1 | `rol` | supervisor → operador |
| 2 | `nombre` | ASC |

**Columnas:**

| Campo | Etiqueta |
|-------|----------|
| `nombre` | Nombre |
| `email` | Correo |
| `rol` | Rol (Gerente/Supervisor/Operador capitalizado) |
| `createdAt` | Alta en sistema |

**No incluir:** `password`, `_id` (opcional _id en pie técnico pequeño).

**Pie legal:** "Documento confidencial — Nativa Superalimentos C.A. — Solo uso interno."

---

## 3) Diseño visual común (HTML → PDF)

Todos los PDF comparten `pdfTemplates.ts`:

### 3.1 Estructura página

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <style>/* ver 3.2 */</style>
</head>
<body>
  <header class="pdf-header">...</header>
  <section class="pdf-kpis">...</section>   <!-- resumen numérico -->
  <section class="pdf-body">...</section>    <!-- tablas / bloques -->
  <footer class="pdf-footer">...</footer>
</body>
</html>
```

### 3.2 CSS inline obligatorio (azul Nativa)

| Clase | Estilo |
|-------|--------|
| `body` | `font-family: system-ui, Segoe UI, sans-serif; font-size: 11px; color: #1a237e; margin: 24px;` |
| `.pdf-header` | `border-bottom: 3px solid #1565C0; padding-bottom: 12px; margin-bottom: 16px;` |
| `.pdf-header h1` | `margin: 0; font-size: 20px; color: #0D47A1; letter-spacing: 0.05em;` |
| `.pdf-header .sub` | `font-size: 11px; color: #546E7A; text-transform: uppercase; letter-spacing: 0.12em;` |
| `.pdf-kpis` | `display: flex; gap: 12px; margin-bottom: 16px;` |
| `.kpi` | `flex: 1; background: #E3F2FD; border-left: 4px solid #1565C0; padding: 10px 12px; border-radius: 6px;` |
| `.kpi .val` | `font-size: 18px; font-weight: 700; color: #0D47A1;` |
| `.kpi .lbl` | `font-size: 9px; color: #546E7A; text-transform: uppercase;` |
| `table` | `width: 100%; border-collapse: collapse; margin-bottom: 16px;` |
| `th` | `background: #1565C0; color: #fff; padding: 8px 10px; text-align: left; font-size: 10px;` |
| `tr:nth-child(even)` | `background: #F5F9FC;` |
| `td` | `padding: 7px 10px; border-bottom: 1px solid #E0E7EF;` |
| `.section-title` | `font-size: 14px; color: #0D47A1; margin: 20px 0 8px; border-left: 4px solid #42A5F5; padding-left: 8px;` |
| `.badge` | `display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 9px; font-weight: 600;` |
| `.pdf-footer` | `margin-top: 24px; font-size: 9px; color: #90A4AE; border-top: 1px solid #E0E7EF; padding-top: 8px;` |

### 3.3 Encabezado estándar

- Línea 1: **NATIVA** — Control de planta  
- Línea 2: Título del reporte (ej. "Inventario de harinas")  
- Línea 3: `Generado: {fecha} · Usuario: {nombre} ({rol}) · Ambiente: {EXPO_PUBLIC_API_URL host}`

### 3.4 Utilidades TypeScript (`pdfTemplates.ts`)

Implementar y reutilizar:

- `formatDate(iso: string): string` → `es-VE`
- `formatNumber(n: number, decimals?: number): string`
- `labelAlertTipo(tipo: AlertTipo): string`
- `labelRol(rol: string): string`
- `sortGruposByCodigo(grupos: GrupoRubro[]): GrupoRubro[]`
- `computeTelemetryStatus(lectura, grupo, humedad): 'OK' | 'ALERTA' | 'CRITICO'` (misma regla que UI)
- `buildPdfHtml({ title, kpis, sections, footerNote }): string`

### 3.5 Nombre de archivo al compartir

Patrón: `nativa_{modulo}_{YYYYMMDD_HHmm}.pdf`  
Ejemplos: `nativa_harinas_20260504_1030.pdf`, `nativa_calibracion_20260504_1030.pdf`

---

## 4) Datos a cargar antes de generar (stores / API)

| PDF | Fetch obligatorio si store vacío |
|-----|----------------------------------|
| Harinas | `harinasStore.fetchAll()` |
| Calibración | `gruposStore.fetchAll()` + humedad en mismo servicio |
| Alertas | `alertsStore.fetchList({ limit: 100 })` |
| Muro | `telemetryStore.fetchLatest()` + `fetchHistory(id, 30)` por cada grupo |
| Equipo | `GET /api/users` (solo gerente) |

Mostrar `ActivityIndicator` + deshabilitar botón mientras se preparan datos.

---

## 5) Checklist calidad PDF

- [ ] Sin columnas vacías ni `_id` visibles al usuario
- [ ] Fechas en español Venezuela
- [ ] Tablas no cortadas: `page-break-inside: avoid` en `tr` si expo-print lo respeta
- [ ] Grupos siempre en orden garbanzo → platano → yuca
- [ ] KPIs arriba, detalle abajo
- [ ] Colores solo paleta azul + semánticos warning/critical
- [ ] Probar share en Android (WhatsApp / Drive)
