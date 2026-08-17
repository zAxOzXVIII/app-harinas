const mongoose = require("mongoose");
const GrupoRubro = require("../models/GrupoRubro");
const { getEmpaquetadoGrupoIds, isGrupoLoteCerrado } = require("./procesoSecado.service");

/**
 * Orden de la cola de trabajo: SIEMPRE createdAt ascendente (mas viejo primero),
 * nunca por nombre. El admin crea el grupo -> entra al final de la fila; al
 * salir el primero (marcado listo), el siguiente en createdAt queda arriba.
 */
const listGrupos = async ({ activos = false, soloHarinas = false } = {}) => {
  const filter = soloHarinas ? { vinculadoAHarina: true } : {};
  const grupos = await GrupoRubro.find(filter).sort({ createdAt: 1 }).lean();
  if (!activos) return grupos;

  const ocultos = await getEmpaquetadoGrupoIds();
  return grupos.filter((g) => !ocultos.has(g._id.toString()));
};

const slugify = (text) =>
  text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildUniqueCodigo = async (nombre) => {
  const base = slugify(nombre) || "grupo";
  let codigo = base;
  let suffix = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await GrupoRubro.exists({ codigo })) {
    suffix += 1;
    codigo = `${base}-${suffix}`;
  }
  return codigo;
};

const createGrupo = async ({ nombre, items, calibracion, vinculadoAHarina = false }, userId) => {
  if (!nombre || !nombre.trim()) {
    const err = new Error("nombre es requerido");
    err.status = 422;
    throw err;
  }
  if (!Array.isArray(items) || items.length !== 2 || items.some((i) => !i || !i.trim())) {
    const err = new Error("items debe contener exactamente 2 rubros");
    err.status = 422;
    throw err;
  }

  const codigo = await buildUniqueCodigo(nombre);

  const grupo = await GrupoRubro.create({
    codigo,
    nombre: nombre.trim(),
    items: items.map((i) => i.trim()),
    ...(calibracion ? { calibracion } : {}),
    creadoPor: userId || null,
    vinculadoAHarina: Boolean(vinculadoAHarina),
  });

  return grupo;
};

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

  if (await isGrupoLoteCerrado(id)) {
    const err = new Error("Lote cerrado (revisado/empaquetado). No se puede recalibrar");
    err.status = 409;
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

module.exports = { listGrupos, getGrupoById, updateCalibracion, createGrupo };
