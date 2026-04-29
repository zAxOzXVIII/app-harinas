import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../screens/LoginScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { HarinasListScreen } from "../screens/HarinasListScreen";
import { HarinaFormScreen } from "../screens/HarinaFormScreen";
import { EquipoListScreen } from "../screens/EquipoListScreen";
import { UsuarioFormScreen } from "../screens/UsuarioFormScreen";
import { MuroGerenteScreen } from "../screens/MuroGerenteScreen";
import { GruposListScreen } from "../screens/GruposListScreen";
import { CalibracionFormScreen } from "../screens/CalibracionFormScreen";
import { HumedadFormScreen } from "../screens/HumedadFormScreen";
import { SupervisorHomeScreen } from "../screens/SupervisorHomeScreen";
import { OperadorHomeScreen } from "../screens/OperadorHomeScreen";
import { AlertsListScreen } from "../screens/AlertsListScreen";
import { useAuthStore } from "../store/auth.store";
import { LoadingScreen } from "../components/LoadingScreen";
import { useBootstrapSession } from "../hooks/useBootstrapSession";
import type { Rol } from "../types/auth";
import type { GerenteStackParamList, GruposStackParamList, OperadorStackParamList } from "./types";

type AuthStackParamList = {
  Login: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const GerenteStack = createNativeStackNavigator<GerenteStackParamList>();
const SupervisorStack = createNativeStackNavigator<GruposStackParamList>();
const OperadorStack = createNativeStackNavigator<OperadorStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
  </AuthStack.Navigator>
);

const GerenteNavigator = () => (
  <GerenteStack.Navigator>
    <GerenteStack.Screen
      name="Dashboard"
      options={{ title: "Inicio" }}
      children={({ navigation }) => (
        <DashboardScreen onGoToGestion={() => navigation.navigate("HarinasList")} />
      )}
    />
    <GerenteStack.Screen
      name="HarinasList"
      options={{ title: "Gestion de Harinas" }}
      children={({ navigation }) => (
        <HarinasListScreen
          onCreateNew={() => navigation.navigate("HarinaCreate")}
          onEdit={(harina) => navigation.navigate("HarinaEdit", { harina })}
        />
      )}
    />
    <GerenteStack.Screen
      name="HarinaCreate"
      options={{ title: "Nueva Harina" }}
      children={({ navigation }) => <HarinaFormScreen onSuccess={() => navigation.goBack()} />}
    />
    <GerenteStack.Screen
      name="HarinaEdit"
      options={{ title: "Editar Harina" }}
      children={({ route, navigation }) => (
        <HarinaFormScreen harinaToEdit={route.params.harina} onSuccess={() => navigation.goBack()} />
      )}
    />
    <GerenteStack.Screen name="EquipoList" options={{ title: "Equipo" }} component={EquipoListScreen} />
    <GerenteStack.Screen
      name="UsuarioForm"
      options={{ title: "Usuario" }}
      children={({ route, navigation }) => (
        <UsuarioFormScreen userId={route.params?.userId} onSuccess={() => navigation.goBack()} />
      )}
    />
    <GerenteStack.Screen name="MuroGerente" options={{ title: "Muro" }} component={MuroGerenteScreen} />
    <GerenteStack.Screen
      name="AlertsList"
      options={{ title: "Alertas de proceso" }}
      component={AlertsListScreen}
    />
    <GerenteStack.Screen
      name="GruposList"
      options={{ title: "Grupos de rubro" }}
      component={GruposListScreen}
    />
    <GerenteStack.Screen
      name="CalibracionEdit"
      options={{ title: "Calibracion" }}
      children={({ route, navigation }) => (
        <CalibracionFormScreen
          grupoId={route.params.grupoId}
          onSuccess={() => navigation.goBack()}
        />
      )}
    />
    <GerenteStack.Screen
      name="HumedadEdit"
      options={{ title: "Humedad global" }}
      children={({ navigation }) => <HumedadFormScreen onSuccess={() => navigation.goBack()} />}
    />
    <GerenteStack.Screen
      name="PreviewSupervisor"
      options={{ title: "Vista Supervisor" }}
      component={SupervisorHomeScreen}
    />
    <GerenteStack.Screen
      name="PreviewOperador"
      options={{ title: "Vista Operador" }}
      component={OperadorHomeScreen}
    />
  </GerenteStack.Navigator>
);

const SupervisorNavigator = () => (
  <SupervisorStack.Navigator>
    <SupervisorStack.Screen
      name="Home"
      options={{ title: "Supervisor" }}
      component={SupervisorHomeScreen}
    />
    <SupervisorStack.Screen
      name="GruposList"
      options={{ title: "Grupos de rubro" }}
      component={GruposListScreen}
    />
    <SupervisorStack.Screen
      name="CalibracionEdit"
      options={{ title: "Calibracion" }}
      children={({ route, navigation }) => (
        <CalibracionFormScreen
          grupoId={route.params.grupoId}
          onSuccess={() => navigation.goBack()}
        />
      )}
    />
    <SupervisorStack.Screen
      name="HumedadEdit"
      options={{ title: "Humedad global" }}
      children={({ navigation }) => <HumedadFormScreen onSuccess={() => navigation.goBack()} />}
    />
  </SupervisorStack.Navigator>
);

const OperadorNavigator = () => (
  <OperadorStack.Navigator>
    <OperadorStack.Screen
      name="Home"
      options={{ title: "Operador" }}
      component={OperadorHomeScreen}
    />
    <OperadorStack.Screen
      name="AlertsList"
      options={{ title: "Alertas" }}
      component={AlertsListScreen}
    />
  </OperadorStack.Navigator>
);

const resolveRol = (rol: Rol | undefined): Rol => {
  if (rol === "supervisor" || rol === "operador" || rol === "gerente") return rol;
  return "gerente";
};

const AppNavigator = () => {
  const rol = resolveRol(useAuthStore((s) => s.user?.rol));

  if (rol === "gerente") return <GerenteNavigator />;
  if (rol === "supervisor") return <SupervisorNavigator />;
  return <OperadorNavigator />;
};

export const RootNavigator = () => {
  const token = useAuthStore((state) => state.token);
  const { isHydrated } = useBootstrapSession();

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  return <NavigationContainer>{token ? <AppNavigator /> : <AuthNavigator />}</NavigationContainer>;
};
