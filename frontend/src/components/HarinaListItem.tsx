import { StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import type { Harina } from "../types/harina";

interface Props {
  harina: Harina;
}

export const HarinaListItem = ({ harina }: Props) => {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium">{harina.nombre}</Text>
        <Text variant="bodyMedium">Tipo: {harina.tipo}</Text>
        <Text variant="bodyMedium">
          Cantidad: {harina.cantidad} {harina.unidad}
        </Text>
        <View style={styles.metaRow}>
          <Text variant="bodySmall">
            Registro: {new Date(harina.fecha_registro).toLocaleDateString()}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
  metaRow: {
    marginTop: 6,
  },
});
