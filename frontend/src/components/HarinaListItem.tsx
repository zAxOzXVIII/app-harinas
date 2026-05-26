import { StyleSheet, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import type { Harina } from "../types/harina";
import { brand } from "../theme";

interface Props {
  harina: Harina;
}

export const HarinaListItem = ({ harina }: Props) => {
  const theme = useTheme();

  return (
    <Card
      mode="outlined"
      style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}
    >
      <Card.Content>
        <Text variant="titleMedium" style={{ color: brand.primaryBlueDark }}>
          {harina.nombre}
        </Text>
        <Text variant="bodyMedium">Tipo: {harina.tipo}</Text>
        <Text variant="bodyMedium">
          Cantidad: {harina.cantidad} {harina.unidad}
        </Text>
        <View style={styles.metaRow}>
          <Text variant="bodySmall" style={styles.muted}>
            Registro: {new Date(harina.fecha_registro).toLocaleDateString("es-VE")}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: brand.skyAccent,
  },
  metaRow: {
    marginTop: 6,
  },
  muted: {
    opacity: 0.75,
  },
});
