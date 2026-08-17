// Los 3 primeros vienen del seed; el gerente puede crear grupos nuevos con
// codigo derivado del nombre (slug), por eso el tipo admite cualquier string.
export type GrupoRubroCodigo = string;

export interface RangoTemperatura {
  min: number;
  max: number;
  criticoMin?: number;
  criticoMax?: number;
  unidad?: string;
}

export interface RangoNivelSecado {
  min: number;
  max: number;
  unidad?: string;
}

export interface TiempoSecado {
  estimadoMin: number;
  unidad?: string;
}

export interface Calibracion {
  temperatura: RangoTemperatura;
  nivelSecado: RangoNivelSecado;
  tiempoSecado: TiempoSecado;
}

export interface GrupoRubro {
  _id: string;
  codigo: GrupoRubroCodigo;
  nombre: string;
  items: string[];
  calibracion: Calibracion;
  creadoPor?: string | null;
  actualizadoPor?: string | null;
  actualizadoEn?: string | null;
  vinculadoAHarina?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Payload minimo para que el gerente cree un grupo nuevo (cola FIFO). */
export interface GrupoRubroPayload {
  nombre: string;
  items: [string, string];
}

export interface CalibracionPayload {
  temperatura?: Partial<RangoTemperatura>;
  nivelSecado?: Partial<RangoNivelSecado>;
  tiempoSecado?: Partial<TiempoSecado>;
}

export interface HumedadConfig {
  _id: string;
  scope: "global";
  min: number;
  max: number;
  criticoMin?: number;
  criticoMax?: number;
  unidad?: string;
  actualizadoPor?: string | null;
  actualizadoEn?: string | null;
}

export interface HumedadPayload {
  min?: number;
  max?: number;
  criticoMin?: number;
  criticoMax?: number;
}
