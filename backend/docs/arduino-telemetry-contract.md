# Contrato Telemetria Arduino -> Backend (Sprint 6)

Endpoint de ingesta:

- `POST /api/arduino/telemetry`

## Payload JSON v1.1 (recomendado — AHT10 + DS3231)

Solo **temperatura** y **humedad** son obligatorias. Ideal para ESP32 con sensor **AHT10** y reloj **DS3231**.

```json
{
  "eventId": "esp32-01-20260601143000",
  "deviceId": "esp32-secador-01",
  "codigoGrupo": "garbanzo-lenteja",
  "timestamp": "2026-06-01T14:30:00.000Z",
  "lecturas": {
    "temperatura": 41.2,
    "humedad": 54.1
  }
}
```

Firmware de referencia: [`firmware/esp32-aht10-ds3231/`](../../firmware/esp32-aht10-ds3231/README.md).

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
| `deviceId` | Sí | ID fijo del ESP32 / Arduino |
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

## Alertas (Sprint 7)

Tras cada ingesta nueva, el backend evalúa la lectura frente a la calibración del grupo y la humedad global. Solo se evalúan **nivel** y **tiempo** de secado si vienen en el payload.

- `GET /api/alerts` (auth): listado de alertas.
- `GET /api/alerts/count` (auth): `{ unread }` alertas no leídas.
- `PATCH /api/alerts/:id/read` (auth): marcar una alerta como leída.
- `POST /api/alerts/mark-all-read` (auth): marcar todas como leídas.

## Códigos de grupo válidos (seed)

- `garbanzo-lenteja`
- `platano-cambur`
- `yuca-batata`
