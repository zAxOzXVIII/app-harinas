import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Card,
  Chip,
  SegmentedButtons,
  Text,
  useTheme,
} from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { ChartTrendBlock } from "../components/ChartTrendBlock";
import { useScreenLayout } from "../hooks/useScreenLayout";
import { useContrastStyles } from "../hooks/useContrastStyles";
import { useGruposStore } from "../store/grupos.store";
import { telemetryService } from "../services/telemetry.service";
import { brand } from "../theme";
import type { HumedadFluctuacionDiaria } from "../types/telemetry";

type RangoDias = "1" | "7" | "30";

const toISODate = (date: Date): string => date.toISOString().slice(0, 10);

const getRangoFechas = (dias: number): { from: string; to: string } => {
  const to = new Date();
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - (dias - 1));
  return { from: toISODate(from), to: toISODate(to) };
};

const formatFecha = (fecha: string): string => {
  const [y, m, d] = fecha.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("es-VE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const FluctuacionesHumedadScreen = () => {
  const theme = useTheme();
  const layout = useScreenLayout();
  const { muted: mutedText, title: titleStyle, body: bodyStyle } = useContrastStyles();

  const grupos = useGruposStore((s) => s.grupos);
  const fetchGrupos = useGruposStore((s) => s.fetchAll);

  const [rango, setRango] = useState<RangoDias>("7");
  const [grupoFilter, setGrupoFilter] = useState<string | null>(null);
  const [rows, setRows] = useState<HumedadFluctuacionDiaria[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dias = rango === "1" ? 1 : rango === "7" ? 7 : 30;

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { from, to } = getRangoFechas(dias);
      const data = await telemetryService.getFluctuacionesHumedad({
        from,
        to,
        grupoRubroId: grupoFilter ?? undefined,
      });
      setRows(data);
    } catch {
      setError("No fue posible cargar el registro de fluctuaciones.");
    } finally {
      setIsLoading(false);
    }
  }, [dias, grupoFilter]);

  useFocusEffect(
    useCallback(() => {
      if (grupos.length === 0) fetchGrupos();
    }, [grupos.length, fetchGrupos])
  );

  useEffect(() => {
    load();
  }, [load]);

  const umbralesHint = useMemo(() => {
    const first = rows[0]?.umbrales;
    if (!first) return null;
    return `Rango operativo ${first.min}–${first.max} ${first.unidad} · Crítico ${first.criticoMin ?? "—"} / ${first.criticoMax ?? "—"}`;
  }, [rows]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={layout.scrollContent}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}
    >
      <Text variant="bodyMedium" style={[bodyStyle, styles.intro]}>
        Registro continuo de humedad — referencia diaria para calibración y trazabilidad,
        independiente del ciclo de secado manual.
      </Text>

      <SegmentedButtons
        value={rango}
        onValueChange={(v) => setRango(v as RangoDias)}
        buttons={[
          { value: "1", label: "Hoy" },
          { value: "7", label: "7 días" },
          { value: "30", label: "30 días" },
        ]}
        style={styles.segment}
      />

      {umbralesHint ? (
        <Text variant="bodySmall" style={[mutedText, styles.umbrales]}>
          {umbralesHint}
        </Text>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        <Chip
          selected={grupoFilter === null}
          onPress={() => setGrupoFilter(null)}
          style={styles.filterChip}
          compact
        >
          Todos
        </Chip>
        {grupos.map((g) => (
          <Chip
            key={g._id}
            selected={grupoFilter === g._id}
            onPress={() => setGrupoFilter(g._id)}
            style={styles.filterChip}
            compact
          >
            {g.nombre}
          </Chip>
        ))}
      </ScrollView>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {isLoading && rows.length === 0 ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : rows.length === 0 ? (
        <Card mode="elevated" style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium" style={bodyStyle}>
              Sin telemetría en este rango. Activa el gateway o ESP32 para registrar humedad 24/7.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        rows.map((row) => {
          const sparkData = [row.humedadMin, row.humedadPromedio, row.humedadMax];
          return (
            <Card key={`${row.grupoRubroId}-${row.fecha}`} mode="elevated" style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={titleStyle}>
                  {row.nombreGrupo}
                </Text>
                <Text variant="bodySmall" style={mutedText}>
                  {formatFecha(row.fecha)}
                </Text>

                <View style={styles.metricsRow}>
                  <Text variant="bodyMedium" style={bodyStyle}>
                    Min {row.humedadMin}% · Prom {row.humedadPromedio}% · Max {row.humedadMax}%
                  </Text>
                </View>

                <View style={styles.chipsRow}>
                  <Chip compact icon="counter">{row.lecturas} lecturas</Chip>
                  {row.fueraRango > 0 ? (
                    <Chip compact icon="alert-outline" style={styles.chipWarn}>
                      {row.fueraRango} fuera de rango
                    </Chip>
                  ) : (
                    <Chip compact icon="check">En rango</Chip>
                  )}
                  {row.critico > 0 ? (
                    <Chip compact icon="alert-circle" style={styles.chipCrit}>
                      {row.critico} críticas
                    </Chip>
                  ) : null}
                </View>

                <ChartTrendBlock
                  label="Tendencia del día (min · prom · max)"
                  data={sparkData}
                  width={layout.chartWidth}
                  color={theme.colors.secondary}
                  emptyMessage="Sin puntos"
                />
              </Card.Content>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  intro: { marginBottom: 12 },
  segment: { marginBottom: 8 },
  umbrales: { marginBottom: 10 },
  filterRow: { marginBottom: 12, maxHeight: 44 },
  filterChip: { marginRight: 8 },
  card: { borderRadius: 14, marginBottom: 10 },
  metricsRow: { marginTop: 8 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10, marginBottom: 8 },
  chipWarn: { backgroundColor: "#FFF3E0" },
  chipCrit: { backgroundColor: "#FFEBEE" },
  loader: { marginTop: 24 },
  error: { color: brand.critical, marginBottom: 8 },
});
