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
  /** Posicion 1-based en la cola FIFO (orden de creacion). 1 = siguiente a trabajar. */
  queuePosition?: number;
}

export const GrupoRubroCard = ({ grupo, humedad, onPress, rightSlot, queuePosition }: Props) => {
  const theme = useTheme();
  const valueColor = theme.colors.onSurface;
  const labelColor = theme.colors.onSurfaceVariant;
  const t = grupo.calibracion.temperatura;
  const ns = grupo.calibracion.nivelSecado;
  const ts = grupo.calibracion.tiempoSecado;
  const esSiguiente = queuePosition === 1;

  return (
    <Card
      mode="elevated"
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface },
        esSiguiente ? { borderLeftColor: theme.colors.primary, borderLeftWidth: 4 } : null,
      ]}
      onPress={onPress}
    >
      <Card.Content>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            {queuePosition !== undefined ? (
              <Chip
                compact
                icon={esSiguiente ? "arrow-up-bold-circle" : "clock-outline"}
                style={[
                  styles.queueChip,
                  {
                    backgroundColor: esSiguiente
                      ? theme.colors.primaryContainer
                      : theme.colors.surfaceVariant,
                  },
                ]}
                textStyle={{
                  color: esSiguiente ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
                  fontSize: 12,
                }}
              >
                {esSiguiente ? "Siguiente en la cola" : `#${queuePosition} en la cola`}
              </Chip>
            ) : null}
            <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
              {grupo.nombre}
            </Text>
            <View style={styles.chipsRow}>
              {[...new Set(grupo.items)].map((item) => (
                <Chip
                  key={item}
                  compact
                  style={{ backgroundColor: theme.colors.secondaryContainer }}
                  textStyle={{ color: theme.colors.onSecondaryContainer, fontSize: 12 }}
                >
                  {item}
                </Chip>
              ))}
            </View>
          </View>
          {rightSlot}
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

        <View style={styles.metricRow}>
          <Text variant="labelLarge" style={{ color: labelColor }}>Temperatura</Text>
          <Text variant="bodyMedium" style={{ color: valueColor }}>
            {t.min}–{t.max} {t.unidad ?? "C"}
            {t.criticoMin !== undefined || t.criticoMax !== undefined
              ? `  (critico ${t.criticoMin ?? "-"}/${t.criticoMax ?? "-"})`
              : ""}
          </Text>
        </View>
        <View style={styles.metricRow}>
          <Text variant="labelLarge" style={{ color: labelColor }}>Nivel de secado</Text>
          <Text variant="bodyMedium" style={{ color: valueColor }}>
            {ns.min}–{ns.max} {ns.unidad ?? "%"}
          </Text>
        </View>
        <View style={styles.metricRow}>
          <Text variant="labelLarge" style={{ color: labelColor }}>Tiempo estimado</Text>
          <Text variant="bodyMedium" style={{ color: valueColor }}>
            {ts.estimadoMin} {ts.unidad ?? "min"}
          </Text>
        </View>
        {humedad ? (
          <View style={styles.metricRow}>
            <Text variant="labelLarge" style={{ color: labelColor }}>Humedad (global)</Text>
            <Text variant="bodyMedium" style={{ color: valueColor }}>
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
  queueChip: {
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
});
