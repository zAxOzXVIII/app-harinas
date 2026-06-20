# ESP32 + AHT10 + DS3231 → Nativa API (producción)

Firmware oficial para **enviar telemetría por Wi‑Fi** al backend Nativa. La app móvil lee los datos desde el servidor; no hay conexión directa teléfono ↔ Arduino.

## Arquitectura

```
┌─────────────┐     I2C      ┌──────────┐    Wi‑Fi / HTTP    ┌─────────────┐
│ AHT10       │─────────────►│          │───────────────────►│ Backend     │
│ DS3231      │              │  ESP32   │  POST /api/arduino │ (Atlas DB)  │
└─────────────┘              └──────────┘     /telemetry     └──────┬──────┘
                                                                     │ REST
                                                                     ▼
                                                              App Nativa (APK)
```

Cada `INTERVAL_MS` (30 s por defecto) el ESP32 lee sensores, arma JSON y hace `POST` al API. El backend persiste la lectura y, si hay un proceso de secado activo, puede generar alertas.

## Hardware

| Módulo | Función | Bus |
|--------|---------|-----|
| **AHT10** | Temperatura (°C) y humedad (%RH) | I2C |
| **DS3231** | Reloj RTC → campo `timestamp` | I2C |
| **ESP32** | Wi‑Fi + HTTP POST | — |

### Cableado I2C (por defecto en el sketch)

| Señal | ESP32 |
|-------|-------|
| SDA | GPIO 21 |
| SCL | GPIO 22 |
| VCC | 3.3 V |
| GND | GND |

AHT10 y DS3231 comparten el mismo bus I2C (direcciones distintas).

> Si vienes de un kit **Arduino Uno**, desconecta los sensores del Uno y conéctalos al ESP32 con el mismo esquema I2C (SDA/SCL + alimentación).

## Software

1. [Arduino IDE](https://www.arduino.cc/en/software) o PlatformIO.
2. Placa: **ESP32 Dev Module** (paquete `esp32` por Espressif en el Gestor de placas).
3. Librerías (Gestor de librerías):
   - **Adafruit AHTX0**
   - **RTClib** (Adafruit)
   - **ArduinoJson** 6.x
4. En `esp32_nativa_telemetry/`:
   - Copia `config.example.h` → `config.h`
   - Edita Wi‑Fi, URL del API, `DEVICE_ID` y `CODIGO_GRUPO`
5. Abre `esp32_nativa_telemetry.ino` y sube al ESP32.
6. Monitor serie (115200): deberías ver `AHT10 OK`, `DS3231 OK`, IP Wi‑Fi y `POST 201`.

## Configuración (`config.h`)

| Variable | Descripción |
|----------|-------------|
| `WIFI_SSID` | Red Wi‑Fi de planta u oficina |
| `WIFI_PASSWORD` | Clave de la red |
| `API_URL` | URL completa del endpoint de ingesta |
| `API_USE_HTTPS` | `1` si `API_URL` usa `https://` (ngrok, Render) |
| `DEVICE_ID` | ID único del equipo, ej. `esp32-secador-01` |
| `CODIGO_GRUPO` | Grupo de rubro asociado al secador |
| `INTERVAL_MS` | Intervalo entre envíos (ms), default `30000` |
| `I2C_SDA` / `I2C_SCL` | Pines I2C (21/22 en DevKit típico) |

### `API_URL` según entorno

| Escenario | Ejemplo |
|-----------|---------|
| Backend en PC (LAN) | `http://192.168.1.100:4000/api/arduino/telemetry` |
| ngrok (demo / APK) | `https://tu-dominio.ngrok-free.app/api/arduino/telemetry` |
| Render + Atlas | `https://app-harinas-api.onrender.com/api/arduino/telemetry` |

Grupos válidos (tras `npm run seed:grupos`): `garbanzo-lenteja`, `platano-cambur`, `yuca-batata`.

**Requisitos de red:** el ESP32 debe alcanzar el host del `API_URL` (misma LAN, o internet si el backend está en la nube). El firewall del servidor debe permitir el puerto del API.

## Integración con la app

1. Backend desplegado o local con MongoDB (Atlas recomendado en producción).
2. Operador inicia secado en la app para el grupo configurado en `CODIGO_GRUPO`.
3. El ESP32 envía lecturas → backend evalúa umbrales → alertas y gráficos en operador/gerente.
4. La app hace polling cada ~10 s; no necesita estar en la misma red que el ESP32 si el backend es público (Render/ngrok).

## Probar sin hardware

```powershell
cd backend
npm run dev
curl -X POST http://localhost:4000/api/arduino/telemetry `
  -H "Content-Type: application/json" `
  -d '{\"deviceId\":\"test\",\"codigoGrupo\":\"garbanzo-lenteja\",\"lecturas\":{\"temperatura\":25.5,\"humedad\":60}}'
```

O: `npm run simulate:telemetry`

## RTC — hora correcta

Si el DS3231 perdió pila, el sketch ajusta con la hora de **compilación** una sola vez (`rtc.lostPower()`). Para producción:

- Sincroniza NTP en un sketch aparte, o
- Ajusta manualmente con RTClib: `rtc.adjust(DateTime(2026, 6, 1, 14, 30, 0));`

## Fase 2 (opcional)

Sensores adicionales de **nivel de secado** o **tiempo de secado** en el JSON:

```json
"lecturas": {
  "temperatura": 41.2,
  "humedad": 54.1,
  "nivelSecado": 62.5,
  "tiempoSecado": 48
}
```

El backend ya acepta esos campos como opcionales.

## Checklist de puesta en marcha

- [ ] AHT10 + DS3231 cableados a ESP32 (I2C)
- [ ] `config.h` con Wi‑Fi, `API_URL`, `DEVICE_ID`, `CODIGO_GRUPO`
- [ ] Sketch subido; monitor serie muestra `POST 201` o `POST 200`
- [ ] Backend activo (`GET /api/health` OK)
- [ ] Grupo sembrado (`npm run seed:grupos`)
- [ ] Operador inicia secado en app → telemetría y alertas visibles

## Otras rutas de hardware

| Ruta | Cuándo usarla |
|------|----------------|
| **Este firmware (ESP32)** | Planta, demo estable, sin PC |
| [`arduino-uno-aht10-ds3231-hc05/`](arduino-uno-aht10-ds3231-hc05/README.md) | Solo desarrollo con Uno + gateway PC |

Montaje detallado del kit Uno + ESP-12F + reguladores: [`docs/MONTAJE-HARDWARE-UNO-ESP12F.md`](../../docs/MONTAJE-HARDWARE-UNO-ESP12F.md).

Índice general: [`../README.md`](../README.md)

## Contrato API

[`backend/docs/arduino-telemetry-contract.md`](../../backend/docs/arduino-telemetry-contract.md)
