const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

const ALLOWED_CREATE_ROLES = ["supervisor", "operador"];

const assertValidRoleForCreate = (rol) => {
  if (!ALLOWED_CREATE_ROLES.includes(rol)) {
    const err = new Error("Solo se pueden crear usuarios supervisor u operador");
    err.status = 400;
    throw err;
  }
};

const listTeamUsers = async () => {
  return User.find({ rol: { $in: ["supervisor", "operador"] } })
    .select("email nombre rol createdAt updatedAt")
    .sort({ createdAt: -1 });
};

const createTeamUser = async ({ email, password, nombre, rol }) => {
  assertValidRoleForCreate(rol);
  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  if (exists) {
    const err = new Error("Ya existe un usuario con ese email");
    err.status = 409;
    throw err;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    nombre: nombre.trim(),
    rol,
  });
  return User.findById(user._id).select("email nombre rol createdAt updatedAt");
};

const updateTeamUser = async (id, { email, password, nombre, rol }) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("ID invalido");
    err.status = 400;
    throw err;
  }
  const user = await User.findById(id).select("+password");
  if (!user) {
    const err = new Error("Usuario no encontrado");
    err.status = 404;
    throw err;
  }
  if (user.rol === "gerente") {
    const err = new Error("No se puede modificar la cuenta Gerente");
    err.status = 403;
    throw err;
  }
  if (rol && !ALLOWED_CREATE_ROLES.includes(rol)) {
    const err = new Error("Rol invalido");
    err.status = 400;
    throw err;
  }
  if (email) {
    const nextEmail = email.toLowerCase().trim();
    const dup = await User.findOne({ email: nextEmail, _id: { $ne: id } });
    if (dup) {
      const err = new Error("Ya existe otro usuario con ese email");
      err.status = 409;
      throw err;
    }
    user.email = nextEmail;
  }
  if (nombre) user.nombre = nombre.trim();
  if (rol) user.rol = rol;
  if (password && password.length >= 6) {
    user.password = await bcrypt.hash(password, 10);
  }
  await user.save();
  return User.findById(user._id).select("email nombre rol createdAt updatedAt");
};

const deleteTeamUser = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("ID invalido");
    err.status = 400;
    throw err;
  }
  const user = await User.findById(id);
  if (!user) {
    const err = new Error("Usuario no encontrado");
    err.status = 404;
    throw err;
  }
  if (user.rol === "gerente") {
    const err = new Error("No se puede eliminar la cuenta Gerente");
    err.status = 403;
    throw err;
  }
  await User.findByIdAndDelete(id);
};

module.exports = {
  listTeamUsers,
  createTeamUser,
  updateTeamUser,
  deleteTeamUser,
};
