import { useCallback, useEffect } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  Text,
  useTheme,
} from "react-native-paper";
import { useAuthStore } from "../store/auth.store";
import { usePdfExport } from "../hooks/usePdfExport";
import { exportMuroPdf } from "../pdf/reports";
import { useTelemetryStore } from "../store/telemetry.store";
import { useAlertsStore } from "../store/alerts.store";
import { useGruposStore } from "../store/grupos.store";
import { ChartTrendBlock } from "../components/ChartTrendBlock";
import { AnimatedReveal } from "../components/AnimatedReveal";
import { ScreenHero } from "../components/ScreenHero";
import { useContrastStyles } from "../hooks/useContrastStyles";
import { useScreenLayout } from "../hooks/useScreenLayout";
import { brand } from "../theme";
import type { TelemetryLatestItem } from "../types/telemetry";
import type { ProcessAlert } from "../types/alert";

const grupoNombreTelemetry = (item: TelemetryLatestItem) => item.grupo?.nombre ?? "Grupo";

const grupoNombreAlerta = (a: ProcessAlert): string => {
  const g = a.grupoRubroId;
  if (g && typeof g === "object" && "nombre" in g) return g.nombre;
  return "Grupo";
};

export const MuroGerenteScreen = () => {
  const theme = useTheme();
  const layout = useScreenLayout();
  const { muted: mutedText, body: bodyStyle, chipLabel, chipWarnLabel, chipWarnBg, chipCritBg } =
    useContrastStyles();
  const user = useAuthStore((s) => s.user);
  const { exporting, runExport } = usePdfExport();

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
      contentContainerStyle={layout.scrollContent}
      refreshControl={
        <RefreshControl refreshing={telemetryLoading || alertsLoading} onRefresh={load} />
      }
    >
      <ScreenHero
        roleLabel="Gerente"
        title="Muro de operaciones"
        subtitle="Vision en tiempo real de telemetria y alertas"
      >
        <View style={styles.heroStats}>
          <Chip compact icon="chart-line">{latest.length} grupos con datos</Chip>
          <Chip compact icon="bell-alert" style={{ backgroundColor: theme.colors.errorContainer }}>
            {criticas} criticas
          </Chip>
          <Chip compact icon="bell-outline">{totalAlertas} alertas</Chip>
        </View>
        <Button
          mode="contained-tonal"
          icon="file-pdf-box"
          loading={exporting}
          onPress={() =>
            runExport(async () => {
              await fetchGrupos();
              await fetchLatest();
              const gs = useGruposStore.getState();
              const ts = useTelemetryStore.getState();
              await exportMuroPdf(ts.latest, gs.grupos, gs.humedad, ts.history, user);
            })
          }
          style={styles.pdfBtn}
        >
          Exportar muro (PDF)
        </Button>
      </ScreenHero>

      {telemetryError ? <Text style={styles.error}>{telemetryError}</Text> : null}
      {alertsError ? <Text style={styles.error}>{alertsError}</Text> : null}

      <Text variant="titleLarge" style={[styles.section, { color: theme.colors.primary }]}>
        Ultimas lecturas
      </Text>
      {latest.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium" style={bodyStyle}>
              Sin telemetria aun. Ejecuta `npm run simulate:telemetry` en el backend.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        latest.map((item, idx) => {
          const hist = history[item.grupoRubroId] ?? [];
          const tempSeries = hist.map((h) => h.lecturas.temperatura).reverse();
          const humSeries = hist.map((h) => h.lecturas.humedad).reverse();
          return (
            <AnimatedReveal key={item._id} delay={60 + idx * 40}>
            <Card mode="elevated" style={styles.card}>
              <Card.Content>
                <View style={styles.row}>
                  <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                    {grupoNombreTelemetry(item)}
                  </Text>
                  <Text variant="labelSmall" style={mutedText}>
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </View>

                <View style={styles.metricsRow}>
                  <Chip compact icon="thermometer" textStyle={{ color: theme.colors.onSurfaceVariant }}>
                    {item.lecturas.temperatura} C
                  </Chip>
                  <Chip compact icon="water-percent" textStyle={{ color: theme.colors.onSurfaceVariant }}>
                    {item.lecturas.humedad}%
                  </Chip>
                  {item.lecturas.nivelSecado != null ? (
                    <Chip compact icon="speedometer" textStyle={{ color: theme.colors.onSurfaceVariant }}>
                      {item.lecturas.nivelSecado}%
                    </Chip>
                  ) : null}
                  {item.lecturas.tiempoSecado != null ? (
                    <Chip compact icon="timer-outline" textStyle={{ color: theme.colors.onSurfaceVariant }}>
                      {item.lecturas.tiempoSecado} min
                    </Chip>
                  ) : null}
                </View>

                <ChartTrendBlock
                  label="Temperatura"
                  data={tempSeries}
                  width={layout.chartWidth}
                  color={theme.colors.primary}
                />
                <ChartTrendBlock
                  label="Humedad"
                  data={humSeries}
                  width={layout.chartWidth}
                  color={theme.colors.secondary}
                />

                <Text variant="bodySmall" style={mutedText}>
                  Device: {item.deviceId}
                </Text>
              </Card.Content>
            </Card>
            </AnimatedReveal>
          );
        })
      )}

      <Text variant="titleLarge" style={[styles.section, { color: theme.colors.primary }]}>
        Alertas recientes
      </Text>
      {alerts.slice(0, 15).length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium" style={bodyStyle}>
              Sin alertas. Las alertas aparecen cuando la telemetria sale de rango.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        alerts.slice(0, 15).map((a, idx) => (
          <AnimatedReveal key={a._id} delay={80 + idx * 35}>
          <Card mode="elevated" style={styles.card}>
            <Card.Content>
              <View style={styles.row}>
                <Chip
                  compact
                  style={{
                    backgroundColor:
                      a.severidad === "critical"
                        ? chipCritBg
                        : a.severidad === "info"
                          ? theme.colors.primaryContainer
                          : chipWarnBg,
                  }}
                  textStyle={a.severidad === "critical" ? chipLabel : chipWarnLabel}
                >
                  {a.severidad === "critical"
                    ? "CRITICO"
                    : a.severidad === "info"
                      ? "TAREA OK"
                      : "ALERTA"}
                </Chip>
                <Text variant="labelSmall" style={mutedText}>
                  {grupoNombreAlerta(a)}
                </Text>
              </View>
              <Divider style={styles.divider} />
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {a.mensaje}
              </Text>
              <Text variant="bodySmall" style={mutedText}>
                {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                {a.leida ? "  ·  leida" : ""}
              </Text>
            </Card.Content>
          </Card>
          </AnimatedReveal>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  heroStats: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  pdfBtn: { marginTop: 12, alignSelf: "flex-start" },
  section: { marginTop: 12 },
  card: { borderRadius: 14 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  metricsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chartBlock: { marginTop: 12, gap: 4 },
  divider: { marginVertical: 8 },
  error: { color: brand.critical },
});
