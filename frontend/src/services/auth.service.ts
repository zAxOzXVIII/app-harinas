import { api } from "./api";
import type { LoginResponse, Rol } from "../types/auth";
import type {
  RecoveryQuestionsResponse,
  SecurityQuestion,
  SecurityQuestionAnswer,
} from "../types/securityQuestions";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<ApiResponse<LoginResponse>>("/api/auth/login", {
      email,
      password,
    });

    return data.data;
  },

  async registerPushToken(expoPushToken: string | null): Promise<void> {
    await api.put<ApiResponse<{ pushRegistered: boolean }>>("/api/auth/push-token", {
      expoPushToken,
    });
  },

  async listSecurityQuestions(rol: Rol): Promise<SecurityQuestion[]> {
    const { data } = await api.get<ApiResponse<{ rol: Rol; questions: SecurityQuestion[] }>>(
      "/api/auth/security-questions",
      { params: { rol } }
    );
    return data.data.questions;
  },

  async recoveryQuestions(email: string): Promise<RecoveryQuestionsResponse> {
    const { data } = await api.post<ApiResponse<RecoveryQuestionsResponse>>(
      "/api/auth/recovery/questions",
      { email }
    );
    return data.data;
  },

  async recoveryReset(
    email: string,
    answers: SecurityQuestionAnswer[],
    newPassword: string
  ): Promise<void> {
    await api.post("/api/auth/recovery/reset", { email, answers, newPassword });
  },

  async getMySecurityQuestions(): Promise<RecoveryQuestionsResponse> {
    const { data } = await api.get<ApiResponse<RecoveryQuestionsResponse>>(
      "/api/auth/me/security-questions"
    );
    return data.data;
  },

  async updateMySecurityQuestions(securityQuestions: SecurityQuestionAnswer[]): Promise<void> {
    await api.put("/api/auth/me/security-questions", { securityQuestions });
  },
};
