# Telemetría de planta — Nativa

Arquitectura oficial para monitoreo en tiempo real desde la app móvil.

## Flujo de producción (recomendado)

```
  AHT10 + DS3231
        │ I2C
        ▼
     ESP32 + Wi‑Fi
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
| **ESP32** | Se une a la red Wi‑Fi de planta y envía lecturas al servidor por HTTP. **No requiere PC encendida.** |
| **Backend** | Valida el payload, guarda telemetría, evalúa alertas si hay secado activo. |
| **App móvil** | Consulta `GET /api/telemetry/*` y alertas; **no** se conecta al Arduino por Bluetooth. |

## Firmware de referencia

| Carpeta | Uso |
|---------|-----|
| **[`esp32-aht10-ds3231/`](esp32-aht10-ds3231/README.md)** | **Producción** — ESP32 + Wi‑Fi directo al API |
| [`arduino-uno-aht10-ds3231-hc05/`](arduino-uno-aht10-ds3231-hc05/README.md) | Solo desarrollo / kit Uno sin ESP32 (gateway en PC) |

Si tienes Arduino Uno + HC-05, los sensores **AHT10 y DS3231 se reutilizan** al migrar a ESP32; solo cambia la placa con Wi‑Fi.

## Configuración rápida (ESP32)

1. Cablea AHT10 y DS3231 al bus I2C del ESP32 (GPIO 21/22 por defecto).
2. Copia `esp32-aht10-ds3231/esp32_nativa_telemetry/config.example.h` → `config.h`.
3. Completa `WIFI_SSID`, `WIFI_PASSWORD`, `API_URL`, `DEVICE_ID`, `CODIGO_GRUPO`.
4. Sube `esp32_nativa_telemetry.ino` con la placa **ESP32 Dev Module**.
5. Backend en marcha (local, ngrok o Render) con MongoDB Atlas.
6. En la app: operador inicia secado → ver T/HR, gráficos y alertas.

### Ejemplos de `API_URL`

| Entorno | `API_URL` |
|---------|-----------|
| Backend en PC (misma red) | `http://192.168.1.100:4000/api/arduino/telemetry` |
| Túnel ngrok | `https://tu-dominio.ngrok-free.app/api/arduino/telemetry` |
| Backend en Render | `https://tu-app.onrender.com/api/arduino/telemetry` |

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
- Deploy backend + Atlas: [`DEPLOY-PLAN.md`](../DEPLOY-PLAN.md)
