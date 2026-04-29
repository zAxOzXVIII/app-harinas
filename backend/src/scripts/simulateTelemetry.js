/* eslint-disable no-console */
const env = require("../config/env");

const API_URL = process.env.TELEMETRY_API_URL || `http://localhost:${env.port}`;
const INTERVAL_MS = Number(process.env.TELEMETRY_INTERVAL_MS || 5000);

const grupos = ["garbanzo-lenteja", "platano-cambur", "yuca-batata"];

const rand = (min, max) => Math.round((Math.random() * (max - min) + min) * 10) / 10;

const createPayload = (idx) => ({
  eventId: `sim-${Date.now()}-${idx}`,
  deviceId: "sim-device-01",
  codigoGrupo: grupos[idx % grupos.length],
  timestamp: new Date().toISOString(),
  lecturas: {
    nivelSecado: rand(30, 90),
    tiempoSecado: rand(10, 140),
    temperatura: rand(20, 65),
    humedad: rand(20, 90),
  },
});

let i = 0;
console.log(`Simulador iniciado -> ${API_URL}/api/arduino/telemetry cada ${INTERVAL_MS} ms`);

setInterval(async () => {
  try {
    const payload = createPayload(i++);
    const response = await fetch(`${API_URL}/api/arduino/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    console.log(`[${new Date().toISOString()}] status=${response.status} ok=${data.success}`);
  } catch (error) {
    console.error("Error enviando telemetria:", error.message);
  }
}, INTERVAL_MS);
