import { api } from "./api";
import type { ProcesoSecado } from "../types/procesoSecado";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const procesoSecadoService = {
  async listActivos(): Promise<ProcesoSecado[]> {
    const { data } = await api.get<ApiResponse<ProcesoSecado[]>>("/api/procesos-secado/activos");
    return data.data;
  },

  async getByGrupo(grupoRubroId: string): Promise<ProcesoSecado | null> {
    const { data } = await api.get<ApiResponse<ProcesoSecado | null>>(
      `/api/procesos-secado/grupo/${grupoRubroId}`
    );
    return data.data;
  },

  async iniciar(grupoRubroId: string): Promise<ProcesoSecado> {
    const { data } = await api.post<ApiResponse<ProcesoSecado>>(
      `/api/procesos-secado/grupo/${grupoRubroId}/iniciar`
    );
    return data.data;
  },

  async completar(procesoId: string): Promise<ProcesoSecado> {
    const { data } = await api.post<ApiResponse<ProcesoSecado>>(
      `/api/procesos-secado/${procesoId}/completar`
    );
    return data.data;
  },

  async reabrirLote(grupoRubroId: string): Promise<{ grupoRubroId: string; reabierto: boolean }> {
    const { data } = await api.post<
      ApiResponse<{ grupoRubroId: string; reabierto: boolean }>
    >(`/api/procesos-secado/grupo/${grupoRubroId}/reabrir`);
    return data.data;
  },
};
