# Análisis de mejoras — backlog por sprint

Hallazgos a partir del estado actual del repo (mayo 2026). Cada ítem se implementa en **fases pequeñas** (ver Sprint 10 y siguientes).

## UX / Visual

| ID | Mejora | Prioridad | Sprint sugerido |
|----|--------|-----------|-----------------|
| V1 | Paleta **azul corporativa** (sustituir verde primario actual en `theme/index.ts`) | Alta | 10A |
| V2 | Login estilo “Control de planta”: fondo navy, tarjeta blanca, logo, subtítulo | Alta | 10A |
| V3 | Tipografía y espaciado consistentes en todas las pantallas por rol | Media | 10C |
| V4 | Estados vacío/error con ilustración o icono + CTA | Media | 10C |
| V5 | Modo oscuro: ajustar azules (no solo verde claro en dark) | Media | 10A |
| V6 | Animaciones suaves en navegación (ya parcial en stacks) | Baja | 10C |

## PDF / Informes

Especificación detallada: **[PDF-DATOS-Y-DISENO.md](./PDF-DATOS-Y-DISENO.md)**.

| ID | Mejora | Prioridad | Sprint sugerido |
|----|--------|-----------|-----------------|
| P1 | Servicio + `pdfTemplates.ts` (CSS azul, KPIs, buildPdfHtml) | Alta | 10B0 |
| P2 | PDF harinas: orden fecha DESC + KPIs por unidad | Alta | 10B1 |
| P3 | PDF calibración: 3 grupos por `codigo` + bloque humedad global | Alta | 10B2 |
| P4 | PDF alertas: orden critical→warning, labels tipo ES, badges | Alta | 10B3 |
| P5 | PDF muro: estado OK/ALERTA/CRITICO + mini-historial 10 pts | Alta | 10B4 |
| P6 | PDF equipo: supervisor antes operador, pie confidencial | Media | 10B5 |
| P7 | `sortGruposByCodigo` y `computeTelemetryStatus` reutilizables | Alta | 10B0 |
| P8 | Endpoint backend server-side PDF (opcional) | Baja | 11 |

## Backend / Infra

| ID | Mejora | Prioridad | Sprint sugerido |
|----|--------|-----------|-----------------|
| B1 | `trust proxy` cuando API va detrás de ngrok/Render | Alta | 10D |
| B2 | CORS: incluir origen ngrok si se usa túnel en demo | Media | 9 / 10D |
| B3 | Tests automatizados (auth, harinas, alertas) con Jest/Supertest | Media | 11 |
| B4 | Paginación en listados largos (harinas, alertas, telemetría) | Media | 11 |
| B5 | Export CSV además de PDF | Baja | 12 |

## App móvil / Producto

| ID | Mejora | Prioridad | Sprint sugerido |
|----|--------|-----------|-----------------|
| A1 | Push notifications (Sprint 7b) | Media | 11 |
| A2 | Informes manuales Operador → Supervisor (form + historial) | Media | 12 |
| A3 | Gráficos: rango de fechas en Sparkline | Media | 10C |
| A4 | Offline: cola de acciones si no hay red | Baja | 13 |
| A5 | i18n ES/EN si mercado EE.UU. | Baja | 13 |

## Seguridad / Calidad

| ID | Mejora | Prioridad | Sprint sugerido |
|----|--------|-----------|-----------------|
| S1 | Rotación documentada de `JWT_SECRET` en producción | Alta | 9 |
| S2 | Política de contraseñas fuertes en alta de usuarios | Media | 11 |
| S3 | Auditoría de export PDF (quién generó, cuándo) | Baja | 12 |

## Documentación

| ID | Mejora | Prioridad | Sprint sugerido |
|----|--------|-----------|-----------------|
| D1 | Centralizar prompts en `docs/prompts/` | Hecho | — |
| D2 | Guía “generar APK + Atlas + ngrok” en un solo doc operativo | Media | 9 |
| D3 | Capturas de pantalla por rol para Play Store | Baja | 13 |
