const mongoose = require("mongoose");

// Sub-schema de calibracion. La humedad se maneja en HumedadConfig (global).
const calibracionSchema = new mongoose.Schema(
  {
    temperatura: {
      min: { type: Number, required: true, default: 25 },
      max: { type: Number, required: true, default: 45 },
      criticoMin: { type: Number, default: 20 },
      criticoMax: { type: Number, default: 55 },
      unidad: { type: String, default: "C" },
    },
    nivelSecado: {
      // Intensidad ventilador (0-100). Define la potencia de secado por defecto.
      min: { type: Number, default: 30, min: 0, max: 100 },
      max: { type: Number, default: 80, min: 0, max: 100 },
      unidad: { type: String, default: "%" },
    },
    tiempoSecado: {
      // Tiempo estimado o relativo en minutos para esta receta.
      estimadoMin: { type: Number, default: 60, min: 0 },
      unidad: { type: String, default: "min" },
    },
  },
  { _id: false, versionKey: false }
);

const grupoRubroSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true,
      enum: ["garbanzo-lenteja", "platano-cambur", "yuca-batata"],
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    items: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length === 2,
        message: "items debe contener exactamente 2 rubros",
      },
    },
    calibracion: {
      type: calibracionSchema,
      required: true,
      default: () => ({}),
    },
    actualizadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    actualizadoEn: {
      type: Date,
      default: null,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("GrupoRubro", grupoRubroSchema);
