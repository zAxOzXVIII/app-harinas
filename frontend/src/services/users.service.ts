import { api } from "./api";
import type { TeamUser } from "../types/auth";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface TeamUserPayload {
  email: string;
  password?: string;
  nombre: string;
  rol: "supervisor" | "operador";
}

export const usersService = {
  async list(): Promise<TeamUser[]> {
    const { data } = await api.get<ApiResponse<TeamUser[]>>("/api/users");
    return data.data;
  },

  async create(payload: TeamUserPayload): Promise<TeamUser> {
    const { data } = await api.post<ApiResponse<TeamUser>>("/api/users", payload);
    return data.data;
  },

  async update(id: string, payload: Partial<TeamUserPayload>): Promise<TeamUser> {
    const { data } = await api.put<ApiResponse<TeamUser>>(`/api/users/${id}`, payload);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/users/${id}`);
  },
};
