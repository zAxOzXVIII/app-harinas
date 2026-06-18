#pragma once

/**
 * Copia este archivo a `config.h` (misma carpeta) y completa tus valores.
 *
 * Producción recomendada: ESP32 → Wi‑Fi → backend en la nube (Render) + MongoDB Atlas.
 * Desarrollo: backend local en la LAN o túnel ngrok.
 */

// --- Red Wi‑Fi de planta (el ESP32 debe poder salir a internet o a la LAN del servidor) ---
#define WIFI_SSID "tu-red-wifi"
#define WIFI_PASSWORD "tu-clave-wifi"

// --- API Nativa (URL completa del endpoint de telemetría) ---
// LAN:     http://192.168.1.100:4000/api/arduino/telemetry
// ngrok:   https://tu-dominio.ngrok-free.app/api/arduino/telemetry  → API_USE_HTTPS 1
// Render:  https://tu-app.onrender.com/api/arduino/telemetry        → API_USE_HTTPS 1
#define API_URL "http://192.168.1.100:4000/api/arduino/telemetry"
#define API_USE_HTTPS 0

// --- Identidad del dispositivo y grupo de rubro (debe existir en el backend) ---
#define DEVICE_ID "esp32-secador-01"
#define CODIGO_GRUPO "garbanzo-lenteja"

// --- Intervalo entre lecturas (ms) ---
#define INTERVAL_MS 30000

// --- Bus I2C (ESP32 DevKit: SDA=21, SCL=22) ---
#define I2C_SDA 21
#define I2C_SCL 22
