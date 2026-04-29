const mongoose = require("mongoose");
const TelemetryEvent = require("../models/TelemetryEvent");
const GrupoRubro = require("../models/GrupoRubro");
const { evaluateTelemetryEvent } = require("./processAlert.service");

const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX_EVENTS = 120;

const resolveGrupoId = async ({ grupoRubroId, codigoGrupo }) => {
  if (grupoRubroId) {
    if (!mongoose.Types.ObjectId.isValid(grupoRubroId)) {
      const err = new Error("grupoRubroId invalido");
      err.status = 400;
      throw err;
    }
    const grupo = await GrupoRubro.findById(grupoRubroId).select("_id codigo nombre");
    if (!grupo) {
      const err = new Error("Grupo de rubro no encontrado");
      err.status = 404;
      throw err;
    }
    return grupo;
  }

  if (codigoGrupo) {
    const grupo = await GrupoRubro.findOne({ codigo: codigoGrupo }).select("_id codigo nombre");
    if (!grupo) {
      const err = new Error("codigoGrupo no coincide con un grupo existente");
      err.status = 404;
      throw err;
    }
    return grupo;
  }

  const err = new Error("Debes enviar grupoRubroId o codigoGrupo");
  err.status = 422;
  throw err;
};

const checkRateLimit = async (deviceId) => {
  const since = new Date(Date.now() - RATE_WINDOW_MS);
  const count = await TelemetryEvent.countDocuments({
    deviceId,
    timestamp: { $gte: since },
  });
  if (count >= RATE_MAX_EVENTS) {
    const err = new Error("Rate limit excedido para este deviceId");
    err.status = 429;
    throw err;
  }
};

const ingestTelemetry = async (payload) => {
  const grupo = await resolveGrupoId(payload);
  await checkRateLimit(payload.deviceId);

  if (payload.eventId) {
    const existing = await TelemetryEvent.findOne({ eventId: payload.eventId });
    if (existing) {
      return { item: existing, deduplicated: true };
    }
  }

  const item = await TelemetryEvent.create({
    eventId: payload.eventId || undefined,
    deviceId: payload.deviceId,
    grupoRubroId: grupo._id,
    timestamp: payload.timestamp || new Date(),
    lecturas: payload.lecturas,
  });

  try {
    await evaluateTelemetryEvent(item);
  } catch (err) {
    // No fallar la ingesta si la evaluacion de alertas falla
    console.error("evaluateTelemetryEvent:", err.message);
  }

  return { item, deduplicated: false };
};

const getLatestByGroup = async () => {
  const latest = await TelemetryEvent.aggregate([
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: "$grupoRubroId",
        item: { $first: "$$ROOT" },
      },
    },
    { $replaceRoot: { newRoot: "$item" } },
    {
      $lookup: {
        from: "gruporubros",
        localField: "grupoRubroId",
        foreignField: "_id",
        as: "grupo",
      },
    },
    { $unwind: "$grupo" },
    { $sort: { "grupo.nombre": 1 } },
  ]);
  return latest;
};

const getRecentByGroup = async (grupoRubroId, limit = 20) => {
  if (!mongoose.Types.ObjectId.isValid(grupoRubroId)) {
    const err = new Error("ID de grupo invalido");
    err.status = 400;
    throw err;
  }

  return TelemetryEvent.find({ grupoRubroId })
    .sort({ timestamp: -1 })
    .limit(Math.min(Math.max(limit, 1), 200));
};

module.exports = {
  ingestTelemetry,
  getLatestByGroup,
  getRecentByGroup,
};
