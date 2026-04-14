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

    const exists = await User.findOne({ email });
    if (exists) {
      console.log("El usuario administrador ya existe");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      nombre,
      email,
      password: hashedPassword,
    });

    console.log("Usuario administrador creado correctamente");
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
