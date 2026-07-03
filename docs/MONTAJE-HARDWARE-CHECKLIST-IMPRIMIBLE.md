# Checklist imprimible — Montaje kit Nativa (Uno + HW-084 + AHT10)

**Proyecto:** App Harinas · **Guía completa:** [`MONTAJE-HARDWARE-UNO-ESP12F.md`](MONTAJE-HARDWARE-UNO-ESP12F.md) (sección 0 = cableado + IDE + Atlas)

| Fecha: _______________ | Montador: _______________ | Fase: ☐ 1 (USB)  ☐ 2 (+ ESP) |
|------------------------|-----------------------------|------------------------------|

---

## Referencia rápida de cables

| Desde | Hacia | Color sugerido |
|-------|-------|----------------|
| Uno **GND** | Riel GND + HW-084 GND + AHT10 GND | Negro |
| Uno **5V** | HW-084 VCC + AHT10 VCC | Rojo |
| Uno **A4** | HW-084 SDA + AHT10 SDA | Azul |
| Uno **A5** | HW-084 SCL + AHT10 SCL | Amarillo |
| Uno **pin 10** | HC-05/ESP **TX** | Verde |
| Uno **pin 11** | HC-05/ESP **RX** (vía divisor) | Blanco |

**HW-084** (= DS3231, con pila CR2032) · **AHT10** = PCB pequeña **sin pila**

---

## Fase 1 — Montaje eléctrico (USB)

| ☐ | Paso | Verificado |
|---|------|------------|
| ☐ | Protoboard lista; riel **GND** identificado y marcado | |
| ☐ | Arduino Uno conectado; cable **USB** accesible | |
| ☐ | **GND Uno** → riel GND común | |
| ☐ | Módulo correcto: **HW-084** (texto en PCB + ranura pila) | |
| ☐ | **CR2032** insertada (+ hacia arriba) | |
| ☐ | HW-084: **VCC** → 5V, **GND** → GND | |
| ☐ | Módulo correcto: **AHT10** (sin pila, chip sensor) | |
| ☐ | AHT10: **VCC** → 5V, **GND** → GND | |
| ☐ | **SDA** HW-084 + AHT10 → Uno **A4** | |
| ☐ | **SCL** HW-084 + AHT10 → Uno **A5** | |
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
| ☐ | `config.h` creado (ver sección 0.11 del MD) | |
| ☐ | Sketch subido — monitor **115200** | |
| ☐ | **`AHT10 OK`** y **`DS3231 OK`** | |
| ☐ | JSON cada ~30 s | |
| ☐ | `backend/.env` + `npm run verify:atlas` | |
| ☐ | `npm run seed:demo` | |
| ☐ | `npm run dev` → health OK | |
| ☐ | Gateway `POST 201` | COM: ______ |
| ☐ | App: operador inicia secado | |

**Atlas (examen):** `mongodb+srv://mardenrosales44_db_user:0fXBYeg3r3uC6etT@cluster0.0jgv676.mongodb.net/app_harinas`

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
