import { useEffect } from "react";
import { useAuthStore } from "../store/auth.store";

export const useBootstrapSession = () => {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const setHydrated = useAuthStore((state) => state.setHydrated);

  useEffect(() => {
    // Fallback de seguridad en caso de rehidratacion lenta o incompleta.
    const timer = setTimeout(() => {
      if (!isHydrated) {
        setHydrated(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [isHydrated, setHydrated]);

  return { isHydrated };
};
