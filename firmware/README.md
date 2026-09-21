# Firmware vigente — Arduino Uno USB → PC → Render

**Sin Wi‑Fi en la placa.** El Uno va por USB a la laptop; el gateway lee el COM y manda las lecturas a Render.

```
AHT10 + DS3231 ──I2C──► Arduino Uno ──USB──► gateway (laptop) ──HTTPS──► Render ──► App
```

## Qué va

| Pieza | Carpeta |
|-------|---------|
| Sketch Arduino Uno | `arduino-uno-aht10-ds3231-hc05/nativa_uno_telemetry/` |
| Gateway Node (lee COM, POST Render) | `arduino-uno-aht10-ds3231-hc05/gateway/` |

Arranque: [`docs/COMO-EJECUTAR-GATEWAY-ARDUINO.md`](../docs/COMO-EJECUTAR-GATEWAY-ARDUINO.md)

## Qué no va

- ESP32 / ESP-12F (Wi‑Fi de placa) — **eliminados**
- HC-05 Bluetooth — **quitado del sketch** (solo USB)

El nombre de carpeta `...-hc05` es histórico; el código ya no usa Bluetooth.

## Probar sin hardware

```powershell
cd backend
npm run simulate:telemetry
```
