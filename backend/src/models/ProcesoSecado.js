const mongoose = require("mongoose");

const ESTADOS = ["pendiente", "en_secado", "completado", "revisado_empaquetado", "archivado"];

const RESULTADOS = ["listo", "poco_optimo"];

const CALIFICACIONES = [
  "quemado",
  "humedecido",
  "tiempo_excedido",
  "temperatura_irregular",
  "secado_irregular",
  "alerta_sin_atender",
];

const procesoSecadoSchema = new mongoose.Schema(
  {
    grupoRubroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GrupoRubro",
      required: true,
      index: true,
    },
    estado: {
      type: String,
      required: true,
      enum: ESTADOS,
      default: "en_secado",
      index: true,
    },
    iniciadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    iniciadoEn: {
      type: Date,
      required: true,
    },
    duracionMin: {
      type: Number,
      required: true,
      min: 1,
    },
    finalizaEn: {
      type: Date,
      required: true,
      index: true,
    },
    completadoEn: {
      type: Date,
      default: null,
    },
    telemetryEventIdInicio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TelemetryEvent",
      default: null,
    },
    /** listo = sin alertas pendientes al cierre; poco_optimo = incidencias sin atender */
    resultado: {
      type: String,
      enum: RESULTADOS,
      default: null,
    },
    calificacion: {
      type: String,
      default: null,
      trim: true,
    },
    descripcionCierre: {
      type: String,
      default: null,
      trim: true,
    },
    alertasPendientesAlCierre: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

procesoSecadoSchema.index({ grupoRubroId: 1, createdAt: -1 });

module.exports = mongoose.model("ProcesoSecado", procesoSecadoSchema);
