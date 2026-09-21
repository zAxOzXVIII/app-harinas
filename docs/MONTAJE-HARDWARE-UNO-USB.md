# Montaje USB — Arduino Uno + AHT10 + DS3231

**Único flujo:** sensores en el Uno, USB a la PC, gateway → Render. No uses ESP-12F ni ESP32 Wi‑Fi.

## Piezas

- Arduino Uno
- AHT10 (PCB pequeña, sin pila)
- HW-084 / DS3231 (ranura pila CR2032)
- Cables Dupont + USB A–B

## Cableado

| Desde | Hacia |
|-------|-------|
| Uno **GND** | GND AHT10 + GND DS3231 |
| Uno **5V** | VCC AHT10 + VCC DS3231 |
| Uno **A4** (SDA) | SDA de ambos sensores |
| Uno **A5** (SCL) | SCL de ambos sensores |

No conectar ESP-12F, HC-05 ni 12 V para esta operación.

## Después del cableado

1. Subir sketch `firmware/arduino-uno-aht10-ds3231-hc05/nativa_uno_telemetry/`
2. Arrancar gateway: [`COMO-EJECUTAR-GATEWAY-ARDUINO.md`](COMO-EJECUTAR-GATEWAY-ARDUINO.md)
3. Checklist: [`MONTAJE-HARDWARE-CHECKLIST-IMPRIMIBLE.md`](MONTAJE-HARDWARE-CHECKLIST-IMPRIMIBLE.md)
