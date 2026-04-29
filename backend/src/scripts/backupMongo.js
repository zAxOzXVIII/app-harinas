const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const env = require("../config/env");

const backupsDir = path.resolve(__dirname, "../../backups");
const ts = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = path.join(backupsDir, `dump-${ts}`);

const run = () => {
  if (!env.mongoUri) {
    console.error("Falta MONGODB_URI");
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });

  const proc = spawn(
    "mongodump",
    ["--uri", env.mongoUri, "--out", outDir, "--gzip"],
    { stdio: "inherit", shell: true }
  );

  proc.on("exit", (code) => {
    if (code === 0) {
      console.log(`Backup creado en: ${outDir}`);
      process.exit(0);
    }
    console.error("Error ejecutando mongodump.");
    process.exit(code || 1);
  });
};

run();
