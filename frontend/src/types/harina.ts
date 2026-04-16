export interface Harina {
  _id: string;
  nombre: string;
  tipo: string;
  cantidad: number;
  unidad: string;
  fecha_registro: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HarinaPayload {
  nombre: string;
  tipo: string;
  cantidad: number;
  unidad: string;
  fecha_registro: string;
}
