import { useCallback, useMemo } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/auth.store";
import type { GerenteStackParamList } from "../navigation/types";
import { useHarinasStore } from "../store/harinas.store";
import { HarinaListItem } from "../components/HarinaListItem";
import { ScreenHero } from "../components/ScreenHero";
import { AnimatedReveal } from "../components/AnimatedReveal";
import { useScreenLayout } from "../hooks/useScreenLayout";
import { useContrastStyles } from "../hooks/useContrastStyles";
import { brand } from "../theme";

interface Props {
  onGoToGestion: () => void;
}

type Nav = NativeStackNavigationProp<GerenteStackParamList>;

export const DashboardScreen = ({ onGoToGestion }: Props) => {
  const theme = useTheme();
  const layout = useScreenLayout();
  const { muted: mutedText, title: titleStyle, body: bodyStyle, onPrimaryContainer } =
    useContrastStyles();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isGerente = user?.rol === "gerente" || !user?.rol;

  const harinas = useHarinasStore((state) => state.harinas);
  const isLoading = useHarinasStore((state) => state.isLoading);
  const error = useHarinasStore((state) => state.error);
  const fetchHarinas = useHarinasStore((state) => state.fetchHarinas);

  useFocusEffect(
    useCallback(() => {
      fetchHarinas();
    }, [fetchHarinas])
  );

  const latestHarinas = useMemo(() => harinas.slice(0, 5), [harinas]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={layout.scrollContent}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchHarinas} />}
    >
      <ScreenHero
        roleLabel="Gerente"
        title={`Hola, ${user?.nombre ?? "Usuario"}`}
        subtitle="Panel de control — inventario, equipo y monitoreo de planta"
      />

      <AnimatedReveal delay={40}>
        <Card style={[styles.statCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <Card.Content>
            <Text variant="labelLarge" style={onPrimaryContainer}>
              Inventario
            </Text>
            <Text variant="displaySmall" style={[onPrimaryContainer, { fontWeight: "700" }]}>
              {harinas.length}
            </Text>
            <Text variant="bodySmall" style={onPrimaryContainer}>
              harinas registradas
            </Text>
          </Card.Content>
        </Card>
      </AnimatedReveal>

      <AnimatedReveal delay={90}>
        <Card mode="elevated" style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.blockTitle, titleStyle]}>
              Ultimos registros
            </Text>
            {latestHarinas.length === 0 ? (
              <Text variant="bodyMedium" style={bodyStyle}>
                No hay registros disponibles
              </Text>
            ) : (
              latestHarinas.map((item) => <HarinaListItem key={item._id} harina={item} />)
            )}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </Card.Content>
        </Card>
      </AnimatedReveal>

      <AnimatedReveal delay={130}>
        <Button mode="contained" onPress={onGoToGestion} icon="warehouse" style={styles.primaryBtn}>
          Gestion de harinas
        </Button>
      </AnimatedReveal>

      {isGerente ? (
        <AnimatedReveal delay={170}>
          <Card mode="elevated" style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={[styles.blockTitle, titleStyle]}>
              Accesos rapidos
            </Text>
            <View style={styles.gerenteGrid}>
              <Button
                mode="contained-tonal"
                icon="account-group"
                onPress={() => navigation.navigate("EquipoList")}
                style={[
                  styles.gridBtn,
                  {
                    minWidth:
                      layout.dashboardColumns === 1
                        ? "100%"
                        : layout.dashboardColumns === 2
                          ? "48%"
                          : "31%",
                  },
                ]}
              >
                Equipo
              </Button>
              <Button
                mode="contained-tonal"
                icon="tune-vertical"
                onPress={() => navigation.navigate("GruposList")}
                style={[
                  styles.gridBtn,
                  {
                    minWidth:
                      layout.dashboardColumns === 1
                        ? "100%"
                        : layout.dashboardColumns === 2
                          ? "48%"
                          : "31%",
                  },
                ]}
              >
                Calibracion
              </Button>
              <Button
                mode="contained-tonal"
                icon="view-dashboard"
                onPress={() => navigation.navigate("MuroGerente")}
                style={[
                  styles.gridBtn,
                  {
                    minWidth:
                      layout.dashboardColumns === 1
                        ? "100%"
                        : layout.dashboardColumns === 2
                          ? "48%"
                          : "31%",
                  },
                ]}
              >
                Muro
              </Button>
              <Button
                mode="contained-tonal"
                icon="bell-alert"
                onPress={() => navigation.navigate("AlertsList")}
                style={[
                  styles.gridBtn,
                  {
                    minWidth:
                      layout.dashboardColumns === 1
                        ? "100%"
                        : layout.dashboardColumns === 2
                          ? "48%"
                          : "31%",
                  },
                ]}
              >
                Alertas
              </Button>
            </View>
            <View style={styles.previewRow}>
              <Button mode="outlined" compact onPress={() => navigation.navigate("PreviewSupervisor")}>
                Preview Supervisor
              </Button>
              <Button mode="outlined" compact onPress={() => navigation.navigate("PreviewOperador")}>
                Preview Operador
              </Button>
            </View>
          </Card.Content>
          </Card>
        </AnimatedReveal>
      ) : null}

      <AnimatedReveal delay={220}>
        <Button mode="outlined" onPress={logout} icon="logout" style={styles.logoutBtn}>
          Cerrar sesion
        </Button>
      </AnimatedReveal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  statCard: { borderRadius: 14 },
  card: { borderRadius: 14 },
  blockTitle: { marginBottom: 10 },
  primaryBtn: { borderRadius: 10 },
  errorText: { marginTop: 8, color: brand.critical },
  gerenteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  gridBtn: { flexGrow: 1, minWidth: "45%" },
  previewRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  logoutBtn: { marginTop: 8 },
});
