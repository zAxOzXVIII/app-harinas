import type { AlertTipo } from "../types/alert";
import type { Rol } from "../types/auth";
import { brand } from "../theme";

export interface PdfKpi {
  label: string;
  value: string;
}

export interface PdfTableSection {
  title: string;
  headers: string[];
  rows: string[][];
  htmlBefore?: string;
}

export interface PdfBuildOptions {
  reportTitle: string;
  userLabel?: string;
  kpis?: PdfKpi[];
  sections: PdfTableSection[];
  footerNote?: string;
}

const PDF_STYLES = `
  body { font-family: system-ui, 'Segoe UI', sans-serif; font-size: 11px; color: #1a237e; margin: 24px; }
  .pdf-header { border-bottom: 3px solid ${brand.primaryBlue}; padding-bottom: 12px; margin-bottom: 16px; }
  .pdf-header h1 { margin: 0; font-size: 20px; color: ${brand.primaryBlueDark}; letter-spacing: 0.05em; }
  .pdf-header .sub { font-size: 11px; color: #546E7A; text-transform: uppercase; letter-spacing: 0.12em; margin-top: 4px; }
  .pdf-header .meta { font-size: 10px; color: #78909C; margin-top: 8px; }
  .pdf-kpis { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
  .kpi { flex: 1; min-width: 120px; background: #E3F2FD; border-left: 4px solid ${brand.primaryBlue}; padding: 10px 12px; border-radius: 6px; }
  .kpi .val { font-size: 18px; font-weight: 700; color: ${brand.primaryBlueDark}; }
  .kpi .lbl { font-size: 9px; color: #546E7A; text-transform: uppercase; margin-top: 2px; }
  .section-title { font-size: 14px; color: ${brand.primaryBlueDark}; margin: 20px 0 8px; border-left: 4px solid ${brand.skyAccent}; padding-left: 8px; }
  .highlight-box { background: ${brand.surfaceMuted}; padding: 12px; border-radius: 8px; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: ${brand.primaryBlue}; color: #fff; padding: 8px 10px; text-align: left; font-size: 10px; }
  tr:nth-child(even) { background: #F5F9FC; }
  td { padding: 7px 10px; border-bottom: 1px solid #E0E7EF; vertical-align: top; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 9px; font-weight: 600; }
  .badge-critical { background: #FFEBEE; color: ${brand.critical}; border: 1px solid ${brand.critical}; }
  .badge-warning { background: #FFF3E0; color: ${brand.warning}; border: 1px solid ${brand.warning}; }
  .badge-ok { background: #E8F5E9; color: ${brand.ok}; border: 1px solid ${brand.ok}; }
  .pdf-footer { margin-top: 24px; font-size: 9px; color: #90A4AE; border-top: 1px solid #E0E7EF; padding-top: 8px; }
`;

export const formatDate = (iso: string | Date): string => {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateShort = (iso: string | Date): string => {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" });
};

export const formatNumber = (n: number, decimals = 1): string =>
  n.toLocaleString("es-VE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export const labelAlertTipo = (tipo: AlertTipo): string => {
  const map: Record<AlertTipo, string> = {
    temp_critico: "Temperatura crítica",
    temp_fuera_rango: "Temperatura fuera de rango",
    humedad_critico: "Humedad crítica",
    humedad_fuera: "Humedad fuera de rango",
    nivel_secado_fuera: "Nivel de secado fuera",
    tiempo_secado_exceso: "Tiempo de secado excedido",
  };
  return map[tipo] ?? tipo;
};

export const labelRol = (rol: Rol | string): string => {
  const map: Record<string, string> = {
    gerente: "Gerente",
    supervisor: "Supervisor",
    operador: "Operador",
  };
  return map[rol] ?? rol;
};

export const statusBadgeHtml = (status: string): string => {
  const s = status.toUpperCase();
  if (s === "CRITICO" || s === "CRITICAL") {
    return `<span class="badge badge-critical">${s}</span>`;
  }
  if (s === "ALERTA" || s === "WARNING") {
    return `<span class="badge badge-warning">${s}</span>`;
  }
  return `<span class="badge badge-ok">${s}</span>`;
};

export const pdfFileName = (modulo: string): string => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `nativa_${modulo}_${stamp}.pdf`;
};

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const buildPdfHtml = (opts: PdfBuildOptions): string => {
  const generated = formatDate(new Date());
  const apiHost = (() => {
    try {
      const u = process.env.EXPO_PUBLIC_API_URL;
      return u ? new URL(u).host : "local";
    } catch {
      return "local";
    }
  })();

  const kpiHtml =
    opts.kpis && opts.kpis.length > 0
      ? `<div class="pdf-kpis">${opts.kpis
          .map(
            (k) =>
              `<div class="kpi"><div class="val">${escapeHtml(k.value)}</div><div class="lbl">${escapeHtml(k.label)}</div></div>`
          )
          .join("")}</div>`
      : "";

  const sectionsHtml = opts.sections
    .map((sec) => {
      const before = sec.htmlBefore ? `<div class="highlight-box">${sec.htmlBefore}</div>` : "";
      const head = sec.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
      const body = sec.rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
        )
        .join("");
      return `
        <h2 class="section-title">${escapeHtml(sec.title)}</h2>
        ${before}
        <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
      `;
    })
    .join("");

  const userLine = opts.userLabel
    ? ` · Usuario: ${escapeHtml(opts.userLabel)}`
    : "";

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"/><style>${PDF_STYLES}</style></head>
<body>
  <header class="pdf-header">
    <div class="sub">Nativa Superalimentos C.A</div>
    <h1>${escapeHtml(opts.reportTitle)}</h1>
    <div class="meta">Generado: ${escapeHtml(generated)}${userLine} · API: ${escapeHtml(apiHost)}</div>
  </header>
  ${kpiHtml}
  ${sectionsHtml}
  <footer class="pdf-footer">
    ${escapeHtml(opts.footerNote ?? "Documento generado por App Harinas — Control de planta.")}
  </footer>
</body>
</html>`;
};
