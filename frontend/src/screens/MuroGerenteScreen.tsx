import { useCallback, useEffect } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Card, Chip, Text } from "react-native-paper";
import { useTelemetryStore } from "../store/telemetry.store";
import { useAlertsStore } from "../store/alerts.store";
import type { TelemetryLatestItem } from "../types/telemetry";
import type { ProcessAlert } from "../types/alert";

const grupoNombreTelemetry = (item: TelemetryLatestItem) => item.grupo?.nombre ?? "Grupo";

const grupoNombreAlerta = (a: ProcessAlert): string => {
  const g = a.grupoRubroId;
  if (g && typeof g === "object" && "nombre" in g) return g.nombre;
  return "Grupo";
};

export const MuroGerenteScreen = () => {
  const latest = useTelemetryStore((s) => s.latest);
  const telemetryLoading = useTelemetryStore((s) => s.isLoading);
  const telemetryError = useTelemetryStore((s) => s.error);
  const fetchLatest = useTelemetryStore((s) => s.fetchLatest);

  const alerts = useAlertsStore((s) => s.items);
  const alertsLoading = useAlertsStore((s) => s.isLoading);
  const alertsError = useAlertsStore((s) => s.error);
  const fetchList = useAlertsStore((s) => s.fetchList);
  const fetchUnreadCount = useAlertsStore((s) => s.fetchUnreadCount);

  const load = useCallback(() => {
    fetchLatest();
    fetchList();
    fetchUnreadCount();
  }, [fetchLatest, fetchList, fetchUnreadCount]);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  const loading = telemetryLoading && latest.length === 0 && alertsLoading && alerts.length === 0;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={telemetryLoading || alertsLoading}
          onRefresh={load}
        />
      }
    >
      <Text variant="headlineSmall">Muro Gerente</Text>
      <Text variant="bodyMedium" style={styles.muted}>
        Resumen de ultimas lecturas por grupo y alertas generadas automaticamente al superar
        umbrales de calibracion.
      </Text>

      {telemetryError ? <Text style={styles.error}>{telemetryError}</Text> : null}
      {alertsError ? <Text style={styles.error}>{alertsError}</Text> : null}

      <Text variant="titleLarge" style={styles.section}>
        Ultimas lecturas
      </Text>
      {latest.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium">Sin telemetria aun. Ejecuta `npm run simulate:telemetry` en el backend.</Text>
          </Card.Content>
        </Card>
      ) : (
        latest.map((item) => (
          <Card key={item._id} style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{grupoNombreTelemetry(item)}</Text>
              <Text variant="bodyMedium">
                T {item.lecturas.temperatura} C · HR {item.lecturas.humedad}% · Secado{" "}
                {item.lecturas.nivelSecado}% · Tiempo {item.lecturas.tiempoSecado} min
              </Text>
              <Text variant="bodySmall" style={styles.muted}>
                {item.deviceId} · {new Date(item.timestamp).toLocaleString()}
              </Text>
            </Card.Content>
          </Card>
        ))
      )}

      <Text variant="titleLarge" style={styles.section}>
        Alertas recientes
      </Text>
      {alerts.slice(0, 15).length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium">Sin alertas. Las alertas aparecen cuando la telemetria sale de rango.</Text>
          </Card.Content>
        </Card>
      ) : (
        alerts.slice(0, 15).map((a) => (
          <Card key={a._id} style={styles.card}>
            <Card.Content>
              <View style={styles.row}>
                <Chip
                  compact
                  style={a.severidad === "critical" ? styles.chipCrit : styles.chipWarn}
                >
                  {a.severidad === "critical" ? "CRITICO" : "ALERTA"}
                </Chip>
                <Text variant="labelSmall">{grupoNombreAlerta(a)}</Text>
              </View>
              <Text variant="bodyMedium" style={styles.msg}>
                {a.mensaje}
              </Text>
              <Text variant="bodySmall" style={styles.muted}>
                {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                {a.leida ? " · leida" : ""}
              </Text>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8" },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  muted: { opacity: 0.75, marginTop: 4 },
  section: { marginTop: 16, marginBottom: 8 },
  card: { marginBottom: 10, borderRadius: 12 },
  error: { color: "#c62828", marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  chipCrit: { backgroundColor: "#ffcdd2" },
  chipWarn: { backgroundColor: "#ffe0b2" },
  msg: { marginTop: 8 },
});
