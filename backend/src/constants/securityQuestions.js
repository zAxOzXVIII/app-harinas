const REQUIRED_COUNT = 2;

const QUESTIONS_BY_ROL = {
  gerente: [
    { id: "gerente_planta", text: "¿Cuál es el nombre comercial de la planta?" },
    { id: "gerente_ciudad", text: "¿En qué ciudad está la planta?" },
    { id: "gerente_mascota", text: "¿Cuál es el nombre de tu primera mascota?" },
    { id: "gerente_color", text: "¿Cuál es tu color favorito?" },
  ],
  supervisor: [
    { id: "supervisor_linea", text: "¿Cuál es tu línea o área de trabajo?" },
    { id: "supervisor_ciudad", text: "¿En qué ciudad naciste?" },
    { id: "supervisor_mascota", text: "¿Cuál es el nombre de tu primera mascota?" },
    { id: "supervisor_color", text: "¿Cuál es tu color favorito?" },
  ],
  operador: [
    { id: "operador_turno", text: "¿Cuál es tu turno habitual (mañana, tarde o noche)?" },
    { id: "operador_ciudad", text: "¿En qué ciudad naciste?" },
    { id: "operador_mascota", text: "¿Cuál es el nombre de tu primera mascota?" },
    { id: "operador_color", text: "¿Cuál es tu color favorito?" },
  ],
};

const getQuestionsForRol = (rol) => QUESTIONS_BY_ROL[rol] || [];

const findQuestion = (rol, questionId) => getQuestionsForRol(rol).find((q) => q.id === questionId);

module.exports = {
  REQUIRED_COUNT,
  QUESTIONS_BY_ROL,
  getQuestionsForRol,
  findQuestion,
};
