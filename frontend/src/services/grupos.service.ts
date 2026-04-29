import { api } from "./api";
import type {
  CalibracionPayload,
  GrupoRubro,
  HumedadConfig,
  HumedadPayload,
} from "../types/grupoRubro";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const gruposService = {
  async list(): Promise<GrupoRubro[]> {
    const { data } = await api.get<ApiResponse<GrupoRubro[]>>("/api/grupos-rubro");
    return data.data;
  },

  async getOne(id: string): Promise<GrupoRubro> {
    const { data } = await api.get<ApiResponse<GrupoRubro>>(`/api/grupos-rubro/${id}`);
    return data.data;
  },

  async updateCalibracion(id: string, payload: CalibracionPayload): Promise<GrupoRubro> {
    const { data } = await api.put<ApiResponse<GrupoRubro>>(
      `/api/grupos-rubro/${id}/calibracion`,
      payload
    );
    return data.data;
  },
};

export const humedadService = {
  async get(): Promise<HumedadConfig> {
    const { data } = await api.get<ApiResponse<HumedadConfig>>("/api/config/humedad");
    return data.data;
  },

  async update(payload: HumedadPayload): Promise<HumedadConfig> {
    const { data } = await api.put<ApiResponse<HumedadConfig>>("/api/config/humedad", payload);
    return data.data;
  },
};
