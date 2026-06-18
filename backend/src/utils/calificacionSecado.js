const ANOMALY_TIPOS = [
  "temp_critico",
  "temp_fuera_rango",
  "humedad_critico",
  "humedad_fuera",
  "nivel_secado_fuera",
  "tiempo_secado_exceso",
];

const CALIFICACIONES = [
  "quemado",
  "humedecido",
  "tiempo_excedido",
  "temperatura_irregular",
  "secado_irregular",
  "alerta_sin_atender",
];

const TIPO_PRIORITY = {
  temp_critico: 100,
  humedad_critico: 90,
  tiempo_secado_exceso: 80,
  humedad_fuera: 70,
  temp_fuera_rango: 60,
  nivel_secado_fuera: 50,
};

const tipoToCalificacion = (tipo) => {
  switch (tipo) {
    case "temp_critico":
      return "quemado";
    case "temp_fuera_rango":
      return "temperatura_irregular";
    case "humedad_critico":
    case "humedad_fuera":
      return "humedecido";
    case "tiempo_secado_exceso":
      return "tiempo_excedido";
    case "nivel_secado_fuera":
      return "secado_irregular";
    default:
      return "alerta_sin_atender";
  }
};

const calificacionLabel = (calificacion) => {
  const map = {
    quemado: "Posible quemado (temperatura crítica)",
    humedecido: "Posible humedecimiento",
    tiempo_excedido: "Tiempo de secado excedido",
    temperatura_irregular: "Temperatura fuera de rango",
    secado_irregular: "Nivel de secado anómalo",
    alerta_sin_atender: "Alerta de proceso sin atender",
    listo: "Producto listo — secado sin incidencias",
  };
  return map[calificacion] || calificacion;
};

const pickWorstCalificacion = (alertas) => {
  if (!alertas?.length) return null;
  const sorted = [...alertas].sort(
    (a, b) => (TIPO_PRIORITY[b.tipo] || 0) - (TIPO_PRIORITY[a.tipo] || 0)
  );
  return tipoToCalificacion(sorted[0].tipo);
};

module.exports = {
  ANOMALY_TIPOS,
  CALIFICACIONES,
  tipoToCalificacion,
  calificacionLabel,
  pickWorstCalificacion,
};
