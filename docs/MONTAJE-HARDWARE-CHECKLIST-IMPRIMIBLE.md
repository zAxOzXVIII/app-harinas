# Checklist imprimible — Montaje USB (Uno + AHT10 + DS3231)

**Guía:** [`MONTAJE-HARDWARE-UNO-USB.md`](MONTAJE-HARDWARE-UNO-USB.md) · **Gateway:** [`COMO-EJECUTAR-GATEWAY-ARDUINO.md`](COMO-EJECUTAR-GATEWAY-ARDUINO.md)

| Fecha: _______________ | Montador: _______________ |
|------------------------|-----------------------------|

---

## Cables

| Desde | Hacia | Color sugerido |
|-------|-------|----------------|
| Uno **GND** | GND AHT10 + GND DS3231 | Negro |
| Uno **5V** | VCC AHT10 + VCC DS3231 | Rojo |
| Uno **A4** | SDA ambos | Azul |
| Uno **A5** | SCL ambos | Amarillo |

**DS3231 / HW-084** = PCB con ranura pila CR2032 · **AHT10** = PCB pequeña **sin pila**

---

## Montaje

| ☐ | Paso |
|---|------|
| ☐ | Protoboard; riel GND marcado |
| ☐ | Uno con USB accesible |
| ☐ | GND común |
| ☐ | DS3231: VCC→5V, GND→GND, pila CR2032 |
| ☐ | AHT10: VCC→5V, GND→GND |
| ☐ | SDA → A4 · SCL → A5 |
| ☐ | Cables I2C < 20 cm |
| ☐ | **Sin** ESP-12F, HC-05 ni 12 V |

---

## Verificación

| ☐ | Medición | Esperado | Medido |
|---|----------|----------|--------|
| ☐ | GND Uno ↔ GND sensores | Continuidad | ______ |
| ☐ | VCC ↔ GND | Sin corto | ______ |
| ☐ | VCC con USB | ~5 V | ______ V |

---

## Software

| ☐ | Paso | Notas |
|---|------|-------|
| ☐ | Sketch subido, monitor **115200** | `AHT10 OK` / `DS3231 OK` |
| ☐ | Monitor Serie **cerrado** | |
| ☐ | `gateway/.env` → Render | `SERIAL_PORT=COM__` |
| ☐ | `npm start` en gateway | `POST 201` |
| ☐ | App: Operador inicia secado | |

---

*Nativa Superalimentos — App Harinas · solo Ruta USB*
