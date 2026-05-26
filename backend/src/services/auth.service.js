const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const env = require("../config/env");

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

  if (!user) {
    const err = new Error("Credenciales inválidas");
    err.status = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error("Credenciales inválidas");
    err.status = 401;
    throw err;
  }

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@nativa.com").toLowerCase();
  if (!user.rol) {
    user.rol = user.email === adminEmail ? "gerente" : "operador";
    await user.save();
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
    },
  };
};

const updatePushToken = async (userId, expoPushToken) => {
  const User = require("../models/User");
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { expoPushToken: expoPushToken || null } },
    { new: true }
  ).select("email nombre rol expoPushToken");

  if (!user) {
    const err = new Error("Usuario no encontrado");
    err.status = 404;
    throw err;
  }

  return user;
};

module.exports = { loginUser, updatePushToken };
