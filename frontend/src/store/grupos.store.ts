import { create } from "zustand";
import { gruposService, humedadService } from "../services/grupos.service";
import type {
  CalibracionPayload,
  GrupoRubro,
  HumedadConfig,
  HumedadPayload,
} from "../types/grupoRubro";

interface GruposState {
  grupos: GrupoRubro[];
  humedad: HumedadConfig | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  updateCalibracion: (id: string, payload: CalibracionPayload) => Promise<void>;
  updateHumedad: (payload: HumedadPayload) => Promise<void>;
  clearError: () => void;
}

export const useGruposStore = create<GruposState>((set, get) => ({
  grupos: [],
  humedad: null,
  isLoading: false,
  isMutating: false,
  error: null,

  fetchAll: async () => {
    try {
      set({ isLoading: true, error: null });
      const [grupos, humedad] = await Promise.all([
        gruposService.list(),
        humedadService.get(),
      ]);
      set({ grupos, humedad, isLoading: false });
    } catch (_error) {
      set({ isLoading: false, error: "No fue posible cargar los grupos de rubro" });
    }
  },

  updateCalibracion: async (id, payload) => {
    try {
      set({ isMutating: true, error: null });
      const updated = await gruposService.updateCalibracion(id, payload);
      set({
        grupos: get().grupos.map((g) => (g._id === id ? updated : g)),
        isMutating: false,
      });
    } catch (error) {
      set({ isMutating: false, error: "No fue posible actualizar la calibracion" });
      throw error;
    }
  },

  updateHumedad: async (payload) => {
    try {
      set({ isMutating: true, error: null });
      const updated = await humedadService.update(payload);
      set({ humedad: updated, isMutating: false });
    } catch (error) {
      set({ isMutating: false, error: "No fue posible actualizar la humedad global" });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
