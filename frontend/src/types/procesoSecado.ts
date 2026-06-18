export type ProcesoSecadoEstado =
  | "pendiente"
  | "en_secado"
  | "completado"
  | "revisado_empaquetado"
  | "archivado";

export interface ProcesoSecadoGrupoRef {
  _id: string;
  nombre: string;
  codigo: string;
}

export interface ProcesoSecadoUserRef {
  _id: string;
  nombre: string;
  email?: string;
}

export type ProcesoSecadoResultado = "listo" | "poco_optimo";

export interface ProcesoSecado {
  _id: string;
  grupoRubroId: string | ProcesoSecadoGrupoRef;
  estado: ProcesoSecadoEstado;
  iniciadoPor?: string | ProcesoSecadoUserRef | null;
  iniciadoEn: string;
  duracionMin: number;
  finalizaEn: string;
  completadoEn?: string | null;
  resultado?: ProcesoSecadoResultado | null;
  calificacion?: string | null;
  descripcionCierre?: string | null;
  alertasPendientesAlCierre?: number;
  restanteMs?: number;
  transcurridoMs?: number;
  restanteMin?: number;
  transcurridoMin?: number;
  createdAt?: string;
  updatedAt?: string;
}
