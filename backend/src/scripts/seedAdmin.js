const bcrypt = require("bcryptjs");
const { connectDb } = require("../config/db");
const env = require("../config/env");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    await connectDb();

    const email = process.env.ADMIN_EMAIL || "admin@nativa.com";
    const password = process.env.ADMIN_PASSWORD || "admin123";
    const nombre = process.env.ADMIN_NOMBRE || "Administrador";

    const adminEmailLower = email.toLowerCase().trim();

    await User.updateMany({ email: adminEmailLower }, { $set: { rol: "gerente" } });
    await User.updateMany(
      { $or: [{ rol: { $exists: false } }, { rol: null }], email: { $ne: adminEmailLower } },
      { $set: { rol: "operador" } }
    );

    const exists = await User.findOne({ email: adminEmailLower });
    if (exists) {
      console.log("Cuenta Gerente ya existe (rol verificado/migrado)");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      nombre,
      email: adminEmailLower,
      password: hashedPassword,
      rol: "gerente",
    });

    console.log("Cuenta Gerente creada correctamente");
    console.log(`Email: ${email}`);
    console.log("Contraseña: (la definida en ADMIN_PASSWORD o admin123)");
    process.exit(0);
  } catch (error) {
    console.error("Error al crear usuario administrador:", error.message);
    process.exit(1);
  }
};

if (!env.mongoUri) {
  console.error("Falta MONGODB_URI en variables de entorno");
  process.exit(1);
}

seedAdmin();
