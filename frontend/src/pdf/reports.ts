import type { ProcessAlert } from "../types/alert";
import type { TeamUser, User } from "../types/auth";
import type { Harina } from "../types/harina";
import type { GrupoRubro, HumedadConfig } from "../types/grupoRubro";
import type { TelemetryGroupItem, TelemetryLatestItem } from "../types/telemetry";
import { exportPdf } from "../services/pdfReport.service";
import {
  formatDate,
  formatDateShort,
  formatNumber,
  labelAlertTipo,
  labelRol,
  statusBadgeHtml,
  type PdfBuildOptions,
} from "../utils/pdfTemplates";
import {
  computeTelemetryStatus,
  sortGruposByCodigo,
} from "../utils/telemetryStatus";

const userLabel = (user: User | null | undefined): string | undefined =>
  user ? `${user.nombre} (${labelRol(user.rol ?? "gerente")})` : undefined;

const sortHarinas = (items: Harina[]): Harina[] =>
  [...items].sort((a, b) => {
    const da = new Date(a.fecha_registro).getTime();
    const db = new Date(b.fecha_registro).getTime();
    if (db !== da) return db - da;
    return a.nombre.localeCompare(b.nombre, "es");
  });

const harinaKpis = (items: Harina[]) => {
  const byUnit = new Map<string, number>();
  items.forEach((h) => {
    byUnit.set(h.unidad, (byUnit.get(h.unidad) ?? 0) + h.cantidad);
  });
  const subtotals = [...byUnit.entries()]
    .map(([u, q]) => `${formatNumber(q, 0)} ${u}`)
    .join(" · ");

  return [
    { label: "Total registros", value: String(items.length) },
    { label: "Subtotales por unidad", value: subtotals || "—" },
  ];
};

export const exportHarinasPdf = async (
  harinas: Harina[],
  user?: User | null
): Promise<void> => {
  const sorted = sortHarinas(harinas);
  const opts: PdfBuildOptions = {
    reportTitle: "Inventario de harinas",
    userLabel: userLabel(user),
    kpis: harinaKpis(sorted),
    sections: [
      {
        title: "Detalle de inventario",
        headers: ["Producto", "Tipo", "Cantidad", "Unidad", "Fecha registro"],
        rows: sorted.map((h) => [
          h.nombre,
          h.tipo,
          formatNumber(h.cantidad, 2),
          h.unidad,
          formatDate(h.fecha_registro),
        ]),
      },
    ],
    footerNote: "Nativa Superalimentos C.A — Inventario interno.",
  };
  await exportPdf(opts, "harinas");
};

const grupoCalibracionHtml = (grupo: GrupoRubro): string => {
  const t = grupo.calibracion.temperatura;
  const ns = grupo.calibracion.nivelSecado;
  const ts = grupo.calibracion.tiempoSecado;
  const items = grupo.items.join(" · ");
  const audit = grupo.actualizadoEn
    ? `Última actualización: ${formatDate(grupo.actualizadoEn)}`
    : "Sin auditoría registrada";
  return `
    <strong>${grupo.nombre}</strong> (${items})<br/>
    Temperatura operativa: ${t.min}–${t.max} ${t.unidad ?? "C"} · Crítico: ${t.criticoMin ?? "—"} / ${t.criticoMax ?? "—"}<br/>
    Nivel secado: ${ns.min}–${ns.max} ${ns.unidad ?? "%"}<br/>
    Tiempo estimado: ${ts.estimadoMin} ${ts.unidad ?? "min"}<br/>
    <em style="font-size:9px;color:#78909C">${audit}</em>
  `;
};

export const exportCalibracionPdf = async (
  grupos: GrupoRubro[],
  humedad: HumedadConfig | null,
  user?: User | null
): Promise<void> => {
  const sorted = sortGruposByCodigo(grupos);
  const humedadHtml = humedad
    ? `Rango operativo: <strong>${humedad.min}–${humedad.max} ${humedad.unidad ?? "%RH"}</strong> · Crítico: ${humedad.criticoMin ?? "—"} / ${humedad.criticoMax ?? "—"}${
        humedad.actualizadoEn
          ? `<br/><em>Actualizado: ${formatDate(humedad.actualizadoEn)}</em>`
          : ""
      }`
    : "No hay configuración global de humedad.";

  const sections = sorted.map((g) => ({
    title: g.nombre,
    headers: ["Parámetro", "Operativo", "Crítico", "Unidad"],
    htmlBefore: grupoCalibracionHtml(g),
    rows: [
      [
        "Temperatura",
        `${g.calibracion.temperatura.min} – ${g.calibracion.temperatura.max}`,
        `${g.calibracion.temperatura.criticoMin ?? "—"} / ${g.calibracion.temperatura.criticoMax ?? "—"}`,
        g.calibracion.temperatura.unidad ?? "C",
      ],
      [
        "Nivel secado",
        `${g.calibracion.nivelSecado.min} – ${g.calibracion.nivelSecado.max}`,
        "—",
        g.calibracion.nivelSecado.unidad ?? "%",
      ],
      [
        "Tiempo secado",
        `Est. ${g.calibracion.tiempoSecado.estimadoMin}`,
        "—",
        g.calibracion.tiempoSecado.unidad ?? "min",
      ],
    ],
  }));

  sections.push({
    title: "Política global de humedad",
    headers: ["Ámbito", "Operativo", "Crítico", "Unidad"],
    htmlBefore: humedadHtml,
    rows: humedad
      ? [
          [
            "Global",
            `${humedad.min} – ${humedad.max}`,
            `${humedad.criticoMin ?? "—"} / ${humedad.criticoMax ?? "—"}`,
            humedad.unidad ?? "%RH",
          ],
        ]
      : [["—", "—", "—", "—"]],
  });

  await exportPdf(
    {
      reportTitle: "Calibración de proceso",
      userLabel: userLabel(user),
      kpis: [
        { label: "Grupos de rubro", value: String(sorted.length) },
        { label: "Humedad global", value: humedad ? "Configurada" : "Pendiente" },
      ],
      sections,
      footerNote: "Umbrales vigentes para supervisión y operación.",
    },
    "calibracion"
  );
};

const sortAlerts = (items: ProcessAlert[]): ProcessAlert[] =>
  [...items].sort((a, b) => {
    const sev = (s: string) => (s === "critical" ? 0 : 1);
    const ds = sev(a.severidad) - sev(b.severidad);
    if (ds !== 0) return ds;
    const ta = new Date(a.createdAt ?? 0).getTime();
    const tb = new Date(b.createdAt ?? 0).getTime();
    if (tb !== ta) return tb - ta;
    const ga =
      typeof a.grupoRubroId === "object" && a.grupoRubroId?.nombre
        ? a.grupoRubroId.nombre
        : "";
    const gb =
      typeof b.grupoRubroId === "object" && b.grupoRubroId?.nombre
        ? b.grupoRubroId.nombre
        : "";
    return ga.localeCompare(gb, "es");
  });

const alertGrupoNombre = (a: ProcessAlert): string => {
  const g = a.grupoRubroId;
  if (g && typeof g === "object" && "nombre" in g) return g.nombre;
  return "Grupo";
};

export const exportAlertsPdf = async (
  alerts: ProcessAlert[],
  user?: User | null,
  unreadOnly = false
): Promise<void> => {
  const filtered = unreadOnly ? alerts.filter((a) => !a.leida) : alerts;
  const sorted = sortAlerts(filtered);
  const criticas = sorted.filter((a) => a.severidad === "critical").length;
  const pendientes = sorted.filter((a) => !a.leida).length;

  await exportPdf(
    {
      reportTitle: unreadOnly ? "Alertas pendientes" : "Bitácora de alertas",
      userLabel: userLabel(user),
      kpis: [
        { label: "En reporte", value: String(sorted.length) },
        { label: "Críticas", value: String(criticas) },
        { label: "Pendientes", value: String(pendientes) },
      ],
      sections: [
        {
          title: "Eventos de proceso",
          headers: ["Fecha", "Grupo", "Tipo", "Severidad", "Estado", "Detalle"],
          rows: sorted.map((a) => [
            a.createdAt ? formatDate(a.createdAt) : "—",
            alertGrupoNombre(a),
            labelAlertTipo(a.tipo),
            statusBadgeHtml(a.severidad === "critical" ? "CRITICO" : "ALERTA"),
            a.leida ? "Leída" : "Pendiente",
            a.mensaje,
          ]),
        },
      ],
      footerNote: "Alertas generadas por telemetría vs calibración.",
    },
    "alertas"
  );
};

export const exportMuroPdf = async (
  latest: TelemetryLatestItem[],
  grupos: GrupoRubro[],
  humedad: HumedadConfig | null,
  history: Record<string, TelemetryGroupItem[]>,
  user?: User | null
): Promise<void> => {
  const sortedGrupos = sortGruposByCodigo(grupos);
  const latestMap = new Map(latest.map((l) => [l.grupoRubroId, l]));

  let enAlerta = 0;
  const sectionsWithHist = sortedGrupos.map((grupo) => {
    const last = latestMap.get(grupo._id);
    const status = last
      ? computeTelemetryStatus(last.lecturas, grupo, humedad)
      : "—";
    if (status === "ALERTA" || status === "CRITICO") enAlerta += 1;

    const hist = [...(history[grupo._id] ?? [])]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
      .reverse();

    const histTable =
      hist.length > 0
        ? `<br/><small>Últimos puntos:</small><table style="margin-top:6px;font-size:9px"><tr><th>Hora</th><th>T</th><th>HR</th></tr>${hist
            .map(
              (h) =>
                `<tr><td>${formatDateShort(h.timestamp)}</td><td>${formatNumber(h.lecturas.temperatura)}</td><td>${formatNumber(h.lecturas.humedad)}</td></tr>`
            )
            .join("")}</table>`
        : "";

    const lecturaRows = last
      ? [
          [
            formatDate(last.timestamp),
            `${formatNumber(last.lecturas.temperatura)} °C`,
            `${formatNumber(last.lecturas.humedad)} %`,
            last.lecturas.nivelSecado != null
              ? `${formatNumber(last.lecturas.nivelSecado, 0)} %`
              : "—",
            last.lecturas.tiempoSecado != null
              ? `${formatNumber(last.lecturas.tiempoSecado, 0)} min`
              : "—",
            statusBadgeHtml(String(status)),
            last.deviceId,
          ],
        ]
      : [["Sin datos", "—", "—", "—", "—", "—", "—"]];

    return {
      title: grupo.nombre,
      headers: ["Última lectura", "T °C", "HR %", "Secado %", "Tiempo", "Estado", "Dispositivo"],
      htmlBefore: `<strong>${grupo.items.join(" · ")}</strong>${histTable}`,
      rows: lecturaRows,
    };
  });

  await exportPdf(
    {
      reportTitle: "Muro de proceso — snapshot",
      userLabel: userLabel(user),
      kpis: [
        { label: "Grupos monitoreados", value: String(sortedGrupos.length) },
        { label: "En alerta / crítico", value: String(enAlerta) },
        { label: "Lecturas activas", value: String(latest.length) },
      ],
      sections: sectionsWithHist,
      footerNote: "Snapshot al momento de exportación.",
    },
    "muro"
  );
};

export const exportEquipoPdf = async (
  team: TeamUser[],
  user?: User | null
): Promise<void> => {
  const sorted = [...team].sort((a, b) => {
    const ro = (r: string) => (r === "supervisor" ? 0 : 1);
    const dr = ro(a.rol) - ro(b.rol);
    if (dr !== 0) return dr;
    return a.nombre.localeCompare(b.nombre, "es");
  });

  await exportPdf(
    {
      reportTitle: "Equipo de trabajo",
      userLabel: userLabel(user),
      kpis: [
        { label: "Supervisores", value: String(sorted.filter((u) => u.rol === "supervisor").length) },
        { label: "Operadores", value: String(sorted.filter((u) => u.rol === "operador").length) },
      ],
      sections: [
        {
          title: "Personal registrado",
          headers: ["Nombre", "Correo", "Rol", "Alta en sistema"],
          rows: sorted.map((u) => [
            u.nombre,
            u.email,
            labelRol(u.rol),
            u.createdAt ? formatDate(u.createdAt) : "—",
          ]),
        },
      ],
      footerNote:
        "Documento confidencial — Nativa Superalimentos C.A. — Solo uso interno. No incluye contraseñas.",
    },
    "equipo"
  );
};
