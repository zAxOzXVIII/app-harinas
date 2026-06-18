import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Chip, Text, useTheme } from "react-native-paper";
import { alertsService } from "../services/alerts.service";
import type { ProcessAlert } from "../types/alert";
import { labelAlertTipoOperador } from "../utils/calificacionSecado";

interface Props {
  grupoRubroId: string;
  procesoSecadoId?: string;
  activo: boolean;
  onAtendida?: () => void;
}

export const GrupoSecadoAlerts = ({
  grupoRubroId,
  procesoSecadoId,
  activo,
  onAtendida,
}: Props) => {
  const theme = useTheme();
  const [items, setItems] = useState<ProcessAlert[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!activo) {
      setItems([]);
      return;
    }
    try {
      const data = await alertsService.list({
        limit: 8,
        grupoRubroId,
        procesoSecadoId,
      });
      const anomalias = data.filter(
        (a) => a.tipo !== "secado_completado" && !a.leida
      );
      setItems(anomalias);
    } catch {
      setItems([]);
    }
  }, [activo, grupoRubroId, procesoSecadoId]);

  useEffect(() => {
    load();
    if (!activo) return undefined;
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [load, activo]);

  const marcarAtendida = async (alertId: string) => {
    setLoadingId(alertId);
    try {
      await alertsService.markRead(alertId);
      await load();
      onAtendida?.();
    } finally {
      setLoadingId(null);
    }
  };

  if (!activo || items.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text variant="labelMedium" style={{ color: theme.colors.error, marginBottom: 6 }}>
        Alertas activas durante el secado
      </Text>
      {items.map((a) => (
        <View key={a._id} style={[styles.row, { backgroundColor: theme.colors.errorContainer }]}>
          <View style={{ flex: 1 }}>
            <Chip compact style={styles.chip} textStyle={{ fontSize: 11 }}>
              {labelAlertTipoOperador(a.tipo)}
            </Chip>
            <Text variant="bodySmall" style={{ marginTop: 4, color: theme.colors.onErrorContainer }}>
              {a.mensaje}
            </Text>
          </View>
          <Button
            mode="contained-tonal"
            compact
            loading={loadingId === a._id}
            onPress={() => marcarAtendida(a._id)}
          >
            Atendida
          </Button>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginTop: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  chip: { alignSelf: "flex-start" },
});
