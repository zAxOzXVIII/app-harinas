const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const env = require("../config/env");

const inputArg = process.argv[2];

const run = () => {
  if (!env.mongoUri) {
    console.error("Falta MONGODB_URI");
    process.exit(1);
  }

  if (!inputArg) {
    console.error("Uso: npm run restore:mongo -- <ruta_dump>");
    process.exit(1);
  }

  const dumpPath = path.resolve(process.cwd(), inputArg);
  if (!fs.existsSync(dumpPath)) {
    console.error(`No existe la ruta: ${dumpPath}`);
    process.exit(1);
  }

  const proc = spawn(
    "mongorestore",
    ["--uri", env.mongoUri, "--drop", "--gzip", dumpPath],
    { stdio: "inherit", shell: true }
  );

  proc.on("exit", (code) => {
    if (code === 0) {
      console.log("Restore completado.");
      process.exit(0);
    }
    console.error("Error ejecutando mongorestore.");
    process.exit(code || 1);
  });
};

run();
