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
| `INDICE-SPRINTS.md` | Tabla de prompts activos |
| `SPRINT-12-UX-RESPONSIVE.md` | Responsive + animaciones de tablero (implementado) |
| `SPRINT-13-UX-CONTRASTE.md` | Contraste y legibilidad claro/oscuro (implementado) |

## Alcance de esta carpeta

- Esta carpeta quedó enfocada en mejoras visuales y responsive.
- `SPRINTS.md` en la raíz conserva el historial y estado de producto.
- Sprints 12 y 13 están **completados** (código + checklists de desarrollo); queda solo QA manual en dispositivo.
- Ver modelos de implementación en cada archivo sprint (sección «Modelo de ajustes»).

## Reglas para cualquier prompt

- TypeScript en frontend; CommonJS modular en backend.
- Respetar roles: `gerente` | `supervisor` | `operador`.
- No subir `.env` ni secretos.
- No ejecutar `npm audit fix --force` en Expo sin migración planificada.
- Tras cambios de UI: `npx expo start -c` o rebuild APK si hace falta.
