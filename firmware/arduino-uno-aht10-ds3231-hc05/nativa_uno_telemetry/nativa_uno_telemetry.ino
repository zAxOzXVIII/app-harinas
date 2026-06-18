/**
 * Nativa — Arduino Uno + AHT10 + DS3231 + HC-05
 *
 * Emite una línea JSON por lectura (mismo contrato que ESP32) por Bluetooth y/o USB.
 * La app móvil NO lee Bluetooth: usa el gateway en PC o cable USB → POST al backend.
 *
 * Librerías (Gestor de librerías Arduino IDE):
 *   - Adafruit AHTX0
 *   - RTClib (Adafruit)
 *   - ArduinoJson 6.x
 */

#include <Wire.h>
#include <ArduinoJson.h>
#include <SoftwareSerial.h>
#include <Adafruit_AHTX0.h>
#include <RTClib.h>

#include "config.h"

Adafruit_AHTX0 aht;
RTC_DS3231 rtc;
SoftwareSerial btSerial(BT_RX_PIN, BT_TX_PIN);

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

static void emitJsonLine(const char* jsonLine) {
#if MIRROR_USB_SERIAL
  Serial.println(jsonLine);
#endif
  btSerial.println(jsonLine);
}

static bool buildTelemetryJson(float tempC, float humRh, const char* eventId, const char* timestamp, char* out, size_t outLen) {
  StaticJsonDocument<384> doc;
  doc["eventId"] = eventId;
  doc["deviceId"] = DEVICE_ID;
  doc["codigoGrupo"] = CODIGO_GRUPO;
  doc["timestamp"] = timestamp;
  JsonObject lecturas = doc.createNestedObject("lecturas");
  lecturas["temperatura"] = roundf(tempC * 10.0f) / 10.0f;
  lecturas["humedad"] = roundf(humRh * 10.0f) / 10.0f;
  lecturas["tiempoSecado"] = (int)(millis() / 60000UL);

  size_t n = serializeJson(doc, out, outLen);
  return n > 0 && n < outLen;
}

void setup() {
  Serial.begin(115200);
  btSerial.begin(BT_BAUD);
  delay(800);

  Serial.println(F("Nativa Uno — AHT10 + DS3231 + HC-05"));
  Serial.println(F("Salida: una linea JSON por lectura (BT + USB)"));

  Wire.begin();

  if (!aht.begin()) {
    Serial.println(F("ERROR: AHT10 no detectado (I2C A4/A5)"));
    while (true) delay(1000);
  }
  Serial.println(F("AHT10 OK"));

  if (!rtc.begin()) {
    Serial.println(F("ERROR: DS3231 no detectado (I2C A4/A5)"));
    while (true) delay(1000);
  }
  if (rtc.lostPower()) {
    Serial.println(F("RTC sin hora — ajustando con hora de compilacion"));
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  }
  Serial.println(F("DS3231 OK"));
}

void loop() {
  sensors_event_t humidity, temp;
  aht.getEvent(&humidity, &temp);

  DateTime now = rtc.now();
  char ts[32];
  formatIso8601(now, ts, sizeof(ts));

  char eventId[48];
  snprintf(
    eventId,
    sizeof(eventId),
    "%s-%04d%02d%02d%02d%02d%02d",
    DEVICE_ID,
    now.year(),
    now.month(),
    now.day(),
    now.hour(),
    now.minute(),
    now.second()
  );

  char jsonLine[320];
  if (buildTelemetryJson(temp.temperature, humidity.relative_humidity, eventId, ts, jsonLine, sizeof(jsonLine))) {
    emitJsonLine(jsonLine);
  }

  delay(INTERVAL_MS);
}
