const mongoose = require("mongoose");

const TIPOS = [
  "temp_critico",
  "temp_fuera_rango",
  "humedad_critico",
  "humedad_fuera",
  "nivel_secado_fuera",
  "tiempo_secado_exceso",
  "secado_completado",
];

const processAlertSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      required: true,
      enum: TIPOS,
      index: true,
    },
    severidad: {
      type: String,
      required: true,
      enum: ["critical", "warning", "info"],
      index: true,
    },
    grupoRubroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GrupoRubro",
      required: true,
      index: true,
    },
    telemetryEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TelemetryEvent",
      default: null,
    },
    procesoSecadoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProcesoSecado",
      default: null,
    },
    mensaje: {
      type: String,
      required: true,
      trim: true,
    },
    leida: {
      type: Boolean,
      default: false,
      index: true,
    },
    /** Borrado logico: oculta en listados sin borrar el registro. */
    eliminada: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

processAlertSchema.index({ grupoRubroId: 1, tipo: 1, createdAt: -1 });

module.exports = mongoose.model("ProcessAlert", processAlertSchema);
