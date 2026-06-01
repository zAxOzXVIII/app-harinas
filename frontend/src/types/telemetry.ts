export interface TelemetryLecturas {
  temperatura: number;
  humedad: number;
  /** Presente si el dispositivo envía nivel de secado (fase 2). */
  nivelSecado?: number;
  /** Presente si el dispositivo envía tiempo de secado en minutos. */
  tiempoSecado?: number;
}

export interface TelemetryLatestItem {
  _id: string;
  eventId?: string;
  deviceId: string;
  grupoRubroId: string;
  timestamp: string;
  lecturas: TelemetryLecturas;
  grupo: {
    _id: string;
    codigo: string;
    nombre: string;
    items?: string[];
  };
}

export interface TelemetryGroupItem {
  _id: string;
  eventId?: string;
  deviceId: string;
  grupoRubroId: string;
  timestamp: string;
  lecturas: TelemetryLecturas;
}
