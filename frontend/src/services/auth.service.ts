import { api } from "./api";
import type { LoginResponse } from "../types/auth";

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
};
