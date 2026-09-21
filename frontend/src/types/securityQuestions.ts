export type SecurityQuestion = {
  id: string;
  text: string;
};

export type SecurityQuestionAnswer = {
  questionId: string;
  answer: string;
};

export type RecoveryQuestionsResponse = {
  email: string;
  rol: "gerente" | "supervisor" | "operador";
  questions: SecurityQuestion[];
};
