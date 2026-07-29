# ESP-12F (ESP8266) + AHT10 + DS3231 → Nativa API

Firmware para el **ESP-12F** (chip **ESP8266**, no ESP32). Misma idea que el ESP32: Wi‑Fi → `POST /api/arduino/telemetry` → Render → app.

## Diferencia con ESP32

| | ESP32 | ESP-12F |
|--|-------|---------|
| Chip | ESP32 | **ESP8266** |
| Sketch | `firmware/esp32-aht10-ds3231/` | **este** |
| Placa IDE | ESP32 Dev Module | NodeMCU 1.0 / Generic ESP8266 |
| I2C por defecto | GPIO 21/22 | **GPIO 4 (SDA) / GPIO 5 (SCL)** |
| Alimentación | 3.3 V | **3.3 V estricto** (nunca 5 V) |

## Hardware mínimo

Sensores en el ESP (como el ESP32):

| Señal | ESP-12F |
|-------|---------|
| SDA | **GPIO4** |
| SCL | **GPIO5** |
| VCC sensores | 3.3 V (mismo riel del ESP) o 5 V solo si el módulo AHT10/DS3231 lo tolera y hay nivel I2C compatible |
| GND | GND común |

**Montaje completo y “¿qué más hace falta?”:** [`docs/MONTAJE-HARDWARE-UNO-ESP12F.md`](../../docs/MONTAJE-HARDWARE-UNO-ESP12F.md)

## Software

1. Arduino IDE → instalar core **esp8266** (http://arduino.esp8266.com/stable/package_esp8266com_index.json).
2. Placa: **NodeMCU 1.0 (ESP-12E Module)** o **Generic ESP8266 Module**.
3. Librerías: Adafruit AHTX0, RTClib, ArduinoJson 6.x.
4. Copia `config.example.h` → `config.h` y completa Wi‑Fi + `API_URL`.
5. Sube `esp12f_nativa_telemetry.ino`.
6. Monitor serie **115200**: `AHT10 OK`, `DS3231 OK`, `POST 201`.

### `config.h` (Render)

```cpp
#define WIFI_SSID "tu-red"
#define WIFI_PASSWORD "tu-clave"
#define API_URL "https://app-harinas.onrender.com/api/arduino/telemetry"
#define API_USE_HTTPS 1
#define DEVICE_ID "esp12f-secador-01"
#define CODIGO_GRUPO "garbanzo-lenteja"
```

## Programar el ESP-12F

Necesitas un adaptador **USB‑TTL 3.3 V** (FTDI / CP2102 / CH340) o una placa adaptadora ESP-12F con USB:

| Modo | GPIO0 | Acción |
|------|-------|--------|
| Flash | a GND | Subir sketch |
| Run | pull-up 3.3 V | Ejecución normal |

El Arduino Uno **no** es el chip que lee sensores en esta ruta: si lo usas, es como fuente 5 V USB hacia un regulador 3.3 V, no como MCU principal.
