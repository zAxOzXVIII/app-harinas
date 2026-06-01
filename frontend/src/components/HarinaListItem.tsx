import { StyleSheet, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import type { Harina } from "../types/harina";
import { useMutedTextStyle } from "../hooks/useMutedTextStyle";
import { brand } from "../theme";

interface Props {
  harina: Harina;
}

export const HarinaListItem = ({ harina }: Props) => {
  const theme = useTheme();
  const mutedText = useMutedTextStyle();

  return (
    <Card
      mode="outlined"
      style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}
    >
      <Card.Content>
        <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
          {harina.nombre}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
          Tipo: {harina.tipo}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
          Cantidad: {harina.cantidad} {harina.unidad}
        </Text>
        <View style={styles.metaRow}>
          <Text variant="bodySmall" style={mutedText}>
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
});
