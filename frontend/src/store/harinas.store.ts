import { create } from "zustand";
import { harinasService } from "../services/harinas.service";
import type { Harina, HarinaPayload } from "../types/harina";

interface HarinasState {
  harinas: Harina[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  fetchHarinas: () => Promise<void>;
  createHarina: (payload: HarinaPayload) => Promise<void>;
  updateHarina: (id: string, payload: HarinaPayload) => Promise<void>;
  deleteHarina: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useHarinasStore = create<HarinasState>((set, get) => ({
  harinas: [],
  isLoading: false,
  isMutating: false,
  error: null,

  fetchHarinas: async () => {
    try {
      set({ isLoading: true, error: null });
      const data = await harinasService.getHarinas();
      set({ harinas: data, isLoading: false });
    } catch (_error) {
      set({ isLoading: false, error: "No fue posible cargar las harinas" });
    }
  },

  createHarina: async (payload) => {
    try {
      set({ isMutating: true, error: null });
      const created = await harinasService.createHarina(payload);
      set({ harinas: [created, ...get().harinas], isMutating: false });
    } catch (_error) {
      set({ isMutating: false, error: "No fue posible crear la harina" });
      throw _error;
    }
  },

  updateHarina: async (id, payload) => {
    try {
      set({ isMutating: true, error: null });
      const updated = await harinasService.updateHarina(id, payload);
      set({
        harinas: get().harinas.map((h) => (h._id === id ? updated : h)),
        isMutating: false,
      });
    } catch (_error) {
      set({ isMutating: false, error: "No fue posible actualizar la harina" });
      throw _error;
    }
  },

  deleteHarina: async (id) => {
    try {
      set({ isMutating: true, error: null });
      await harinasService.deleteHarina(id);
      set({
        harinas: get().harinas.filter((h) => h._id !== id),
        isMutating: false,
      });
    } catch (_error) {
      set({ isMutating: false, error: "No fue posible eliminar la harina" });
      throw _error;
    }
  },

  clearError: () => set({ error: null }),
}));
