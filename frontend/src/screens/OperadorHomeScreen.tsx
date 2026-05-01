import { useCallback, useEffect, useMemo } from "react";
import { Dimensions, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Badge,
  Button,
  Card,
  Chip,
  Divider,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { OperadorStackParamList } from "../navigation/types";
import { useGruposStore } from "../store/grupos.store";
import { useAuthStore } from "../store/auth.store";
import { useTelemetryStore } from "../store/telemetry.store";
import { useAlertsStore } from "../store/alerts.store";
import { Sparkline } from "../components/Sparkline";
import { MetricGauge } from "../components/MetricGauge";
import { statusColors } from "../theme";

type Nav = NativeStackNavigationProp<OperadorStackParamList>;

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_W = Math.min(SCREEN_W - 64, 360);

export const OperadorHomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const grupos = useGruposStore((s) => s.grupos);
  const humedad = useGruposStore((s) => s.humedad);
  const isLoading = useGruposStore((s) => s.isLoading);
  const error = useGruposStore((s) => s.error);
  const fetchAll = useGruposStore((s) => s.fetchAll);

  const latest = useTelemetryStore((s) => s.latest);
  const history = useTelemetryStore((s) => s.history);
  const telemetryError = useTelemetryStore((s) => s.error);
  const fetchLatest = useTelemetryStore((s) => s.fetchLatest);
  const fetchHistory = useTelemetryStore((s) => s.fetchHistory);

  const unreadCount = useAlertsStore((s) => s.unreadCount);
  const fetchUnreadCount = useAlertsStore((s) => s.fetchUnreadCount);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
      fetchLatest();
      fetchUnreadCount();
      const id = setInterval(() => {
        fetchLatest();
        fetchUnreadCount();
      }, 10000);
      return () => clearInterval(id);
    }, [fetchAll, fetchLatest, fetchUnreadCount])
  );

  useEffect(() => {
    grupos.forEach((g) => {
      if (!history[g._id]) fetchHistory(g._id, 30);
    });
  }, [grupos, history, fetchHistory]);

  const latestByGroup = useMemo(() => {
    const map = new Map<string, (typeof latest)[number]>();
    latest.forEach((item) => map.set(item.grupoRubroId, item));
    return map;
  }, [latest]);

  const onRefresh = () => {
    fetchAll();
    fetchLatest();
    fetchUnreadCount();
    grupos.forEach((g) => fetchHistory(g._id, 30));
  };

  if (isLoading && grupos.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
    >
      <Surface elevation={1} style={[styles.hero, { backgroundColor: theme.colors.surface }]}>
        <View style={{ flex: 1 }}>
          <Text variant="labelLarge" style={styles.muted}>Operador</Text>
          <Text variant="headlineSmall">Hola, {user?.nombre ?? "Operador"}</Text>
          <Text variant="bodySmall" style={styles.muted}>
            Monitoreo de proceso por grupo de rubro y alertas de calibracion.
          </Text>
        </View>
        <View>
          <Button
            mode="contained-tonal"
            onPress={() => navigation.navigate("AlertsList")}
            icon="bell-outline"
          >
            Alertas
          </Button>
          {unreadCount > 0 ? (
            <Badge style={styles.badge}>{unreadCount}</Badge>
          ) : null}
        </View>
      </Surface>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {telemetryError ? <Text style={styles.error}>{telemetryError}</Text> : null}

      {humedad ? (
        <Card mode="elevated" style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleMedium">Humedad global</Text>
              <Chip compact icon="water-percent">
                {humedad.unidad ?? "%RH"}
              </Chip>
            </View>
            <View style={styles.gaugeBlock}>
              <MetricGauge
                label="Lectura promedio"
                value={
                  latest.length > 0
                    ? latest.reduce((a, b) => a + b.lecturas.humedad, 0) / latest.length
                    : (humedad.min + humedad.max) / 2
                }
                unit="%"
                min={humedad.min}
                max={humedad.max}
                criticoMin={humedad.criticoMin}
                criticoMax={humedad.criticoMax}
                rangeMin={0}
                rangeMax={100}
              />
            </View>
          </Card.Content>
        </Card>
      ) : null}

      <Text variant="titleLarge" style={styles.sectionTitle}>
        Grupos calibrados
      </Text>

      {grupos.length === 0 ? (
        <Card>
          <Card.Content>
            <Text variant="bodyMedium">No hay grupos disponibles.</Text>
          </Card.Content>
        </Card>
      ) : (
        grupos.map((grupo) => {
          const last = latestByGroup.get(grupo._id);
          const hist = history[grupo._id] ?? [];
          const tempSeries = hist.map((h) => h.lecturas.temperatura).reverse();
          const humSeries = hist.map((h) => h.lecturas.humedad).reverse();

          const t = grupo.calibracion.temperatura;
          const tValue = last?.lecturas.temperatura ?? (t.min + t.max) / 2;

          let statusColor = statusColors.ok;
          if (last && humedad) {
            const l = last.lecturas;
            const isCrit =
              (t.criticoMin !== undefined && l.temperatura < t.criticoMin) ||
              (t.criticoMax !== undefined && l.temperatura > t.criticoMax);
            const out =
              l.temperatura < t.min ||
              l.temperatura > t.max ||
              l.humedad < humedad.min ||
              l.humedad > humedad.max;
            if (isCrit) statusColor = statusColors.critical;
            else if (out) statusColor = statusColors.warning;
          }

          return (
            <Card key={grupo._id} mode="elevated" style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium">{grupo.nombre}</Text>
                    <View style={styles.chipsRow}>
                      {grupo.items.map((it) => (
                        <Chip key={it} compact style={styles.chipItem}>{it}</Chip>
                      ))}
                    </View>
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                </View>

                <Divider style={styles.divider} />

                <MetricGauge
                  label={`Temperatura (${t.unidad ?? "C"})`}
                  value={tValue}
                  unit={t.unidad ?? "C"}
                  min={t.min}
                  max={t.max}
                  criticoMin={t.criticoMin}
                  criticoMax={t.criticoMax}
                />

                {humedad && last ? (
                  <View style={{ marginTop: 12 }}>
                    <MetricGauge
                      label="Humedad (%)"
                      value={last.lecturas.humedad}
                      unit="%"
                      min={humedad.min}
                      max={humedad.max}
                      criticoMin={humedad.criticoMin}
                      criticoMax={humedad.criticoMax}
                      rangeMin={0}
                      rangeMax={100}
                    />
                  </View>
                ) : null}

                {tempSeries.length >= 2 ? (
                  <View style={styles.chartBlock}>
                    <Text variant="labelSmall" style={styles.muted}>
                      Tendencia temperatura ({tempSeries.length} lecturas)
                    </Text>
                    <Sparkline
                      data={tempSeries}
                      width={CHART_W}
                      height={56}
                      color={statusColors.warning}
                    />
                  </View>
                ) : null}

                {humSeries.length >= 2 ? (
                  <View style={styles.chartBlock}>
                    <Text variant="labelSmall" style={styles.muted}>
                      Tendencia humedad ({humSeries.length} lecturas)
                    </Text>
                    <Sparkline
                      data={humSeries}
                      width={CHART_W}
                      height={56}
                      color={theme.colors.secondary}
                    />
                  </View>
                ) : null}

                {last ? (
                  <View style={styles.lastRow}>
                    <Chip compact icon="speedometer">
                      Secado {last.lecturas.nivelSecado}%
                    </Chip>
                    <Chip compact icon="timer-outline">
                      {last.lecturas.tiempoSecado} min
                    </Chip>
                    <Chip compact icon="clock-outline">
                      {new Date(last.timestamp).toLocaleTimeString()}
                    </Chip>
                  </View>
                ) : (
                  <Text variant="bodySmall" style={styles.muted}>
                    Sin telemetria todavia para este grupo.
                  </Text>
                )}
              </Card.Content>
            </Card>
          );
        })
      )}

      <Button mode="outlined" onPress={logout} style={styles.logoutBtn}>
        Cerrar sesion
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
  },
  badge: { position: "absolute", top: -6, right: -6 },
  card: { borderRadius: 14 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  chipItem: {},
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  divider: { marginVertical: 12 },
  gaugeBlock: { marginTop: 8 },
  chartBlock: { marginTop: 12, gap: 4 },
  lastRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  sectionTitle: { marginTop: 6 },
  muted: { opacity: 0.7 },
  error: { color: "#c62828" },
  logoutBtn: { marginTop: 16 },
});
