export type GrupoRubroCodigo =
  | "garbanzo-lenteja"
  | "platano-cambur"
  | "yuca-batata";

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
  actualizadoPor?: string | null;
  actualizadoEn?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
