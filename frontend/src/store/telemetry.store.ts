import { create } from "zustand";
import { telemetryService } from "../services/telemetry.service";
import type { TelemetryGroupItem, TelemetryLatestItem } from "../types/telemetry";

interface TelemetryState {
  latest: TelemetryLatestItem[];
  history: Record<string, TelemetryGroupItem[]>;
  isLoading: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  fetchLatest: () => Promise<void>;
  fetchHistory: (grupoRubroId: string, limit?: number) => Promise<void>;
  clearError: () => void;
}

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
  latest: [],
  history: {},
  isLoading: false,
  isLoadingHistory: false,
  error: null,

  fetchLatest: async () => {
    try {
      set({ isLoading: true, error: null });
      const latest = await telemetryService.getLatest();
      set({ latest, isLoading: false });
    } catch (_error) {
      set({ isLoading: false, error: "No fue posible cargar telemetria" });
    }
  },

  fetchHistory: async (grupoRubroId, limit = 30) => {
    try {
      set({ isLoadingHistory: true });
      const items = await telemetryService.getRecentByGroup(grupoRubroId, limit);
      set({
        history: { ...get().history, [grupoRubroId]: items },
        isLoadingHistory: false,
      });
    } catch (_e) {
      set({ isLoadingHistory: false });
    }
  },

  clearError: () => set({ error: null }),
}));
