/**
 * Datos de demostración completos: usuarios, harinas, telemetría y alertas.
 * Requiere MongoDB y variables en .env (MONGODB_URI).
 */
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { connectDb } = require("../config/db");
const env = require("../config/env");
const User = require("../models/User");
const Harina = require("../models/Harina");
const GrupoRubro = require("../models/GrupoRubro");
const HumedadConfig = require("../models/HumedadConfig");
const ProcesoSecado = require("../models/ProcesoSecado");
const { ingestTelemetry } = require("../services/telemetry.service");

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

const DEMO_USERS = [
  {
    email: "admin@nativa.com",
    nombre: "Administrador",
    password: process.env.ADMIN_PASSWORD || "admin123",
    rol: "gerente",
  },
  {
    email: "supervisor@nativa.com",
    nombre: "Supervisor Demo",
    password: "supervisor123",
    rol: "supervisor",
  },
  {
    email: "operador@nativa.com",
    nombre: "Operador Demo",
    password: "operador123",
    rol: "operador",
  },
];

const HARINAS = [
  { nombre: "Harina de maiz", tipo: "Precocida", cantidad: 120, unidad: "kg" },
  { nombre: "Harina de yuca", tipo: "Extrafina", cantidad: 85, unidad: "kg" },
  { nombre: "Harina de platano", tipo: "Verde", cantidad: 60, unidad: "kg" },
  { nombre: "Harina de garbanzo", tipo: "Integral", cantidad: 45, unidad: "kg" },
  { nombre: "Harina de lenteja", tipo: "Premium", cantidad: 38, unidad: "kg" },
  { nombre: "Harina de batata", tipo: "Industrial", cantidad: 72, unidad: "kg" },
];

const ensureUser = async ({ email, nombre, password, rol }) => {
  const emailLower = email.toLowerCase().trim();
  const existing = await User.findOne({ email: emailLower });
  const hashed = await bcrypt.hash(password, 10);

  if (existing) {
    existing.nombre = nombre;
    existing.rol = rol;
    existing.password = hashed;
    await existing.save();
    console.log(`Usuario ${emailLower} actualizado (${rol})`);
    return;
  }

  await User.create({
    email: emailLower,
    nombre,
    password: hashed,
    rol,
  });
  console.log(`Usuario ${emailLower} creado (${rol})`);
};

const ensureGrupos = async () => {
  for (const grupo of GRUPOS) {
    const existing = await GrupoRubro.findOne({ codigo: grupo.codigo });
    if (existing) {
      console.log(`Grupo ${grupo.codigo} ya existe`);
      continue;
    }
    await GrupoRubro.create(grupo);
    console.log(`Grupo ${grupo.codigo} creado`);
  }

  const humedad = await HumedadConfig.findOne({ scope: "global" });
  if (!humedad) {
    await HumedadConfig.create({ scope: "global" });
    console.log("HumedadConfig global creada");
  } else {
    console.log("HumedadConfig global OK");
  }
};

const ensureHarinas = async () => {
  const count = await Harina.countDocuments();
  if (count > 0) {
    console.log(`Harinas: ya hay ${count} registros (no se duplican)`);
    return;
  }

  const now = Date.now();
  for (let i = 0; i < HARINAS.length; i++) {
    const h = HARINAS[i];
    await Harina.create({
      ...h,
      fecha_registro: new Date(now - i * 86400000),
    });
  }
  console.log(`${HARINAS.length} harinas de demo creadas`);
};

/** Lecturas dentro de rango operativo del grupo. */
const readingsInRange = (grupo, humedad, count) => {
  const t = grupo.calibracion.temperatura;
  const ns = grupo.calibracion.nivelSecado;
  const items = [];
  for (let i = 0; i < count; i++) {
    const ts = new Date(Date.now() - (count - i) * 5 * 60 * 1000);
    items.push({
      eventId: `seed-demo-${grupo.codigo}-ok-${i}`,
      deviceId: "seed-device-01",
      codigoGrupo: grupo.codigo,
      timestamp: ts.toISOString(),
      lecturas: {
        temperatura: (t.min + t.max) / 2 + (i % 3) - 1,
        humedad: (humedad.min + humedad.max) / 2 + (i % 2),
        nivelSecado: (ns.min + ns.max) / 2,
        tiempoSecado: grupo.calibracion.tiempoSecado.estimadoMin - 10 + i,
      },
    });
  }
  return items;
};

/** Una lectura fuera de rango para generar alertas de prueba. */
const readingOutOfRange = (grupo, humedad) => ({
  eventId: `seed-demo-${grupo.codigo}-alert-${Date.now()}`,
  deviceId: "seed-device-01",
  codigoGrupo: grupo.codigo,
  timestamp: new Date().toISOString(),
  lecturas: {
    temperatura: grupo.calibracion.temperatura.criticoMax + 3,
    humedad: humedad.max + 5,
    nivelSecado: grupo.calibracion.nivelSecado.max + 5,
    tiempoSecado: grupo.calibracion.tiempoSecado.estimadoMin + 30,
  },
});

const seedTelemetry = async () => {
  const humedad = await HumedadConfig.findOne({ scope: "global" });
  if (!humedad) {
    console.warn("Sin HumedadConfig; omitiendo telemetria");
    return;
  }

  const grupos = await GrupoRubro.find().sort({ codigo: 1 });
  let ingested = 0;

  for (const grupo of grupos) {
    const payloads = [
      ...readingsInRange(grupo, humedad, 12),
      readingOutOfRange(grupo, humedad),
    ];

    for (const payload of payloads) {
      try {
        const result = await ingestTelemetry(payload);
        if (!result.deduplicated) ingested++;
      } catch (err) {
        if (err.message?.includes("duplicate") || err.code === 11000) {
          continue;
        }
        console.warn(`Telemetria ${payload.eventId}:`, err.message);
      }
    }
  }

  console.log(`Telemetria: ${ingested} eventos nuevos ingestados (con evaluacion de alertas)`);
};

const seedProcesosSecado = async () => {
  const operador = await User.findOne({ email: "operador@nativa.com" });
  const grupos = await GrupoRubro.find().sort({ codigo: 1 });
  if (!grupos.length) return;

  const yuca = grupos.find((g) => g.codigo === "yuca-batata") || grupos[2];
  const platano = grupos.find((g) => g.codigo === "platano-cambur") || grupos[1];

  const existingYuca = await ProcesoSecado.findOne({ grupoRubroId: yuca._id });
  if (!existingYuca) {
    const hace2h = new Date(Date.now() - 2 * 60 * 60 * 1000);
    await ProcesoSecado.create({
      grupoRubroId: yuca._id,
      estado: "revisado_empaquetado",
      iniciadoPor: operador?._id || null,
      iniciadoEn: hace2h,
      duracionMin: yuca.calibracion.tiempoSecado.estimadoMin,
      finalizaEn: new Date(hace2h.getTime() + 60 * 60 * 1000),
      completadoEn: new Date(hace2h.getTime() + 60 * 60 * 1000),
    });
    console.log("ProcesoSecado demo: yuca-batata empaquetado");
  }

  const existingPlatano = await ProcesoSecado.findOne({
    grupoRubroId: platano._id,
    estado: "en_secado",
  });
  if (!existingPlatano) {
    const hace30m = new Date(Date.now() - 30 * 60 * 1000);
    const dur = platano.calibracion.tiempoSecado.estimadoMin;
    await ProcesoSecado.create({
      grupoRubroId: platano._id,
      estado: "en_secado",
      iniciadoPor: operador?._id || null,
      iniciadoEn: hace30m,
      duracionMin: dur,
      finalizaEn: new Date(hace30m.getTime() + dur * 60 * 1000),
    });
    console.log("ProcesoSecado demo: platano-cambur en secado (mitad de ciclo)");
  }
};

const seedDemo = async () => {
  try {
    await connectDb();
    console.log("--- Usuarios demo ---");
    for (const u of DEMO_USERS) {
      await ensureUser(u);
    }

    console.log("--- Grupos y humedad ---");
    await ensureGrupos();

    console.log("--- Inventario harinas ---");
    await ensureHarinas();

    console.log("--- Telemetria y alertas ---");
    await seedTelemetry();

    console.log("--- Procesos de secado ---");
    await seedProcesosSecado();

    console.log("\nSeed demo completado.");
    console.log("Credenciales:");
    console.log("  Gerente:    admin@nativa.com / admin123");
    console.log("  Supervisor: supervisor@nativa.com / supervisor123");
    console.log("  Operador:   operador@nativa.com / operador123");
    process.exit(0);
  } catch (error) {
    console.error("Error seed demo:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

if (!env.mongoUri) {
  console.error("Falta MONGODB_URI en .env");
  process.exit(1);
}

seedDemo();
