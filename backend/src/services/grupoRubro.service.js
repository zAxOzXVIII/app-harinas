const mongoose = require("mongoose");
const GrupoRubro = require("../models/GrupoRubro");

const listGrupos = async () => GrupoRubro.find().sort({ nombre: 1 });

const getGrupoById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("ID de grupo invalido");
    err.status = 400;
    throw err;
  }
  const grupo = await GrupoRubro.findById(id);
  if (!grupo) {
    const err = new Error("Grupo de rubro no encontrado");
    err.status = 404;
    throw err;
  }
  return grupo;
};

const updateCalibracion = async (id, payload, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("ID de grupo invalido");
    err.status = 400;
    throw err;
  }

  const grupo = await GrupoRubro.findById(id);
  if (!grupo) {
    const err = new Error("Grupo de rubro no encontrado");
    err.status = 404;
    throw err;
  }

  // Merge defensivo: solo se sobreescriben los campos enviados.
  if (payload.temperatura) {
    grupo.calibracion.temperatura = {
      ...grupo.calibracion.temperatura.toObject(),
      ...payload.temperatura,
    };
  }
  if (payload.nivelSecado) {
    grupo.calibracion.nivelSecado = {
      ...grupo.calibracion.nivelSecado.toObject(),
      ...payload.nivelSecado,
    };
  }
  if (payload.tiempoSecado) {
    grupo.calibracion.tiempoSecado = {
      ...grupo.calibracion.tiempoSecado.toObject(),
      ...payload.tiempoSecado,
    };
  }

  // Validacion logica min<=max.
  const t = grupo.calibracion.temperatura;
  if (t.min > t.max) {
    const err = new Error("Temperatura: min no puede ser mayor que max");
    err.status = 422;
    throw err;
  }
  const ns = grupo.calibracion.nivelSecado;
  if (ns.min > ns.max) {
    const err = new Error("Nivel de secado: min no puede ser mayor que max");
    err.status = 422;
    throw err;
  }

  grupo.actualizadoPor = userId || null;
  grupo.actualizadoEn = new Date();

  await grupo.save();
  return grupo;
};

module.exports = { listGrupos, getGrupoById, updateCalibracion };
