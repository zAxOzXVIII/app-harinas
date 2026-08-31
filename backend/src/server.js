const app = require("./app");
const env = require("./config/env");
const { connectDb } = require("./config/db");

const bootstrap = async () => {
  try {
    if (!env.jwtSecret) {
      throw new Error("Falta la variable de entorno JWT_SECRET");
    }

    await connectDb();

    // 0.0.0.0: obligatorio en Render / contenedores (no solo localhost)
    const host = process.env.HOST || "0.0.0.0";
    app.listen(env.port, host, () => {
      console.log(`Servidor ejecutándose en http://${host}:${env.port}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error.message);
    process.exit(1);
  }
};

bootstrap();
