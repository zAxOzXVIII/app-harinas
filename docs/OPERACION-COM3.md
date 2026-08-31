# Operación con Arduino Uno + COM3 → Render → App

Flujo del kit de examen:

```
AHT10 + DS3231 ──I2C──► Arduino Uno ──USB (COM3)──► gateway (laptop) ──► Render ──► App móvil
```

## Preparación (una vez)

```powershell
# Desde la raíz del repo
.\scripts\prep-com3.ps1
```

Eso instala deps del gateway, crea `.env` si faltan y verifica Render.

## Cuando conectes el Arduino

1. **Cable USB** al Uno → debe aparecer **COM3** (o anota el COM en Administrador de dispositivos).
2. **Cierra** el Monitor Serie de Arduino IDE (solo un programa puede usar el puerto).
3. **Prueba** sin enviar a la nube:

```powershell
cd firmware\arduino-uno-aht10-ds3231-hc05\gateway
npm run probe
```

Deberías ver líneas JSON con temperatura/humedad. Si no:

- Pulsa **RESET** en el Uno.
- Confirma **115200** baud en el sketch.
- Re-sube el sketch si hace falta.

4. **Arranca el gateway** (espera COM3 si aún no está conectado):

```powershell
npm start
```

Éxito: `POST 201 | T=… HR=… | true`

## Ver en la app

| Rol | Pantalla | Refresco |
|-----|----------|----------|
| Gerente | Muro | ~15 s |
| Operador | Inicio (tarjeta del grupo) | ~30 s |

La app debe usar Render:

```env
# frontend/.env
EXPO_PUBLIC_API_URL=https://app-harinas.onrender.com
```

APK preview (EAS) ya trae esa URL. En Expo local, crea `frontend/.env` como arriba.

## Config del gateway (`gateway/.env`)

| Variable | Valor típico |
|----------|----------------|
| `SERIAL_PORT` | `COM3` |
| `SERIAL_BAUD` | `115200` |
| `API_URL` | `https://app-harinas.onrender.com/api/arduino/telemetry` |
| `DEVICE_ID` | `uno-secador-01` |
| `CODIGO_GRUPO` | `garbanzo-lenteja` |
| `WAIT_FOR_PORT` | `1` (espera hasta que aparezca COM3) |

## Formatos JSON aceptados

**Nativa** (firmware `nativa_uno_telemetry.ino`):

```json
{"deviceId":"uno-secador-01","codigoGrupo":"garbanzo-lenteja","lecturas":{"temperatura":40.1,"humedad":32.3}}
```

**Legacy** (sketch de prueba):

```json
{"temperature":40.1,"humidity":32.3,"timestamp":"..."}
```

El gateway completa `deviceId` y `codigoGrupo` en formato legacy.

## Cableado sensores (Uno)

| Señal | Pin Uno |
|-------|---------|
| SDA | A4 |
| SCL | A5 |
| VCC | 5V |
| GND | GND |

AHT10 y DS3231 comparten el mismo bus I2C.
