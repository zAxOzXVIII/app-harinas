const mongoose = require("mongoose");
const ProcesoSecado = require("../models/ProcesoSecado");
const ProcessAlert = require("../models/ProcessAlert");
const GrupoRubro = require("../models/GrupoRubro");
const { emitSecadoCompletadoAlert } = require("./processAlert.service");
const {
  ANOMALY_TIPOS,
  calificacionLabel,
  pickWorstCalificacion,
} = require("../utils/calificacionSecado");

const activeAlertFilter = { eliminada: { $ne: true } };

const getLatestByGrupo = (grupoRubroId) =>
  ProcesoSecado.findOne({ grupoRubroId }).sort({ createdAt: -1 });

const getEmpaquetadoGrupoIds = async () => {
  const rows = await ProcesoSecado.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$grupoRubroId",
        latestEstado: { $first: "$estado" },
      },
    },
    { $match: { latestEstado: "revisado_empaquetado" } },
  ]);
  return new Set(rows.map((r) => r._id.toString()));
};

const isGrupoLoteCerrado = async (grupoRubroId) => {
  const latest = await getLatestByGrupo(grupoRubroId);
  return latest?.estado === "revisado_empaquetado";
};

const completeProceso = async (proceso) => {
  if (!proceso || proceso.estado !== "en_secado") return proceso;

  const grupo = await GrupoRubro.findById(proceso.grupoRubroId).select("nombre");
  const nombreGrupo = grupo?.nombre || "Grupo";
  const ahora = new Date();

  const unattended = await ProcessAlert.find({
    grupoRubroId: proceso.grupoRubroId,
    leida: false,
    ...activeAlertFilter,
    tipo: { $in: ANOMALY_TIPOS },
    $or: [
      { procesoSecadoId: proceso._id },
      {
        procesoSecadoId: null,
        createdAt: { $gte: proceso.iniciadoEn, $lte: ahora },
      },
    ],
  }).lean();

  const resultado = unattended.length > 0 ? "poco_optimo" : "listo";
  const calificacion =
    resultado === "listo" ? null : pickWorstCalificacion(unattended) || "alerta_sin_atender";

  let descripcionCierre;
  if (resultado === "listo") {
    descripcionCierre = calificacionLabel("listo");
  } else {
    descripcionCierre = `Producto poco óptimo: ${calificacionLabel(calificacion)} (${unattended.length} alerta(s) sin atender)`;
  }

  proceso.estado = "revisado_empaquetado";
  proceso.completadoEn = ahora;
  proceso.resultado = resultado;
  proceso.calificacion = calificacion;
  proceso.descripcionCierre = descripcionCierre;
  proceso.alertasPendientesAlCierre = unattended.length;
  await proceso.save();

  const mensajeCierre =
    resultado === "listo"
      ? `${nombreGrupo}: secado finalizado — producto listo para revisión/empaquetado`
      : `${nombreGrupo}: secado cerrado — ${descripcionCierre}`;

  await emitSecadoCompletadoAlert({
    grupoRubroId: proceso.grupoRubroId,
    procesoSecadoId: proceso._id,
    mensaje: mensajeCierre,
    severidad: resultado === "listo" ? "info" : "warning",
  });

  return proceso;
};

/** Cierra sesiones cuyo temporizador ya venció. */
const finalizeExpiredSessions = async () => {
  const now = new Date();
  const expired = await ProcesoSecado.find({
    estado: "en_secado",
    finalizaEn: { $lte: now },
  });
  for (const proceso of expired) {
    await completeProceso(proceso);
  }
};

const enrichProceso = (doc) => {
  if (!doc) return null;
  const plain = doc.toObject ? doc.toObject() : { ...doc };
  const now = Date.now();
  const finaliza = new Date(plain.finalizaEn).getTime();
  const iniciado = new Date(plain.iniciadoEn).getTime();
  const restanteMs = Math.max(0, finaliza - now);
  const transcurridoMs = Math.max(0, now - iniciado);
  return {
    ...plain,
    restanteMs,
    transcurridoMs,
    restanteMin: Math.ceil(restanteMs / 60000),
    transcurridoMin: Math.floor(transcurridoMs / 60000),
  };
};

const listActivos = async () => {
  await finalizeExpiredSessions();
  const docs = await ProcesoSecado.find({ estado: "en_secado" })
    .populate("grupoRubroId", "nombre codigo")
    .populate("iniciadoPor", "nombre email")
    .sort({ iniciadoEn: -1 });
  return docs.map(enrichProceso);
};

const getActualByGrupo = async (grupoRubroId) => {
  if (!mongoose.Types.ObjectId.isValid(grupoRubroId)) {
    const err = new Error("ID de grupo invalido");
    err.status = 400;
    throw err;
  }
  await finalizeExpiredSessions();
  const latest = await getLatestByGrupo(grupoRubroId);
  return enrichProceso(latest);
};

const iniciarSecado = async (grupoRubroId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(grupoRubroId)) {
    const err = new Error("ID de grupo invalido");
    err.status = 400;
    throw err;
  }

  await finalizeExpiredSessions();

  const grupo = await GrupoRubro.findById(grupoRubroId);
  if (!grupo) {
    const err = new Error("Grupo de rubro no encontrado");
    err.status = 404;
    throw err;
  }

  const duracionMin = grupo.calibracion?.tiempoSecado?.estimadoMin ?? 0;
  if (duracionMin <= 0) {
    const err = new Error("El grupo no tiene tiempo de secado calibrado");
    err.status = 422;
    throw err;
  }

  const activo = await ProcesoSecado.findOne({ grupoRubroId, estado: "en_secado" });
  if (activo) {
    const err = new Error("Ya hay un secado en curso para este grupo");
    err.status = 409;
    throw err;
  }

  if (await isGrupoLoteCerrado(grupoRubroId)) {
    const err = new Error("Lote cerrado (revisado/empaquetado). No se puede iniciar de nuevo");
    err.status = 409;
    throw err;
  }

  const iniciadoEn = new Date();
  const finalizaEn = new Date(iniciadoEn.getTime() + duracionMin * 60 * 1000);

  const proceso = await ProcesoSecado.create({
    grupoRubroId,
    estado: "en_secado",
    iniciadoPor: userId || null,
    iniciadoEn,
    duracionMin,
    finalizaEn,
  });

  return enrichProceso(proceso);
};

const completarManual = async (procesoId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(procesoId)) {
    const err = new Error("ID de proceso invalido");
    err.status = 400;
    throw err;
  }

  const proceso = await ProcesoSecado.findById(procesoId);
  if (!proceso) {
    const err = new Error("Proceso de secado no encontrado");
    err.status = 404;
    throw err;
  }
  if (proceso.estado !== "en_secado") {
    const err = new Error("El proceso no esta en secado activo");
    err.status = 409;
    throw err;
  }

  await completeProceso(proceso);
  return enrichProceso(await ProcesoSecado.findById(procesoId));
};

const marcarEmpaquetado = async (procesoId) => {
  if (!mongoose.Types.ObjectId.isValid(procesoId)) {
    const err = new Error("ID de proceso invalido");
    err.status = 400;
    throw err;
  }

  const proceso = await ProcesoSecado.findById(procesoId);
  if (!proceso) {
    const err = new Error("Proceso de secado no encontrado");
    err.status = 404;
    throw err;
  }

  if (proceso.estado === "revisado_empaquetado") {
    return enrichProceso(proceso);
  }

  proceso.estado = "revisado_empaquetado";
  proceso.completadoEn = proceso.completadoEn || new Date();
  await proceso.save();
  return enrichProceso(proceso);
};

/** Permite un nuevo ciclo de secado archivando el lote cerrado anterior. */
const reabrirLote = async (grupoRubroId) => {
  if (!mongoose.Types.ObjectId.isValid(grupoRubroId)) {
    const err = new Error("ID de grupo invalido");
    err.status = 400;
    throw err;
  }

  await finalizeExpiredSessions();

  const activo = await ProcesoSecado.findOne({ grupoRubroId, estado: "en_secado" });
  if (activo) {
    const err = new Error("Hay un secado en curso; no se puede reabrir el lote");
    err.status = 409;
    throw err;
  }

  const latest = await getLatestByGrupo(grupoRubroId);
  if (!latest || latest.estado !== "revisado_empaquetado") {
    const err = new Error("No hay lote cerrado para reabrir en este grupo");
    err.status = 409;
    throw err;
  }

  latest.estado = "archivado";
  await latest.save();
  return { grupoRubroId, reabierto: true };
};

module.exports = {
  finalizeExpiredSessions,
  getEmpaquetadoGrupoIds,
  isGrupoLoteCerrado,
  listActivos,
  getActualByGrupo,
  iniciarSecado,
  completarManual,
  marcarEmpaquetado,
  reabrirLote,
};
