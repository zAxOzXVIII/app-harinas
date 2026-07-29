#pragma once

/**
 * Copia este archivo a `config.h` (misma carpeta) y completa tus valores.
 *
 * ESP-12F (ESP8266) → Wi‑Fi → Render /api/arduino/telemetry
 * Los sensores AHT10 + DS3231 van en el bus I2C del ESP (como en el ESP32).
 */

// --- Red Wi‑Fi (2.4 GHz; el ESP-12F no usa 5 GHz) ---
#define WIFI_SSID "tu-red-wifi"
#define WIFI_PASSWORD "tu-clave-wifi"

// --- API Nativa ---
// Render (recomendado):
#define API_URL "https://app-harinas.onrender.com/api/arduino/telemetry"
#define API_USE_HTTPS 1
// LAN (backend en PC):
// #define API_URL "http://192.168.1.100:4000/api/arduino/telemetry"
// #define API_USE_HTTPS 0

// --- Identidad ---
#define DEVICE_ID "esp12f-secador-01"
#define CODIGO_GRUPO "garbanzo-lenteja"

#define INTERVAL_MS 30000

// --- I2C en ESP-12F / NodeMCU (SDA=GPIO4, SCL=GPIO5) ---
#define I2C_SDA 4
#define I2C_SCL 5
