import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/auth.store";
import type { GruposStackParamList } from "../navigation/types";

type Nav = NativeStackNavigationProp<GruposStackParamList>;

export const SupervisorHomeScreen = () => {
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Bienvenido, {user?.nombre ?? "Supervisor"}</Text>
      <Text variant="bodyMedium" style={styles.muted}>
        Calibra los grupos de rubro y la politica global de humedad.
      </Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Grupos de rubro</Text>
          <Text variant="bodySmall" style={styles.muted}>
            Garbanzo + Lenteja, Platano + Cambur, Yuca + Batata. Cada grupo tiene su propia
            calibracion (temperatura, nivel de secado, tiempo).
          </Text>
          <Button
            mode="contained"
            style={styles.btn}
            onPress={() => navigation.navigate("GruposList")}
          >
            Ver y calibrar grupos
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium">Humedad global</Text>
          <Text variant="bodySmall" style={styles.muted}>
            Politica unica para todos los grupos.
          </Text>
          <Button
            mode="contained-tonal"
            style={styles.btn}
            onPress={() => navigation.navigate("HumedadEdit")}
          >
            Editar humedad global
          </Button>
        </Card.Content>
      </Card>

      <Button mode="outlined" onPress={logout} style={styles.logoutBtn}>
        Cerrar sesion
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: "#f4f6f8" },
  card: { borderRadius: 12 },
  btn: { marginTop: 12 },
  muted: { opacity: 0.7, marginTop: 4 },
  logoutBtn: { marginTop: "auto" },
});
