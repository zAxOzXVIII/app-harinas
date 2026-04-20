export type Rol = "gerente" | "supervisor" | "operador";

export interface User {
  id: string;
  email: string;
  nombre: string;
  /** Ausente en sesiones persistidas antiguas; se asume gerente hasta nuevo login. */
  rol?: Rol;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface TeamUser {
  id: string;
  email: string;
  nombre: string;
  rol: Exclude<Rol, "gerente">;
  createdAt?: string;
  updatedAt?: string;
}
