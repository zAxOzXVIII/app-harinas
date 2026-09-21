# Contrato Telemetria Arduino -> Backend

## Arquitectura vigente

```
AHT10 + DS3231 ──I2C──► Arduino Uno ──USB──► gateway (PC) ──HTTPS──► POST /api/arduino/telemetry ──► MongoDB
                                                                              │
                                                                              └──► App móvil (REST)
```

- Firmware: [`firmware/arduino-uno-aht10-ds3231-hc05/`](../../firmware/arduino-uno-aht10-ds3231-hc05/README.md)
- Índice: [`firmware/README.md`](../../firmware/README.md)

Endpoint: `POST /api/arduino/telemetry`

## Payload JSON v1.1 (AHT10 + DS3231)

Solo **temperatura** y **humedad** son obligatorias.

```json
{
  "eventId": "uno-01-20260601143000",
  "deviceId": "uno-secador-01",
  "codigoGrupo": "garbanzo-lenteja",
  "timestamp": "2026-06-01T14:30:00.000Z",
  "lecturas": {
    "temperatura": 41.2,
    "humedad": 54.1
  }
}
```

## Payload JSON v1 (completo — cuatro lecturas)

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

## Campos

| Campo | Obligatorio | Origen típico |
|-------|-------------|----------------|
| `deviceId` | Sí | ID fijo del Arduino (ej. `uno-secador-01`) |
| `codigoGrupo` o `grupoRubroId` | Uno de los dos | Config en firmware |
| `timestamp` | No (ISO 8601) | **DS3231**; si falta, usa hora del servidor |
| `eventId` | No | Recomendado (`deviceId` + hora) para deduplicar |
| `lecturas.temperatura` | Sí | **AHT10** (°C) |
| `lecturas.humedad` | Sí | **AHT10** (%RH, 0–100) |
| `lecturas.nivelSecado` | No | Ventilador / potenciómetro (fase 2) |
| `lecturas.tiempoSecado` | No | Minutos de ciclo (RTC + lógica local) |

## Respuesta esperada

- `201` cuando se registra una nueva lectura.
- `200` cuando el `eventId` ya existe (deduplicado).
- `429` si el `deviceId` excede el límite de eventos por minuto.

## Consultas para app

- `GET /api/telemetry/latest` (auth): última lectura por grupo.
- `GET /api/telemetry/group/:grupoRubroId?limit=20` (auth): historial reciente por grupo.
- `GET /api/telemetry/fluctuaciones/humedad?from=&to=&grupoRubroId=` (auth, supervisor/gerente): agregación diaria min/max/promedio y conteo fuera de rango.

Para el **registro de fluctuaciones 24/7**, el gateway debe enviar telemetría de forma continua (no solo durante secado activo). Cada evento se persiste en `TelemetryEvent`.

## Alertas (Sprint 7)

Tras cada ingesta nueva, el backend evalúa la lectura frente a la calibración del grupo y la humedad global. Solo se evalúan **nivel** y **tiempo** de secado si vienen en el payload.

- `GET /api/alerts` (auth): listado de alertas.
- `GET /api/alerts/count` (auth): `{ unread }` alertas no leídas.
- `PATCH /api/alerts/:id/read` (auth): marcar una alerta como leída.
- `DELETE /api/alerts/:id` (auth): borrado lógico (`eliminada: true`); no aparece en listados.
- `POST /api/alerts/mark-all-read` (auth): marcar todas como leídas.

## Códigos de grupo válidos (seed)

- `garbanzo-lenteja`
- `platano-cambur`
- `yuca-batata`
