import { useCallback } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Card,
  Chip,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { useProcesoSecadoStore } from "../store/procesoSecado.store";
import { useScreenLayout } from "../hooks/useScreenLayout";
import { useContrastStyles } from "../hooks/useContrastStyles";
import { brand } from "../theme";
import type { ProcesoSecado, ProcesoSecadoGrupoRef } from "../types/procesoSecado";

const grupoLabel = (grupoRubroId: string | ProcesoSecadoGrupoRef): string =>
  typeof grupoRubroId === "string" ? "Lote" : grupoRubroId.nombre;

const operadorLabel = (proceso: ProcesoSecado): string => {
  const ref = proceso.confirmadoListoPor;
  if (!ref) return "Operador";
  return typeof ref === "string" ? "Operador" : ref.nombre;
};

export const LotesPendientesArchivoScreen = () => {
  const theme = useTheme();
  const layout = useScreenLayout();
  const { muted: mutedText, title: titleStyle, body: bodyStyle } = useContrastStyles();

  const pendientes = useProcesoSecadoStore((s) => s.pendientesArchivo);
  const isLoading = useProcesoSecadoStore((s) => s.isLoading);
  const isMutating = useProcesoSecadoStore((s) => s.isMutating);
  const error = useProcesoSecadoStore((s) => s.error);
  const fetchPendientesArchivo = useProcesoSecadoStore((s) => s.fetchPendientesArchivo);
  const archivarLote = useProcesoSecadoStore((s) => s.archivarLote);

  useFocusEffect(
    useCallback(() => {
      fetchPendientesArchivo();
    }, [fetchPendientesArchivo])
  );

  const confirmArchivar = (proceso: ProcesoSecado) => {
    Alert.alert(
      "Archivar lote",
      `¿Archivar ${grupoLabel(proceso.grupoRubroId)}? Los registros históricos se conservan.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Archivar",
          style: "destructive",
          onPress: async () => {
            try {
              await archivarLote(proceso._id);
            } catch {
              Alert.alert("Error", "No fue posible archivar el lote.");
            }
          },
        },
      ]
    );
  };

  if (isLoading && pendientes.length === 0) {
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
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={fetchPendientesArchivo} />
      }
    >
      <Text variant="bodyMedium" style={[bodyStyle, styles.intro]}>
        Lotes confirmados por el Operador (✓). Archívalos para liberar el ciclo.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {pendientes.length === 0 ? (
        <Card mode="elevated" style={styles.card}>
          <Card.Content>
            <Text variant="bodyMedium" style={bodyStyle}>
              No hay lotes pendientes de archivo. Aparecerán aquí cuando el Operador marque un
              secado como listo.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        pendientes.map((proceso) => (
          <Card key={proceso._id} mode="elevated" style={styles.card}>
            <Card.Content>
              <View style={styles.row}>
                <View style={styles.info}>
                  <Text variant="titleMedium" style={titleStyle}>
                    {grupoLabel(proceso.grupoRubroId)}
                  </Text>
                  <Text variant="bodySmall" style={mutedText}>
                    Confirmado por {operadorLabel(proceso)}
                    {proceso.confirmadoListoEn
                      ? ` · ${new Date(proceso.confirmadoListoEn).toLocaleString()}`
                      : ""}
                  </Text>
                  {proceso.descripcionCierre ? (
                    <Text variant="bodySmall" style={[bodyStyle, { marginTop: 6 }]}>
                      {proceso.descripcionCierre}
                    </Text>
                  ) : null}
                  <View style={styles.chips}>
                    <Chip
                      compact
                      icon={proceso.resultado === "listo" ? "check-circle" : "alert-circle"}
                      style={{
                        backgroundColor:
                          proceso.resultado === "listo"
                            ? theme.colors.primaryContainer
                            : theme.colors.errorContainer,
                      }}
                    >
                      {proceso.resultado === "listo" ? "Listo" : "Poco óptimo"}
                    </Chip>
                  </View>
                </View>
                <IconButton
                  icon="delete-outline"
                  iconColor={theme.colors.error}
                  size={28}
                  disabled={isMutating}
                  onPress={() => confirmArchivar(proceso)}
                  accessibilityLabel="Archivar lote"
                />
              </View>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  intro: { marginBottom: 12 },
  card: { borderRadius: 14, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 4 },
  info: { flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  error: { color: brand.critical, marginBottom: 8 },
});
