# Telemetría de planta — Nativa

Arquitectura oficial para monitoreo en tiempo real desde la app móvil.

## Flujo de producción (recomendado)

```
  AHT10 + DS3231
        │ I2C
        ▼
  ESP32  o  ESP-12F (ESP8266)  + Wi‑Fi
        │  POST /api/arduino/telemetry  (JSON cada ~30 s)
        ▼
  Backend Nativa  ──►  MongoDB Atlas
        │  REST (JWT)
        ▼
  APK operador / gerente / supervisor
```

| Capa | Qué hace |
|------|----------|
| **Sensores** | AHT10: temperatura y humedad. DS3231: hora del evento (`timestamp`). |
| **ESP32 / ESP-12F** | Se une a la red Wi‑Fi de planta y envía lecturas al servidor por HTTP. **No requiere PC encendida.** |
| **Backend** | Valida el payload, guarda telemetría, evalúa alertas si hay secado activo. |
| **App móvil** | Consulta `GET /api/telemetry/*` y alertas; **no** se conecta al Arduino por Bluetooth. |

## Firmware de referencia

| Carpeta | Uso |
|---------|-----|
| **[`esp32-aht10-ds3231/`](esp32-aht10-ds3231/README.md)** | **Producción** — ESP32 + Wi‑Fi directo al API |
| **[`esp8266-esp12f-aht10-ds3231/`](esp8266-esp12f-aht10-ds3231/README.md)** | **ESP-12F (ESP8266)** + Wi‑Fi directo al API (mismo contrato) |
| [`arduino-uno-aht10-ds3231-hc05/`](arduino-uno-aht10-ds3231-hc05/README.md) | Solo desarrollo / kit Uno sin Wi‑Fi (gateway en PC) |

Si tienes Arduino Uno + sensores, puedes **mover AHT10 y DS3231 al ESP-12F/ESP32** (I2C) y dejar de usar el gateway.

## Configuración rápida (ESP32 o ESP-12F)

1. Cablea AHT10 y DS3231 al I2C de la placa Wi‑Fi (ESP32: 21/22 — ESP-12F: **4/5**).
2. Copia `config.example.h` → `config.h` en la carpeta del firmware correspondiente.
3. Completa `WIFI_SSID`, `WIFI_PASSWORD`, `API_URL`, `DEVICE_ID`, `CODIGO_GRUPO`.
4. Sube el `.ino` con la placa correcta (ESP32 Dev Module **o** NodeMCU/Generic ESP8266).
5. Backend en marcha (local o Render) con MongoDB Atlas.
6. En la app: operador inicia secado → ver T/HR, gráficos y alertas.

### Ejemplos de `API_URL`

| Entorno | `API_URL` |
|---------|-----------|
| Backend en PC (misma red) | `http://192.168.1.100:4000/api/arduino/telemetry` |
| Túnel ngrok | `https://tu-dominio.ngrok-free.app/api/arduino/telemetry` |
| Backend en Render | `https://app-harinas.onrender.com/api/arduino/telemetry` |

Con HTTPS (`https://...`), define `API_USE_HTTPS` en `1` en `config.h`.

## Contrato API

Documentación completa: [`backend/docs/arduino-telemetry-contract.md`](../backend/docs/arduino-telemetry-contract.md)

Grupos válidos (tras `npm run seed:grupos`): `garbanzo-lenteja`, `platano-cambur`, `yuca-batata`.

## Probar sin hardware

```powershell
cd backend
npm run dev
npm run simulate:telemetry
```

## Documentación relacionada

- Operación local, ngrok, Atlas, APK: [`docs/OPERACION-LOCAL.md`](../docs/OPERACION-LOCAL.md)
- **Montaje kit Uno + ESP-12F:** [`docs/MONTAJE-HARDWARE-UNO-ESP12F.md`](../docs/MONTAJE-HARDWARE-UNO-ESP12F.md)
- Deploy backend + Atlas: [`DEPLOY-PLAN.md`](../DEPLOY-PLAN.md)
