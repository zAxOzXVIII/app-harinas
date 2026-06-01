import type { HumedadConfig } from "../types/grupoRubro";
import type { GrupoRubro } from "../types/grupoRubro";
import type { TelemetryLecturas } from "../types/telemetry";

export type TelemetryStatus = "OK" | "ALERTA" | "CRITICO";

export const ORDEN_GRUPOS_CODIGO = [
  "garbanzo-lenteja",
  "platano-cambur",
  "yuca-batata",
] as const;

export const sortGruposByCodigo = <T extends { codigo: string }>(grupos: T[]): T[] =>
  [...grupos].sort(
    (a, b) =>
      ORDEN_GRUPOS_CODIGO.indexOf(a.codigo as (typeof ORDEN_GRUPOS_CODIGO)[number]) -
      ORDEN_GRUPOS_CODIGO.indexOf(b.codigo as (typeof ORDEN_GRUPOS_CODIGO)[number])
  );

export const computeTelemetryStatus = (
  lecturas: TelemetryLecturas,
  grupo: GrupoRubro,
  humedad: HumedadConfig | null
): TelemetryStatus => {
  const t = grupo.calibracion.temperatura;
  const l = lecturas;

  const tempCrit =
    (t.criticoMin !== undefined && t.criticoMin !== null && l.temperatura < t.criticoMin) ||
    (t.criticoMax !== undefined && t.criticoMax !== null && l.temperatura > t.criticoMax);

  if (tempCrit) return "CRITICO";

  if (humedad) {
    const humCrit =
      (humedad.criticoMin !== undefined &&
        humedad.criticoMin !== null &&
        l.humedad < humedad.criticoMin) ||
      (humedad.criticoMax !== undefined &&
        humedad.criticoMax !== null &&
        l.humedad > humedad.criticoMax);
    if (humCrit) return "CRITICO";
  }

  const ns = grupo.calibracion.nivelSecado;
  const tsMin = grupo.calibracion.tiempoSecado?.estimadoMin ?? 0;

  const out =
    l.temperatura < t.min ||
    l.temperatura > t.max ||
    (humedad && (l.humedad < humedad.min || l.humedad > humedad.max)) ||
    (l.nivelSecado != null && (l.nivelSecado < ns.min || l.nivelSecado > ns.max)) ||
    (l.tiempoSecado != null && tsMin > 0 && l.tiempoSecado > tsMin);

  return out ? "ALERTA" : "OK";
};
