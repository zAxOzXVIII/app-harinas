import { useCallback, useEffect } from "react";
import { Dimensions, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Card,
  Chip,
  Divider,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useTelemetryStore } from "../store/telemetry.store";
import { useAlertsStore } from "../store/alerts.store";
import { useGruposStore } from "../store/grupos.store";
import { Sparkline } from "../components/Sparkline";
import { statusColors } from "../theme";
import type { TelemetryLatestItem } from "../types/telemetry";
import type { ProcessAlert } from "../types/alert";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_W = Math.min(SCREEN_W - 80, 360);

const grupoNombreTelemetry = (item: TelemetryLatestItem) => item.grupo?.nombre ?? "Grupo";

const grupoNombreAlerta = (a: ProcessAlert): string => {
  const g = a.grupoRubroId;
  if (g && typeof g === "object" && "nombre" in g) return g.nombre;
  return "Grupo";
};

export const MuroGerenteScreen = () => {
  const theme = useTheme();

  const latest = useTelemetryStore((s) => s.latest);
  const history = useTelemetryStore((s) => s.history);
  const telemetryLoading = useTelemetryStore((s) => s.isLoading);
  const telemetryError = useTelemetryStore((s) => s.error);
  const fetchLatest = useTelemetryStore((s) => s.fetchLatest);
  const fetchHistory = useTelemetryStore((s) => s.fetchHistory);

  const grupos = useGruposStore((s) => s.grupos);
  const fetchGrupos = useGruposStore((s) => s.fetchAll);

  const alerts = useAlertsStore((s) => s.items);
  const alertsLoading = useAlertsStore((s) => s.isLoading);
  const alertsError = useAlertsStore((s) => s.error);
  const fetchList = useAlertsStore((s) => s.fetchList);
  const fetchUnreadCount = useAlertsStore((s) => s.fetchUnreadCount);

  const load = useCallback(() => {
    fetchGrupos();
    fetchLatest();
    fetchList();
    fetchUnreadCount();
  }, [fetchGrupos, fetchLatest, fetchList, fetchUnreadCount]);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    grupos.forEach((g) => {
      if (!history[g._id]) fetchHistory(g._id, 30);
    });
  }, [grupos, history, fetchHistory]);

  const loading = telemetryLoading && latest.length === 0 && alertsLoading && alerts.length === 0;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const totalAlertas = alerts.length;
  const criticas = alerts.filter((a) => a.severidad === "critical").length;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={telemetryLoading || alertsLoading} onRefresh={load} />
      }
    >
      <Surface elevation={1} style={[styles.hero, { backgroundColor: theme.colors.surface }]}>
        <Text variant="labelLarge" style={styles.muted}>Gerente</Text>
        <Text variant="headlineSmall">Muro de operaciones</Text>
        <View style={styles.heroStats}>
          <Chip compact icon="chart-line">{latest.length} grupos con datos</Chip>
          <Chip compact icon="bell-alert" style={{ backgroundColor: theme.colors.errorContainer }}>
            {criticas} criticas
          </Chip>
          <Chip compact icon="bell-outline">{totalAlertas} alertas</Chip>
        </View>
      </Surface>

      {telemetryError ? <Text style={styles.error}>{telemetryError}</Text> : null}
      {alertsError ? <Text style={styles.error}>{alertsError}</Text> : null}

      <Text variant="titleLarge" style={styles.section}>Ultimas lecturas</Text>
      {latest.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium">
              Sin telemetria aun. Ejecuta `npm run simulate:telemetry` en el backend.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        latest.map((item) => {
          const hist = history[item.grupoRubroId] ?? [];
          const tempSeries = hist.map((h) => h.lecturas.temperatura).reverse();
          const humSeries = hist.map((h) => h.lecturas.humedad).reverse();
          return (
            <Card key={item._id} mode="elevated" style={styles.card}>
              <Card.Content>
                <View style={styles.row}>
                  <Text variant="titleMedium">{grupoNombreTelemetry(item)}</Text>
                  <Text variant="labelSmall" style={styles.muted}>
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.metricsRow}>
                  <Chip compact icon="thermometer">{item.lecturas.temperatura} C</Chip>
                  <Chip compact icon="water-percent">{item.lecturas.humedad}%</Chip>
                  <Chip compact icon="speedometer">{item.lecturas.nivelSecado}%</Chip>
                  <Chip compact icon="timer-outline">{item.lecturas.tiempoSecado} min</Chip>
                </View>

                {tempSeries.length >= 2 ? (
                  <View style={styles.chartBlock}>
                    <Text variant="labelSmall" style={styles.muted}>Temperatura</Text>
                    <Sparkline
                      data={tempSeries}
                      width={CHART_W}
                      height={50}
                      color={statusColors.warning}
                    />
                  </View>
                ) : null}

                {humSeries.length >= 2 ? (
                  <View style={styles.chartBlock}>
                    <Text variant="labelSmall" style={styles.muted}>Humedad</Text>
                    <Sparkline
                      data={humSeries}
                      width={CHART_W}
                      height={50}
                      color={theme.colors.secondary}
                    />
                  </View>
                ) : null}

                <Text variant="bodySmall" style={styles.muted}>
                  Device: {item.deviceId}
                </Text>
              </Card.Content>
            </Card>
          );
        })
      )}

      <Text variant="titleLarge" style={styles.section}>Alertas recientes</Text>
      {alerts.slice(0, 15).length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium">
              Sin alertas. Las alertas aparecen cuando la telemetria sale de rango.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        alerts.slice(0, 15).map((a) => (
          <Card key={a._id} mode="elevated" style={styles.card}>
            <Card.Content>
              <View style={styles.row}>
                <Chip
                  compact
                  style={{
                    backgroundColor:
                      a.severidad === "critical"
                        ? theme.colors.errorContainer
                        : "rgba(239,108,0,0.15)",
                  }}
                >
                  {a.severidad === "critical" ? "CRITICO" : "ALERTA"}
                </Chip>
                <Text variant="labelSmall" style={styles.muted}>
                  {grupoNombreAlerta(a)}
                </Text>
              </View>
              <Divider style={styles.divider} />
              <Text variant="bodyMedium">{a.mensaje}</Text>
              <Text variant="bodySmall" style={styles.muted}>
                {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                {a.leida ? "  ·  leida" : ""}
              </Text>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  hero: { padding: 16, borderRadius: 16 },
  heroStats: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  muted: { opacity: 0.7 },
  section: { marginTop: 12 },
  card: { borderRadius: 14 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  metricsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chartBlock: { marginTop: 12, gap: 4 },
  divider: { marginVertical: 8 },
  error: { color: "#c62828" },
});
