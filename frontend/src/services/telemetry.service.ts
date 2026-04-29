import { api } from "./api";
import type { TelemetryGroupItem, TelemetryLatestItem } from "../types/telemetry";

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
};
