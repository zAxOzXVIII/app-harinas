# Prompts — App Harinas / Nativa

Guía central para usar prompts con Cursor (o cualquier agente) sin duplicar texto en `SPRINTS.md`.

## Cómo usar

1. Lee primero **[00-CONTEXTO.md](./00-CONTEXTO.md)** (stack, roles, reglas).
2. Elige el sprint en **[INDICE-SPRINTS.md](./INDICE-SPRINTS.md)**.
3. Copia el bloque `Prompt` del archivo del sprint y pégalo en el chat.
4. Pide avance **por fases** (no “genera todo de una vez”).

## Estructura de carpetas

| Carpeta / archivo | Contenido |
|-------------------|-----------|
| `00-CONTEXTO.md` | Contexto fijo del producto y del repo |
| `INDICE-SPRINTS.md` | Tabla de sprints: estado + enlace |
| `completados/` | Prompts históricos (sprints 2–8), resumidos |
| `SPRINT-09-DEPLOY.md` | Deploy POC (Atlas + hosting) |
| `SPRINT-10-VISUAL-PDF.md` | **Activo** — UI azul corporativa + export PDF por módulos |
| `PDF-DATOS-Y-DISENO.md` | **PDF** — campos BD, orden de filas, KPIs y CSS para reportes bonitos |
| `MEJORAS-SISTEMA.md` | Análisis de mejoras detectadas (backlog por sprint) |

## Limpieza respecto a `SPRINTS.md`

- `SPRINTS.md` en la raíz conserva **plan de producto**, checks y estado.
- Los prompts largos ya no viven ahí; solo enlaces a esta carpeta.
- No borres historial de sprints completados: están en `completados/` como referencia corta.

## Reglas para cualquier prompt

- TypeScript en frontend; CommonJS modular en backend.
- Respetar roles: `gerente` | `supervisor` | `operador`.
- No subir `.env` ni secretos.
- No ejecutar `npm audit fix --force` en Expo sin migración planificada.
- Tras cambios de UI: `npx expo start -c` o rebuild APK si hace falta.
