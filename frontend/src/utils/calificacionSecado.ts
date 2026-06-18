export type CalificacionSecado =
  | "quemado"
  | "humedecido"
  | "tiempo_excedido"
  | "temperatura_irregular"
  | "secado_irregular"
  | "alerta_sin_atender";

export const labelCalificacion = (calificacion: string | null | undefined): string => {
  const map: Record<string, string> = {
    quemado: "Posible quemado",
    humedecido: "Posible humedecimiento",
    tiempo_excedido: "Tiempo excedido",
    temperatura_irregular: "Temperatura irregular",
    secado_irregular: "Secado irregular",
    alerta_sin_atender: "Alerta sin atender",
    listo: "Producto listo",
  };
  return map[calificacion ?? ""] ?? calificacion ?? "Sin calificación";
};

export const labelAlertTipoOperador = (tipo: string): string => {
  const map: Record<string, string> = {
    temp_critico: "Temperatura crítica",
    temp_fuera_rango: "Temperatura fuera de rango",
    humedad_critico: "Humedad crítica",
    humedad_fuera: "Humedad fuera de rango",
    nivel_secado_fuera: "Nivel de secado anómalo",
    tiempo_secado_exceso: "Tiempo de secado excedido",
  };
  return map[tipo] ?? tipo;
};
