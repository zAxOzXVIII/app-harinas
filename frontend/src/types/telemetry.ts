export interface TelemetryLecturas {
  nivelSecado: number;
  tiempoSecado: number;
  temperatura: number;
  humedad: number;
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
