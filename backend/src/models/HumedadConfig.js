const mongoose = require("mongoose");

// Configuracion global de humedad: politica unica para todos los grupos de rubro.
const humedadConfigSchema = new mongoose.Schema(
  {
    // Clave unica para asegurar singleton. Solo permitimos "global".
    scope: {
      type: String,
      required: true,
      unique: true,
      default: "global",
      enum: ["global"],
    },
    min: { type: Number, required: true, default: 30 },
    max: { type: Number, required: true, default: 60 },
    criticoMin: { type: Number, default: 20 },
    criticoMax: { type: Number, default: 75 },
    unidad: { type: String, default: "%RH" },
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

module.exports = mongoose.model("HumedadConfig", humedadConfigSchema);
