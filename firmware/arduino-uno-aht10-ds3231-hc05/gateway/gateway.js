/**
 * Gateway serial → API Nativa
 *
 * Uso:
 *   cd firmware/arduino-uno-aht10-ds3231-hc05/gateway
 *   npm install
 *   copy .env.example .env   (editar SERIAL_PORT)
 *   npm start
 *
 * Requiere backend activo: cd backend && npm run dev
 */

require("dotenv").config();

const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const SERIAL_PORT = process.env.SERIAL_PORT || "COM3";
const SERIAL_BAUD = Number(process.env.SERIAL_BAUD || 115200);
const API_URL = process.env.API_URL || "http://localhost:4000/api/arduino/telemetry";
const API_INSECURE_TLS = process.env.API_INSECURE_TLS === "1";

const postTelemetry = async (payload) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
};

const main = async () => {
  if (API_INSECURE_TLS && API_URL.startsWith("https")) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  console.log(`Gateway Nativa — ${SERIAL_PORT} @ ${SERIAL_BAUD} → ${API_URL}`);

  const port = new SerialPort({ path: SERIAL_PORT, baudRate: SERIAL_BAUD, autoOpen: false });

  port.open((err) => {
    if (err) {
      console.error("No se pudo abrir el puerto:", err.message);
      console.error("Verifica SERIAL_PORT en .env (Device Manager → COM)");
      process.exit(1);
    }
    console.log("Puerto abierto. Esperando líneas JSON del Arduino...");
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

  parser.on("data", async (line) => {
    const trimmed = String(line).trim();
    if (!trimmed.startsWith("{")) return;

    let payload;
    try {
      payload = JSON.parse(trimmed);
    } catch {
      console.warn("JSON inválido:", trimmed.slice(0, 80));
      return;
    }

    if (!payload.deviceId || payload.lecturas?.temperatura == null || payload.lecturas?.humedad == null) {
      console.warn("Payload incompleto, se omite");
      return;
    }

    try {
      const { status, body } = await postTelemetry(payload);
      const t = payload.lecturas?.temperatura;
      const h = payload.lecturas?.humedad;
      console.log(`POST ${status} | T=${t} HR=${h} |`, typeof body === "object" ? body.success : body);
    } catch (e) {
      console.error("Error POST API:", e.message);
    }
  });

  port.on("error", (e) => console.error("Serial error:", e.message));
};

main();
