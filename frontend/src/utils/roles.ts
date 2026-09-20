import type { Rol } from "../types/auth";

/** Etiqueta que ve LeanHerz / la planta. El JWT sigue gerente | supervisor | operador. */
export const uiRolLabel = (rol?: Rol | string | null): string => {
  const map: Record<string, string> = {
    gerente: "Admin",
    supervisor: "Gerente",
    operador: "Usuario",
  };
  return map[rol ?? ""] ?? "Admin";
};
