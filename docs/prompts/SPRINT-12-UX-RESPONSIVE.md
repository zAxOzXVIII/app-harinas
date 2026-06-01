# Sprint 12 — UX responsive + animaciones de tablero

Estado: **implementado** en frontend (jun 2026).

Objetivo: mejorar la experiencia visual del tablero y la adaptación a distintos tamaños de pantalla, manteniendo la identidad azul corporativa y sin tocar lógica de negocio.

## Prompt listo para usar

```text
Iniciar Sprint UX-Responsive: animación de tablero + adaptación visual por dispositivo.

Contexto:
- Proyecto: App-Harinas (frontend Expo + React Native + TypeScript).
- Objetivo: mejorar la experiencia visual del tablero y hacerlo responsive en teléfonos de distintos tamaños.
- Mantener identidad visual azul corporativa ya definida en `src/theme/index.ts`.
- No romper funcionalidades existentes.

Alcance técnico:
1) Tablero con movimiento suave al desplegar
- Aplicar animaciones de entrada/transición en Dashboard y pantallas Home por rol (gerente/supervisor/operador).
- Usar Animated (Expo SDK estable).
- Animar tarjetas KPI, bloques de métricas y listas (fade + translateY suave).

2) Responsive real por dispositivo
- `useBreakpoint` + `useScreenLayout` para padding, columnas y ancho de gráficos.
- Corregir overflows y paddings en listas.

3) Sistema visual reutilizable
- `AnimatedReveal`, `useBreakpoint`, `useScreenLayout`.

4) Validación
- `npm run typecheck` sin errores.
```

## Checklist de cierre

- [x] Animaciones suaves aplicadas en dashboard y homes por rol.
- [x] Layout usable en pantallas pequeñas sin solapamientos (padding dinámico).
- [x] Componentes/utilidades responsive reutilizables creados.
- [x] `npm run typecheck` sin errores.
- [x] Documentación y prompts cerrados (jun 2026).
- [ ] Prueba manual en al menos 2 tamaños de pantalla (QA en dispositivo).

## Modelo de ajustes (implementación)

```
useWindowDimensions()
       │
       ▼
useBreakpoint() ──► compact | comfortable | wide
       │              (ancho < 360 | < 600 | ≥ 600)
       ▼
useScreenLayout() ──► backgroundColor, scrollContent, listContent, toolbarPadding
       │
       ├── AnimatedReveal (fade + translateY, delay escalonado)
       └── Pantallas: padding/columnas según breakpoint; gráficos con ancho flexible
```

| Utilidad | Responsabilidad |
|----------|-----------------|
| `useBreakpoint` | Clasifica ancho de pantalla y expone `contentPadding`, `isCompact`. |
| `useScreenLayout` | Unifica fondo y paddings de ScrollView / FlatList / toolbars. |
| `AnimatedReveal` | Entrada suave de cards y filas sin bloquear interacción. |

**Pantallas tocadas:** Dashboard, SupervisorHome, OperadorHome, MuroGerente, HarinasList, EquipoList, GruposList, AlertsList (+ `ScreenHero` con padding coherente).

## Archivos clave

- `frontend/src/hooks/useBreakpoint.ts`
- `frontend/src/hooks/useScreenLayout.ts`
- `frontend/src/components/AnimatedReveal.tsx`
- Pantallas: Dashboard, SupervisorHome, OperadorHome, Muro, Harinas, Equipo, Grupos, Alertas
