# Cómo subir lecturas del Arduino a Render (Ruta B)

El Arduino Uno va por **USB a la laptop**. Un pequeño programa (gateway) lee el puerto COM y manda temperatura/humedad a Render. La app móvil solo habla con Render.

```
AHT10 + DS3231 → Arduino Uno → USB (COM) → gateway en la PC → Render → App
```

## Pasos (cada vez que quieras telemetría en la app)

1. Conecta el **Uno por USB** a la PC. Anota el puerto (ej. `COM3`) en Administrador de dispositivos.
2. Cierra el **Monitor Serie** de Arduino IDE (bloquea el puerto).
3. En PowerShell:

```powershell
cd firmware\arduino-uno-aht10-ds3231-hc05\gateway
npm install
copy .env.example .env
```

4. Edita `gateway\.env` si hace falta:

```env
SERIAL_PORT=COM3
API_URL=https://app-harinas.onrender.com/api/arduino/telemetry
WAIT_FOR_PORT=1
```

5. Arranca el gateway:

```powershell
npm start
```

Éxito: líneas como `POST 201 | T=… HR=… | true`.

6. En la app (APK apuntando a Render): el **Operador inicia secado**; el **Admin** ve el Muro; el **Gerente** ve fluctuaciones.

## Si no sube

- Puerto incorrecto → cambia `SERIAL_PORT`.
- Render “dormido” → espera 1 minuto o abre `https://app-harinas.onrender.com/api/health`.
- Sin lote en secado → la app no muestra alertas de proceso aunque el POST sea 201.
- La laptop debe permanecer encendida con el gateway corriendo.
