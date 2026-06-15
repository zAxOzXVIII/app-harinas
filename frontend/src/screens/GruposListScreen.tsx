import { useCallback } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Text, useTheme } from "react-native-paper";
import { AnimatedReveal } from "../components/AnimatedReveal";
import { useContrastStyles } from "../hooks/useContrastStyles";
import { useScreenLayout } from "../hooks/useScreenLayout";
import { brand } from "../theme";
import { usePdfExport } from "../hooks/usePdfExport";
import { exportCalibracionPdf } from "../pdf/reports";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useGruposStore } from "../store/grupos.store";
import { useAuthStore } from "../store/auth.store";
import { GrupoRubroCard } from "../components/GrupoRubroCard";
import type { GruposStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<GruposStackParamList>;

export const GruposListScreen = () => {
  const theme = useTheme();
  const layout = useScreenLayout();
  const { muted: mutedText, body: bodyStyle } = useContrastStyles();
  const navigation = useNavigation<Nav>();
  const grupos = useGruposStore((s) => s.grupos);
  const humedad = useGruposStore((s) => s.humedad);
  const isLoading = useGruposStore((s) => s.isLoading);
  const error = useGruposStore((s) => s.error);
  const fetchAll = useGruposStore((s) => s.fetchAll);
  const rol = useAuthStore((s) => s.user?.rol);

  const canEdit = rol === "gerente" || rol === "supervisor";
  const user = useAuthStore((s) => s.user);
  const { exporting, runExport } = usePdfExport();

  const onExportPdf = () =>
    runExport(async () => {
      if (grupos.length === 0) await fetchAll();
      const { grupos: g, humedad: h } = useGruposStore.getState();
      await exportCalibracionPdf(g, h, user);
    });

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  if (isLoading && grupos.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: layout.backgroundColor }]}
      contentContainerStyle={layout.scrollContent}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchAll} />}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        mode="contained-tonal"
        icon="file-pdf-box"
        loading={exporting}
        onPress={onExportPdf}
        style={styles.pdfBtn}
      >
        Exportar calibración (PDF)
      </Button>

      {humedad ? (
        <Card style={[styles.humedadCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <Card.Content>
            <Text variant="titleMedium" style={{ color: theme.colors.onPrimaryContainer }}>
              Humedad global
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onPrimaryContainer, opacity: 0.85 }}>
              Politica unica para todos los grupos de rubro.
            </Text>
            <Text
              variant="displaySmall"
              style={[styles.humedadValue, { color: theme.colors.onPrimaryContainer }]}
            >
              {humedad.min}–{humedad.max} {humedad.unidad ?? "%RH"}
            </Text>
            {humedad.criticoMin !== undefined || humedad.criticoMax !== undefined ? (
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onPrimaryContainer, opacity: 0.85 }}
              >
                Critico: {humedad.criticoMin ?? "-"} / {humedad.criticoMax ?? "-"}
              </Text>
            ) : null}
            {canEdit ? (
              <Button
                mode="contained-tonal"
                style={styles.humedadBtn}
                onPress={() => navigation.navigate("HumedadEdit")}
              >
                Editar humedad global
              </Button>
            ) : null}
          </Card.Content>
        </Card>
      ) : null}

      <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.primary }]}>
        Grupos de rubro
      </Text>

      {grupos.length === 0 ? (
        <Card>
          <Card.Content>
            <Text variant="bodyMedium" style={bodyStyle}>
              No hay grupos sembrados. Ejecuta `npm run seed:grupos` en el backend.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        grupos.map((grupo, idx) => (
          <AnimatedReveal key={grupo._id} delay={50 + idx * 40}>
            <GrupoRubroCard
              grupo={grupo}
              humedad={humedad}
              onPress={
                canEdit
                  ? () => navigation.navigate("CalibracionEdit", { grupoId: grupo._id })
                  : undefined
              }
            />
          </AnimatedReveal>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  pdfBtn: { marginBottom: 12 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: brand.critical, marginBottom: 8 },
  humedadCard: { borderRadius: 12, marginBottom: 16 },
  humedadValue: { marginTop: 8, fontWeight: "700" },
  humedadBtn: { marginTop: 12 },
  sectionTitle: { marginTop: 8, marginBottom: 8 },
});
