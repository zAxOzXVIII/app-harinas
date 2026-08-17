const mongoose = require("mongoose");
const TelemetryEvent = require("../models/TelemetryEvent");
const GrupoRubro = require("../models/GrupoRubro");
const { evaluateTelemetryEvent } = require("./processAlert.service");

const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX_EVENTS = 120;

/** Un solo sensor USB: si el firmware manda un código semilla, pegar la lectura al lote de harina. */
const attachToLoteHarina = async (grupo) => {
  if (!grupo || grupo.vinculadoAHarina) return grupo;

  const ProcesoSecado = require("../models/ProcesoSecado");
  const activo = await ProcesoSecado.findOne({ estado: "en_secado" })
    .sort({ iniciadoEn: -1 })
    .select("grupoRubroId");
  if (activo?.grupoRubroId) {
    const enSecado = await GrupoRubro.findById(activo.grupoRubroId).select(
      "_id codigo nombre vinculadoAHarina"
    );
    if (enSecado?.vinculadoAHarina) return enSecado;
  }

  const lote = await GrupoRubro.findOne({ vinculadoAHarina: true })
    .sort({ createdAt: -1 })
    .select("_id codigo nombre vinculadoAHarina");
  return lote || grupo;
};

const resolveGrupoId = async ({ grupoRubroId, codigoGrupo }) => {
  if (grupoRubroId) {
    if (!mongoose.Types.ObjectId.isValid(grupoRubroId)) {
      const err = new Error("grupoRubroId invalido");
      err.status = 400;
      throw err;
    }
    const grupo = await GrupoRubro.findById(grupoRubroId).select(
      "_id codigo nombre vinculadoAHarina"
    );
    if (!grupo) {
      const err = new Error("Grupo de rubro no encontrado");
      err.status = 404;
      throw err;
    }
    return attachToLoteHarina(grupo);
  }

  if (codigoGrupo) {
    const grupo = await GrupoRubro.findOne({ codigo: codigoGrupo }).select(
      "_id codigo nombre vinculadoAHarina"
    );
    if (!grupo) {
      const err = new Error("codigoGrupo no coincide con un grupo existente");
      err.status = 404;
      throw err;
    }
    return attachToLoteHarina(grupo);
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

const startOfDay = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
};

const round1 = (n) => Math.round(n * 10) / 10;

/** Agregación diaria de humedad por grupo (registro 24/7). */
const getHumedadFluctuacionesDiarias = async ({ from, to, grupoRubroId } = {}) => {
  const { getConfig } = require("./humedadConfig.service");
  const humedad = await getConfig();
  const min = humedad.min;
  const max = humedad.max;
  const criticoMin = humedad.criticoMin;
  const criticoMax = humedad.criticoMax;

  const toDate = to ? endOfDay(new Date(to)) : endOfDay(new Date());
  const fromDate = from
    ? startOfDay(new Date(from))
    : startOfDay(new Date(toDate.getTime() - 6 * 24 * 60 * 60 * 1000));

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    const err = new Error("Rango de fechas invalido");
    err.status = 400;
    throw err;
  }

  const match = {
    timestamp: { $gte: fromDate, $lte: toDate },
  };

  if (grupoRubroId) {
    if (!mongoose.Types.ObjectId.isValid(grupoRubroId)) {
      const err = new Error("ID de grupo invalido");
      err.status = 400;
      throw err;
    }
    match.grupoRubroId = new mongoose.Types.ObjectId(grupoRubroId);
  }

  const criticoCond = [];
  if (criticoMin != null) {
    criticoCond.push({ $lt: ["$lecturas.humedad", criticoMin] });
  }
  if (criticoMax != null) {
    criticoCond.push({ $gt: ["$lecturas.humedad", criticoMax] });
  }

  const groupStage = {
    _id: {
      fecha: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
      grupoRubroId: "$grupoRubroId",
    },
    lecturas: { $sum: 1 },
    humedadMin: { $min: "$lecturas.humedad" },
    humedadMax: { $max: "$lecturas.humedad" },
    humedadPromedio: { $avg: "$lecturas.humedad" },
    fueraRango: {
      $sum: {
        $cond: [
          {
            $or: [
              { $lt: ["$lecturas.humedad", min] },
              { $gt: ["$lecturas.humedad", max] },
            ],
          },
          1,
          0,
        ],
      },
    },
  };

  if (criticoCond.length > 0) {
    groupStage.critico = {
      $sum: {
        $cond: [{ $or: criticoCond }, 1, 0],
      },
    };
  } else {
    groupStage.critico = { $sum: 0 };
  }

  const rows = await TelemetryEvent.aggregate([
    { $match: match },
    { $group: groupStage },
    {
      $lookup: {
        from: "gruporubros",
        localField: "_id.grupoRubroId",
        foreignField: "_id",
        as: "grupo",
      },
    },
    { $unwind: "$grupo" },
    { $sort: { "_id.fecha": -1, "grupo.nombre": 1 } },
  ]);

  const umbrales = {
    min,
    max,
    criticoMin: criticoMin ?? null,
    criticoMax: criticoMax ?? null,
    unidad: humedad.unidad ?? "%RH",
  };

  return rows.map((row) => ({
    grupoRubroId: row._id.grupoRubroId,
    nombreGrupo: row.grupo.nombre,
    codigoGrupo: row.grupo.codigo,
    fecha: row._id.fecha,
    lecturas: row.lecturas,
    humedadMin: round1(row.humedadMin),
    humedadMax: round1(row.humedadMax),
    humedadPromedio: round1(row.humedadPromedio),
    fueraRango: row.fueraRango,
    critico: row.critico,
    umbrales,
  }));
};

module.exports = {
  ingestTelemetry,
  getLatestByGroup,
  getRecentByGroup,
  getHumedadFluctuacionesDiarias,
};
