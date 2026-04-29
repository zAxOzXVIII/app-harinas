import { api } from "./api";
import type { ProcessAlert } from "../types/alert";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const alertsService = {
  async list(params?: { limit?: number; unreadOnly?: boolean }): Promise<ProcessAlert[]> {
    const search = new URLSearchParams();
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.unreadOnly) search.set("unreadOnly", "true");
    const q = search.toString();
    const { data } = await api.get<ApiResponse<ProcessAlert[]>>(
      `/api/alerts${q ? `?${q}` : ""}`
    );
    return data.data;
  },

  async countUnread(): Promise<number> {
    const { data } = await api.get<ApiResponse<{ unread: number }>>("/api/alerts/count");
    return data.data.unread;
  },

  async markRead(id: string): Promise<ProcessAlert> {
    const { data } = await api.patch<ApiResponse<ProcessAlert>>(`/api/alerts/${id}/read`);
    return data.data;
  },

  async markAllRead(): Promise<void> {
    await api.post("/api/alerts/mark-all-read");
  },
};
