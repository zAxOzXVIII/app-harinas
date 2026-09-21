const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { hashQuestionAnswers } = require("../src/utils/securityAnswers");

const TEST_SECURITY = {
  gerente: [
    { questionId: "gerente_planta", answer: "nativa" },
    { questionId: "gerente_ciudad", answer: "caracas" },
  ],
  supervisor: [
    { questionId: "supervisor_linea", answer: "secado" },
    { questionId: "supervisor_color", answer: "azul" },
  ],
  operador: [
    { questionId: "operador_turno", answer: "manana" },
    { questionId: "operador_color", answer: "verde" },
  ],
};

const ensureTestUser = async ({ email, nombre, password, rol }) => {
  const User = require("../src/models/User");
  const hashedPassword = await bcrypt.hash(password, 10);
  const securityQuestions = await hashQuestionAnswers(rol, TEST_SECURITY[rol]);
  const existing = await User.findOne({ email }).select("+securityQuestions");
  if (existing) {
    existing.nombre = nombre;
    existing.rol = rol;
    existing.password = hashedPassword;
    existing.securityQuestions = securityQuestions;
    await existing.save();
    return;
  }
  await User.create({
    email,
    nombre,
    password: hashedPassword,
    rol,
    securityQuestions,
  });
};

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  await ensureTestUser({
    email: "admin@nativa.com",
    nombre: "Admin Test",
    password: "admin123",
    rol: "gerente",
  });
  await ensureTestUser({
    email: "operador@nativa.com",
    nombre: "Operador Test",
    password: "operador123",
    rol: "operador",
  });
  await ensureTestUser({
    email: "supervisor@nativa.com",
    nombre: "Supervisor Test",
    password: "supervisor123",
    rol: "supervisor",
  });

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
