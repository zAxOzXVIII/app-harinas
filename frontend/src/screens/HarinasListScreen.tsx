import { useEffect, useCallback } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, FAB, IconButton, Text } from "react-native-paper";
import { useHarinasStore } from "../store/harinas.store";
import type { Harina } from "../types/harina";

interface Props {
  onCreateNew: () => void;
  onEdit: (harina: Harina) => void;
}

export const HarinasListScreen = ({ onCreateNew, onEdit }: Props) => {
  const harinas = useHarinasStore((state) => state.harinas);
  const isLoading = useHarinasStore((state) => state.isLoading);
  const isMutating = useHarinasStore((state) => state.isMutating);
  const error = useHarinasStore((state) => state.error);
  const fetchHarinas = useHarinasStore((state) => state.fetchHarinas);
  const deleteHarina = useHarinasStore((state) => state.deleteHarina);

  useEffect(() => {
    fetchHarinas();
  }, [fetchHarinas]);

  const handleDelete = useCallback(
    (harina: Harina) => {
      Alert.alert(
        "Eliminar harina",
        `¿Deseas eliminar "${harina.nombre}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteHarina(harina._id);
              } catch {
                Alert.alert("Error", "No fue posible eliminar la harina");
              }
            },
          },
        ],
        { cancelable: true }
      );
    },
    [deleteHarina]
  );

  if (isLoading && harinas.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error && harinas.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Button onPress={fetchHarinas}>Reintentar</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={harinas}
        keyExtractor={(item) => item._id}
        refreshing={isLoading}
        onRefresh={fetchHarinas}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text>No hay harinas registradas</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{item.nombre}</Text>
              <Text variant="bodyMedium">Tipo: {item.tipo}</Text>
              <Text variant="bodyMedium">
                Cantidad: {item.cantidad} {item.unidad}
              </Text>
              <Text variant="bodySmall">
                Registro: {new Date(item.fecha_registro).toLocaleDateString()}
              </Text>
            </Card.Content>
            <Card.Actions>
              <IconButton
                icon="pencil"
                onPress={() => onEdit(item)}
                disabled={isMutating}
              />
              <IconButton
                icon="delete"
                iconColor="#c62828"
                onPress={() => handleDelete(item)}
                disabled={isMutating}
              />
            </Card.Actions>
          </Card>
        )}
      />

      <FAB icon="plus" style={styles.fab} onPress={onCreateNew} disabled={isMutating} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  list: {
    padding: 16,
    paddingBottom: 90,
  },
  card: {
    marginBottom: 10,
    borderRadius: 12,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: "#c62828",
    marginBottom: 12,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
  },
});
