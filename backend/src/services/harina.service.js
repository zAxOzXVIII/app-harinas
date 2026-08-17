const mongoose = require("mongoose");
const Harina = require("../models/Harina");
const { createGrupo } = require("./grupoRubro.service");

const getAllHarinas = async (userId) => {
  const rows = await Harina.find().sort({ fecha_registro: -1 });
  await Promise.all(rows.map((h) => ensureGrupoForHarina(h, userId)));
  return Harina.find().sort({ fecha_registro: -1 }).populate("grupoRubroId");
};

const ensureGrupoForHarina = async (harina, userId) => {
  if (harina.grupoRubroId) return harina;
  const tipo = (harina.tipo || "lote").trim() || "lote";
  const grupo = await createGrupo(
    {
      nombre: harina.nombre,
      items: [tipo, tipo],
      vinculadoAHarina: true,
    },
    userId
  );
  harina.grupoRubroId = grupo._id;
  await harina.save();
  return harina;
};

const createHarina = async (payload, userId) => {
  const harina = await Harina.create(payload);
  await ensureGrupoForHarina(harina, userId);
  return Harina.findById(harina._id).populate("grupoRubroId");
};

const updateHarina = async (id, payload, userId) => {
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

  await ensureGrupoForHarina(harina, userId);
  if (payload.nombre && harina.grupoRubroId) {
    const GrupoRubro = require("../models/GrupoRubro");
    await GrupoRubro.findByIdAndUpdate(harina.grupoRubroId, { nombre: payload.nombre.trim() });
  }
  return Harina.findById(harina._id).populate("grupoRubroId");
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
  if (harina.grupoRubroId) {
    const GrupoRubro = require("../models/GrupoRubro");
    await GrupoRubro.findOneAndDelete({
      _id: harina.grupoRubroId,
      vinculadoAHarina: true,
    });
  }
};

module.exports = { getAllHarinas, createHarina, updateHarina, deleteHarina, ensureGrupoForHarina };
