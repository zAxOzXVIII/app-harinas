import { api } from "./api";
import type {
  CalibracionPayload,
  GrupoRubro,
  GrupoRubroPayload,
  HumedadConfig,
  HumedadPayload,
} from "../types/grupoRubro";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const gruposService = {
  async list(opts?: { activos?: boolean; soloHarinas?: boolean }): Promise<GrupoRubro[]> {
    const params: Record<string, string> = {};
    if (opts?.activos === true) params.activos = "true";
    if (opts?.soloHarinas === true) params.soloHarinas = "true";
    const { data } = await api.get<ApiResponse<GrupoRubro[]>>("/api/grupos-rubro", {
      params: Object.keys(params).length ? params : undefined,
    });
    return data.data;
  },

  async getOne(id: string): Promise<GrupoRubro> {
    const { data } = await api.get<ApiResponse<GrupoRubro>>(`/api/grupos-rubro/${id}`);
    return data.data;
  },

  async create(payload: GrupoRubroPayload): Promise<GrupoRubro> {
    const { data } = await api.post<ApiResponse<GrupoRubro>>("/api/grupos-rubro", payload);
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
