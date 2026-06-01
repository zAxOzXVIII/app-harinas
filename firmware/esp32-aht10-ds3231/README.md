# ESP32 — AHT10 + DS3231 → Nativa API

Firmware de referencia para enviar **temperatura**, **humedad** y **marca de tiempo** al backend Nativa.

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

## Software

1. Instala [Arduino IDE](https://www.arduino.cc/en/software) o PlatformIO.
2. Placa: **ESP32 Dev Module** (paquete `esp32` por Espressif).
3. Librerías (Gestor de librerías):
   - **Adafruit AHTX0**
   - **RTClib** (Adafruit)
   - **ArduinoJson** 6.x
4. En `esp32_nativa_telemetry/`, copia `config.example.h` → `config.h` y edita Wi‑Fi, URL y `CODIGO_GRUPO`.
5. Abre `esp32_nativa_telemetry.ino` y sube al ESP32.

## Configuración API

| Variable | Ejemplo |
|----------|---------|
| `API_URL` | `http://192.168.1.100:4000/api/arduino/telemetry` |
| `API_USE_HTTPS` | `1` si usas ngrok/Render (`https://...`) |
| `DEVICE_ID` | `esp32-secador-01` |
| `CODIGO_GRUPO` | `garbanzo-lenteja` |

Grupos válidos (tras `npm run seed:demo`): `garbanzo-lenteja`, `platano-cambur`, `yuca-batata`.

## Probar sin hardware

```bash
cd backend
npm run dev
# otra terminal:
curl -X POST http://localhost:4000/api/arduino/telemetry \
  -H "Content-Type: application/json" \
  -d "{\"deviceId\":\"test\",\"codigoGrupo\":\"garbanzo-lenteja\",\"lecturas\":{\"temperatura\":25.5,\"humedad\":60}}"
```

## RTC — poner hora correcta

Si el DS3231 perdió pila, el sketch ajusta con la hora de **compilación** una sola vez (`rtc.lostPower()`). Para producción:

- Sincroniza NTP en un sketch aparte, o
- Ajusta manualmente con un ejemplo RTClib `rtc.adjust(DateTime(2026, 6, 1, 14, 30, 0));`

## Fase 2 (opcional)

Cuando tengas sensores de **nivel de secado** o quieras **tiempo de secado** (minutos desde inicio de ciclo con el DS3231), añade al JSON:

```json
"lecturas": {
  "temperatura": 41.2,
  "humedad": 54.1,
  "nivelSecado": 62.5,
  "tiempoSecado": 48
}
```

El backend ya acepta esos campos como opcionales.

## Documentación del contrato

[backend/docs/arduino-telemetry-contract.md](../../backend/docs/arduino-telemetry-contract.md)
