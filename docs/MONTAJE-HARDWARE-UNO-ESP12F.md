# Montaje hardware — Arduino Uno + DS3231 + AHT10 (+ ESP-12F)

Guía paso a paso para **identificar, cablear y montar cada pieza** del kit de laboratorio Nativa y conectarlo al backend + app.

> **Ruta recomendada para empezar:** Uno por **USB** + sensores I2C + **gateway en PC** (firmware listo en `firmware/arduino-uno-aht10-ds3231-hc05/`).  
> El **ESP-12F** es fase avanzada (sin sketch en el repo). Para planta sin PC: **ESP32 Dev** (`firmware/esp32-aht10-ds3231/`).

---

## Índice

1. [Materiales del kit](#1-materiales-del-kit)
   - [1.1 Guía visual — reconocer cada módulo](#11-guía-visual--reconocer-cada-módulo)
2. [Orden de montaje recomendado](#2-orden-de-montaje-recomendado)
3. [Montaje pieza por pieza](#3-montaje-pieza-por-pieza)
4. [Ensamblaje final — Fase 1 (USB)](#4-ensamblaje-final--fase-1-usb)
5. [Ensamblaje final — Fase 2 (fuente 12 V + ESP-12F)](#5-ensamblaje-final--fase-2-fuente-12-v--esp-12f)
6. [Verificación eléctrica antes de encender](#6-verificación-eléctrica-antes-de-encender)
7. [Software tras el montaje](#7-software-tras-el-montaje)
8. [Checklist de montaje](#8-checklist-de-montaje) · [versión imprimible](MONTAJE-HARDWARE-CHECKLIST-IMPRIMIBLE.md)
9. [Problemas frecuentes](#9-problemas-frecuentes)
10. [Próximo paso (planta)](#10-próximo-paso-planta)
11. [Documentos relacionados](#11-documentos-relacionados)

---

## 1. Materiales del kit

| Pieza | Cómo reconocerla | Función en Nativa |
|-------|------------------|-------------------|
| **Arduino Uno** | Placa azul, conector USB tipo B, chip ATmega328P | Lee sensores, arma JSON de telemetría |
| **DS3231** | PCB pequeña con **ranura CR2032** y 4 pines | Reloj RTC → campo `timestamp` |
| **AHT10** | PCB ~4 pines, sin pila (sensor temp/humedad I2C) | Temperatura + humedad (obligatorios en API) |
| **ESP-12F** | Módulo Wi‑Fi con antena, muchos pines soldados | Wi‑Fi 3.3 V — fase avanzada |
| **HC-05** *(si viene en el kit)* | Módulo azul **6 pines**, etiqueta HC-05/06 | Bluetooth serial (alternativa al USB) |
| **Regulador 12 V** | Módulo de entrada (fuente/batería) | Entrada desde 12 V |
| **Regulador 5 V** (7805) | Chip con 3 patas: IN, GND, OUT | Alimenta Arduino a 5 V |
| **Regulador 3.3 V** (AMS1117) | Chip/módulo 3 patas: IN, GND, OUT | Alimenta ESP-12F (**solo 3.3 V**) |
| **Resistencias 10 kΩ** | Bandas marrón-negro-naranja | Pull-up/pull-down del ESP-12F |
| **Resistencias 1 kΩ + 2 kΩ** | Para divisor serial | Proteger RX 3.3 V (HC-05 o ESP) |
| **Condensador 104** (cerámico) | Marcado **104** = **0,1 µF** (100 nF) | Desacople junto a reguladores |
| **Electrolítico 100 µF** | Cilíndrico, polarizado (+/−) | Entrada/salida de reguladores |
| **CR2032** | Pila botón 3 V | Mantiene hora del DS3231 apagado |
| **Protoboard + cables dupont** | — | Montaje sin soldar |

### Aclaración condensadores

- **104** cerámico = **100 nF** (0,1 µF). **No** es 100 µF.
- Los **100 µF** van en la **entrada 12 V** y en la **salida 5 V** si alimentas varios módulos.

### ¿Qué ruta usar?

| Ruta | Cuándo | Firmware |
|------|--------|----------|
| **Uno + USB + gateway** | Demo, desarrollo, informe | `firmware/arduino-uno-aht10-ds3231-hc05/` |
| **ESP32 Dev + Wi‑Fi** | Producción en planta | `firmware/esp32-aht10-ds3231/` |
| **Uno + ESP-12F** | Experimental | **Sin firmware en repo** |

---

### 1.1 Guía visual — reconocer cada módulo

Usa esta sección **antes de cablear** para no confundir piezas parecidas (sobre todo DS3231 vs AHT10).

#### DS3231 vs AHT10 — comparación rápida

| | **DS3231** (reloj) | **AHT10** (sensor) |
|---|-------------------|-------------------|
| Señal clave | **Ranura CR2032** en la PCB | **Sin pila**; chip pequeño central |
| Tamaño | PCB algo más grande | PCB más chica, 4 pines |
| Función | Hora → `timestamp` | T° y HR → `lecturas` |
| Pines | VCC, GND, SDA, SCL | VCC, GND, SDA, SCL |

```
  DS3231 (vista superior)              AHT10 (vista superior)
  ┌─────────────────────┐            ┌──────────────┐
  │  ┌───────────────┐  │            │   ┌──────┐   │
  │  │  CR2032       │  │  ◄─ PILA   │   │ chip │   │  ◄─ sensor
  │  │  (botón 3V)   │  │            │   └──────┘   │
  │  └───────────────┘  │            │              │
  │     DS3231 IC       │            │   AHT10      │
  └─────────────────────┘            └──────────────┘
   │ │ │ │                             │ │ │ │
   V G S S                             V G S S
   C N D C                             C N D C
   C D A L                             C D A L
```

#### DS3231 — vista física y pines

```
Vista lateral (pila):
        ┌── CR2032 (+ arriba) ──┐
        │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
        └──────────────────────┘
              PCB DS3231
    ─────●───●───●───●─────  ← 4 pines hacia protoboard
         │   │   │   │
        VCC GND SDA SCL     (orden típico; verificar silkscreen)

Vista desde los pines (mirando la PCB de frente, pines abajo):
    [ VCC ] [ GND ] [ SDA ] [ SCL ]
       │       │       │       │
       └───────┴───────┴───────┴──► hacia Arduino A4/A5 + 5V + GND
```

#### AHT10 — vista física y pines

```
Vista superior:
    ┌────────────────┐
    │  ┌──────────┐  │
    │  │  AHT10   │  │   ← encapsulado del sensor (no tocar con dedos grasos)
    │  └──────────┘  │
    └────────────────┘
     │   │   │   │
    VCC GND SDA SCL

Montaje en protoboard (vista lateral):
         AHT10
          ││││
    ══════╋╋╋╋══════  protoboard
          │
    cables cortos hacia mismo bus que DS3231
```

> **No confundir:** si la PCB tiene **6 pines azules** y dice **HC-05**, no es AHT10 ni DS3231 (ver HC-05 abajo).

---

#### Arduino Uno — vista y pines usados

```
                    USB tipo B
                       ║
    ┌──────────────────╨──────────────────┐
    │  [PWR]  ATmega328P          [RESET] │
    │                                     │
    │  ~13 ... ~2   [DIGITAL 0-13]        │
    │                                     │
    │  GND 5V 3V3 RESET 3V3 GND VIN       │  ← alimentación
    │                                     │
    │  A0 A1 A2 A3  A4   A5  [ANALOG]     │
    │              SDA  SCL  ◄── I2C      │
    └─────────────────────────────────────┘
         pin 10 (RX)  pin 11 (TX)  ← Fase 2 serial
```

---

#### ESP-12F — vista física

```
Vista superior (antena arriba):

              ╭─────────────╮
              │   ANTENA    │
              ╰─────────────╯
        ┌─────────────────────────┐
        │      ESP-12F module     │
        │   (metal shield / IC)   │
        └─────────────────────────┘
    ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●   ← 16 pines (2 mm; usar adaptador)
    │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │
   GND GPIO0 GPIO2 ... VCC VCC ...

Orientación para cablear (antena ARRIBA, pines ABAJO, módulo de frente):
    - Lado con antena = frente
    - Pin VCC: 3.3 V SOLO (nunca 5 V)
    - GPIO15 debe ir a GND (vía 10k) al boot
```

```
Adaptador ESP-12F en protoboard (recomendado):

    [ESP-12F soldado en breakout]
              │
    ┌─────────┴─────────┐
    │  breakout 2.54mm  │  ◄─ pasa a protoboard estándar
    └─────────┬─────────┘
    ● ● ● ● ● ● ● ●
    ═════════════════  protoboard
```

---

#### HC-05 — vista física (si viene en el kit)

```
Módulo azul, 6 pines en fila:

    ┌──────────────────┐
    │  HC-05  [LED]    │  ◄─ LED parpadea al buscar emparejamiento
    │  Bluetooth 2.0   │
    └──────────────────┘
     │  │  │  │  │  │
    EN  VCC GND TXD RXD STATE   (orden puede variar; leer silkscreen)

    VCC → 5V    GND → GND
    TXD → Uno pin 10
    RXD ← Uno pin 11 (con divisor 1k/2k)
```

---

#### Regulador 7805 — vista física

```
Chip TO-220 (vista frontal, texto legible):

         ┌─────────────┐
         │   7805      │
         │   5V 1.5A   │
         └──────┬──────┘
                │ metal (GND, pin central)
    IN ●────────┼────────● OUT
   (12V)       GND      (5V)
    pin 1      pin 2     pin 3

Montaje con disipador (recomendado si > 12 V entrada):

    [disipador]──7805──► protoboard
         │
    104 entre IN-GND y OUT-GND pegados al chip
```

---

#### Regulador AMS1117-3.3 — vista física

```
Módulo breakout (común en kits):

    ┌──────────────┐
    │ AMS1117 3.3V │
    └──────────────┘
     │    │    │
    IN   GND  OUT
    5V         3.3V ──► SOLO ESP-12F

Chip suelto TO-220 (igual patilla que 7805 pero etiqueta AMS1117-3.3):
    IN (5V) ──► OUT (3.3V)
```

---

#### Condensadores y resistencias — identificación visual

```
Condensador cerámico 104 (amarillo/naranja, pequeño):
    ┌──┐
    │104│  = 100 nF = 0.1 µF  → junto a cada regulador IN y OUT
    └──┘

Electrolítico 100 µF (cilindro, polarizado):
    ┌─────────┐
    │ 100µF   │
    │   +     │  ◄─ raya blanca = lado NEGATIVO (−)
    └────┬────┘
         │ patilla larga = +
         patilla corta = −

Resistencia 10 kΩ (bandas marrón-negro-naranja-dorado):
    ──██████──  10 kΩ  → pull-up/down ESP-12F

Resistencia 1 kΩ + 2 kΩ (divisor serial):
    ──████── 1k   Uno TX ──1k──┬── RX módulo
    ──██████── 2k              └── 2k ── GND
```

---

#### Mapa físico en protoboard — Fase 1 (referencia)

```
    Riel (−) GND ═══════════════════════════════════════
    Riel (+) 5V  ═══════════════════════════════════════

         [DS3231]          [AHT10]
          V G S S           V G S S
          │ │ │ │           │ │ │ │
          └─┴─┼─┼───────────┴─┴─┼─┼──► A4 (SDA), A5 (SCL) desde Uno
                │                   │
    dupont ─────┴───────────────────┴──── Arduino Uno (USB a PC)
```

> Checklist para imprimir y marcar con lápiz: [`MONTAJE-HARDWARE-CHECKLIST-IMPRIMIBLE.md`](MONTAJE-HARDWARE-CHECKLIST-IMPRIMIBLE.md)

---

## 2. Orden de montaje recomendado

Monta en este orden para evitar errores y poder probar a medida que avanzas:

| Paso | Qué montar | Alimentación |
|------|------------|--------------|
| **1** | Protoboard + rieles GND/5V | — |
| **2** | Arduino Uno (sin sensores aún) | USB a PC |
| **3** | DS3231 (con pila CR2032) | — |
| **4** | AHT10 | — |
| **5** | Bus I2C (SDA/SCL compartido) | USB |
| **6** | **Prueba Fase 1** — subir sketch, monitor serie | USB |
| **7** | Cadena 12 V → 5 V (7805) | Fuente 12 V |
| **8** | Regulador 3.3 V (AMS1117) | Desde 5 V |
| **9** | ESP-12F + resistencias de boot | 3.3 V |
| **10** | Serial Uno ↔ ESP (divisor) | USB + 3.3 V |
| **11** | **Prueba Fase 2** — solo si programaste el ESP | Fuente completa |

> **No saltes al paso 7** hasta que la Fase 1 (sensores + USB) funcione en monitor serie.

---

## 3. Montaje pieza por pieza

### 3.1 Protoboard y rieles de alimentación

**Objetivo:** un **GND común** para todas las piezas.

1. Coloca la protoboard sobre la mesa.
2. Identifica las **tiras largas** de los bordes:
   - Una tira = **GND** (marca con cinta o anota “−”).
   - Otra tira = **5 V** (solo cuando uses regulador o pin 5V del Uno).
3. Conecta el **GND del Arduino** (`GND`) a la tira GND de la protoboard con un cable dupont.
4. Si alimentas por USB, puedes llevar también el **5V del Uno** a la tira +5 V (opcional, para alimentar sensores desde el riel).

```
Protoboard (vista superior)
┌────────────────────────────────────────┐
│  (−) GND ═══════════════════════════   │  ← riel GND común
│  (+) 5V  ═══════════════════════════   │  ← riel 5V (opcional Fase 1)
│                                        │
│     [huecos para módulos]              │
└────────────────────────────────────────┘
         │
    GND Arduino ──► riel GND
```

**Verificación:** continuidad con multímetro entre GND del Uno y el riel GND.

---

### 3.2 Arduino Uno

**Objetivo:** fijar la placa y dejar accesibles A4, A5, 5V, GND y USB.

1. **No** insertes el Uno directamente en la protoboard si los pines no coinciden con el paso (muchas protoboards no encajan bien). Opciones:
   - Cables dupont hembra-hembra desde los pines del Uno a la protoboard, o
   - Protoboard de doble ancho / shield.
2. Deja el **cable USB** accesible para programar y alimentar (Fase 1).
3. Pines que usarás:

| Pin Uno | Uso en este proyecto |
|---------|----------------------|
| **A4** | SDA (I2C) |
| **A5** | SCL (I2C) |
| **5V** | VCC sensores |
| **GND** | GND común |
| **10** | RX serial (HC-05/ESP TX) — Fase 2 |
| **11** | TX serial (vía divisor → HC-05/ESP RX) — Fase 2 |

**Montaje:** conecta **GND** al riel común antes de cualquier otro cable de señal.

---

### 3.3 Módulo DS3231 (reloj RTC)

> **Identificación visual:** ver [DS3231 vs AHT10](#ds3231-vs-aht10--comparación-rápida) — la ranura **CR2032** es la señal inequívoca.

**Objetivo:** hora estable para el campo `timestamp` del JSON.

#### Identificación de pines (4 pines típicos)

| Pin módulo | Etiqueta común | Conexión |
|------------|----------------|----------|
| 1 | **VCC** | 5 V (Uno o riel +5V) |
| 2 | **GND** | Riel GND |
| 3 | **SDA** | Arduino **A4** (más tarde, también AHT10) |
| 4 | **SCL** | Arduino **A5** (más tarde, también AHT10) |

> Algunos módulos marcan **32K**, **SQW** — no los uses en este proyecto.

#### Montaje físico

1. Inserta el módulo en la protoboard (4 pines en una fila).
2. **Pila CR2032:** abre el soporte, inserta la pila con **+ hacia arriba** (lado ancho/plano suele ser +). Sin pila el reloj **pierde la hora** al apagar.
3. Cablea en este orden:
   - **GND** → riel GND
   - **VCC** → 5V del Uno (o riel +5V)
   - Deja **SDA** y **SCL** sin conectar hasta montar el AHT10 (paso 3.5)

#### Verificación aislada (opcional)

Con solo DS3231 cableado, puedes subir un sketch de prueba RTClib; en el proyecto Nativa se valida junto con el AHT10.

---

### 3.4 Módulo AHT10 (temperatura y humedad)

> **Identificación visual:** PCB pequeña **sin pila**; chip sensor en el centro. No es el módulo azul de 6 pines (HC-05).

**Objetivo:** lecturas `temperatura` y `humedad` en la API.

#### Identificación de pines (4 pines)

| Pin módulo | Conexión |
|------------|----------|
| **VCC** | 5 V |
| **GND** | Riel GND |
| **SDA** | Arduino **A4** |
| **SCL** | Arduino **A5** |

> Si el módulo trae **ADDR** o **CS**, no lo conectes (breakout ya fijado para I2C).

#### Montaje físico

1. Coloca el AHT10 en la protoboard **cerca del DS3231** (mismo bus I2C, cables cortos).
2. **No** superpongas módulos uno encima del otro (afecta lectura de temperatura).
3. Cablea GND y VCC primero; SDA/SCL al final.

---

### 3.5 Bus I2C compartido (DS3231 + AHT10)

**Objetivo:** un solo bus I2C con dos dispositivos (direcciones distintas).

#### Cableado — paso a paso

1. **SDA:** Arduino **A4** → pin SDA del **DS3231** → pin SDA del **AHT10** (tres puntos en el mismo “tronco”).
2. **SCL:** Arduino **A5** → pin SCL del **DS3231** → pin SCL del **AHT10**.
3. **VCC:** 5V del Uno → VCC de **ambos** módulos (puede ser desde riel +5V).
4. **GND:** riel GND → GND de **ambos** módulos.

```
        ┌─────────────┐
        │ Arduino Uno │
        │             │
        │  A4 ── SDA ─┼──────┬──────► DS3231 SDA
        │             │      └──────► AHT10 SDA
        │  A5 ── SCL ─┼──────┬──────► DS3231 SCL
        │             │      └──────► AHT10 SCL
        │  5V ── VCC ─┼──────┬──────► DS3231 VCC
        │             │      └──────► AHT10 VCC
        │  GND ───────┼──────┬──────► DS3231 GND
        │             │      └──────► AHT10 GND
        └─────────────┘
```

#### Buenas prácticas

- Cables **cortos** (< 20 cm en protoboard).
- **Un solo** punto de GND común (riel), no “cadenas” largas de GND.
- No cruces cables SDA/SCL con cables de alimentación de motores o 12 V.

#### Verificación

Monitor serie (115200) tras subir `nativa_uno_telemetry.ino`:

- `AHT10 OK`
- `DS3231 OK`
- JSON cada 30 s con `temperatura`, `humedad`, `timestamp`

---

### 3.6 Alimentación por USB (Fase 1 — sin reguladores)

**Objetivo:** alimentar Uno + sensores sin montar la cadena 12 V.

1. Conecta USB del Uno a la PC.
2. Los sensores toman 5 V del pin **5V** del Uno.
3. **No** conectes fuente 12 V ni reguladores todavía.

| Consumo aproximado | Nota |
|--------------------|------|
| Uno + AHT10 + DS3231 | < 200 mA — USB suficiente |

---

### 3.7 Regulador 5 V (7805)

**Objetivo:** bajar 12 V a 5 V estables para el Arduino (Fase 2, sin PC).

#### Pines del 7805 (vista frontal, texto legible)

| Pin | Nombre | Conexión |
|-----|--------|----------|
| 1 | **IN** | +12 V de la fuente |
| 2 | **GND** | Riel GND común |
| 3 | **OUT** | +5 V → VIN del Uno **o** pin 5V si alimentas por jack |

#### Montaje paso a paso

1. Coloca el 7805 en la protoboard con espacio para disipación (se calienta).
2. **Condensador 104:** entre **IN** y **GND**, lo más cerca posible del chip.
3. **Condensador 104:** entre **OUT** y **GND**, cerca del chip.
4. **100 µF electrolítico** (opcional): **+** en IN, **−** en GND (entrada 12 V).
5. **100 µF** (opcional): **+** en OUT, **−** en GND (salida 5 V).
6. **GND** del 7805 al riel GND común.
7. **OUT (5 V)** al **VIN** del Arduino (7–12 V en VIN es válido; aquí entran 5 V regulados en el pin 5V **o** VIN según tu esquema — lo habitual: 5 V al pin **5V** del Uno solo si el regulador onboard del Uno no se usa; más seguro: **5 V → pin 5V** del Uno con USB desconectado).

```
12 V (+) ──► [100µF+] ──► IN (7805) ──► OUT ──► [100µF+] ──► 5V Uno / riel +5V
                │            │           │            │
               GND          GND         GND          GND
                └── 104 IN ──┘           └── 104 OUT ─┘
```

> **Importante:** GND de la fuente 12 V y GND del Uno **deben** estar unidos.

---

### 3.8 Regulador 3.3 V (AMS1117-3.3)

**Objetivo:** alimentar el **ESP-12F** (tolerancia estricta: **3.3 V**, nunca 5 V).

#### Pines típicos AMS1117

| Pin | Conexión |
|-----|----------|
| **IN** | 5 V (salida del 7805 o pin 5V Uno) |
| **GND** | Riel GND |
| **OUT** | **3.3 V** → VCC del ESP-12F |

#### Montaje paso a paso

1. Coloca el AMS1117 en protoboard separado del 7805.
2. **104** entre IN–GND y OUT–GND, pegados al regulador.
3. **OUT** alimenta **solo** el ESP-12F y sus pull-ups (no mezclar 5 V en esa línea).
4. Reserva **≥ 300 mA** en esta línea (picos Wi‑Fi del ESP).

```
5 V ──► IN (AMS1117) ──► OUT (3.3 V) ──► VCC ESP-12F
           │                  │
          GND                GND
     104 IN/OUT
```

---

### 3.9 Condensadores — dónde va cada uno

| Componente | Ubicación | Función |
|------------|-----------|---------|
| **104** (cerámico) | IN–GND del 7805 | Filtra ruido entrada |
| **104** | OUT–GND del 7805 | Estabiliza 5 V |
| **104** | IN–GND del AMS1117 | Filtra entrada 3.3 V |
| **104** | OUT–GND del AMS1117 | Estabiliza 3.3 V |
| **100 µF** | Entrada 12 V (opcional) | Reserva de corriente |
| **100 µF** | Salida 5 V (opcional) | Suaviza picos Uno + sensores |

**Polaridad electrolítico:** patilla larga / marca **+** hacia el positivo; **−** hacia GND.

---

### 3.10 Módulo ESP-12F (Wi‑Fi — Fase avanzada)

> El repo **no incluye** firmware para ESP-12F. Este montaje es para quien programe el ESP8266 aparte o migre después a ESP32.

**Regla crítica:** **VCC = 3.3 V únicamente.** Conectar 5 V **destruye** el módulo.

#### Vista de pines (ESP-12F, antena hacia arriba, pines abajo)

Pines relevantes para arranque y serial:

| Pin ESP-12F | Nombre | Montaje obligatorio |
|-------------|--------|---------------------|
| **VCC** | Alimentación | **3.3 V** (AMS1117 OUT) |
| **GND** | Tierra | Riel GND común |
| **CH_PD** / **EN** | Enable | **3.3 V** vía resistencia **10 kΩ** (pull-up a VCC) |
| **GPIO15** | Boot | **GND** vía resistencia **10 kΩ** (pull-down — bajo al encender) |
| **GPIO0** | Flash / boot | **3.3 V** vía **10 kΩ** (modo ejecución; a GND = modo flash) |
| **GPIO2** | — | **3.3 V** vía **10 kΩ** (recomendado, evita boot fallido) |
| **RST** | Reset | Pull-up 10 kΩ a 3.3 V (opcional botón a GND para reset) |
| **TX** | Serial TX | Pin **10** del Uno (RX) |
| **RX** | Serial RX | Pin **11** del Uno vía **divisor 5 V→3.3 V** |

#### Montaje paso a paso

1. **Sin alimentación**, solda o inserta el ESP-12F en adaptador/protoboard (los pines son 2 mm — suele hacer falta adaptador ESP-12F).
2. Conecta **GND** al riel común.
3. Conecta **VCC** a la salida **3.3 V** del AMS1117 (no al 5 V).
4. Monta las **resistencias 10 kΩ**:
   - **CH_PD** → 3.3 V (pull-up).
   - **GPIO15** → GND (pull-down).
   - **GPIO0** → 3.3 V (pull-up, modo run).
   - **GPIO2** → 3.3 V (pull-up).
5. Deja **TX/RX** sin conectar hasta montar el divisor (sección 3.12).
6. **Primera encendida:** medir con multímetro **3.3 V ± 0.1 V** entre VCC y GND del ESP **antes** de conectar el Uno TX.

```
                    3.3 V (AMS1117)
                         │
        ┌────────────────┼────────────────┐
        │                │                │
     [10k]            [10k]            [10k]
        │                │                │
     CH_PD            GPIO0            GPIO2
        │                │                │
    ESP-12F          ESP-12F          ESP-12F

     GPIO15 ──[10k]── GND
```

---

### 3.11 Módulo HC-05 (Bluetooth — alternativa al USB)

Si tu kit trae **HC-05** en lugar de (o además de) ESP-12F, y quieres enviar JSON por Bluetooth al PC:

| Pin HC-05 | Conexión |
|-----------|----------|
| **VCC** | 5 V |
| **GND** | Riel GND |
| **TXD** | Arduino pin **10** (BT_RX_PIN) |
| **RXD** | Arduino pin **11** (BT_TX_PIN) vía **divisor** |

> Usa **solo un camino** a la vez: USB **o** HC-05 **o** ESP-12F.

---

### 3.12 Divisor de voltaje (Uno TX → RX 3.3 V)

**Objetivo:** el TX del Arduino es **5 V**; el RX del HC-05/ESP-12F acepta **3.3 V máximo**.

#### Con resistencias 1 kΩ + 2 kΩ (recomendado)

```
Arduino pin 11 (TX) ──[1 kΩ]──┬──► HC-05 RXD  o  ESP RX
                              │
                           [2 kΩ]
                              │
                             GND
```

Voltaje en el nodo central: 5 V × 2/(1+2) ≈ **3.3 V**.

#### Con resistencias 10 kΩ + 20 kΩ (si no tienes 1k/2k)

Misma topología; valores mayores, misma proporción 1:2.

#### Conexión RX del Uno

- **HC-05 TXD** o **ESP TX** → Arduino pin **10** directo (3.3 V es leído correctamente por el Uno).

---

## 4. Ensamblaje final — Fase 1 (USB)

Configuración mínima para desarrollo con firmware del repo:

```
[PC USB] ──► Arduino Uno
                 │
                 ├── A4/A5 ── I2C ──► DS3231 + AHT10 (5V, GND)
                 │
                 └── (opcional) Monitor serie 115200

[PC] ── gateway ──► POST localhost:4000/api/arduino/telemetry
```

**Piezas montadas:** Uno, DS3231, AHT10, cables dupont, pila CR2032.  
**Piezas NO necesarias aún:** 7805, AMS1117, ESP-12F, fuente 12 V.

---

## 5. Ensamblaje final — Fase 2 (fuente 12 V + ESP-12F)

```
[Fuente 12 V]
      │
      ▼
 [7805 → 5 V] ──► Arduino Uno (5V/VIN) + sensores I2C
      │
      ▼
 [AMS1117 → 3.3 V] ──► ESP-12F (pull-ups 10k, GPIO15 a GND)
      │
Arduino pin 11 ──[divisor]──► ESP RX
Arduino pin 10 ◄────────────── ESP TX
      │
      GND común en toda la protoboard
```

**Antes de energizar:** revisar sección [6. Verificación eléctrica](#6-verificación-eléctrica-antes-de-encender).

---

## 6. Verificación eléctrica antes de encender

Comprueba **sin USB/fuente conectada** (solo con multímetro en continuidad/resistencia), luego con alimentación:

| # | Comprobación | Valor esperado |
|---|--------------|----------------|
| 1 | Continuidad GND fuente ↔ GND Uno ↔ GND sensores | 0 Ω |
| 2 | **No** hay corto entre 5 V y GND | ∞ / abierto |
| 3 | **No** hay corto entre 3.3 V (ESP) y 5 V | ∞ / abierto |
| 4 | ESP-12F VCC–GND (sin carga) | **3.3 V** (con AMS1117 alimentado) |
| 5 | Salida 7805 | **5.0–5.2 V** |
| 6 | SDA/SCL no tocados a 5V o GND directo | — |
| 7 | GPIO15 del ESP a GND vía 10 kΩ | ~0 V al boot |
| 8 | CH_PD del ESP a 3.3 V vía 10 kΩ | ~3.3 V |

**Señales de error al encender:**

- ESP-12F **muy caliente** en segundos → probablemente alimentado a 5 V → **apagar ya**.
- 7805 **quemándose** → revisar polaridad 12 V o corto en salida.

---

## 7. Software tras el montaje

Una vez la Fase 1 pasa la verificación eléctrica y el monitor serie muestra JSON:

### 7.1 Sketch Arduino

1. [Arduino IDE](https://www.arduino.cc/en/software) → placa **Arduino Uno**.
2. Librerías: **Adafruit AHTX0**, **RTClib**, **ArduinoJson 6**.
3. Copiar `firmware/arduino-uno-aht10-ds3231-hc05/nativa_uno_telemetry/config.example.h` → `config.h`.
4. Subir `nativa_uno_telemetry.ino`.
5. Monitor serie **115200**: `AHT10 OK`, `DS3231 OK`, JSON cada 30 s.

| Variable `config.h` | Ejemplo | Descripción |
|---------------------|---------|-------------|
| `CODIGO_GRUPO` | `garbanzo-lenteja` | Grupo en backend |
| `DEVICE_ID` | `uno-secador-01` | ID del secador |
| `MIRROR_USB_SERIAL` | `1` | JSON por USB (gateway) |

### 7.2 Gateway + backend

```powershell
cd backend
npm run dev

cd firmware\arduino-uno-aht10-ds3231-hc05\gateway
npm install
copy .env.example .env
# SERIAL_PORT=COMx  (Administrador de dispositivos)
npm start
```

### 7.3 Documentación detallada de operación

| Tema | Documento |
|------|-----------|
| ngrok, APK, Atlas | [`OPERACION-LOCAL.md`](OPERACION-LOCAL.md) |
| Gateway y HC-05 | [`firmware/arduino-uno-aht10-ds3231-hc05/README.md`](../firmware/arduino-uno-aht10-ds3231-hc05/README.md) |
| Contrato JSON | [`backend/docs/arduino-telemetry-contract.md`](../backend/docs/arduino-telemetry-contract.md) |
| Mapa sistema completo | [`GUIA-SISTEMA-COMPLETA.md`](GUIA-SISTEMA-COMPLETA.md) |

### 7.4 JSON de telemetría

```json
{
  "eventId": "uno-secador-01-20260619143000",
  "deviceId": "uno-secador-01",
  "codigoGrupo": "garbanzo-lenteja",
  "timestamp": "2026-06-19T14:30:00.000Z",
  "lecturas": {
    "temperatura": 41.2,
    "humedad": 54.1
  }
}
```

Grupos válidos: `garbanzo-lenteja`, `platano-cambur`, `yuca-batata`.

---

## 8. Checklist de montaje

> **Versión para imprimir** (una página, casillas en blanco): [`MONTAJE-HARDWARE-CHECKLIST-IMPRIMIBLE.md`](MONTAJE-HARDWARE-CHECKLIST-IMPRIMIBLE.md)

### Eléctrico — Fase 1

- [ ] Riel GND común (Uno + DS3231 + AHT10)
- [ ] DS3231: VCC, GND, SDA→A4, SCL→A5
- [ ] AHT10: VCC, GND, SDA→A4, SCL→A5
- [ ] CR2032 insertada en DS3231 (+ correcta)
- [ ] Cables I2C cortos; sin cruces con 12 V

### Eléctrico — Fase 2 (opcional)

- [ ] 104 cerámico en IN/OUT de cada regulador
- [ ] 7805: 12 V → 5 V, GND común con Uno
- [ ] AMS1117: 5 V → 3.3 V solo para ESP
- [ ] ESP-12F **nunca** a 5 V en VCC
- [ ] CH_PD, GPIO0, GPIO2 pull-up 10 kΩ a 3.3 V
- [ ] GPIO15 pull-down 10 kΩ a GND
- [ ] Divisor 1k/2k en Uno pin 11 → ESP/HC-05 RX

### Software

- [ ] Monitor serie: `AHT10 OK` + `DS3231 OK`
- [ ] JSON cada 30 s en monitor serie
- [ ] `GET /api/health` → `success: true`
- [ ] Gateway `POST 201` con `SERIAL_PORT` correcto
- [ ] Operador inicia secado → telemetría en app

---

## 9. Problemas frecuentes

| Síntoma | Causa probable | Acción |
|---------|----------------|--------|
| `AHT10 no detectado` | SDA/SCL invertidos o sueltos | Revisar A4/A5, VCC, GND |
| `DS3231 no detectado` | Mismo bus I2C mal cableado | Repetir sección 3.5 |
| Sin lecturas / valores 0 | Sin alimentación en sensor | Medir 5 V en VCC del módulo |
| Hora incorrecta | Sin CR2032 | Insertar pila o aceptar ajuste al encender |
| Gateway sin datos | COM incorrecto | `SERIAL_PORT` en `.env` |
| Gateway `ECONNREFUSED` | Backend apagado | `npm run dev` en backend |
| ESP-12F caliente | **5 V en VCC** | Apagar; alimentar solo 3.3 V |
| ESP-12F no arranca | GPIO15/CH_PD mal | Revisar pull-up/down 10 kΩ |
| HC-05 no responde | Sin divisor en RX | Montar divisor sección 3.12 |
| App sin telemetría | Secado no iniciado | Operador → **Iniciar secado** |

---

## 10. Próximo paso (planta)

Para secador **sin PC** y **sin gateway**:

1. Comprar **ESP32 Dev Module** (~USD 5–8).
2. **Reutilizar** AHT10 + DS3231 en I2C (GPIO 21/22 en ESP32).
3. Firmware listo: [`firmware/esp32-aht10-ds3231/README.md`](../firmware/esp32-aht10-ds3231/README.md).

---

## 11. Documentos relacionados

| Documento | Contenido |
|-----------|-----------|
| [`OPERACION-LOCAL.md`](OPERACION-LOCAL.md) | ngrok, seeds, APK, tests |
| [`GUIA-SISTEMA-COMPLETA.md`](GUIA-SISTEMA-COMPLETA.md) | Mapa pantalla ↔ código ↔ API |
| [`firmware/README.md`](../firmware/README.md) | Arquitectura telemetría |
| [`firmware/arduino-uno-aht10-ds3231-hc05/README.md`](../firmware/arduino-uno-aht10-ds3231-hc05/README.md) | Gateway, HC-05, sketch Uno |
| [`firmware/esp32-aht10-ds3231/README.md`](../firmware/esp32-aht10-ds3231/README.md) | Montaje producción ESP32 |
| [`MONTAJE-HARDWARE-CHECKLIST-IMPRIMIBLE.md`](MONTAJE-HARDWARE-CHECKLIST-IMPRIMIBLE.md) | Checklist imprimible |
