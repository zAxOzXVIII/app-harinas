# Contrato Telemetria Arduino -> Backend (Sprint 6)

Endpoint de ingesta:

- `POST /api/arduino/telemetry`

## Payload JSON (v1)

```json
{
  "eventId": "dev-01-1714229000",
  "deviceId": "secador-dev-01",
  "codigoGrupo": "garbanzo-lenteja",
  "timestamp": "2026-04-27T14:30:00.000Z",
  "lecturas": {
    "nivelSecado": 62.5,
    "tiempoSecado": 48,
    "temperatura": 41.2,
    "humedad": 54.1
  }
}
```

Notas:

- `grupoRubroId` o `codigoGrupo` son válidos (al menos uno requerido).
- `eventId` es opcional, pero recomendado para deduplicación idempotente.
- `timestamp` si no se envía se toma el tiempo del servidor.

## Respuesta esperada

- `201` cuando se registra una nueva lectura.
- `200` cuando el `eventId` ya existe (deduplicado).
- `429` si el `deviceId` excede el límite de eventos por minuto.

## Consultas para app

- `GET /api/telemetry/latest` (auth): última lectura por grupo.
- `GET /api/telemetry/group/:grupoRubroId?limit=20` (auth): historial reciente por grupo.

## Alertas (Sprint 7)

Tras cada ingesta nueva, el backend evalúa la lectura frente a la calibración del grupo y la humedad global. Si aplica, crea registros en `ProcessAlert` con anti-spam de **5 minutos** por par `(grupoRubroId, tipo)`.

- `GET /api/alerts` (auth): listado de alertas.
- `GET /api/alerts/count` (auth): `{ unread }` alertas no leídas.
- `PATCH /api/alerts/:id/read` (auth): marcar una alerta como leída.
- `POST /api/alerts/mark-all-read` (auth): marcar todas como leídas.
