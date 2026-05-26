import { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, FAB, IconButton, Text } from "react-native-paper";
import { useAuthStore } from "../store/auth.store";
import { usePdfExport } from "../hooks/usePdfExport";
import { exportEquipoPdf } from "../pdf/reports";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { usersService } from "../services/users.service";
import type { TeamUser } from "../types/auth";
import type { GerenteStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<GerenteStackParamList>;

export const EquipoListScreen = () => {
  const navigation = useNavigation<Nav>();
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const { exporting, runExport } = usePdfExport();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersService.list();
      setUsers(data);
    } catch {
      setError("No fue posible cargar el equipo");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onDelete = (u: TeamUser) => {
    Alert.alert("Eliminar usuario", `¿Eliminar a ${u.nombre}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await usersService.remove(u.id);
            await load();
          } catch {
            Alert.alert("Error", "No fue posible eliminar");
          }
        },
      },
    ]);
  };

  if (loading && users.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.toolbar}>
        <Button
          mode="contained-tonal"
          icon="file-pdf-box"
          loading={exporting}
          onPress={() => runExport(async () => exportEquipoPdf(users, user))}
        >
          Exportar equipo (PDF)
        </Button>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text>No hay supervisores ni operadores registrados</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{item.nombre}</Text>
              <Text variant="bodyMedium">{item.email}</Text>
              <Text variant="labelLarge">Rol: {item.rol}</Text>
            </Card.Content>
            <Card.Actions>
              <IconButton icon="pencil" onPress={() => navigation.navigate("UsuarioForm", { userId: item.id })} />
              <IconButton icon="delete" iconColor="#c62828" onPress={() => onDelete(item)} />
            </Card.Actions>
          </Card>
        )}
      />
      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate("UsuarioForm", {})} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F9FC" },
  toolbar: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  list: { padding: 16, paddingBottom: 90 },
  card: { marginBottom: 10, borderRadius: 12 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  error: { color: "#c62828", padding: 16 },
  fab: { position: "absolute", right: 16, bottom: 24 },
});
