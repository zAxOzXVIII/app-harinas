/**
 * Verifica conexión a MongoDB Atlas y cuenta documentos clave.
 * Uso: npm run verify:atlas
 */
require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Falta MONGODB_URI en .env");
  process.exit(1);
}

async function main() {
  await mongoose.connect(uri);
  console.log("MongoDB conectado correctamente");

  const db = mongoose.connection.db;
  const collections = ["users", "gruporubros", "harinas", "telemetryevents", "processalerts", "procesosecados"];

  for (const name of collections) {
    try {
      const count = await db.collection(name).countDocuments();
      console.log(`  ${name}: ${count} documentos`);
    } catch {
      console.log(`  ${name}: (colección no existe aún)`);
    }
  }

  await mongoose.disconnect();
  console.log("Verificación Atlas OK");
}

main().catch((err) => {
  console.error("Error Atlas:", err.message);
  process.exit(1);
});
