# Arduino Uno + HC-05 — solo desarrollo (sin Wi‑Fi en placa)

> **No usar en planta.** El Arduino Uno **no tiene Wi‑Fi**. Para producción usa **[ESP32 + Wi‑Fi → servidor](../esp32-aht10-ds3231/README.md)** con los mismos sensores AHT10 y DS3231.
>
> Este folder queda para pruebas con tu kit Uno + HC-05 y un **gateway en PC**.

Firmware para kit (jun 2026): **Arduino Uno**, **AHT10**, **DS3231**, **HC-05** (Bluetooth clásico).

---

## Arquitectura de producción (usar ESP32)

En producción el dispositivo debe **unirse a una red Wi‑Fi** y **enviar datos al servidor** por HTTP. La app solo consulta el backend; no habla con el Arduino.

```
Sensores (AHT10 + DS3231)
        ↓ I2C
   Micro con Wi‑Fi (ESP32 recomendado)
        ↓  POST /api/arduino/telemetry  (JSON)
   Backend Nativa (local / Render + MongoDB Atlas)
        ↓  REST
   APK operador / gerente
```

Eso **ya está implementado** en:

- **Firmware:** [`../esp32-aht10-ds3231/`](../esp32-aht10-ds3231/README.md)  
- **Contrato API:** [`backend/docs/arduino-telemetry-contract.md`](../../backend/docs/arduino-telemetry-contract.md)

Configuras en el ESP32: `WIFI_SSID`, `WIFI_PASSWORD`, `API_URL` (ngrok, IP local o URL de Render). Cada ~30 s envía temperatura, humedad y hora del RTC.

| Entorno | Ejemplo `API_URL` |
|---------|-------------------|
| PC en la misma red | `http://192.168.1.100:4000/api/arduino/telemetry` |
| Túnel ngrok | `https://tu-dominio.ngrok-free.app/api/arduino/telemetry` |
| Backend en la nube | `https://tu-app.onrender.com/api/arduino/telemetry` |

---

## Ruta temporal con tu Arduino Uno (sin Wi‑Fi en la placa)

El **Arduino Uno no tiene Wi‑Fi**. Por eso este folder describe un **puente por PC**:

La **app móvil no se empareja por Bluetooth** con el Arduino. El flujo provisional es:

```
AHT10 + DS3231 ──I2C──► Arduino Uno ──JSON──► USB o HC-05
                                              │
                                    PC con gateway (este repo)
                                              │
                                              ▼
                                    POST /api/arduino/telemetry
                                              │
                                              ▼
                                    APK (operador / gerente)
```

### Para pasar de Uno → Wi‑Fi directo

| Opción | Qué comprar / usar |
|--------|---------------------|
| **Recomendada** | Placa **ESP32** (~mismo precio que muchos kits) + mismo AHT10 y DS3231 en I2C → firmware `esp32-aht10-ds3231` |
| Alternativa | **ESP8266 (ESP-01)** como módulo Wi‑Fi (más cableado, menos cómodo que ESP32) |
| Temporal | PC o Raspberry con el **gateway** de este folder (no ideal en planta 24/7) |

Los sensores **AHT10 y DS3231 se reutilizan**; solo cambia el micro que tenga Wi‑Fi.

---

## Identificación de tus módulos

| En la foto | Módulo | Función |
|------------|--------|---------|
| Arduino azul | **Arduino Uno** | Lee sensores y arma el JSON |
| PCB con pila CR2032 | **DS3231** | Hora real → `timestamp` |
| PCB pequeña 4 pines | **AHT10** (u similar I2C) | Temperatura + humedad |
| Azul 6 pines | **HC-05 / HC-06** | Bluetooth serial (9600 baud) |
| PCB chica extra | Ver abajo | No obligatoria para este firmware |

### ¿Qué es el módulo pequeño extra?

- Si tiene **6 pines** y dice **HC-05/06** → duplicado, no lo necesitas a la vez.
- Si es **HM-10 / JDY-08** (BLE 4.0) → **no** sirve con este sketch (es otro protocolo). Guárdalo o úsalo en un sprint futuro con app BLE.
- Si es **ESP-01 / ESP8266** → podría usarse después como **puente Wi‑Fi** sin PC (ver «Componentes que faltan»).

---

## Cableado recomendado

### I2C compartido (AHT10 + DS3231)

| Señal | Arduino Uno |
|-------|-------------|
| SDA | **A4** |
| SCL | **A5** |
| VCC | **5V** (breakouts con regulador) |
| GND | **GND** |

### HC-05 (SoftwareSerial)

| HC-05 | Arduino Uno |
|-------|-------------|
| VCC | **5V** |
| GND | **GND** |
| TXD | Pin **10** (`BT_RX_PIN`) |
| RXD | Pin **11** (`BT_TX_PIN`) vía **divisor de voltaje** |

**Importante:** el RX del HC-05 es **3.3 V**. No conectes el TX del Arduino (5 V) directo.

Divisor típico Arduino → HC-05 RX:

```
Arduino pin 11 (TX) ──[1 kΩ]──┬── HC-05 RXD
                              │
                           [2 kΩ]
                              │
                             GND
```

### Programación por USB

Mientras subes el sketch, el HC-05 puede desconectarse de los pines **0/1** (usamos 10/11 a propósito).

---

## Software Arduino

1. [Arduino IDE](https://www.arduino.cc/en/software) → placa **Arduino Uno**.
2. Librerías: **Adafruit AHTX0**, **RTClib**, **ArduinoJson 6**.
3. Copia `nativa_uno_telemetry/config.example.h` → `config.h`.
4. Abre `nativa_uno_telemetry.ino` y **Subir**.

En el Monitor Serie (115200) deberías ver líneas JSON cada `INTERVAL_MS` (30 s por defecto).

---

## Gateway en PC (puente a la API)

Con el Uno por **USB** (más fácil para empezar) o con **HC-05 emparejado** al PC (aparece otro puerto COM):

```powershell
cd backend
npm run dev

cd ..\firmware\arduino-uno-aht10-ds3231-hc05\gateway
npm install
copy .env.example .env
# Edita SERIAL_PORT=COMx en .env
npm start
```

Variables `.env`:

| Variable | Ejemplo |
|----------|---------|
| `SERIAL_PORT` | `COM3` (USB) o `COM5` (Bluetooth) |
| `SERIAL_BAUD` | `115200` (USB) o `9600` si lees solo el HC-05* |
| `API_URL` | `http://localhost:4000/api/arduino/telemetry` |

\* Si usas solo HC-05 sin espejo USB, cambia `MIRROR_USB_SERIAL` a `0` en `config.h` y pon `SERIAL_BAUD=9600`.

Con backend + gateway activos, la **app** verá telemetría y alertas al iniciar secado (Sprint 14–15).

---

## Componentes que **faltan** (o recomendados)

### Para funcionar en planta **sin PC encendida**

| Componente | Para qué |
|------------|----------|
| **ESP8266 (ESP-01)** o **ESP32** | Wi‑Fi → API directa (firmware ya existe para ESP32 en `../esp32-aht10-ds3231/`) |
| o **Ethernet Shield** para Uno | Red cableada |
| o **PC / Raspberry Pi** siempre on | Solo con el gateway de este folder |

### Para montaje seguro (recomendado)

| Componente | Para qué |
|------------|----------|
| **Resistencias 1 kΩ + 2 kΩ** | Divisor en HC-05 RX (proteger 3.3 V) |
| **Protoboard + cables dupont** | Si aún no está cableado fijo |
| **Pila CR2032** en DS3231 | Si el reloj perdió hora (`lostPower`) |
| **Fuente 5 V ≥ 1 A** | Si alimentas todo sin USB (Uno + HC-05 consumen más que solo USB) |

### No hace falta comprar

- Otro HC-05 si ya tienes uno funcionando.
- El módulo BLE chico **a menos** que quieras desarrollar conexión BLE en la app (no está hoy).

---

## Segundo módulo Bluetooth

Usa **solo un camino** a la vez:

1. **USB + gateway** (desarrollo y demo), o  
2. **HC-05 emparejado al PC** con gateway, o  
3. **ESP32 con Wi‑Fi** (producción, sin PC).

No mezcles dos módulos BT en el mismo bus serial sin saber cuál es.

---

## Contrato JSON (igual que ESP32)

```json
{
  "eventId": "uno-secador-01-20260617103000",
  "deviceId": "uno-secador-01",
  "codigoGrupo": "garbanzo-lenteja",
  "timestamp": "2026-06-17T10:30:00.000Z",
  "lecturas": {
    "temperatura": 41.2,
    "humedad": 54.1,
    "tiempoSecado": 12
  }
}
```

`tiempoSecado` en el Uno es minutos desde que encendió (aprox.). El **temporizador del operador en la app** sigue siendo la referencia del ciclo de planta.

Documentación API: [`backend/docs/arduino-telemetry-contract.md`](../../backend/docs/arduino-telemetry-contract.md).

**Montaje de tu kit (Uno + ESP-12F + reguladores):** [`docs/MONTAJE-HARDWARE-UNO-ESP12F.md`](../../docs/MONTAJE-HARDWARE-UNO-ESP12F.md).

---

## Checklist rápido

- [ ] AHT10 + DS3231 en I2C (A4/A5)
- [ ] HC-05 con divisor en RX
- [ ] `config.h` con `CODIGO_GRUPO` y `DEVICE_ID`
- [ ] Sketch subido al Uno
- [ ] Backend `npm run dev` (o Atlas + Render)
- [ ] Gateway `npm start` con `SERIAL_PORT` correcto
- [ ] Operador inicia secado en la app → ver T/HR y alertas
