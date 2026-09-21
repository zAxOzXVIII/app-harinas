const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { QUESTIONS_BY_ROL, getQuestionsForRol } = require("../constants/securityQuestions");
const {
  REQUIRED_COUNT,
  hashQuestionAnswers,
  verifyQuestionAnswers,
  toPublicQuestions,
} = require("../utils/securityAnswers");

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const listSecurityQuestionCatalog = (rol) => {
  if (!rol) {
    return QUESTIONS_BY_ROL;
  }
  const questions = getQuestionsForRol(rol);
  if (!questions.length) {
    throw httpError(400, "Rol invalido. Usa gerente, supervisor u operador");
  }
  return { rol, questions, required: REQUIRED_COUNT };
};

const startRecovery = async (email) => {
  const user = await User.findOne({ email: String(email || "").toLowerCase().trim() }).select(
    "+securityQuestions"
  );
  if (!user) {
    throw httpError(404, "No hay una cuenta con ese correo");
  }
  if (!user.securityQuestions || user.securityQuestions.length < REQUIRED_COUNT) {
    throw httpError(
      409,
      "Esta cuenta no tiene preguntas de seguridad. Pide al Admin que las configure."
    );
  }

  return {
    email: user.email,
    rol: user.rol,
    questions: toPublicQuestions(user.rol, user.securityQuestions),
  };
};

const resetPasswordWithAnswers = async ({ email, answers, newPassword }) => {
  if (!newPassword || String(newPassword).length < 6) {
    throw httpError(400, "La nueva contraseña debe tener al menos 6 caracteres");
  }

  const user = await User.findOne({ email: String(email || "").toLowerCase().trim() }).select(
    "+password +securityQuestions"
  );
  if (!user) {
    throw httpError(404, "No hay una cuenta con ese correo");
  }
  if (!user.securityQuestions || user.securityQuestions.length < REQUIRED_COUNT) {
    throw httpError(
      409,
      "Esta cuenta no tiene preguntas de seguridad. Pide al Admin que las configure."
    );
  }

  const ok = await verifyQuestionAnswers(user.securityQuestions, answers);
  if (!ok) {
    throw httpError(401, "Las respuestas de seguridad no coinciden");
  }

  user.password = await bcrypt.hash(String(newPassword), 10);
  await user.save();

  return { email: user.email, rol: user.rol };
};

const getMySecurityQuestions = async (userId) => {
  const user = await User.findById(userId).select("email nombre rol").select("+securityQuestions");
  if (!user) {
    throw httpError(404, "Usuario no encontrado");
  }
  return {
    email: user.email,
    rol: user.rol,
    questions: toPublicQuestions(user.rol, user.securityQuestions || []),
  };
};

const updateMySecurityQuestions = async (userId, items) => {
  const user = await User.findById(userId).select("+securityQuestions email rol");
  if (!user) {
    throw httpError(404, "Usuario no encontrado");
  }
  user.securityQuestions = await hashQuestionAnswers(user.rol, items);
  await user.save();
  return {
    email: user.email,
    rol: user.rol,
    questions: toPublicQuestions(user.rol, user.securityQuestions),
  };
};

module.exports = {
  listSecurityQuestionCatalog,
  startRecovery,
  resetPasswordWithAnswers,
  getMySecurityQuestions,
  updateMySecurityQuestions,
};
