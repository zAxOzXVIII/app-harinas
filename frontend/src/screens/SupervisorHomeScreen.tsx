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
  const logout = useAuthStore((s) => s.logout);
  const rol = useAuthStore((s) => s.user?.rol);
  const showLogout = rol === "supervisor";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={layout.scrollContent}
    >
      <ScreenHero
        roleLabel="Gerente"
        title="Calibración"
        subtitle="Ajusta T°, nivel y tiempo sobre el lote que registró el Admin"
      />

      <AnimatedReveal delay={40}>
        <Card mode="elevated" style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.cardTitle, titleStyle]}>
              Lotes a calibrar
            </Text>
            <Text variant="bodySmall" style={mutedText}>
              Lo que el Admin creó en inventario (nombre, tipo, cantidad).
            </Text>
            <Button
              mode="contained"
              icon="tune-vertical"
              style={styles.btn}
              onPress={() => navigation.navigate("GruposList")}
            >
              Calibrar lotes
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
              Registro de fluctuaciones
            </Text>
            <Text variant="bodySmall" style={mutedText}>
              Humedad ambiental por día — registro 24/7 para calibración y trazabilidad.
            </Text>
            <Button
              mode="contained"
              icon="chart-timeline-variant"
              style={styles.btn}
              onPress={() => navigation.navigate("FluctuacionesHumedad")}
            >
              Ver fluctuaciones de humedad
            </Button>
          </Card.Content>
        </Card>
      </AnimatedReveal>

      <AnimatedReveal delay={120}>
        <Card
          mode="elevated"
          style={[styles.card, { backgroundColor: theme.colors.primaryContainer }]}
        >
          <Card.Content>
            <Text variant="titleMedium" style={[styles.cardTitle, titleStyle]}>
              Humedad global
            </Text>
            <Text variant="bodySmall" style={mutedText}>
              Politica unica %RH para todos los lotes.
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

      {showLogout ? (
      <AnimatedReveal delay={160}>
        <>
        <Button
          mode="contained-tonal"
          icon="shield-account"
          onPress={() => navigation.navigate("PreguntasSeguridad")}
          style={styles.logoutBtn}
        >
          Seguridad / clave
        </Button>
        <Button mode="outlined" onPress={logout} icon="logout" style={styles.logoutBtn}>
          Cerrar sesion
        </Button>
        </>
      </AnimatedReveal>
      ) : null}
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
