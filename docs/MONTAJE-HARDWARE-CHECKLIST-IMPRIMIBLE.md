# Checklist imprimible — Montaje kit Nativa (Uno + DS3231 + AHT10)

**Proyecto:** App Harinas · **Documento completo:** [`MONTAJE-HARDWARE-UNO-ESP12F.md`](MONTAJE-HARDWARE-UNO-ESP12F.md)

| Fecha: _______________ | Montador: _______________ | Fase: ☐ 1 (USB)  ☐ 2 (+ ESP) |
|------------------------|-----------------------------|------------------------------|

---

## Referencia rápida de cables

| Desde | Hacia | Color sugerido |
|-------|-------|----------------|
| Uno **GND** | Riel GND + DS3231 GND + AHT10 GND | Negro |
| Uno **5V** | DS3231 VCC + AHT10 VCC | Rojo |
| Uno **A4** | DS3231 SDA + AHT10 SDA | Azul |
| Uno **A5** | DS3231 SCL + AHT10 SCL | Amarillo |
| Uno **pin 10** | HC-05/ESP **TX** | Verde |
| Uno **pin 11** | HC-05/ESP **RX** (vía divisor) | Blanco |

**DS3231** = PCB con **pila CR2032** · **AHT10** = PCB pequeña **sin pila**

---

## Fase 1 — Montaje eléctrico (USB)

| ☐ | Paso | Verificado |
|---|------|------------|
| ☐ | Protoboard lista; riel **GND** identificado y marcado | |
| ☐ | Arduino Uno conectado; cable **USB** accesible | |
| ☐ | **GND Uno** → riel GND común | |
| ☐ | Módulo correcto: **DS3231** (tiene ranura pila) | |
| ☐ | **CR2032** insertada (+ hacia arriba) | |
| ☐ | DS3231: **VCC** → 5V, **GND** → GND | |
| ☐ | Módulo correcto: **AHT10** (sin pila, chip sensor) | |
| ☐ | AHT10: **VCC** → 5V, **GND** → GND | |
| ☐ | **SDA** DS3231 + AHT10 → Uno **A4** | |
| ☐ | **SCL** DS3231 + AHT10 → Uno **A5** | |
| ☐ | Cables I2C **cortos** (< 20 cm) | |
| ☐ | **No** hay cables 12 V ni reguladores conectados aún | |

---

## Fase 1 — Verificación eléctrica

| ☐ | Medición | Esperado | Medido |
|---|----------|----------|--------|
| ☐ | GND Uno ↔ GND sensores | Continuidad (0 Ω) | ______ |
| ☐ | VCC sensor ↔ GND | **Sin corto** (∞) | ______ |
| ☐ | VCC sensor ↔ GND (con USB) | **~5 V** | ______ V |

---

## Fase 1 — Software

| ☐ | Paso | Notas |
|---|------|-------|
| ☐ | Sketch `nativa_uno_telemetry.ino` subido | |
| ☐ | Monitor serie **115200** abierto | |
| ☐ | Mensaje **`AHT10 OK`** | |
| ☐ | Mensaje **`DS3231 OK`** | |
| ☐ | JSON cada ~30 s con temp, humedad, timestamp | |
| ☐ | Backend `npm run dev` → `/api/health` OK | |
| ☐ | Gateway `npm start` → **POST 201** | COM: ______ |
| ☐ | App: operador inicia secado → ve telemetría | |

---

## Fase 2 — Montaje eléctrico (opcional: 12 V + ESP-12F)

| ☐ | Paso | Verificado |
|---|------|------------|
| ☐ | **Fase 1 OK** antes de continuar | |
| ☐ | Fuente **12 V** con GND común al Uno | |
| ☐ | **7805**: IN←12V, GND→riel, OUT→5V | |
| ☐ | **104** cerámico IN-GND y OUT-GND (7805) | |
| ☐ | **100 µF** polaridad correcta (si se usa) | |
| ☐ | **AMS1117**: IN←5V, OUT→**3.3 V solo ESP** | |
| ☐ | **104** cerámico IN-GND y OUT-GND (AMS1117) | |
| ☐ | ESP-12F en **adaptador** 2.54 mm | |
| ☐ | ESP **VCC = 3.3 V** (nunca 5 V) | |
| ☐ | **CH_PD** → 3.3 V vía 10 kΩ | |
| ☐ | **GPIO0** → 3.3 V vía 10 kΩ | |
| ☐ | **GPIO2** → 3.3 V vía 10 kΩ | |
| ☐ | **GPIO15** → GND vía 10 kΩ | |
| ☐ | Divisor **1k + 2k**: Uno pin 11 → ESP/HC-05 RX | |
| ☐ | ESP/HC-05 TX → Uno pin 10 | |

---

## Fase 2 — Verificación eléctrica (antes de encender ESP)

| ☐ | Medición | Esperado | Medido |
|---|----------|----------|--------|
| ☐ | Salida 7805 | 5.0 – 5.2 V | ______ V |
| ☐ | Salida AMS1117 (ESP VCC) | **3.3 V ± 0.1** | ______ V |
| ☐ | Corto 5 V ↔ 3.3 V | **Sin corto** | |
| ☐ | GPIO15 al boot | ~0 V | ______ V |

---

## HC-05 (alternativa a USB — marcar si aplica)

| ☐ | Paso |
|---|------|
| ☐ | HC-05 VCC → 5V, GND → GND |
| ☐ | HC-05 TXD → Uno pin 10 |
| ☐ | HC-05 RXD ← Uno pin 11 con divisor 1k/2k |
| ☐ | **Solo un camino activo:** USB **o** HC-05 **o** ESP |

---

## Anotaciones / incidencias

```
_______________________________________________________________________________

_______________________________________________________________________________

_______________________________________________________________________________

_______________________________________________________________________________
```

---

## Firmas

| Montaje eléctrico OK | Software OK | Fecha |
|----------------------|-------------|-------|
| ☐ __________________ | ☐ __________ | _____ |

---

*Imprimir en una hoja · Nativa Superalimentos — App Harinas*
