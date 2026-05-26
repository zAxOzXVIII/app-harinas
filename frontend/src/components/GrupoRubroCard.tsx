import { StyleSheet, View } from "react-native";
import { Card, Chip, Text, useTheme } from "react-native-paper";
import type { GrupoRubro, HumedadConfig } from "../types/grupoRubro";
import { brand } from "../theme";

interface Props {
  grupo: GrupoRubro;
  humedad?: HumedadConfig | null;
  onPress?: () => void;
  showActions?: boolean;
  rightSlot?: React.ReactNode;
}

export const GrupoRubroCard = ({ grupo, humedad, onPress, rightSlot }: Props) => {
  const theme = useTheme();
  const t = grupo.calibracion.temperatura;
  const ns = grupo.calibracion.nivelSecado;
  const ts = grupo.calibracion.tiempoSecado;

  return (
    <Card mode="elevated" style={[styles.card, { backgroundColor: theme.colors.surface }]} onPress={onPress}>
      <Card.Content>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={{ color: brand.primaryBlueDark }}>
              {grupo.nombre}
            </Text>
            <View style={styles.chipsRow}>
              {grupo.items.map((item) => (
                <Chip key={item} compact style={styles.chip}>
                  {item}
                </Chip>
              ))}
            </View>
          </View>
          {rightSlot}
        </View>

        <View style={styles.divider} />

        <View style={styles.metricRow}>
          <Text variant="labelLarge">Temperatura</Text>
          <Text variant="bodyMedium">
            {t.min}–{t.max} {t.unidad ?? "C"}
            {t.criticoMin !== undefined || t.criticoMax !== undefined
              ? `  (critico ${t.criticoMin ?? "-"}/${t.criticoMax ?? "-"})`
              : ""}
          </Text>
        </View>
        <View style={styles.metricRow}>
          <Text variant="labelLarge">Nivel de secado</Text>
          <Text variant="bodyMedium">
            {ns.min}–{ns.max} {ns.unidad ?? "%"}
          </Text>
        </View>
        <View style={styles.metricRow}>
          <Text variant="labelLarge">Tiempo estimado</Text>
          <Text variant="bodyMedium">
            {ts.estimadoMin} {ts.unidad ?? "min"}
          </Text>
        </View>
        {humedad ? (
          <View style={styles.metricRow}>
            <Text variant="labelLarge">Humedad (global)</Text>
            <Text variant="bodyMedium">
              {humedad.min}–{humedad.max} {humedad.unidad ?? "%RH"}
            </Text>
          </View>
        ) : null}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: brand.primaryBlue,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  chip: {
    backgroundColor: brand.surfaceMuted,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E7EF",
    marginVertical: 10,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
});
