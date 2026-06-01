const mongoose = require("mongoose");

const telemetryEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    deviceId: {
      type: String,
      required: true,
      trim: true,
    },
    grupoRubroId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GrupoRubro",
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    lecturas: {
      temperatura: { type: Number, required: true },
      humedad: { type: Number, required: true, min: 0, max: 100 },
      /** Opcional: sensor de nivel / ventilador (fase 2). */
      nivelSecado: { type: Number, min: 0, max: 100 },
      /** Opcional: minutos de secado (RTC u otro sensor). */
      tiempoSecado: { type: Number, min: 0 },
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

telemetryEventSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model("TelemetryEvent", telemetryEventSchema);
