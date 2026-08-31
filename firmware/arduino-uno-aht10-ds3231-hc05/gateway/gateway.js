/**
 * Gateway serial → API Nativa (Render o local)
 *
 * Flujo kit examen:
 *   AHT10 + DS3231 → Arduino Uno (USB COM) → este gateway → POST Render
 *
 * Acepta:
 *   - Contrato Nativa: { deviceId, codigoGrupo, lecturas: { temperatura, humedad } }
 *   - Sketch legacy:   { temperature, humidity, timestamp }
 *
 * Uso:
 *   cd firmware/arduino-uno-aht10-ds3231-hc05/gateway
 *   npm install
 *   copy .env.example .env   (editar SERIAL_PORT)
 *   npm start
 */

require("dotenv").config();

const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const SERIAL_PORT = process.env.SERIAL_PORT || "COM3";
const SERIAL_BAUD = Number(process.env.SERIAL_BAUD || 115200);
const API_URL = process.env.API_URL || "https://app-harinas.onrender.com/api/arduino/telemetry";
const API_INSECURE_TLS = process.env.API_INSECURE_TLS === "1";
const API_TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS || 90000);
const API_RETRIES = Number(process.env.API_RETRIES || 3);
const DEVICE_ID = process.env.DEVICE_ID || "uno-secador-01";
const CODIGO_GRUPO = process.env.CODIGO_GRUPO || "garbanzo-lenteja";
const WAIT_FOR_PORT = process.env.WAIT_FOR_PORT !== "0";
const PORT_POLL_MS = Number(process.env.PORT_POLL_MS || 3000);

const healthUrlFromApi = (apiUrl) => {
  try {
    const u = new URL(apiUrl);
    return `${u.origin}/api/health`;
  } catch {
    return null;
  }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const round1 = (n) => Math.round(Number(n) * 10) / 10;

/** Convierte timestamp legacy "2000-1-1 0:6:46" a ISO si es parseable; si no, usa ahora. */
const toIsoTimestamp = (raw) => {
  if (!raw || typeof raw !== "string") return new Date().toISOString();
  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }
  // "YYYY-M-D H:M:S" (sin ceros a la izquierda)
  const m = raw.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
  if (!m) return new Date().toISOString();
  const [, y, mo, d, h, mi, s] = m.map(Number);
  // Reloj DS3231 en año 2000 = sin pila / nunca ajustado → usar hora del PC
  if (y < 2020) return new Date().toISOString();
  const iso = new Date(Date.UTC(y, mo - 1, d, h, mi, s));
  return Number.isNaN(iso.getTime()) ? new Date().toISOString() : iso.toISOString();
};

/**
 * Normaliza Nativa o legacy al contrato POST /api/arduino/telemetry.
 * Legacy: { temperature, humidity, timestamp }
 */
const normalizePayload = (raw) => {
  if (raw?.deviceId && raw?.lecturas?.temperatura != null && raw?.lecturas?.humedad != null) {
    return {
      eventId: raw.eventId,
      deviceId: raw.deviceId,
      codigoGrupo: raw.codigoGrupo || CODIGO_GRUPO,
      timestamp: raw.timestamp || new Date().toISOString(),
      lecturas: {
        temperatura: round1(raw.lecturas.temperatura),
        humedad: round1(raw.lecturas.humedad),
        ...(raw.lecturas.tiempoSecado != null ? { tiempoSecado: raw.lecturas.tiempoSecado } : {}),
      },
    };
  }

  const temp = raw?.temperature ?? raw?.temperatura;
  const hum = raw?.humidity ?? raw?.humedad;
  if (temp == null || hum == null) return null;

  const timestamp = toIsoTimestamp(raw.timestamp);
  const stamp = timestamp.replace(/[-:TZ.]/g, "").slice(0, 14);

  return {
    eventId: `${DEVICE_ID}-${stamp}`,
    deviceId: DEVICE_ID,
    codigoGrupo: CODIGO_GRUPO,
    timestamp,
    lecturas: {
      temperatura: round1(temp),
      humedad: round1(hum),
    },
  };
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = API_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

/** Despierta el free tier de Render (cold start ~30–60 s). */
const wakeRender = async () => {
  const healthUrl = healthUrlFromApi(API_URL);
  if (!healthUrl) return;

  console.log(`Despertando API: GET ${healthUrl}`);
  for (let attempt = 1; attempt <= API_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(healthUrl, { method: "GET" }, API_TIMEOUT_MS);
      const text = await res.text();
      console.log(`Health ${res.status} (intento ${attempt}/${API_RETRIES})`, text.slice(0, 80));
      if (res.ok) return;
    } catch (e) {
      console.warn(`Health fallo intento ${attempt}/${API_RETRIES}:`, e.message);
    }
    if (attempt < API_RETRIES) await sleep(2000 * attempt);
  }
  console.warn("API aún no respondió health; se reintentará en cada POST.");
};

const postTelemetry = async (payload) => {
  let lastError;
  for (let attempt = 1; attempt <= API_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(
        API_URL,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
        API_TIMEOUT_MS
      );
      const text = await res.text();
      let body;
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
      if (res.status >= 500 && attempt < API_RETRIES) {
        console.warn(`POST ${res.status}, reintento ${attempt}/${API_RETRIES}...`);
        await sleep(2000 * attempt);
        continue;
      }
      return { status: res.status, body };
    } catch (e) {
      lastError = e;
      console.warn(`POST error intento ${attempt}/${API_RETRIES}:`, e.message);
      if (attempt < API_RETRIES) await sleep(2000 * attempt);
    }
  }
  throw lastError || new Error("POST falló sin respuesta");
};

const waitForPort = async (path) => {
  if (!WAIT_FOR_PORT) return;
  for (;;) {
    const ports = await SerialPort.list();
    if (ports.some((p) => p.path === path)) {
      const info = ports.find((p) => p.path === path);
      console.log(`Puerto ${path} detectado${info?.manufacturer ? ` (${info.manufacturer})` : ""}`);
      return;
    }
    console.log(
      `Esperando ${path}… Conecta el Arduino por USB y cierra el Monitor Serie (reintento en ${PORT_POLL_MS / 1000}s)`
    );
    await sleep(PORT_POLL_MS);
  }
};

const attachSerial = (port) => {
  const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

  parser.on("data", async (line) => {
    const trimmed = String(line).trim();
    if (!trimmed.startsWith("{")) {
      if (trimmed) console.log("[serial]", trimmed.slice(0, 120));
      return;
    }

    let raw;
    try {
      raw = JSON.parse(trimmed);
    } catch {
      console.warn("JSON inválido:", trimmed.slice(0, 80));
      return;
    }

    const payload = normalizePayload(raw);
    if (!payload) {
      console.warn("Payload incompleto, se omite:", trimmed.slice(0, 100));
      return;
    }

    try {
      const { status, body } = await postTelemetry(payload);
      const t = payload.lecturas.temperatura;
      const h = payload.lecturas.humedad;
      console.log(`POST ${status} | T=${t} HR=${h} |`, typeof body === "object" ? body.success : body);
    } catch (e) {
      console.error("Error POST API:", e.message);
    }
  });

  port.on("error", (e) => console.error("Serial error:", e.message));
};

const openSerial = async () => {
  await waitForPort(SERIAL_PORT);

  const port = new SerialPort({ path: SERIAL_PORT, baudRate: SERIAL_BAUD, autoOpen: false });

  port.open((err) => {
    if (err) {
      console.error("No se pudo abrir el puerto:", err.message);
      if (/access denied|busy|in use/i.test(err.message)) {
        console.error("Cierra el Monitor Serie de Arduino IDE u otro gateway en COM3.");
      }
      setTimeout(() => openSerial().catch((e) => console.error(e.message)), PORT_POLL_MS);
      return;
    }
    console.log("Puerto abierto. Esperando líneas JSON del Arduino (AHT10 + DS3231)...");
  });

  port.on("close", () => {
    console.warn(`Puerto ${SERIAL_PORT} cerrado. Reintentando en ${PORT_POLL_MS / 1000}s…`);
    setTimeout(() => openSerial().catch((e) => console.error(e.message)), PORT_POLL_MS);
  });

  attachSerial(port);
};

const main = async () => {
  if (API_INSECURE_TLS && API_URL.startsWith("https")) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  console.log(`Gateway Nativa — ${SERIAL_PORT} @ ${SERIAL_BAUD} → ${API_URL}`);
  console.log(`Identidad fallback (sketch legacy): deviceId=${DEVICE_ID} grupo=${CODIGO_GRUPO}`);

  await wakeRender();
  await openSerial();
};

main().catch((e) => {
  console.error("Gateway no pudo iniciar:", e.message);
  process.exit(1);
});
