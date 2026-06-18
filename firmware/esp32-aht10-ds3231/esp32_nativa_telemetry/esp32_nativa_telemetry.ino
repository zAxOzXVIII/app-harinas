/**
 * Nativa — telemetria ESP32 + AHT10 + DS3231 (produccion)
 * Wi‑Fi → POST /api/arduino/telemetry → backend → app movil
 *
 * Guia: ../README.md  |  Config: config.example.h → config.h
 *
 * Librerias (Arduino Library Manager):
 *   - Adafruit AHTX0
 *   - RTClib
 *   - ArduinoJson (v6)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <ArduinoJson.h>
#include <Adafruit_AHTX0.h>
#include <RTClib.h>

#if API_USE_HTTPS
#include <WiFiClientSecure.h>
#endif

#include "config.h"

Adafruit_AHTX0 aht;
RTC_DS3231 rtc;

#if API_USE_HTTPS
WiFiClientSecure tlsClient;
#endif

static bool wifiReady = false;

static void connectWifi() {
  if (WiFi.status() == WL_CONNECTED) {
    wifiReady = true;
    return;
  }
  wifiReady = false;
  Serial.print("WiFi ");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    delay(300);
    Serial.print(".");
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    wifiReady = true;
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi: sin conexion");
  }
}

/** ISO 8601 UTC a partir del DS3231 (sin zona; asumir hora local = UTC si RTC bien configurado). */
static void formatIso8601(const DateTime& dt, char* buf, size_t len) {
  snprintf(
    buf,
    len,
    "%04d-%02d-%02dT%02d:%02d:%02d.000Z",
    dt.year(),
    dt.month(),
    dt.day(),
    dt.hour(),
    dt.minute(),
    dt.second()
  );
}

static bool postTelemetry(float tempC, float humRh, const char* eventId, const char* timestamp) {
  StaticJsonDocument<384> doc;
  doc["eventId"] = eventId;
  doc["deviceId"] = DEVICE_ID;
  doc["codigoGrupo"] = CODIGO_GRUPO;
  doc["timestamp"] = timestamp;
  JsonObject lecturas = doc.createNestedObject("lecturas");
  lecturas["temperatura"] = roundf(tempC * 10.0f) / 10.0f;
  lecturas["humedad"] = roundf(humRh * 10.0f) / 10.0f;

  char body[320];
  size_t n = serializeJson(doc, body, sizeof(body));

  HTTPClient http;
#if API_USE_HTTPS
  tlsClient.setInsecure();
  if (!http.begin(tlsClient, API_URL)) {
    Serial.println("HTTP begin fallo");
    return false;
  }
#else
  if (!http.begin(API_URL)) {
    Serial.println("HTTP begin fallo");
    return false;
  }
#endif

  http.addHeader("Content-Type", "application/json");
  int code = http.POST((uint8_t*)body, n);
  String response = http.getString();
  http.end();

  Serial.printf("POST %d | %s\n", code, response.c_str());
  return code == 200 || code == 201;
}

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("Nativa ESP32 telemetria AHT10 + DS3231");

  Wire.begin(I2C_SDA, I2C_SCL);

  if (!aht.begin()) {
    Serial.println("ERROR: AHT10 no detectado en I2C");
    while (true) delay(1000);
  }
  Serial.println("AHT10 OK");

  if (!rtc.begin()) {
    Serial.println("ERROR: DS3231 no detectado en I2C");
    while (true) delay(1000);
  }
  if (rtc.lostPower()) {
    Serial.println("RTC sin hora — ajustando con compilacion (configura hora real luego)");
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  }
  Serial.println("DS3231 OK");

  connectWifi();
}

void loop() {
  if (!wifiReady) connectWifi();

  sensors_event_t humidity, temp;
  aht.getEvent(&humidity, &temp);

  DateTime now = rtc.now();
  char ts[32];
  formatIso8601(now, ts, sizeof(ts));

  char eventId[48];
  snprintf(eventId, sizeof(eventId), "%s-%04d%02d%02d%02d%02d%02d",
           DEVICE_ID, now.year(), now.month(), now.day(),
           now.hour(), now.minute(), now.second());

  Serial.printf("T=%.1f C  HR=%.1f %%  @ %s\n", temp.temperature, humidity.relative_humidity, ts);

  if (wifiReady) {
    postTelemetry(temp.temperature, humidity.relative_humidity, eventId, ts);
  }

  delay(INTERVAL_MS);
}
