# Sprint 13 — Contraste y legibilidad (modo claro/oscuro)

Estado: **implementado** en frontend (jun 2026).

Objetivo: corregir textos ilegibles en la app móvil (labels secundarios, hints, cards azules, modo oscuro) manteniendo la identidad visual Nativa azul.

## Prompt listo para usar

```text
Iniciar Sprint UX-Contraste: legibilidad en toda la app (claro + oscuro).

Contexto:
- Proyecto: App-Harinas (frontend Expo + React Native + TypeScript + React Native Paper).
- Problema: letras poco legibles por opacity baja o colores fijos.
- Base visual: `frontend/src/theme/index.ts`.

Alcance técnico:
1) Tokens de contraste en tema Paper (onSurface, onSurfaceVariant, outline).
2) `useMutedTextStyle` — sin opacity en textos secundarios.
3) Pantallas y componentes: Login, heroes, tableros, listas, formularios, MetricGauge, cards.
4) primaryContainer con onPrimaryContainer legible.
5) `npm run typecheck` sin errores.
```

## Checklist de cierre

- [x] Tokens `onSurface` / `onSurfaceVariant` definidos en claro y oscuro.
- [x] Textos secundarios sin `opacity` como único recurso de “muted”.
- [x] Login y tableros con colores del tema.
- [x] Cards azules (`primaryContainer`) con texto legible.
- [x] `npm run typecheck` sin errores.
- [x] Auditoría de contrastes y corrección de colores fijos (jun 2026).
- [x] Documentación y prompts cerrados (jun 2026).
- [ ] Prueba manual en teléfono (claro + oscuro) (QA en dispositivo).

## Archivos clave

- `frontend/src/theme/index.ts`
- `frontend/src/hooks/useMutedTextStyle.ts`
- `frontend/src/hooks/useContrastStyles.ts` (títulos, cuerpo, chips, KPI)
- Componentes: ScreenHero, MetricGauge, HarinaListItem, GrupoRubroCard, ErrorBoundary
- Pantallas principales actualizadas

## Modelo de ajustes (implementación)

```
theme/index.ts (lightTheme | darkTheme)
       │
       ├── onSurface / onSurfaceVariant / onPrimaryContainer
       │
       ├── useMutedTextStyle() ──► color: onSurfaceVariant (sin opacity global)
       │
       └── useContrastStyles() ──► title, body, chipLabel, onPrimaryContainer
                │
                └── Pantallas y cards consumen tokens, no brand.primaryBlueDark en texto
```

| Capa | Regla |
|------|--------|
| Texto principal | `theme.colors.onSurface` |
| Texto secundario | `onSurfaceVariant` vía `useMutedTextStyle` |
| Títulos / acentos | `theme.colors.primary` |
| KPI / cards tintadas | `primaryContainer` + `onPrimaryContainer` |
| Chips de severidad | Fondo pastel fijo + texto `#1A1A1A` |
| Excepciones | Login (card clara fija), PDF (HTML claro) |

## Auditoría (jun 2026)

| Área | Antes | Después |
|------|--------|---------|
| KPI Dashboard (`primaryContainer`) | `primaryBlueDark` fijo | `onPrimaryContainer` |
| Títulos de sección | `primaryBlueDark` fijo | `theme.colors.primary` |
| Formularios (harina, usuario, humedad) | fondos `#f4f6f8` / `#e8f5e9` | `background` / `primaryContainer` del tema |
| Chips alertas | texto sin color explícito | `#1A1A1A` sobre fondo pastel |
| ErrorBoundary | `textMutedOnLight` fijo | colores del tema activo |
| Login | card clara sobre navy | sin cambio (contraste OK por diseño fijo) |
| PDF export | colores brand | sin cambio (HTML estático claro) |
