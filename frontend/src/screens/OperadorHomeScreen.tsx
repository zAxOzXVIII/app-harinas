import { useCallback, useMemo } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { OperadorStackParamList } from "../navigation/types";
import { useGruposStore } from "../store/grupos.store";
import { useAuthStore } from "../store/auth.store";
import { GrupoRubroCard } from "../components/GrupoRubroCard";
import { useTelemetryStore } from "../store/telemetry.store";
import { useAlertsStore } from "../store/alerts.store";

type Nav = NativeStackNavigationProp<OperadorStackParamList>;

export const OperadorHomeScreen = () => {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const grupos = useGruposStore((s) => s.grupos);
  const humedad = useGruposStore((s) => s.humedad);
  const isLoading = useGruposStore((s) => s.isLoading);
  const error = useGruposStore((s) => s.error);
  const fetchAll = useGruposStore((s) => s.fetchAll);
  const latest = useTelemetryStore((s) => s.latest);
  const telemetryError = useTelemetryStore((s) => s.error);
  const fetchLatest = useTelemetryStore((s) => s.fetchLatest);
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

  const latestByGroup = useMemo(() => {
    const map = new Map<string, (typeof latest)[number]>();
    latest.forEach((item) => map.set(item.grupoRubroId, item));
    return map;
  }, [latest]);

  const getStatus = (grupoId: string) => {
    const event = latestByGroup.get(grupoId);
    if (!event || !humedad) return null;
    const grupo = grupos.find((g) => g._id === grupoId);
    if (!grupo) return null;

    const t = grupo.calibracion.temperatura;
    const ns = grupo.calibracion.nivelSecado;
    const ts = grupo.calibracion.tiempoSecado.estimadoMin;
    const l = event.lecturas;

    const hasCriticalTemp =
      (t.criticoMin !== undefined && l.temperatura < t.criticoMin) ||
      (t.criticoMax !== undefined && l.temperatura > t.criticoMax);
    const hasOutOfRange =
      l.temperatura < t.min ||
      l.temperatura > t.max ||
      l.nivelSecado < ns.min ||
      l.nivelSecado > ns.max ||
      l.humedad < humedad.min ||
      l.humedad > humedad.max ||
      l.tiempoSecado > ts;

    if (hasCriticalTemp) return { label: "CRITICO", color: "#c62828" };
    if (hasOutOfRange) return { label: "ALERTA", color: "#ef6c00" };
    return { label: "OK", color: "#2e7d32" };
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
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => {
            fetchAll();
            fetchLatest();
            fetchUnreadCount();
          }}
        />
      }
    >
      <Text variant="headlineSmall">Bienvenido, {user?.nombre ?? "Operador"}</Text>
      <Text variant="bodyMedium" style={styles.muted}>
        Umbrales calibrados, ultima telemetria por grupo (polling) y alertas persistidas en el
        servidor cuando una lectura sale de rango.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {telemetryError ? <Text style={styles.error}>{telemetryError}</Text> : null}

      <View style={styles.alertRow}>
        <Button mode="contained-tonal" onPress={() => navigation.navigate("AlertsList")}>
          Ver alertas de proceso
        </Button>
        {unreadCount > 0 ? (
          <Text variant="labelLarge" style={styles.badge}>
            {unreadCount} sin leer
          </Text>
        ) : null}
      </View>

      {humedad ? (
        <Card style={styles.humedadCard}>
          <Card.Content>
            <Text variant="titleMedium">Humedad global</Text>
            <Text variant="displaySmall" style={styles.humedadValue}>
              {humedad.min}–{humedad.max} {humedad.unidad ?? "%RH"}
            </Text>
            {humedad.criticoMin !== undefined || humedad.criticoMax !== undefined ? (
              <Text variant="bodySmall" style={styles.muted}>
                Critico: {humedad.criticoMin ?? "-"} / {humedad.criticoMax ?? "-"}
              </Text>
            ) : null}
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
          const status = getStatus(grupo._id);
          return (
            <View key={grupo._id}>
              <GrupoRubroCard grupo={grupo} humedad={humedad} />
              <Card style={styles.telemetryCard}>
                <Card.Content>
                  <Text variant="titleSmall">Ultima lectura</Text>
                  {!last ? (
                    <Text variant="bodySmall" style={styles.muted}>
                      Sin datos recientes
                    </Text>
                  ) : (
                    <>
                      <Text variant="bodyMedium">
                        Temp: {last.lecturas.temperatura} C | Hum: {last.lecturas.humedad} %RH
                      </Text>
                      <Text variant="bodyMedium">
                        Secado: {last.lecturas.nivelSecado} % | Tiempo: {last.lecturas.tiempoSecado} min
                      </Text>
                      <Text variant="bodySmall" style={styles.muted}>
                        Device: {last.deviceId} | {new Date(last.timestamp).toLocaleString()}
                      </Text>
                      {status ? (
                        <Text variant="labelLarge" style={{ color: status.color, marginTop: 4 }}>
                          Estado: {status.label}
                        </Text>
                      ) : null}
                    </>
                  )}
                </Card.Content>
              </Card>
            </View>
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
  container: { flex: 1, backgroundColor: "#f4f6f8" },
  content: { padding: 16, paddingBottom: 32, gap: 4 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "#c62828", marginBottom: 8 },
  humedadCard: { borderRadius: 12, marginBottom: 12, backgroundColor: "#e8f5e9" },
  humedadValue: { color: "#2e7d32", marginTop: 8 },
  sectionTitle: { marginTop: 8, marginBottom: 8 },
  muted: { opacity: 0.75, marginTop: 2 },
  logoutBtn: { marginTop: 16 },
  telemetryCard: { marginTop: -4, marginBottom: 12, borderRadius: 12, backgroundColor: "#fff8e1" },
  alertRow: { flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 },
  badge: { color: "#c62828" },
});
