# Arduino Uno + AHT10 + DS3231 — USB a la PC → Render

Flujo **único** del proyecto: sensores en el Uno, USB a la laptop, gateway Node, POST a Render. **Sin Wi‑Fi de placa.**

```
AHT10 + DS3231 ──I2C──► Arduino Uno ──USB (COM)──► gateway ──► Render ──► App
```

La app **no** se empareja por Bluetooth ni habla con el Arduino.

## Cableado I2C

| Señal | Arduino Uno |
|-------|-------------|
| SDA | **A4** |
| SCL | **A5** |
| VCC | **5V** |
| GND | **GND** |

AHT10 y DS3231 (HW-084) comparten el mismo bus. Cables I2C cortos (< 20 cm).

## Software Arduino

1. Arduino IDE → placa **Arduino Uno**.
2. Librerías: **Adafruit AHTX0**, **RTClib**, **ArduinoJson 6**.
3. Copia `nativa_uno_telemetry/config.example.h` → `config.h`.
4. Sube `nativa_uno_telemetry.ino`.
5. Monitor Serie **115200**: JSON cada ~30 s. Cierra el monitor antes del gateway.

## Gateway → Render

```powershell
cd firmware\arduino-uno-aht10-ds3231-hc05\gateway
npm install
copy .env.example .env
```

En `.env`:

```env
SERIAL_PORT=COM3
SERIAL_BAUD=115200
API_URL=https://app-harinas.onrender.com/api/arduino/telemetry
WAIT_FOR_PORT=1
```

```powershell
npm start
```

Éxito: `POST 201 | T=… HR=… | true`

Texto corto: [`docs/COMO-EJECUTAR-GATEWAY-ARDUINO.md`](../../docs/COMO-EJECUTAR-GATEWAY-ARDUINO.md)

## Contrato JSON

```json
{"deviceId":"uno-secador-01","codigoGrupo":"garbanzo-lenteja","lecturas":{"temperatura":40.1,"humedad":32.3}}
```

El gateway completa `deviceId` / `codigoGrupo` si el sketch manda el formato legacy `{ temperature, humidity }`.
