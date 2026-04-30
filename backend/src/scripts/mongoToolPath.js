const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const WINDOWS_CANDIDATES = [
  "C:\\Program Files\\MongoDB\\Server\\8.0\\bin",
  "C:\\Program Files\\MongoDB\\Server\\7.0\\bin",
  "C:\\Program Files\\MongoDB\\Server\\6.0\\bin",
  "C:\\Program Files\\MongoDB\\Tools\\100\\bin",
];

const resolveFromPathDirs = (name) => {
  const extra = (process.env.PATH || "")
    .split(path.delimiter)
    .map((p) => p.trim())
    .filter(Boolean);

  for (const dir of [...WINDOWS_CANDIDATES, ...extra]) {
    const candidate = path.join(dir, process.platform === "win32" ? `${name}.exe` : name);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
};

/**
 * Resuelve ruta a mongodump / mongorestore (PATH o carpetas tipicas en Windows).
 */
const resolveMongoTool = (name) => {
  try {
    const out = execSync(process.platform === "win32" ? `where.exe ${name}` : `command -v ${name}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const first = out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)[0];
    if (first && fs.existsSync(first)) return first;
  } catch (_e) {
    // ignorar
  }
  return resolveFromPathDirs(name);
};

module.exports = { resolveMongoTool };
