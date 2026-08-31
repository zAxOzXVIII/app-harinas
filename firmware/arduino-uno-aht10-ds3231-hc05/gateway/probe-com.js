/**
 * Prueba rápida del puerto serial (sin enviar a Render).
 * Uso: npm run probe
 */
require("dotenv").config();

const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const SERIAL_PORT = process.env.SERIAL_PORT || "COM3";
const SERIAL_BAUD = Number(process.env.SERIAL_BAUD || 115200);
const PROBE_MS = Number(process.env.PROBE_MS || 15000);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const main = async () => {
  const ports = await SerialPort.list();
  console.log("Puertos disponibles:", ports.map((p) => p.path).join(", ") || "(ninguno)");

  const target = ports.find((p) => p.path === SERIAL_PORT);
  if (!target) {
    console.log(`\n${SERIAL_PORT} no detectado. Conecta el Arduino por USB y vuelve a ejecutar npm run probe.`);
    process.exit(1);
  }

  console.log(`\nProbando ${SERIAL_PORT} @ ${SERIAL_BAUD} durante ${PROBE_MS / 1000}s...`);
  console.log("(Cierra el Monitor Serie de Arduino IDE antes de abrir el puerto)\n");

  let jsonLines = 0;
  let textLines = 0;
  let lastJson = null;

  await new Promise((resolve, reject) => {
    const port = new SerialPort({ path: SERIAL_PORT, baudRate: SERIAL_BAUD, autoOpen: false });

    port.open((err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log("Puerto abierto.");
    });

    const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

    parser.on("data", (line) => {
      const trimmed = String(line).trim();
      if (!trimmed) return;
      if (trimmed.startsWith("{")) {
        jsonLines += 1;
        console.log(`[JSON ${jsonLines}]`, trimmed.slice(0, 200));
        try {
          lastJson = JSON.parse(trimmed);
        } catch {
          /* ignore */
        }
      } else {
        textLines += 1;
        if (textLines <= 5) console.log("[texto]", trimmed.slice(0, 120));
      }
    });

    port.on("error", (e) => reject(e));

    setTimeout(() => {
      port.close(() => resolve());
    }, PROBE_MS);
  });

  console.log("\n--- Resultado ---");
  console.log("lineas JSON:", jsonLines);
  console.log("lineas texto:", textLines);

  if (lastJson) {
    const temp = lastJson.temperature ?? lastJson.lecturas?.temperatura;
    const hum = lastJson.humidity ?? lastJson.lecturas?.humedad;
    console.log("ultima T:", temp ?? "—");
    console.log("ultima HR:", hum ?? "—");
    console.log("formato:", lastJson.deviceId ? "Nativa" : "legacy");
    process.exit(0);
  }

  if (jsonLines === 0) {
    console.log("Sin JSON. Revisa: sketch subido, baud 115200, cable USB, RESET en el Uno.");
    process.exit(1);
  }
};

main().catch((e) => {
  console.error("Error:", e.message);
  if (/access denied|busy|in use/i.test(e.message)) {
    console.error("El puerto está ocupado (Monitor Serie u otro gateway). Ciérralo e intenta de nuevo.");
  }
  process.exit(1);
});
