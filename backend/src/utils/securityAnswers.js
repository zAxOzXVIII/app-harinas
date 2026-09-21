const bcrypt = require("bcryptjs");
const { getQuestionsForRol, findQuestion, REQUIRED_COUNT } = require("../constants/securityQuestions");

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const normalizeAnswer = (raw) =>
  String(raw || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

const hashQuestionAnswers = async (rol, items) => {
  if (!Array.isArray(items) || items.length !== REQUIRED_COUNT) {
    throw httpError(400, `Debes configurar ${REQUIRED_COUNT} preguntas de seguridad`);
  }

  const bank = getQuestionsForRol(rol);
  if (!bank.length) {
    throw httpError(400, "Rol invalido para preguntas de seguridad");
  }

  const seen = new Set();
  const hashed = [];

  for (const item of items) {
    const questionId = String(item?.questionId || "").trim();
    if (!questionId) {
      throw httpError(400, "Cada pregunta de seguridad necesita un identificador");
    }
    if (seen.has(questionId)) {
      throw httpError(400, "Las preguntas de seguridad no pueden repetirse");
    }
    seen.add(questionId);
    if (!findQuestion(rol, questionId)) {
      throw httpError(400, "Pregunta de seguridad invalida para este rol");
    }

    const normalized = normalizeAnswer(item.answer);
    if (normalized.length < 3) {
      throw httpError(400, "Cada respuesta debe tener al menos 3 caracteres");
    }

    hashed.push({
      questionId,
      answerHash: await bcrypt.hash(normalized, 10),
    });
  }

  return hashed;
};

const verifyQuestionAnswers = async (stored, submitted) => {
  if (!Array.isArray(stored) || stored.length !== REQUIRED_COUNT) return false;
  if (!Array.isArray(submitted) || submitted.length !== REQUIRED_COUNT) return false;

  const byId = new Map(
    submitted.map((item) => [String(item?.questionId || ""), normalizeAnswer(item?.answer)])
  );

  for (const row of stored) {
    const given = byId.get(row.questionId);
    if (given == null || given.length < 3) return false;
    const ok = await bcrypt.compare(given, row.answerHash);
    if (!ok) return false;
  }

  return true;
};

const toPublicQuestions = (rol, stored) =>
  (stored || [])
    .map((row) => {
      const q = findQuestion(rol, row.questionId);
      return q ? { id: q.id, text: q.text } : null;
    })
    .filter(Boolean);

module.exports = {
  REQUIRED_COUNT,
  normalizeAnswer,
  hashQuestionAnswers,
  verifyQuestionAnswers,
  toPublicQuestions,
};
