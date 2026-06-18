# Contexto fijo — Nativa Superalimentos

Copia este bloque al inicio de cualquier sesión de desarrollo si el agente no tiene contexto del repo.

```text
Proyecto: App Harinas — Nativa Superalimentos C.A.
Repo: App-Harinas (monorepo)
- backend/: Node.js + Express 5 + Mongoose + MongoDB
- frontend/: Expo SDK 54 + React Native + TypeScript + React Native Paper + Zustand

Roles:
- gerente: cuenta maestra, CRUD equipo, muro, alertas, todo el resto
- supervisor: calibración por grupo de rubro + humedad global
- operador: telemetría, alertas, vista informativa

Grupos de rubro (parejas fijas):
1. garbanzo / lenteja
2. platano / cambur
3. yuca / batata

MVP sensores: temperatura + humedad (+ nivel/tiempo secado en calibración).

API base local: http://localhost:4000
Health: GET /api/health
Login: POST /api/auth/login { email, password }

Variables:
- backend/.env: MONGODB_URI, JWT_SECRET, CORS_ORIGINS, RATE_LIMIT_*, AUTH_RATE_LIMIT_*
- frontend/.env: EXPO_PUBLIC_API_URL

Documentación técnica:
- SPRINTS.md (plan y estado)
- DEPLOY-PLAN.md, SECURITY-AUDIT.md
- firmware/README.md (ESP32 Wi‑Fi → servidor → app)
- backend/docs/arduino-telemetry-contract.md
- backend/docs/BACKUP-SECURITY.md
```

## Referencia visual (web POC)

Existe una referencia de login “CONTROL DE PLANTA” (fondo navy, tarjeta blanca, marca NATIVA). En móvil se adaptará con **paleta azul corporativa** (ver Sprint 10), no copiar literal la web Netlify si diverge del APK.

## Credenciales demo (desarrollo)

Tras `npm run seed:admin` en backend (valores por defecto en `.env.example`):

- Gerente: `admin@nativa.com` / `admin123`
