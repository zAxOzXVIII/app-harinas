import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/auth.store";
import type { GruposStackParamList } from "../navigation/types";
import { ScreenHero } from "../components/ScreenHero";
import { brand } from "../theme";

type Nav = NativeStackNavigationProp<GruposStackParamList>;

export const SupervisorHomeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <ScreenHero
        roleLabel="Supervisor"
        title={`Hola, ${user?.nombre ?? "Supervisor"}`}
        subtitle="Calibra temperatura, nivel de secado y tiempo por grupo de rubro"
      />

      <Card mode="elevated" style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Grupos de rubro
          </Text>
          <Text variant="bodySmall" style={styles.muted}>
            Garbanzo + Lenteja · Platano + Cambur · Yuca + Batata
          </Text>
          <Button
            mode="contained"
            icon="tune-vertical"
            style={styles.btn}
            onPress={() => navigation.navigate("GruposList")}
          >
            Ver y calibrar grupos
          </Button>
        </Card.Content>
      </Card>

      <Card mode="elevated" style={[styles.card, styles.humedadHighlight]}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Humedad global
          </Text>
          <Text variant="bodySmall" style={styles.muted}>
            Politica unica %RH para todos los grupos.
          </Text>
          <Button
            mode="contained-tonal"
            icon="water-percent"
            style={styles.btn}
            onPress={() => navigation.navigate("HumedadEdit")}
          >
            Editar humedad global
          </Button>
        </Card.Content>
      </Card>

      <Button mode="outlined" onPress={logout} icon="logout" style={styles.logoutBtn}>
        Cerrar sesion
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  card: { borderRadius: 14 },
  humedadHighlight: { backgroundColor: "#E3F2FD" },
  cardTitle: { color: brand.primaryBlueDark },
  btn: { marginTop: 12, borderRadius: 10 },
  muted: { opacity: 0.75, marginTop: 4 },
  logoutBtn: { marginTop: 8 },
});
