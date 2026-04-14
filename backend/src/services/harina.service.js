const mongoose = require("mongoose");
const Harina = require("../models/Harina");

const getAllHarinas = async () => Harina.find().sort({ fecha_registro: -1 });

const createHarina = async (payload) => Harina.create(payload);

const updateHarina = async (id, payload) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("ID de harina inválido");
    err.status = 400;
    throw err;
  }

  const harina = await Harina.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!harina) {
    const err = new Error("Harina no encontrada");
    err.status = 404;
    throw err;
  }

  return harina;
};

const deleteHarina = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("ID de harina inválido");
    err.status = 400;
    throw err;
  }

  const harina = await Harina.findByIdAndDelete(id);
  if (!harina) {
    const err = new Error("Harina no encontrada");
    err.status = 404;
    throw err;
  }
};

module.exports = { getAllHarinas, createHarina, updateHarina, deleteHarina };
