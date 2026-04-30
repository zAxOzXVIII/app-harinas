const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const env = require("../config/env");
const { resolveMongoTool } = require("./mongoToolPath");

const backupsDir = path.resolve(__dirname, "../../backups");
const ts = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = path.join(backupsDir, `dump-${ts}`);

const run = () => {
  if (!env.mongoUri) {
    console.error("Falta MONGODB_URI");
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });

  const mongodump = resolveMongoTool("mongodump");
  if (!mongodump) {
    console.error(
      "No se encontro mongodump en PATH ni en rutas tipicas de MongoDB. Instala MongoDB Database Tools: https://www.mongodb.com/try/download/database-tools"
    );
    process.exit(1);
  }

  const proc = spawn(
    mongodump,
    ["--uri", env.mongoUri, "--out", outDir, "--gzip"],
    { stdio: "inherit", shell: false }
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
