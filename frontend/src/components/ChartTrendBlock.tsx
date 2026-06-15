import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Sparkline } from "./Sparkline";
import { useMutedTextStyle } from "../hooks/useMutedTextStyle";

interface Props {
  label: string;
  data: number[];
  width: number;
  height?: number;
  color?: string;
  emptyMessage?: string;
}

/** Bloque de tendencia: gráfica o estado vacío explícito (sin inventar lecturas). */
export const ChartTrendBlock = ({
  label,
  data,
  width,
  height = 56,
  color,
  emptyMessage = "Sin lecturas aún",
}: Props) => {
  const theme = useTheme();
  const mutedText = useMutedTextStyle();
  const stroke = color ?? theme.colors.primary;
  const hasTrend = data.length >= 2;

  return (
    <View style={styles.block}>
      <Text variant="labelSmall" style={mutedText}>
        {label}
        {hasTrend ? ` (${data.length} lecturas)` : ""}
      </Text>
      {hasTrend ? (
        <Sparkline data={data} width={width} height={height} color={stroke} />
      ) : (
        <View
          style={[
            styles.empty,
            {
              width,
              height,
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.outline,
            },
          ]}
        >
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
            {emptyMessage}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  block: { marginTop: 12, gap: 4 },
  empty: {
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
});
