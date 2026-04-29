import { create } from "zustand";
import { telemetryService } from "../services/telemetry.service";
import type { TelemetryLatestItem } from "../types/telemetry";

interface TelemetryState {
  latest: TelemetryLatestItem[];
  isLoading: boolean;
  error: string | null;
  fetchLatest: () => Promise<void>;
  clearError: () => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  latest: [],
  isLoading: false,
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

  clearError: () => set({ error: null }),
}));
