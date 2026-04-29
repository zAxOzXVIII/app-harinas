import { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  IconButton,
  Text,
} from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { useAlertsStore } from "../store/alerts.store";
import type { ProcessAlert } from "../types/alert";

const grupoNombre = (a: ProcessAlert): string => {
  const g = a.grupoRubroId;
  if (g && typeof g === "object" && "nombre" in g) return g.nombre;
  return "Grupo";
};

export const AlertsListScreen = () => {
  const items = useAlertsStore((s) => s.items);
  const isLoading = useAlertsStore((s) => s.isLoading);
  const error = useAlertsStore((s) => s.error);
  const fetchList = useAlertsStore((s) => s.fetchList);
  const fetchUnreadCount = useAlertsStore((s) => s.fetchUnreadCount);
  const markRead = useAlertsStore((s) => s.markRead);
  const markAllRead = useAlertsStore((s) => s.markAllRead);

  useFocusEffect(
    useCallback(() => {
      fetchList();
      fetchUnreadCount();
    }, [fetchList, fetchUnreadCount])
  );

  const renderItem = ({ item }: { item: ProcessAlert }) => (
    <Card style={[styles.card, item.leida ? styles.read : null]}>
      <Card.Content>
        <View style={styles.row}>
          <Chip
            compact
            style={item.severidad === "critical" ? styles.chipCrit : styles.chipWarn}
            textStyle={styles.chipText}
          >
            {item.severidad === "critical" ? "CRITICO" : "ALERTA"}
          </Chip>
          <Text variant="labelSmall" style={styles.muted}>
            {grupoNombre(item)}
          </Text>
        </View>
        <Text variant="bodyMedium" style={styles.msg}>
          {item.mensaje}
        </Text>
        <Text variant="bodySmall" style={styles.muted}>
          {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""} · {item.tipo}
        </Text>
      </Card.Content>
      {!item.leida ? (
        <Card.Actions>
          <IconButton icon="check" accessibilityLabel="Marcar leida" onPress={() => markRead(item._id)} />
        </Card.Actions>
      ) : null}
    </Card>
  );

  if (isLoading && items.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.toolbar}>
        <Button mode="contained-tonal" onPress={() => markAllRead()} compact>
          Marcar todas leidas
        </Button>
        <Button mode="outlined" onPress={() => fetchList()} compact>
          Actualizar
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
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text variant="bodyLarge">No hay alertas registradas</Text>
            <Text variant="bodySmall" style={styles.muted}>
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
  container: { flex: 1, backgroundColor: "#f4f6f8" },
  list: { padding: 16, paddingBottom: 32 },
  card: { marginBottom: 10, borderRadius: 12 },
  read: { opacity: 0.65 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  chipCrit: { backgroundColor: "#ffcdd2" },
  chipWarn: { backgroundColor: "#ffe0b2" },
  chipText: { fontSize: 11 },
  msg: { marginTop: 8 },
  muted: { opacity: 0.7, marginTop: 4 },
  error: { color: "#c62828", paddingHorizontal: 16, paddingTop: 8 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  toolbar: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 8 },
});
