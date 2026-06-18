import { useCallback } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
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
  const { muted: mutedText, body: bodyStyle, chipLabel, chipWarnLabel, chipWarnBg, chipCritBg } =
    useContrastStyles();
  const items = useAlertsStore((s) => s.items);
  const isLoading = useAlertsStore((s) => s.isLoading);
  const error = useAlertsStore((s) => s.error);
  const fetchList = useAlertsStore((s) => s.fetchList);
  const fetchUnreadCount = useAlertsStore((s) => s.fetchUnreadCount);
  const markRead = useAlertsStore((s) => s.markRead);
  const markAllRead = useAlertsStore((s) => s.markAllRead);
  const removeAlert = useAlertsStore((s) => s.removeAlert);
  const removeAllAlerts = useAlertsStore((s) => s.removeAllAlerts);
  const user = useAuthStore((s) => s.user);
  const isGerente = user?.rol === "gerente" || !user?.rol;
  const { exporting, runExport } = usePdfExport();

  useFocusEffect(
    useCallback(() => {
      fetchList();
      fetchUnreadCount();
    }, [fetchList, fetchUnreadCount])
  );

  const confirmRemove = (id: string) => {
    Alert.alert(
      "Eliminar alerta",
      "Se ocultara de la lista. El registro se conserva en el sistema (borrado logico).",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => removeAlert(id) },
      ]
    );
  };

  const confirmRemoveAll = () => {
    if (items.length === 0) return;
    Alert.alert(
      "Limpiar todas las alertas",
      `Se ocultaran ${items.length} alerta(s) de la lista (borrado logico). Solo el gerente puede hacer esto.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar todas",
          style: "destructive",
          onPress: () => removeAllAlerts(),
        },
      ]
    );
  };

  const renderItem = ({ item, index }: { item: ProcessAlert; index: number }) => (
    <AnimatedReveal delay={Math.min(index * 35, 210)}>
      <Card
        style={[
          styles.card,
          { backgroundColor: item.leida ? theme.colors.surfaceVariant : theme.colors.surface },
        ]}
      >
        <Card.Content>
          <View style={styles.row}>
            <Chip
              compact
              style={{
                backgroundColor:
                  item.severidad === "critical"
                    ? chipCritBg
                    : item.severidad === "info"
                      ? theme.colors.primaryContainer
                      : chipWarnBg,
              }}
              textStyle={item.severidad === "critical" ? chipLabel : chipWarnLabel}
            >
              {item.severidad === "critical"
                ? "CRITICO"
                : item.severidad === "info"
                  ? "COMPLETADO"
                  : "ALERTA"}
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
        <Card.Actions>
          {!item.leida ? (
            <IconButton
              icon="check"
              accessibilityLabel="Marcar leida"
              onPress={() => markRead(item._id)}
            />
          ) : null}
          {isGerente ? (
            <IconButton
              icon="delete-outline"
              accessibilityLabel="Eliminar alerta"
              iconColor={theme.colors.error}
              onPress={() => confirmRemove(item._id)}
            />
          ) : null}
        </Card.Actions>
      </Card>
    </AnimatedReveal>
  );

  if (isLoading && items.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: layout.backgroundColor }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: layout.backgroundColor }]}>
      {error ? (
        <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>
      ) : null}
      <View style={[styles.toolbar, layout.toolbarPadding]}>
        <Button mode="contained-tonal" onPress={() => markAllRead()} compact>
          Marcar todas leidas
        </Button>
        {isGerente ? (
          <Button
            mode="outlined"
            icon="delete-sweep"
            textColor={theme.colors.error}
            onPress={confirmRemoveAll}
            compact
            disabled={items.length === 0}
          >
            Limpiar alertas
          </Button>
        ) : null}
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
            <Text variant="bodySmall" style={[mutedText, styles.emptyHint]}>
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
  msg: { marginTop: 8 },
  error: { paddingHorizontal: 16, paddingTop: 8 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyHint: { textAlign: "center", marginTop: 8 },
  toolbar: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingTop: 8 },
});
