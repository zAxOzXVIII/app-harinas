const mongoose = require("mongoose");
const ProcessAlert = require("../models/ProcessAlert");
const GrupoRubro = require("../models/GrupoRubro");
const { getConfig } = require("./humedadConfig.service");

const ANTI_SPAM_MS = 5 * 60 * 1000;

const shouldEmit = async (grupoRubroId, tipo) => {
  const since = new Date(Date.now() - ANTI_SPAM_MS);
  const existing = await ProcessAlert.findOne({
    grupoRubroId,
    tipo,
    createdAt: { $gte: since },
  })
    .select("_id")
    .lean();
  return !existing;
};

const emitAlert = async ({ tipo, severidad, grupoRubroId, telemetryEventId, mensaje }) => {
  if (!(await shouldEmit(grupoRubroId, tipo))) return null;
  return ProcessAlert.create({
    tipo,
    severidad,
    grupoRubroId,
    telemetryEventId,
    mensaje,
  });
};

/**
 * Evalua una lectura recien guardada contra calibracion del grupo y humedad global.
 * Emite alertas granulares con anti-spam por (grupo, tipo).
 */
const evaluateTelemetryEvent = async (telemetryDoc) => {
  const grupo = await GrupoRubro.findById(telemetryDoc.grupoRubroId);
  if (!grupo) return;

  const humedad = await getConfig();
  const l = telemetryDoc.lecturas;
  const t = grupo.calibracion.temperatura;
  const ns = grupo.calibracion.nivelSecado;
  const tsMin = grupo.calibracion.tiempoSecado?.estimadoMin ?? 0;
  const nombreGrupo = grupo.nombre;

  const hasCriticalTemp =
    (t.criticoMin !== undefined && t.criticoMin !== null && l.temperatura < t.criticoMin) ||
    (t.criticoMax !== undefined && t.criticoMax !== null && l.temperatura > t.criticoMax);

  if (hasCriticalTemp) {
    await emitAlert({
      tipo: "temp_critico",
      severidad: "critical",
      grupoRubroId: grupo._id,
      telemetryEventId: telemetryDoc._id,
      mensaje: `${nombreGrupo}: temperatura critica ${l.temperatura} (fuera de umbrales criticos)`,
    });
  } else if (l.temperatura < t.min || l.temperatura > t.max) {
    await emitAlert({
      tipo: "temp_fuera_rango",
      severidad: "warning",
      grupoRubroId: grupo._id,
      telemetryEventId: telemetryDoc._id,
      mensaje: `${nombreGrupo}: temperatura ${l.temperatura} fuera del rango operativo ${t.min}-${t.max}`,
    });
  }

  const humCritMin = humedad.criticoMin;
  const humCritMax = humedad.criticoMax;
  const hasCriticalHum =
    (humCritMin !== undefined && humCritMin !== null && l.humedad < humCritMin) ||
    (humCritMax !== undefined && humCritMax !== null && l.humedad > humCritMax);

  if (hasCriticalHum) {
    await emitAlert({
      tipo: "humedad_critico",
      severidad: "critical",
      grupoRubroId: grupo._id,
      telemetryEventId: telemetryDoc._id,
      mensaje: `${nombreGrupo}: humedad critica ${l.humedad} %RH`,
    });
  } else if (l.humedad < humedad.min || l.humedad > humedad.max) {
    await emitAlert({
      tipo: "humedad_fuera",
      severidad: "warning",
      grupoRubroId: grupo._id,
      telemetryEventId: telemetryDoc._id,
      mensaje: `${nombreGrupo}: humedad ${l.humedad} fuera del rango global ${humedad.min}-${humedad.max}`,
    });
  }

  if (l.nivelSecado < ns.min || l.nivelSecado > ns.max) {
    await emitAlert({
      tipo: "nivel_secado_fuera",
      severidad: "warning",
      grupoRubroId: grupo._id,
      telemetryEventId: telemetryDoc._id,
      mensaje: `${nombreGrupo}: nivel de secado ${l.nivelSecado}% fuera de ${ns.min}-${ns.max}%`,
    });
  }

  if (l.tiempoSecado > tsMin) {
    await emitAlert({
      tipo: "tiempo_secado_exceso",
      severidad: "warning",
      grupoRubroId: grupo._id,
      telemetryEventId: telemetryDoc._id,
      mensaje: `${nombreGrupo}: tiempo de secado ${l.tiempoSecado} min supera estimado ${tsMin} min`,
    });
  }
};

const listAlerts = async ({ limit = 50, unreadOnly = false }) => {
  const q = {};
  if (unreadOnly) q.leida = false;
  return ProcessAlert.find(q)
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(Number(limit) || 50, 1), 200))
    .populate("grupoRubroId", "nombre codigo")
    .lean();
};

const countUnread = async () => ProcessAlert.countDocuments({ leida: false });

const markRead = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("ID de alerta invalido");
    err.status = 400;
    throw err;
  }
  const doc = await ProcessAlert.findByIdAndUpdate(id, { $set: { leida: true } }, { new: true });
  if (!doc) {
    const err = new Error("Alerta no encontrada");
    err.status = 404;
    throw err;
  }
  return doc;
};

const markAllRead = async () => {
  await ProcessAlert.updateMany({ leida: false }, { $set: { leida: true } });
  return { updated: true };
};

module.exports = {
  evaluateTelemetryEvent,
  listAlerts,
  countUnread,
  markRead,
  markAllRead,
};
