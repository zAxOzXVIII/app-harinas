import { useCallback, useMemo } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/auth.store";
import type { GerenteStackParamList } from "../navigation/types";
import { useHarinasStore } from "../store/harinas.store";
import { HarinaListItem } from "../components/HarinaListItem";

interface Props {
  onGoToGestion: () => void;
}

type Nav = NativeStackNavigationProp<GerenteStackParamList>;

export const DashboardScreen = ({ onGoToGestion }: Props) => {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isGerente = user?.rol === "gerente" || !user?.rol;

  const harinas = useHarinasStore((state) => state.harinas);
  const isLoading = useHarinasStore((state) => state.isLoading);
  const error = useHarinasStore((state) => state.error);
  const fetchHarinas = useHarinasStore((state) => state.fetchHarinas);

  // Refresca los datos cada vez que el Dashboard recupera el foco (ej: al volver del CRUD).
  useFocusEffect(
    useCallback(() => {
      fetchHarinas();
    }, [fetchHarinas])
  );

  const latestHarinas = useMemo(() => harinas.slice(0, 5), [harinas]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchHarinas} />}
    >
      <Text variant="headlineSmall">Bienvenido, {user?.nombre ?? "Usuario"}</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Total de harinas registradas</Text>
          <Text variant="displaySmall">{harinas.length}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.blockTitle}>
            Ultimos registros
          </Text>
          {latestHarinas.length === 0 ? (
            <Text variant="bodyMedium">No hay registros disponibles</Text>
          ) : (
            latestHarinas.map((item) => <HarinaListItem key={item._id} harina={item} />)
          )}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </Card.Content>
      </Card>

      <View style={styles.buttonRow}>
        <Button mode="contained" onPress={onGoToGestion}>
          Ir a gestion de harinas
        </Button>
      </View>

      {isGerente ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.blockTitle}>
              Panel Gerente
            </Text>
            <Text variant="bodySmall" style={styles.muted}>
              Registro de equipo, muro y vistas previas de otros roles (base para demo).
            </Text>
            <View style={styles.gerenteRow}>
              <Button mode="contained-tonal" onPress={() => navigation.navigate("EquipoList")}>
                Equipo (CRUD)
              </Button>
            </View>
            <View style={styles.gerenteRow}>
              <Button mode="contained-tonal" onPress={() => navigation.navigate("MuroGerente")}>
                Muro
              </Button>
            </View>
            <View style={styles.gerenteRow}>
              <Button mode="outlined" onPress={() => navigation.navigate("PreviewSupervisor")}>
                Vista Supervisor (preview)
              </Button>
            </View>
            <View style={styles.gerenteRow}>
              <Button mode="outlined" onPress={() => navigation.navigate("PreviewOperador")}>
                Vista Operador (preview)
              </Button>
            </View>
          </Card.Content>
        </Card>
      ) : null}

      <View style={styles.buttonRow}>
        <Button mode="outlined" onPress={logout}>
          Cerrar sesion
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 12,
  },
  blockTitle: {
    marginBottom: 10,
  },
  buttonRow: {
    marginTop: 6,
  },
  errorText: {
    marginTop: 8,
    color: "#c62828",
  },
  gerenteRow: {
    marginTop: 8,
  },
  muted: {
    opacity: 0.75,
    marginBottom: 4,
  },
});
