/**
 * Monitor de flujo: Render → telemetría visible en app.
 * El gateway (otra terminal) cubre COM3 → POST Render.
 *
 * Uso: node scripts/monitor-flujo.js
 */
const BASE = process.env.RENDER_URL || "https://app-harinas.onrender.com";
const EMAIL = process.env.MONITOR_EMAIL || "admin@nativa.com";
const PASSWORD = process.env.MONITOR_PASSWORD || "admin123";
const INTERVAL_MS = Number(process.env.MONITOR_INTERVAL_MS || 5000);
const GRUPO = process.env.MONITOR_GRUPO || "garbanzo-lenteja";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ts = () => new Date().toLocaleTimeString("es-VE");

const line = (step, msg) => console.log(`[${ts()}] ${step} ${msg}`);

const request = async (method, path, { token, body } = {}) => {
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 120) };
  }
  return { status: res.status, json };
};

const login = async () => {
  const res = await request("POST", "/api/auth/login", {
    body: { email: EMAIL, password: PASSWORD },
  });
  if (res.status !== 200 || !res.json?.data?.token) {
    throw new Error(`Login falló (${res.status})`);
  }
  return res.json.data.token;
};

const formatAgo = (iso) => {
  const sec = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return `hace ${sec}s`;
  return `hace ${Math.round(sec / 60)}m`;
};

const main = async () => {
  console.clear();
  console.log("═══════════════════════════════════════════════════");
  console.log("  FLUJO DE DATOS — App Harinas (monitor en vivo)");
  console.log("═══════════════════════════════════════════════════");
  console.log("");
  line("SETUP", `API ${BASE}`);
  line("SETUP", "Cadena esperada:");
  console.log("  Arduino (COM3) → gateway laptop → POST Render → MongoDB → app móvil");
  console.log("");

  const health = await request("GET", "/api/health");
  line("RENDER", `GET /api/health → ${health.status} ${health.json?.message || ""}`);

  const token = await login();
  line("APP   ", `Login OK (${EMAIL})`);

  let lastEventId = null;
  let tick = 0;

  const poll = async () => {
    tick += 1;
    const res = await request("GET", "/api/telemetry/latest", { token });
    if (res.status !== 200) {
      line("APP   ", `GET /telemetry/latest → ${res.status}`);
      return;
    }

    const items = res.json?.data ?? [];
    const byDevice = items.filter((x) => x.deviceId === "uno-secador-01");
    const pool = byDevice.length ? byDevice : items;
    const item = pool.reduce((best, cur) => {
      if (!best) return cur;
      return new Date(cur.timestamp) > new Date(best.timestamp) ? cur : best;
    }, null);

    if (!item) {
      line("DATOS ", "Sin lecturas aún en la API (¿gateway activo en COM3?)");
      return;
    }

    const { temperatura: t, humedad: h } = item.lecturas || {};
    const grupo = item.grupo?.nombre || item.grupo?.codigo || "?";
    const device = item.deviceId || "?";
    const ago = formatAgo(item.timestamp);
    const isNew = item.eventId && item.eventId !== lastEventId;
    if (isNew) lastEventId = item.eventId;

    console.log("");
    line("FLUJO ", `tick #${tick}`);
    line("  [1] ", "Arduino + sensores → JSON por USB (COM3)");
    line("  [2] ", "Gateway laptop → POST /api/arduino/telemetry");
    line("  [3] ", `Render + MongoDB → guardado ${isNew ? "(lectura NUEVA)" : "(sin cambio)"}`);
    line("  [4] ", `App consulta API → ${grupo}`);
    line("  VAL  ", `device=${device}  T=${t}°C  HR=${h}%  ${ago}`);
    if (item.eventId) line("  ID   ", item.eventId);
  };

  await poll();
  setInterval(() => {
    poll().catch((e) => line("ERROR ", e.message));
  }, INTERVAL_MS);

  line("INFO  ", `Actualizando cada ${INTERVAL_MS / 1000}s — Ctrl+C para salir`);
};

main().catch((e) => {
  console.error("Monitor no pudo iniciar:", e.message);
  process.exit(1);
});
