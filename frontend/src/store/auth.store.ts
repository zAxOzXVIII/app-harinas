import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authService } from "../services/auth.service";
import { authSession } from "../services/api";
import type { User } from "../types/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setHydrated: (value: boolean) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => {
      const hardLogout = () => {
        authSession.clearToken();
        set({
          user: null,
          token: null,
          error: null,
        });
      };

      authSession.setUnauthorizedHandler(hardLogout);

      return {
        user: null,
        token: null,
        isLoading: false,
        isHydrated: false,
        error: null,
        setHydrated: (value) => set({ isHydrated: value }),
        clearError: () => set({ error: null }),
        login: async (email: string, password: string) => {
          try {
            set({ isLoading: true, error: null });
            const response = await authService.login(email, password);
            authSession.setToken(response.token);
            set({
              user: response.user,
              token: response.token,
              isLoading: false,
            });
          } catch (_error) {
            set({
              isLoading: false,
              error: "Credenciales invalidas o error de conexion",
            });
          }
        },
        logout: hardLogout,
      };
    },
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        const token = state?.token ?? null;
        authSession.setToken(token);
        state?.setHydrated(true);
      },
    }
  )
);
