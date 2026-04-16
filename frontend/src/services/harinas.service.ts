import { api } from "./api";
import type { Harina, HarinaPayload } from "../types/harina";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const harinasService = {
  async getHarinas(): Promise<Harina[]> {
    const { data } = await api.get<ApiResponse<Harina[]>>("/api/harinas");
    return data.data;
  },

  async createHarina(payload: HarinaPayload): Promise<Harina> {
    const { data } = await api.post<ApiResponse<Harina>>("/api/harinas", payload);
    return data.data;
  },

  async updateHarina(id: string, payload: HarinaPayload): Promise<Harina> {
    const { data } = await api.put<ApiResponse<Harina>>(`/api/harinas/${id}`, payload);
    return data.data;
  },

  async deleteHarina(id: string): Promise<void> {
    await api.delete(`/api/harinas/${id}`);
  },
};
