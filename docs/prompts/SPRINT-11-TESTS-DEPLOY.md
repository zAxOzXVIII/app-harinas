# Sprint 11 — Tests automatizados + preparación deploy

## Estado

- [x] Jest + Supertest + MongoDB Memory Server en `backend/tests/`
- [x] Scripts `npm test` / `npm test:watch`
- [x] Rate limit desactivado en `NODE_ENV=test`
- [x] Tests: health, auth, harinas, grupos, telemetria, alertas (18 tests)
- [x] CI GitHub Actions: `.github/workflows/backend-tests.yml`
- [x] Seed grupos + humedad en `setupAfterEnv.js`
- [ ] Push notifications (7b) — pendiente
- [ ] Deploy Render/Railway con Atlas — requiere credenciales del equipo

## Prompt — ampliar tests

```text
Iniciar Sprint 11b — más tests backend.

Con la base en backend/tests/, agregar:
- tests/grupos.test.js: GET grupos, PUT calibracion (token gerente)
- tests/alerts.test.js: tras simulate telemetry o POST manual, GET /api/alerts
- tests/telemetry.test.js: POST ingestion con payload valido e invalido

Mantener globalSetup/globalTeardown. npm test debe pasar en CI.
```

## Prompt — deploy Render

```text
Iniciar Sprint 9/11 deploy.

1) Conectar repo a Render Web Service (root: backend).
2) Variables: MONGODB_URI (Atlas), JWT_SECRET, NODE_ENV=production, CORS_ORIGINS, TRUST_PROXY=1.
3) Health check: /api/health
4) Tras deploy: seed:admin y seed:grupos contra Atlas.
5) EAS: EXPO_PUBLIC_API_URL = URL Render.

Ver DEPLOY-PLAN.md y docs/OPERACION-LOCAL.md.
```
