export type AlertTipo =
  | "temp_critico"
  | "temp_fuera_rango"
  | "humedad_critico"
  | "humedad_fuera"
  | "nivel_secado_fuera"
  | "tiempo_secado_exceso"
  | "secado_completado";

export type AlertSeveridad = "critical" | "warning" | "info";

export interface GrupoAlertaRef {
  _id: string;
  nombre: string;
  codigo: string;
}

export interface ProcessAlert {
  _id: string;
  tipo: AlertTipo;
  severidad: AlertSeveridad;
  grupoRubroId: string | GrupoAlertaRef;
  telemetryEventId?: string | null;
  procesoSecadoId?: string | null;
  mensaje: string;
  leida: boolean;
  createdAt?: string;
  updatedAt?: string;
}
