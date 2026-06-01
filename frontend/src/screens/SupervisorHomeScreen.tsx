import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/auth.store";
import type { GruposStackParamList } from "../navigation/types";
import { ScreenHero } from "../components/ScreenHero";
import { AnimatedReveal } from "../components/AnimatedReveal";
import { useScreenLayout } from "../hooks/useScreenLayout";
import { useContrastStyles } from "../hooks/useContrastStyles";
import { brand } from "../theme";

type Nav = NativeStackNavigationProp<GruposStackParamList>;

export const SupervisorHomeScreen = () => {
  const theme = useTheme();
  const layout = useScreenLayout();
  const { muted: mutedText, title: titleStyle } = useContrastStyles();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={layout.scrollContent}
    >
      <ScreenHero
        roleLabel="Supervisor"
        title={`Hola, ${user?.nombre ?? "Supervisor"}`}
        subtitle="Calibra temperatura, nivel de secado y tiempo por grupo de rubro"
      />

      <AnimatedReveal delay={40}>
        <Card mode="elevated" style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.cardTitle, titleStyle]}>
              Grupos de rubro
            </Text>
            <Text variant="bodySmall" style={mutedText}>
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
      </AnimatedReveal>

      <AnimatedReveal delay={90}>
        <Card
          mode="elevated"
          style={[styles.card, { backgroundColor: theme.colors.primaryContainer }]}
        >
          <Card.Content>
            <Text variant="titleMedium" style={[styles.cardTitle, titleStyle]}>
              Humedad global
            </Text>
            <Text variant="bodySmall" style={mutedText}>
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
      </AnimatedReveal>

      <AnimatedReveal delay={130}>
        <Button mode="outlined" onPress={logout} icon="logout" style={styles.logoutBtn}>
          Cerrar sesion
        </Button>
      </AnimatedReveal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { borderRadius: 14 },
  cardTitle: {},
  btn: { marginTop: 12, borderRadius: 10 },
  logoutBtn: { marginTop: 8 },
});
