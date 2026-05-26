# Sprint 9 — Deploy POC

Estado: guía principal en `DEPLOY-PLAN.md` en la raíz del repo.

## Prompt

```text
Iniciar Sprint 9 (deploy POC).

Objetivo: backend público HTTPS + MongoDB Atlas + app con EXPO_PUBLIC_API_URL productiva.

Fases:
1) Atlas M0: usuario, Network Access (IPs del hosting o temporal 0.0.0.0/0), MONGODB_URI con /app_harinas.
2) Render/Railway: root backend, npm start, variables JWT_SECRET, CORS_ORIGINS, RATE_LIMIT_*, AUTH_RATE_LIMIT_*.
3) seed:admin y seed:grupos una vez en el entorno remoto.
4) EAS Build APK/AAB con EXPO_PUBLIC_API_URL del backend desplegado.
5) Checklist go-live en DEPLOY-PLAN.md.

No commitear .env. Documentar limitaciones free tier (sleep, cold start).
```
