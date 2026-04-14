const app = require("./app");
const env = require("./config/env");
const { connectDb } = require("./config/db");

const bootstrap = async () => {
  try {
    if (!env.jwtSecret) {
      throw new Error("Falta la variable de entorno JWT_SECRET");
    }

    await connectDb();

    app.listen(env.port, () => {
      console.log(`Servidor ejecutándose en puerto ${env.port}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error.message);
    process.exit(1);
  }
};

bootstrap();
