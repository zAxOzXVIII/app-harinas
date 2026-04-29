import { useCallback } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useGruposStore } from "../store/grupos.store";
import { useAuthStore } from "../store/auth.store";
import { GrupoRubroCard } from "../components/GrupoRubroCard";
import type { GruposStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<GruposStackParamList>;

export const GruposListScreen = () => {
  const navigation = useNavigation<Nav>();
  const grupos = useGruposStore((s) => s.grupos);
  const humedad = useGruposStore((s) => s.humedad);
  const isLoading = useGruposStore((s) => s.isLoading);
  const error = useGruposStore((s) => s.error);
  const fetchAll = useGruposStore((s) => s.fetchAll);
  const rol = useAuthStore((s) => s.user?.rol);

  const canEdit = rol === "gerente" || rol === "supervisor";

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
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchAll} />}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {humedad ? (
        <Card style={styles.humedadCard}>
          <Card.Content>
            <Text variant="titleMedium">Humedad global</Text>
            <Text variant="bodyMedium" style={styles.muted}>
              Politica unica para todos los grupos de rubro.
            </Text>
            <Text variant="displaySmall" style={styles.humedadValue}>
              {humedad.min}–{humedad.max} {humedad.unidad ?? "%RH"}
            </Text>
            {humedad.criticoMin !== undefined || humedad.criticoMax !== undefined ? (
              <Text variant="bodySmall" style={styles.muted}>
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

      <Text variant="titleLarge" style={styles.sectionTitle}>
        Grupos de rubro
      </Text>

      {grupos.length === 0 ? (
        <Card>
          <Card.Content>
            <Text variant="bodyMedium">
              No hay grupos sembrados. Ejecuta `npm run seed:grupos` en el backend.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        grupos.map((grupo) => (
          <GrupoRubroCard
            key={grupo._id}
            grupo={grupo}
            humedad={humedad}
            onPress={
              canEdit
                ? () => navigation.navigate("CalibracionEdit", { grupoId: grupo._id })
                : undefined
            }
          />
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8" },
  content: { padding: 16, paddingBottom: 32, gap: 4 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { color: "#c62828", marginBottom: 8 },
  humedadCard: { borderRadius: 12, marginBottom: 16, backgroundColor: "#e8f5e9" },
  humedadValue: { marginTop: 8, color: "#2e7d32" },
  humedadBtn: { marginTop: 12 },
  sectionTitle: { marginTop: 8, marginBottom: 8 },
  muted: { opacity: 0.75 },
});
