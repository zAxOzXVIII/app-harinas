import { useCallback, useEffect, useMemo } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Badge,
  Button,
  Card,
  Chip,
  Divider,
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
import { useProcesoSecadoStore } from "../store/procesoSecado.store";
import { ChartTrendBlock } from "../components/ChartTrendBlock";
import { MetricGauge } from "../components/MetricGauge";
import { AnimatedReveal } from "../components/AnimatedReveal";
import { IniciarSecadoButton, SecadoTimer } from "../components/SecadoTimer";
import { GrupoSecadoAlerts } from "../components/GrupoSecadoAlerts";
import { useScreenLayout } from "../hooks/useScreenLayout";
import { useContrastStyles } from "../hooks/useContrastStyles";
import { brand, statusColors } from "../theme";
import { ScreenHero } from "../components/ScreenHero";
import type { GrupoRubro } from "../types/grupoRubro";
import type { ProcesoSecado } from "../types/procesoSecado";
import { apiErrorMessage } from "../utils/apiError";

type Nav = NativeStackNavigationProp<OperadorStackParamList>;

const uniqueItems = (items: string[]): string[] => [...new Set(items.filter(Boolean))];

const getProcesoForGrupo = (
  grupoId: string,
  byGrupoId: Record<string, ProcesoSecado | null>
): ProcesoSecado | null | undefined => byGrupoId[grupoId];

export const OperadorHomeScreen = () => {
  const theme = useTheme();
  const layout = useScreenLayout();
  const { muted: mutedText, title: titleStyle, body: bodyStyle } = useContrastStyles();
  const chipText = { color: theme.colors.onSurfaceVariant, fontSize: 12 };
  const navigation = useNavigation<Nav>();
  const logout = useAuthStore((s) => s.logout);
  const rol = useAuthStore((s) => s.user?.rol);
  const showLogout = rol === "operador";

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

  const byGrupoId = useProcesoSecadoStore((s) => s.byGrupoId);
  const isMutatingSecado = useProcesoSecadoStore((s) => s.isMutating);
  const secadoError = useProcesoSecadoStore((s) => s.error);
  const fetchActivos = useProcesoSecadoStore((s) => s.fetchActivos);
  const fetchByGrupo = useProcesoSecadoStore((s) => s.fetchByGrupo);
  const iniciarSecado = useProcesoSecadoStore((s) => s.iniciarSecado);
  const completarSecado = useProcesoSecadoStore((s) => s.completarSecado);
  const marcarListo = useProcesoSecadoStore((s) => s.marcarListo);
  const clearSecadoError = useProcesoSecadoStore((s) => s.clearError);
  const activosSecado = useProcesoSecadoStore((s) => s.activos);

  const refreshOperador = useCallback(() => {
    fetchAll({ activosOnly: true, soloHarinas: true });
    fetchLatest();
    fetchUnreadCount();
    fetchActivos();
  }, [fetchAll, fetchLatest, fetchUnreadCount, fetchActivos]);

  useFocusEffect(
    useCallback(() => {
      refreshOperador();
      const pollMs = activosSecado.length > 0 ? 10000 : 30000;
      const id = setInterval(() => {
        fetchLatest();
        fetchUnreadCount();
        fetchActivos();
      }, pollMs);
      return () => clearInterval(id);
    }, [refreshOperador, fetchLatest, fetchUnreadCount, fetchActivos, activosSecado.length])
  );

  useEffect(() => {
    grupos.forEach((g) => {
      if (!history[g._id]) fetchHistory(g._id, 30);
      if (byGrupoId[g._id] === undefined) fetchByGrupo(g._id);
    });
    latest.forEach((item) => {
      if (!history[item.grupoRubroId]) fetchHistory(item.grupoRubroId, 30);
    });
  }, [grupos, latest, history, fetchHistory, byGrupoId, fetchByGrupo]);

  const latestByGroup = useMemo(() => {
    const map = new Map<string, (typeof latest)[number]>();
    latest.forEach((item) => map.set(item.grupoRubroId, item));
    return map;
  }, [latest]);

  const plantLatest = useMemo(() => {
    if (latest.length === 0) return null;
    return latest.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
  }, [latest]);

  /** Una sola línea de trabajo: secado activo, o pendiente de ✓, o el más antiguo. */
  const loteActual = useMemo(() => {
    if (grupos.length === 0) return null;
    const enSecado = grupos.find((g) => byGrupoId[g._id]?.estado === "en_secado");
    if (enSecado) return enSecado;
    const pendienteListo = grupos.find((g) => {
      const p = byGrupoId[g._id];
      return p?.estado === "revisado_empaquetado" && !p.confirmadoListoPorOperador;
    });
    if (pendienteListo) return pendienteListo;
    return grupos[0];
  }, [grupos, byGrupoId]);

  const lotesEnEspera = Math.max(0, grupos.length - (loteActual ? 1 : 0));

  const onRefresh = () => {
    refreshOperador();
    if (loteActual) fetchHistory(loteActual._id, 30);
  };

  const handleIniciarSecado = async (grupo: GrupoRubro) => {
    clearSecadoError();
    try {
      await iniciarSecado(grupo._id);
      await Promise.all([
        fetchLatest(),
        fetchHistory(grupo._id, 30),
        fetchActivos(),
        fetchByGrupo(grupo._id),
      ]);
    } catch (error) {
      const actual = await fetchByGrupo(grupo._id);
      if (actual?.estado === "en_secado") {
        await Promise.all([fetchLatest(), fetchHistory(grupo._id, 30), fetchActivos()]);
        return;
      }
      Alert.alert(
        "No se pudo iniciar",
        apiErrorMessage(error, "El lote puede estar cerrado o pendiente de archivo.")
      );
    }
  };

  const showCierreDialog = (proceso: ProcesoSecado | null) => {
    if (!proceso?.resultado) return;
    if (proceso.resultado === "listo") {
      Alert.alert(
        "Producto listo",
        proceso.descripcionCierre ?? "Secado completado sin alertas pendientes."
      );
    } else {
      Alert.alert(
        "Producto poco óptimo",
        proceso.descripcionCierre ?? "Revisar incidencias del proceso."
      );
    }
  };

  const handleCierreGrupo = useCallback(
    async (grupoId: string) => {
      const p = await fetchByGrupo(grupoId);
      await fetchActivos();
      await fetchAll({ activosOnly: true, soloHarinas: true });
      await fetchUnreadCount();
      if (p?.estado === "revisado_empaquetado") {
        showCierreDialog(p);
      }
    },
    [fetchByGrupo, fetchActivos, fetchAll, fetchUnreadCount]
  );

  const handleFinalizarSecado = (grupo: GrupoRubro, procesoId: string) => {
    Alert.alert("Finalizar secado", "¿Confirmas cierre del tiempo de secado?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Finalizar",
        onPress: async () => {
          try {
            const p = await completarSecado(procesoId, grupo._id);
            showCierreDialog(p);
            await fetchAll({ activosOnly: true, soloHarinas: true });
            await fetchUnreadCount();
          } catch {
            Alert.alert("Error", "No se pudo finalizar el secado.");
          }
        },
      },
    ]);
  };

  const handleMarcarListo = (grupo: GrupoRubro, procesoId: string) => {
    Alert.alert(
      "Marcar como listo",
      "¿Confirmas que el producto está listo para empaquetar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Marcar listo",
          onPress: async () => {
            try {
              await marcarListo(procesoId, grupo._id);
              Alert.alert("Listo", "Lote marcado. El Admin podrá archivarlo desde su panel.");
              await fetchAll({ activosOnly: true, soloHarinas: true });
              await fetchByGrupo(grupo._id);
            } catch {
              Alert.alert("Error", "No se pudo marcar el lote como listo.");
            }
          },
        },
      ]
    );
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
      contentContainerStyle={layout.scrollContent}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
    >
      <ScreenHero
        roleLabel="Operador"
        title="Operación de secado"
        subtitle="Inicia el secado del lote del Admin y monitorea temperatura y humedad"
      >
        <View style={styles.alertBtnWrap}>
          <Button
            mode="contained-tonal"
            onPress={() => navigation.navigate("AlertsList")}
            icon="bell-outline"
            style={styles.alertBtn}
          >
            Alertas{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </Button>
          {unreadCount > 0 ? (
            <Badge style={styles.badge}>{unreadCount}</Badge>
          ) : null}
        </View>
      </ScreenHero>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {secadoError ? <Text style={styles.error}>{secadoError}</Text> : null}
      {telemetryError ? <Text style={styles.error}>{telemetryError}</Text> : null}

      {humedad ? (
        <AnimatedReveal delay={50}>
          <Card mode="elevated" style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  Humedad global
                </Text>
                <Chip compact icon="water-percent" textStyle={chipText}>
                  {humedad.unidad ?? "%RH"}
                </Chip>
              </View>
              <View style={styles.gaugeBlock}>
                <MetricGauge
                  label="Lectura promedio"
                  value={
                    latest.length > 0
                      ? latest.reduce((a, b) => a + b.lecturas.humedad, 0) / latest.length
                      : null
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
        </AnimatedReveal>
      ) : null}

      <Text variant="titleLarge" style={[styles.sectionTitle, titleStyle]}>
        Lote a secar
      </Text>
      <Text variant="bodySmall" style={mutedText}>
        Producto registrado por el Admin. Tú solo inicias, finalizas o marcas listo.
      </Text>
      {lotesEnEspera > 0 ? (
        <Text variant="bodySmall" style={[mutedText, { marginBottom: 8 }]}>
          {lotesEnEspera} lote{lotesEnEspera === 1 ? "" : "s"} más cuando termines este.
        </Text>
      ) : null}

      {!loteActual ? (
        <Card style={{ backgroundColor: theme.colors.surface }}>
          <Card.Content>
            <Text variant="bodyMedium" style={bodyStyle}>
              No hay lotes pendientes. El Admin debe registrar una harina.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        (() => {
          const grupo = loteActual;
          const idx = 0;
          const last = latestByGroup.get(grupo._id) ?? plantLatest;
          const hist = history[grupo._id]?.length
            ? history[grupo._id]
            : plantLatest
              ? (history[plantLatest.grupoRubroId] ?? [])
              : [];
          const tempSeries = hist.map((h) => h.lecturas.temperatura).reverse();
          const humSeries = hist.map((h) => h.lecturas.humedad).reverse();
          const chips = uniqueItems(grupo.items);

          const t = grupo.calibracion.temperatura;
          const tValue = last?.lecturas.temperatura ?? null;
          const proceso = getProcesoForGrupo(grupo._id, byGrupoId);
          const procesoCargado = proceso !== undefined;
          const enSecado = proceso?.estado === "en_secado";
          const lotePendienteListo =
            proceso?.estado === "revisado_empaquetado" && !proceso.confirmadoListoPorOperador;
          const loteEsperandoArchivo =
            proceso?.estado === "revisado_empaquetado" && Boolean(proceso.confirmadoListoPorOperador);
          const puedeIniciarSecado =
            procesoCargado &&
            !enSecado &&
            !lotePendienteListo &&
            !loteEsperandoArchivo &&
            (!proceso || proceso.estado === "archivado");
          const tiempoEst = grupo.calibracion.tiempoSecado?.estimadoMin ?? 0;

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
            <AnimatedReveal key={grupo._id} delay={90 + idx * 35}>
              <Card mode="elevated" style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                  {grupo.nombre}
                </Text>
                      <View style={styles.chipsRow}>
                        {chips.map((it) => (
                          <Chip
                            key={it}
                            compact
                            style={[styles.chipItem, { backgroundColor: theme.colors.secondaryContainer }]}
                            textStyle={{ color: theme.colors.onSecondaryContainer, fontSize: 12 }}
                          >
                            {it}
                          </Chip>
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

                {humedad ? (
                  <View style={{ marginTop: 12 }}>
                    <MetricGauge
                      label="Humedad (%)"
                      value={last?.lecturas.humedad ?? null}
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

                <ChartTrendBlock
                  label="Tendencia temperatura"
                  data={tempSeries}
                  width={layout.chartWidth}
                  color={theme.colors.primary}
                  emptyMessage="Esperando lecturas del sensor…"
                />
                <ChartTrendBlock
                  label="Tendencia humedad"
                  data={humSeries}
                  width={layout.chartWidth}
                  color={theme.colors.secondary}
                  emptyMessage="Esperando lecturas del sensor…"
                />

                {last ? (
                  <View style={styles.lastRow}>
                    {last.lecturas.nivelSecado != null ? (
                      <Chip compact icon="speedometer" textStyle={chipText}>
                        Secado {last.lecturas.nivelSecado}%
                      </Chip>
                    ) : null}
                    {last.lecturas.tiempoSecado != null ? (
                      <Chip compact icon="timer-outline" textStyle={chipText}>
                        Sensor {last.lecturas.tiempoSecado} min
                      </Chip>
                    ) : null}
                    <Chip compact icon="clock-outline" textStyle={chipText}>
                      {new Date(last.timestamp).toLocaleTimeString()}
                    </Chip>
                  </View>
                ) : (
                  <Text variant="bodySmall" style={mutedText}>
                    Sin lecturas aún. La laptop debe enviar sensores al servidor.
                  </Text>
                )}

                {enSecado && proceso ? (
                  <>
                    <GrupoSecadoAlerts
                      grupoRubroId={grupo._id}
                      procesoSecadoId={proceso._id}
                      activo={enSecado}
                      onAtendida={fetchUnreadCount}
                    />
                    <SecadoTimer
                      iniciadoEn={proceso.iniciadoEn}
                      finalizaEn={proceso.finalizaEn}
                      duracionMin={proceso.duracionMin}
                      isMutating={isMutatingSecado}
                      onTickComplete={() => handleCierreGrupo(grupo._id)}
                      onFinalizar={() => handleFinalizarSecado(grupo, proceso._id)}
                    />
                  </>
                ) : lotePendienteListo && proceso ? (
                  <View style={styles.cierreBlock}>
                    <Chip
                      compact
                      icon="check-circle-outline"
                      style={{ alignSelf: "flex-start", marginBottom: 8 }}
                    >
                      Secado finalizado
                    </Chip>
                    {proceso.resultado ? (
                      <Chip
                        compact
                        icon={proceso.resultado === "listo" ? "thumb-up" : "alert"}
                        style={{ alignSelf: "flex-start", marginBottom: 8 }}
                      >
                        {proceso.resultado === "listo" ? "Producto listo" : "Poco óptimo"}
                      </Chip>
                    ) : null}
                    <Button
                      mode="contained"
                      icon="check-circle"
                      loading={isMutatingSecado}
                      onPress={() => handleMarcarListo(grupo, proceso._id)}
                      style={styles.marcarListoBtn}
                    >
                      Marcar como listo
                    </Button>
                  </View>
                ) : loteEsperandoArchivo ? (
                  <Text variant="bodySmall" style={[mutedText, { marginTop: 12 }]}>
                    Este lote ya se cerró. El gerente debe archivarlo (o reabrirlo) para un nuevo ciclo.
                  </Text>
                ) : !procesoCargado ? (
                  <ActivityIndicator style={{ marginTop: 12 }} />
                ) : puedeIniciarSecado && tiempoEst > 0 ? (
                  <IniciarSecadoButton
                    duracionMin={tiempoEst}
                    loading={isMutatingSecado}
                    onPress={() => handleIniciarSecado(grupo)}
                  />
                ) : null}
                </Card.Content>
              </Card>
            </AnimatedReveal>
          );
        })()
      )}

      {showLogout ? (
      <>
      <Button
        mode="contained-tonal"
        icon="shield-account"
        onPress={() => navigation.navigate("PreguntasSeguridad")}
        style={styles.logoutBtn}
      >
        Preguntas de seguridad
      </Button>
      <Button mode="outlined" onPress={logout} style={styles.logoutBtn}>
        Cerrar sesion
      </Button>
      </>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  alertBtnWrap: { marginTop: 12, alignSelf: "flex-start", position: "relative" },
  alertBtn: { borderRadius: 10 },
  badge: { position: "absolute", top: -6, right: -6 },
  card: { borderRadius: 14 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  queueChip: { alignSelf: "flex-start", marginBottom: 6 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  chipItem: {},
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  divider: { marginVertical: 12 },
  gaugeBlock: { marginTop: 8 },
  chartBlock: { marginTop: 12, gap: 4 },
  lastRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  cierreBlock: { marginTop: 12 },
  marcarListoBtn: { borderRadius: 10, marginTop: 4 },
  sectionTitle: { marginTop: 6 },
  error: { color: brand.critical },
  logoutBtn: { marginTop: 16 },
});
