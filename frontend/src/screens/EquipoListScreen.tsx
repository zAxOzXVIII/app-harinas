import { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, FAB, IconButton, Text, useTheme } from "react-native-paper";
import { AnimatedReveal } from "../components/AnimatedReveal";
import { useMutedTextStyle } from "../hooks/useMutedTextStyle";
import { useScreenLayout } from "../hooks/useScreenLayout";
import { useAuthStore } from "../store/auth.store";
import { usePdfExport } from "../hooks/usePdfExport";
import { exportEquipoPdf } from "../pdf/reports";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { usersService } from "../services/users.service";
import type { TeamUser } from "../types/auth";
import type { GerenteStackParamList } from "../navigation/types";
import { brand } from "../theme";

type Nav = NativeStackNavigationProp<GerenteStackParamList>;

export const EquipoListScreen = () => {
  const theme = useTheme();
  const layout = useScreenLayout();
  const mutedText = useMutedTextStyle();
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
      <View style={[styles.centered, { backgroundColor: layout.backgroundColor }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: layout.backgroundColor }]}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={layout.toolbarPadding}>
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
        contentContainerStyle={layout.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurface }}>
              No hay supervisores ni operadores registrados
            </Text>
            <Text variant="bodySmall" style={mutedText}>
              Agrega miembros del equipo con el boton +.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <AnimatedReveal delay={Math.min(index * 40, 200)}>
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
                  {item.nombre}
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                  {item.email}
                </Text>
                <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                  Rol: {item.rol}
                </Text>
              </Card.Content>
              <Card.Actions>
                <IconButton
                  icon="pencil"
                  onPress={() => navigation.navigate("UsuarioForm", { userId: item.id })}
                />
                <IconButton
                  icon="delete"
                  iconColor={brand.critical}
                  onPress={() => onDelete(item)}
                />
              </Card.Actions>
            </Card>
          </AnimatedReveal>
        )}
      />
      <FAB
        icon="plus"
        style={[styles.fab, { right: layout.contentPadding }]}
        onPress={() => navigation.navigate("UsuarioForm", {})}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { marginBottom: 10, borderRadius: 12 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  error: { color: brand.critical, paddingHorizontal: 16, paddingTop: 8 },
  fab: { position: "absolute", bottom: 24 },
});
