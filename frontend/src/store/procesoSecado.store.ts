import { create } from "zustand";
import { procesoSecadoService } from "../services/procesoSecado.service";
import type { ProcesoSecado } from "../types/procesoSecado";
import { apiErrorMessage } from "../utils/apiError";

interface ProcesoSecadoState {
  activos: ProcesoSecado[];
  pendientesArchivo: ProcesoSecado[];
  byGrupoId: Record<string, ProcesoSecado | null>;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  fetchActivos: () => Promise<void>;
  fetchPendientesArchivo: () => Promise<void>;
  fetchByGrupo: (grupoRubroId: string) => Promise<ProcesoSecado | null>;
  iniciarSecado: (grupoRubroId: string) => Promise<ProcesoSecado>;
  completarSecado: (procesoId: string, grupoRubroId: string) => Promise<ProcesoSecado>;
  marcarListo: (procesoId: string, grupoRubroId: string) => Promise<ProcesoSecado>;
  archivarLote: (procesoId: string) => Promise<void>;
  setProcesoForGrupo: (grupoRubroId: string, proceso: ProcesoSecado | null) => void;
  clearError: () => void;
}

export const useProcesoSecadoStore = create<ProcesoSecadoState>((set, get) => ({
  activos: [],
  pendientesArchivo: [],
  byGrupoId: {},
  isLoading: false,
  isMutating: false,
  error: null,

  fetchActivos: async () => {
    try {
      set({ isLoading: true, error: null });
      const activos = await procesoSecadoService.listActivos();
      const byGrupoId = { ...get().byGrupoId };
      activos.forEach((p) => {
        const gid =
          typeof p.grupoRubroId === "string" ? p.grupoRubroId : p.grupoRubroId._id;
        byGrupoId[gid] = p;
      });
      set({ activos, byGrupoId, isLoading: false });
    } catch (_error) {
      set({ isLoading: false, error: "No fue posible cargar los procesos de secado" });
    }
  },

  fetchPendientesArchivo: async () => {
    try {
      set({ isLoading: true, error: null });
      const pendientesArchivo = await procesoSecadoService.listPendientesArchivo();
      set({ pendientesArchivo, isLoading: false });
    } catch (_error) {
      set({ isLoading: false, error: "No fue posible cargar lotes pendientes de archivo" });
    }
  },

  fetchByGrupo: async (grupoRubroId) => {
    try {
      const proceso = await procesoSecadoService.getByGrupo(grupoRubroId);
      set({
        byGrupoId: { ...get().byGrupoId, [grupoRubroId]: proceso },
      });
      return proceso;
    } catch (_error) {
      return null;
    }
  },

  iniciarSecado: async (grupoRubroId) => {
    try {
      set({ isMutating: true, error: null });
      const proceso = await procesoSecadoService.iniciar(grupoRubroId);
      set({
        activos: [
          ...get().activos.filter((p) => {
            const gid = typeof p.grupoRubroId === "string" ? p.grupoRubroId : p.grupoRubroId._id;
            return gid !== grupoRubroId;
          }),
          proceso,
        ],
        byGrupoId: { ...get().byGrupoId, [grupoRubroId]: proceso },
        isMutating: false,
      });
      return proceso;
    } catch (error) {
      set({ isMutating: false, error: apiErrorMessage(error, "No fue posible iniciar el secado") });
      throw error;
    }
  },

  completarSecado: async (procesoId, grupoRubroId) => {
    try {
      set({ isMutating: true, error: null });
      const proceso = await procesoSecadoService.completar(procesoId);
      set({
        activos: get().activos.filter((p) => p._id !== procesoId),
        byGrupoId: { ...get().byGrupoId, [grupoRubroId]: proceso },
        isMutating: false,
      });
      return proceso;
    } catch (error) {
      set({ isMutating: false, error: "No fue posible finalizar el secado" });
      throw error;
    }
  },

  marcarListo: async (procesoId, grupoRubroId) => {
    try {
      set({ isMutating: true, error: null });
      const proceso = await procesoSecadoService.marcarListo(procesoId);
      set({
        byGrupoId: { ...get().byGrupoId, [grupoRubroId]: proceso },
        isMutating: false,
      });
      return proceso;
    } catch (error) {
      set({ isMutating: false, error: "No fue posible marcar el lote como listo" });
      throw error;
    }
  },

  archivarLote: async (procesoId) => {
    try {
      set({ isMutating: true, error: null });
      await procesoSecadoService.archivar(procesoId);
      set({
        pendientesArchivo: get().pendientesArchivo.filter((p) => p._id !== procesoId),
        isMutating: false,
      });
    } catch (error) {
      set({ isMutating: false, error: "No fue posible archivar el lote" });
      throw error;
    }
  },

  setProcesoForGrupo: (grupoRubroId, proceso) => {
    set({ byGrupoId: { ...get().byGrupoId, [grupoRubroId]: proceso } });
  },

  clearError: () => set({ error: null }),
}));
