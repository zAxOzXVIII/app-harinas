import { create } from "zustand";
import { alertsService } from "../services/alerts.service";
import type { ProcessAlert } from "../types/alert";

interface AlertsState {
  items: ProcessAlert[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchList: (opts?: { unreadOnly?: boolean }) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  removeAlert: (id: string) => Promise<void>;
  removeAllAlerts: () => Promise<void>;
  clearError: () => void;
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  items: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchList: async (opts) => {
    try {
      set({ isLoading: true, error: null });
      const items = await alertsService.list({ limit: 80, unreadOnly: opts?.unreadOnly });
      set({ items, isLoading: false });
    } catch (_e) {
      set({ isLoading: false, error: "No fue posible cargar alertas" });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const unreadCount = await alertsService.countUnread();
      set({ unreadCount });
    } catch (_e) {
      set({ unreadCount: 0 });
    }
  },

  markRead: async (id) => {
    try {
      await alertsService.markRead(id);
      set({
        items: get().items.map((a) => (a._id === id ? { ...a, leida: true } : a)),
        unreadCount: Math.max(0, get().unreadCount - 1),
      });
    } catch (_e) {
      set({ error: "No fue posible marcar la alerta" });
    }
  },

  markAllRead: async () => {
    try {
      await alertsService.markAllRead();
      set({
        items: get().items.map((a) => ({ ...a, leida: true })),
        unreadCount: 0,
      });
    } catch (_e) {
      set({ error: "No fue posible marcar todas como leidas" });
    }
  },

  removeAlert: async (id) => {
    const prev = get().items.find((a) => a._id === id);
    try {
      await alertsService.remove(id);
      set({
        items: get().items.filter((a) => a._id !== id),
        unreadCount:
          prev && !prev.leida ? Math.max(0, get().unreadCount - 1) : get().unreadCount,
      });
    } catch (_e) {
      set({ error: "No fue posible eliminar la alerta" });
    }
  },

  removeAllAlerts: async () => {
    try {
      await alertsService.removeAll();
      set({ items: [], unreadCount: 0 });
    } catch (_e) {
      set({ error: "No fue posible eliminar las alertas" });
    }
  },

  clearError: () => set({ error: null }),
}));
