const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  const User = require("../src/models/User");
  const email = "admin@nativa.com";
  const exists = await User.findOne({ email });
  if (!exists) {
    await User.create({
      email,
      nombre: "Admin Test",
      password: await bcrypt.hash("admin123", 10),
      rol: "gerente",
    });
  }

  const operadorEmail = "operador@nativa.com";
  const operadorExists = await User.findOne({ email: operadorEmail });
  if (!operadorExists) {
    await User.create({
      email: operadorEmail,
      nombre: "Operador Test",
      password: await bcrypt.hash("operador123", 10),
      rol: "operador",
    });
  }

  const GrupoRubro = require("../src/models/GrupoRubro");
  const HumedadConfig = require("../src/models/HumedadConfig");

  const gruposSeed = [
    {
      codigo: "garbanzo-lenteja",
      nombre: "Garbanzo y Lenteja",
      items: ["Garbanzo", "Lenteja"],
      calibracion: {
        temperatura: { min: 30, max: 50, criticoMin: 25, criticoMax: 60, unidad: "C" },
        nivelSecado: { min: 40, max: 80, unidad: "%" },
        tiempoSecado: { estimadoMin: 90, unidad: "min" },
      },
    },
    {
      codigo: "platano-cambur",
      nombre: "Platano y Cambur",
      items: ["Platano", "Cambur"],
      calibracion: {
        temperatura: { min: 25, max: 45, criticoMin: 20, criticoMax: 55, unidad: "C" },
        nivelSecado: { min: 30, max: 70, unidad: "%" },
        tiempoSecado: { estimadoMin: 75, unidad: "min" },
      },
    },
    {
      codigo: "yuca-batata",
      nombre: "Yuca y Batata",
      items: ["Yuca", "Batata"],
      calibracion: {
        temperatura: { min: 30, max: 55, criticoMin: 25, criticoMax: 65, unidad: "C" },
        nivelSecado: { min: 50, max: 90, unidad: "%" },
        tiempoSecado: { estimadoMin: 120, unidad: "min" },
      },
    },
  ];

  for (const grupo of gruposSeed) {
    const found = await GrupoRubro.findOne({ codigo: grupo.codigo });
    if (!found) {
      await GrupoRubro.create(grupo);
    }
  }

  const humedad = await HumedadConfig.findOne({ scope: "global" });
  if (!humedad) {
    await HumedadConfig.create({ scope: "global" });
  }
});
