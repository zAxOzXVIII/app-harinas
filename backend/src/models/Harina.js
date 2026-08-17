const mongoose = require("mongoose");

const harinaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    tipo: {
      type: String,
      required: true,
      trim: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: 0,
    },
    unidad: {
      type: String,
      required: true,
      trim: true,
    },
    fecha_registro: {
      type: Date,
      required: true,
    },
    /** Receta de secado/telemetría asociada (GrupoRubro interno). */
    grupoRubroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GrupoRubro",
      default: null,
      index: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("Harina", harinaSchema);
