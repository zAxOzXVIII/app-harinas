const { connectDb } = require("../config/db");
const env = require("../config/env");
const GrupoRubro = require("../models/GrupoRubro");
const HumedadConfig = require("../models/HumedadConfig");

const GRUPOS = [
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

const seedGrupos = async () => {
  try {
    await connectDb();

    for (const grupo of GRUPOS) {
      const existing = await GrupoRubro.findOne({ codigo: grupo.codigo });
      if (existing) {
        console.log(`Grupo ${grupo.codigo} ya existe (no se modifica)`);
        continue;
      }
      await GrupoRubro.create(grupo);
      console.log(`Grupo ${grupo.codigo} creado`);
    }

    const humedad = await HumedadConfig.findOne({ scope: "global" });
    if (!humedad) {
      await HumedadConfig.create({ scope: "global" });
      console.log("HumedadConfig global creada con valores por defecto");
    } else {
      console.log("HumedadConfig global ya existe");
    }

    console.log("Seed de grupos de rubro completado");
    process.exit(0);
  } catch (error) {
    console.error("Error al sembrar grupos:", error.message);
    process.exit(1);
  }
};

if (!env.mongoUri) {
  console.error("Falta MONGODB_URI en variables de entorno");
  process.exit(1);
}

seedGrupos();
