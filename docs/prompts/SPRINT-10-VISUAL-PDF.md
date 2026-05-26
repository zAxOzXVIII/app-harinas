# Sprint 10 — UI azul corporativa + exportación PDF

**Objetivo:** alinear la app móvil con la identidad “NATIVA — Control de planta” (referencia web: fondo oscuro, tarjeta clara, marca centrada), usando **azules** como color principal, y añadir **PDF** en los módulos críticos del negocio.

**Regla de ejecución:** implementar **una sub-fase por sesión**; al terminar cada sub-fase, ejecutar `npm run typecheck` en frontend y probar en emulador o APK.

**Estado implementación (código):** Sprint 10 completo en repo (10A–10D). Detalle PDF: [`PDF-DATOS-Y-DISENO.md`](./PDF-DATOS-Y-DISENO.md).

---

## Paleta sugerida (azul Nativa)

Usar en `frontend/src/theme/index.ts` y componentes:

| Token | Hex | Uso |
|-------|-----|-----|
| `navyDeep` | `#0B1320` | Fondo login / headers |
| `primaryBlue` | `#1565C0` | Botones, links, acentos |
| `primaryBlueDark` | `#0D47A1` | Botón primario pressed |
| `skyAccent` | `#42A5F5` | Chips, gráficos, highlights |
| `surfaceCard` | `#FFFFFF` | Tarjetas sobre fondo oscuro |
| `surfaceMuted` | `#E8EEF4` | Inputs, fondos secundarios |
| `textOnDark` | `#E3F2FD` | Texto sobre navy |
| `warning` | `#EF6C00` | Alertas warning (mantener) |
| `critical` | `#C62828` | Crítico (mantener) |
| `ok` | `#2E7D32` | OK proceso (puede quedar verde semántico) |

Mantener semántica de estado (ok/warning/critical) aunque el brand sea azul.

---

## Sub-fase 10A — Tema y Login (empezar aquí)

### Prompt

```text
Iniciar Sprint 10A — tema azul + Login.

Contexto: leer docs/prompts/00-CONTEXTO.md y MEJORAS-SISTEMA.md (V1, V2, V5).

Tareas:
1) Actualizar frontend/src/theme/index.ts con paleta azul (tabla en SPRINT-10-VISUAL-PDF.md).
2) Ajustar navLight/navDark para coherencia con Paper MD3.
3) Rediseñar LoginScreen:
   - Fondo navyDeep a pantalla completa
   - Tarjeta blanca centrada (borderRadius ~24), sombra sutil si Paper lo permite sin “slop”
   - Título NATIVA + subtítulo "CONTROL DE PLANTA" (letter-spacing ligero en subtítulo)
   - Icono/logo: cuadrado redondeado con primaryBlue (MaterialCommunityIcons "factory" o "leaf")
   - Botón INGRESAR: primaryBlueDark, texto blanco, mayúsculas
   - Footer opcional en dev: texto pequeño con credenciales demo (solo __DEV__)
4) No romper flujo de login ni validaciones existentes.
5) Entregar: lista de archivos tocados + comando typecheck.

No implementar PDF en esta fase.
```

### Criterios de aceptación

- [ ] Login legible en claro/oscuro del sistema
- [ ] `npx tsc --noEmit` sin errores
- [ ] Colores primarios ya no son verde `#2e7d32` como brand principal

---

## Especificación PDF (obligatoria antes de 10B1)

Leer y seguir **`PDF-DATOS-Y-DISENO.md`**: columnas por colección MongoDB, orden de filas, KPIs, CSS azul Nativa y nombres de archivo.

---

## Sub-fase 10B — Infra PDF (una vez)

### Prompt

```text
Iniciar Sprint 10B0 — infra PDF + plantillas bonitas.

Leer: docs/prompts/PDF-DATOS-Y-DISENO.md (secciones 3 y 4).

Instalar (Expo SDK 54): expo-print, expo-sharing, expo-file-system.

Crear frontend/src/utils/pdfTemplates.ts con:
- CSS inline completo (clases .pdf-header, .kpi, table zebra, .badge, .section-title)
- buildPdfHtml({ title, subtitle, kpis[], sections[] })
- formatDate (es-VE), formatNumber, labelAlertTipo, labelRol
- sortGruposByCodigo(["garbanzo-lenteja","platano-cambur","yuca-batata"])
- ORDEN_GRUPOS constante exportada

Crear frontend/src/services/pdfReport.service.ts:
- generatePdfFromHtml(html) → uri
- sharePdf(uri, filename) con patrón nativa_{modulo}_{YYYYMMDD_HHmm}.pdf
- PDF prueba: 1 KPI + tabla 3 filas dummy con estilos azul

No conectar pantallas aún.
```

---

## Sub-fase 10B1 — PDF Harinas (inventario)

### Prompt

```text
Iniciar Sprint 10B1 — PDF Harinas (diseño según PDF-DATOS-Y-DISENO.md §2.1).

Pantalla: HarinasListScreen — botón "Exportar PDF" (icon file-pdf), solo gerente.

Datos:
- harinasStore.fetchAll() si vacío
- Orden PDF: fecha_registro DESC, luego nombre ASC (no solo el orden del API)

KPIs encabezado:
- Total registros
- Subtotales cantidad por unidad (kg, lb, etc. — no sumar unidades distintas)
- Fecha generación

Tabla columnas (orden fijo): Producto | Tipo | Cantidad | Unidad | Fecha registro
Formato fecha: dd/MM/yyyy HH:mm es-VE

HTML: buildPdfHtml + tablas zebra azul. Footer: Nativa Superalimentos C.A.
Archivo: nativa_harinas_{timestamp}.pdf → sharePdf.
```

---

## Sub-fase 10B2 — PDF Calibración

### Prompt

```text
Iniciar Sprint 10B2 — PDF Calibración y humedad.

Pantallas: GruposListScreen, CalibracionFormScreen, HumedadFormScreen.

PDF por grupo: nombre pareja, umbrales temperatura, nivel secado, tiempo secado, actualizadoPor/En.
Sección aparte: HumedadConfig global.

Botón "Exportar calibración" en GruposList (Gerente + Supervisor).
```

---

## Sub-fase 10B3 — PDF Alertas

### Prompt

```text
Iniciar Sprint 10B3 — PDF Alertas (PDF-DATOS-Y-DISENO.md §2.3).

Pantalla: AlertsListScreen — Exportar PDF + chip filtro "Solo pendientes" (leida=false).

Datos: fetchList limit 100. Orden PDF:
1) severidad critical antes warning
2) createdAt DESC
3) grupo nombre ASC

KPIs: Total | Pendientes | Críticas | Advertencias

Tabla: Fecha/hora | Grupo | Tipo (labelAlertTipo) | Severidad (badge color) | Detalle (mensaje) | Estado Leída/Pendiente

Colores badge según doc (critical #C62828, warning #EF6C00).
Roles: operador y gerente. Encabezado con usuario que exporta.
```

---

## Sub-fase 10B4 — PDF Muro / Telemetría

### Prompt

```text
Iniciar Sprint 10B4 — PDF Muro (PDF-DATOS-Y-DISENO.md §2.4).

Pantalla: MuroGerenteScreen — Exportar snapshot (solo gerente).

Datos antes de PDF:
- fetchLatest + fetchGrupos + por cada grupo fetchHistory(id, 30)

Orden grupos: sortGruposByCodigo.

Por grupo:
- Tabla lectura actual: T °C | HR % | Nivel % | Tiempo min | Última lectura | Estado (OK/ALERTA/CRITICO badge)
- computeTelemetryStatus igual que la app (vs calibracion grupo + HumedadConfig)
- Mini-tabla historial: últimos 10 puntos, timestamp ASC, columnas Hora | T | HR (desde history slice reverse)

KPIs globales: grupos en alerta (estado≠OK) | total grupos 3 | alertas pendientes (opcional desde alerts store).

Título: "Snapshot de proceso — Muro Gerente".
Incluir deviceId en pie pequeño por grupo.
```

---

## Sub-fase 10B5 — PDF Equipo

### Prompt

```text
Iniciar Sprint 10B5 — PDF Equipo (PDF-DATOS-Y-DISENO.md §2.5).

Pantalla: EquipoListScreen — Exportar PDF (solo gerente).

Datos: GET /api/users (supervisor + operador; no incluir cuenta gerente en tabla).

Orden PDF: rol supervisor primero, luego operador; dentro de cada rol nombre ASC.

Tabla: Nombre | Correo | Rol (labelRol) | Alta (createdAt formateado).

KPI: Total equipo | Supervisores | Operadores.

Footer obligatorio: "Documento confidencial — Nativa Superalimentos C.A. — Solo uso interno."
Nunca imprimir password ni _id en cuerpo visible.
```

---

## Sub-fase 10C — Pulido visual resto de pantallas

### Prompt

```text
Iniciar Sprint 10C — pulido UI por rol.

Aplicar tokens azul en:
- DashboardScreen (cards, FAB, app bar)
- OperadorHomeScreen, SupervisorHomeScreen (MetricGauge, Sparkline colores skyAccent)
- MuroGerenteScreen, AlertsListScreen
- Componentes GrupoRubroCard, HarinaListItem

Unificar: AppBar primaryBlue, fondos surfaceMuted en listas, chips con skyAccent.
Revisar contraste WCAG básico en texto sobre navy.
Por pantalla: una PR o un commit lógico.
```

---

## Sub-fase 10D — Backend proxy (ngrok / deploy)

### Prompt

```text
Iniciar Sprint 10D — trust proxy.

En backend/src/app.js:
- Si NODE_ENV !== 'test' y existe TRUST_PROXY=1 (o producción), app.set('trust proxy', 1).
Documentar en backend/.env.example y README.

Evita error express-rate-limit X-Forwarded-For detrás de ngrok.
```

---

## Orden recomendado

1. **10A** → 2. **10B0** → 3. **10B1…B5** (cualquier orden de B1-B5) → 4. **10C** → 5. **10D**

---

## Prompt maestro (copiar si quieres todo el sprint en una conversación)

```text
Ejecutar Sprint 10 Nativa por sub-fases en orden: 10A → 10B0 → 10B1 → 10B2 → 10B3 → 10B4 → 10B5 → 10C → 10D.

Leer:
- docs/prompts/00-CONTEXTO.md
- docs/prompts/SPRINT-10-VISUAL-PDF.md (completo)
- docs/prompts/PDF-DATOS-Y-DISENO.md (OBLIGATORIO para PDF)
- docs/prompts/MEJORAS-SISTEMA.md

Reglas:
- Una sub-fase por respuesta; pedir confirmación antes de la siguiente.
- Paleta azul corporativa; login tipo Control de Planta.
- PDF bonitos: KPIs + tablas zebra + orden BD documentado + labels en español.
- typecheck después de cada sub-fase.
- No audit fix --force en Expo.
```
