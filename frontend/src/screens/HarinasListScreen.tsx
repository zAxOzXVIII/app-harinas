import { useEffect, useCallback } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, FAB, IconButton, Text, useTheme } from "react-native-paper";
import { AnimatedReveal } from "../components/AnimatedReveal";
import { useMutedTextStyle } from "../hooks/useMutedTextStyle";
import { useScreenLayout } from "../hooks/useScreenLayout";
import { useHarinasStore } from "../store/harinas.store";
import { useAuthStore } from "../store/auth.store";
import { usePdfExport } from "../hooks/usePdfExport";
import { exportHarinasPdf } from "../pdf/reports";
import { brand } from "../theme";
import type { Harina } from "../types/harina";

interface Props {
  onCreateNew: () => void;
  onEdit: (harina: Harina) => void;
}

export const HarinasListScreen = ({ onCreateNew, onEdit }: Props) => {
  const theme = useTheme();
  const layout = useScreenLayout();
  const mutedText = useMutedTextStyle();
  const harinas = useHarinasStore((state) => state.harinas);
  const isLoading = useHarinasStore((state) => state.isLoading);
  const isMutating = useHarinasStore((state) => state.isMutating);
  const error = useHarinasStore((state) => state.error);
  const fetchHarinas = useHarinasStore((state) => state.fetchHarinas);
  const deleteHarina = useHarinasStore((state) => state.deleteHarina);
  const user = useAuthStore((s) => s.user);
  const { exporting, runExport } = usePdfExport();

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
      <View style={[styles.centered, { backgroundColor: layout.backgroundColor }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error && harinas.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: layout.backgroundColor }]}>
        <Text style={styles.errorText}>{error}</Text>
        <Button onPress={fetchHarinas}>Reintentar</Button>
      </View>
    );
  }

  const onExportPdf = () =>
    runExport(async () => {
      if (harinas.length === 0) await fetchHarinas();
      const list = useHarinasStore.getState().harinas;
      await exportHarinasPdf(list, user);
    });

  return (
    <View style={[styles.container, { backgroundColor: layout.backgroundColor }]}>
      <View style={layout.toolbarPadding}>
        <Button
          mode="contained-tonal"
          icon="file-pdf-box"
          loading={exporting}
          onPress={onExportPdf}
        >
          Exportar PDF
        </Button>
      </View>
      <FlatList
        data={harinas}
        keyExtractor={(item) => item._id}
        refreshing={isLoading}
        onRefresh={fetchHarinas}
        contentContainerStyle={layout.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
              No hay harinas registradas
            </Text>
            <Text variant="bodySmall" style={mutedText}>
              Usa el boton + para agregar la primera.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <AnimatedReveal delay={Math.min(index * 40, 200)}>
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
                  {item.nombre}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  Tipo: {item.tipo}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  Cantidad: {item.cantidad} {item.unidad}
                </Text>
                <Text variant="bodySmall" style={mutedText}>
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
                  iconColor={brand.critical}
                  onPress={() => handleDelete(item)}
                  disabled={isMutating}
                />
              </Card.Actions>
            </Card>
          </AnimatedReveal>
        )}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { right: layout.contentPadding }]}
        onPress={onCreateNew}
        disabled={isMutating}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { marginBottom: 10, borderRadius: 12 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: brand.critical,
    marginBottom: 12,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 24,
  },
});
