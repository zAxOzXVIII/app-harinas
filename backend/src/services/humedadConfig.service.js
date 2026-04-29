const HumedadConfig = require("../models/HumedadConfig");

// Garantiza la existencia del singleton.
const getOrCreateConfig = async () => {
  let config = await HumedadConfig.findOne({ scope: "global" });
  if (!config) {
    config = await HumedadConfig.create({ scope: "global" });
  }
  return config;
};

const getConfig = async () => getOrCreateConfig();

const updateConfig = async (payload, userId) => {
  const config = await getOrCreateConfig();

  if (payload.min !== undefined) config.min = payload.min;
  if (payload.max !== undefined) config.max = payload.max;
  if (payload.criticoMin !== undefined) config.criticoMin = payload.criticoMin;
  if (payload.criticoMax !== undefined) config.criticoMax = payload.criticoMax;

  if (config.min > config.max) {
    const err = new Error("Humedad: min no puede ser mayor que max");
    err.status = 422;
    throw err;
  }

  config.actualizadoPor = userId || null;
  config.actualizadoEn = new Date();
  await config.save();
  return config;
};

module.exports = { getConfig, updateConfig };
