export interface User {
  id: string;
  email: string;
  nombre: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
