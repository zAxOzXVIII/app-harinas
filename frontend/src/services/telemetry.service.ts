import { api } from "./api";
import type {
  HumedadFluctuacionDiaria,
  TelemetryGroupItem,
  TelemetryLatestItem,
} from "../types/telemetry";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const telemetryService = {
  async getLatest(): Promise<TelemetryLatestItem[]> {
    const { data } = await api.get<ApiResponse<TelemetryLatestItem[]>>("/api/telemetry/latest");
    return data.data;
  },

  async getRecentByGroup(grupoRubroId: string, limit = 20): Promise<TelemetryGroupItem[]> {
    const { data } = await api.get<ApiResponse<TelemetryGroupItem[]>>(
      `/api/telemetry/group/${grupoRubroId}?limit=${limit}`
    );
    return data.data;
  },

  async getFluctuacionesHumedad(params: {
    from?: string;
    to?: string;
    grupoRubroId?: string;
  }): Promise<HumedadFluctuacionDiaria[]> {
    const search = new URLSearchParams();
    if (params.from) search.set("from", params.from);
    if (params.to) search.set("to", params.to);
    if (params.grupoRubroId) search.set("grupoRubroId", params.grupoRubroId);
    const qs = search.toString();
    const { data } = await api.get<ApiResponse<HumedadFluctuacionDiaria[]>>(
      `/api/telemetry/fluctuaciones/humedad${qs ? `?${qs}` : ""}`
    );
    return data.data;
  },
};
