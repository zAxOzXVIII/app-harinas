import { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import { AnimatedReveal } from "../components/AnimatedReveal";
import { useContrastStyles } from "../hooks/useContrastStyles";
import { useScreenLayout } from "../hooks/useScreenLayout";
import { brand } from "../theme";
import { useFocusEffect } from "@react-navigation/native";
import { useAlertsStore } from "../store/alerts.store";
import { useAuthStore } from "../store/auth.store";
import { usePdfExport } from "../hooks/usePdfExport";
import { exportAlertsPdf } from "../pdf/reports";
import type { ProcessAlert } from "../types/alert";

const grupoNombre = (a: ProcessAlert): string => {
  const g = a.grupoRubroId;
  if (g && typeof g === "object" && "nombre" in g) return g.nombre;
  return "Grupo";
};

export const AlertsListScreen = () => {
  const theme = useTheme();
  const layout = useScreenLayout();
  const { muted: mutedText, body: bodyStyle, chipLabel } = useContrastStyles();
  const items = useAlertsStore((s) => s.items);
  const isLoading = useAlertsStore((s) => s.isLoading);
  const error = useAlertsStore((s) => s.error);
  const fetchList = useAlertsStore((s) => s.fetchList);
  const fetchUnreadCount = useAlertsStore((s) => s.fetchUnreadCount);
  const markRead = useAlertsStore((s) => s.markRead);
  const markAllRead = useAlertsStore((s) => s.markAllRead);
  const user = useAuthStore((s) => s.user);
  const { exporting, runExport } = usePdfExport();

  useFocusEffect(
    useCallback(() => {
      fetchList();
      fetchUnreadCount();
    }, [fetchList, fetchUnreadCount])
  );

  const renderItem = ({ item, index }: { item: ProcessAlert; index: number }) => (
    <AnimatedReveal delay={Math.min(index * 35, 210)}>
    <Card
      style={[
        styles.card,
        item.leida ? { backgroundColor: theme.colors.surfaceVariant } : null,
      ]}
    >
      <Card.Content>
        <View style={styles.row}>
          <Chip
            compact
            style={item.severidad === "critical" ? styles.chipCrit : styles.chipWarn}
            textStyle={chipLabel}
          >
            {item.severidad === "critical" ? "CRITICO" : "ALERTA"}
          </Chip>
          <Text variant="labelSmall" style={mutedText}>
            {grupoNombre(item)}
          </Text>
        </View>
        <Text variant="bodyMedium" style={[styles.msg, { color: theme.colors.onSurface }]}>
          {item.mensaje}
        </Text>
        <Text variant="bodySmall" style={mutedText}>
          {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""} · {item.tipo}
        </Text>
      </Card.Content>
      {!item.leida ? (
        <Card.Actions>
          <IconButton icon="check" accessibilityLabel="Marcar leida" onPress={() => markRead(item._id)} />
        </Card.Actions>
      ) : null}
    </Card>
    </AnimatedReveal>
  );

  if (isLoading && items.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: layout.backgroundColor }]}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={[styles.toolbar, layout.toolbarPadding]}>
        <Button mode="contained-tonal" onPress={() => markAllRead()} compact>
          Marcar todas leidas
        </Button>
        <Button mode="outlined" onPress={() => fetchList()} compact>
          Actualizar
        </Button>
        <Button
          mode="contained-tonal"
          icon="file-pdf-box"
          loading={exporting}
          compact
          onPress={() =>
            runExport(async () => {
              if (items.length === 0) await fetchList();
              await exportAlertsPdf(useAlertsStore.getState().items, user, false);
            })
          }
        >
          PDF
        </Button>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        refreshing={isLoading}
        onRefresh={() => {
          fetchList();
          fetchUnreadCount();
        }}
        contentContainerStyle={layout.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text variant="bodyLarge" style={bodyStyle}>
              No hay alertas registradas
            </Text>
            <Text variant="bodySmall" style={mutedText}>
              Las alertas se generan al recibir telemetria fuera de calibracion (simulador o Arduino).
            </Text>
          </View>
        }
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { marginBottom: 10, borderRadius: 12 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  chipCrit: { backgroundColor: "#ffcdd2" },
  chipWarn: { backgroundColor: "#ffe0b2" },
  msg: { marginTop: 8 },
  error: { color: brand.critical, paddingHorizontal: 16, paddingTop: 8 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  toolbar: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingTop: 8 },
});
