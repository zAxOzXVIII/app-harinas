import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useMutedTextStyle } from "../hooks/useMutedTextStyle";
import { statusColors, statusColorsDark } from "../theme";

interface Props {
  label: string;
  /** null = sin lectura real (no mostrar valor inventado). */
  value?: number | null;
  unit?: string;
  min: number;
  max: number;
  criticoMin?: number;
  criticoMax?: number;
  rangeMin?: number;
  rangeMax?: number;
}

const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);

/**
 * Barra horizontal con zonas (critico / operativo / critico) y marcador del valor actual.
 * Util para mostrar T y HR contra umbrales calibrados.
 */
export const MetricGauge = ({
  label,
  value,
  unit,
  min,
  max,
  criticoMin,
  criticoMax,
  rangeMin,
  rangeMax,
}: Props) => {
  const theme = useTheme();
  const mutedText = useMutedTextStyle();
  const palette = theme.dark ? statusColorsDark : statusColors;
  const hasReading = value != null && Number.isFinite(value);
  const reading = hasReading ? (value as number) : 0;

  const lo =
    rangeMin ??
    Math.min(criticoMin ?? min, ...(hasReading ? [reading] : []), min) -
      Math.max(1, (max - min) * 0.1);
  const hi =
    rangeMax ??
    Math.max(criticoMax ?? max, ...(hasReading ? [reading] : []), max) +
      Math.max(1, (max - min) * 0.1);
  const total = hi - lo || 1;

  const pct = (v: number): `${number}%` => {
    const num = Number((clamp((v - lo) / total, 0, 1) * 100).toFixed(2));
    return `${num}%` as `${number}%`;
  };

  const cMinPct: `${number}%` = criticoMin !== undefined ? pct(criticoMin) : `0%`;
  const cMaxPct: `${number}%` = criticoMax !== undefined ? pct(criticoMax) : `100%`;
  const minPct = pct(min);
  const maxPct = pct(max);
  const maxPctNumber = Number(maxPct.replace("%", ""));
  const rightFromMax: `${number}%` = `${100 - maxPctNumber}%` as `${number}%`;
  const valuePct = hasReading ? pct(reading) : null;

  const isCritical =
    hasReading &&
    ((criticoMin !== undefined && reading < criticoMin) ||
      (criticoMax !== undefined && reading > criticoMax));
  const isOutOfRange = hasReading && (reading < min || reading > max);
  const status = !hasReading
    ? theme.colors.outline
    : isCritical
    ? palette.critical
    : isOutOfRange
    ? palette.warning
    : palette.ok;

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text variant="labelLarge" style={{ color: theme.colors.onSurface }}>
          {label}
        </Text>
        <Text variant="titleSmall" style={{ color: hasReading ? status : theme.colors.onSurfaceVariant }}>
          {hasReading ? `${reading.toFixed(1)} ${unit ?? ""}`.trim() : "Sin lectura"}
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View
          style={[
            styles.zoneCritical,
            { left: 0, width: cMinPct, backgroundColor: palette.critical, opacity: 0.15 },
          ]}
        />
        <View
          style={[
            styles.zoneCritical,
            { left: cMaxPct, right: 0, backgroundColor: palette.critical, opacity: 0.15 },
          ]}
        />
        <View
          style={[
            styles.zoneOk,
            { left: minPct, right: rightFromMax, backgroundColor: palette.ok, opacity: 0.18 },
          ]}
        />
        {hasReading && valuePct ? (
          <View
            style={[
              styles.marker,
              { left: valuePct, backgroundColor: status },
            ]}
          />
        ) : null}
      </View>

      <View style={styles.scaleRow}>
        <Text variant="bodySmall" style={mutedText}>{lo.toFixed(0)}</Text>
        <Text variant="bodySmall" style={mutedText}>
          op. {min}–{max}{unit ? ` ${unit}` : ""}
        </Text>
        <Text variant="bodySmall" style={mutedText}>{hi.toFixed(0)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { gap: 6 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  track: { height: 10, borderRadius: 5, overflow: "hidden", position: "relative" },
  zoneCritical: { position: "absolute", top: 0, bottom: 0 },
  zoneOk: { position: "absolute", top: 0, bottom: 0, borderRadius: 5 },
  marker: {
    position: "absolute",
    top: -3,
    width: 4,
    height: 16,
    borderRadius: 2,
    transform: [{ translateX: -2 }],
  },
  scaleRow: { flexDirection: "row", justifyContent: "space-between" },
});
