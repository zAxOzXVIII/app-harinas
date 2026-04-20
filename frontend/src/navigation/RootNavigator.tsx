import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../screens/LoginScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { HarinasListScreen } from "../screens/HarinasListScreen";
import { HarinaFormScreen } from "../screens/HarinaFormScreen";
import { EquipoListScreen } from "../screens/EquipoListScreen";
import { UsuarioFormScreen } from "../screens/UsuarioFormScreen";
import { MuroGerenteScreen } from "../screens/MuroGerenteScreen";
import { SupervisorPlaceholderScreen } from "../screens/SupervisorPlaceholderScreen";
import { OperadorPlaceholderScreen } from "../screens/OperadorPlaceholderScreen";
import { useAuthStore } from "../store/auth.store";
import { LoadingScreen } from "../components/LoadingScreen";
import { useBootstrapSession } from "../hooks/useBootstrapSession";
import type { Rol } from "../types/auth";
import type { GerenteStackParamList } from "./types";

type AuthStackParamList = {
  Login: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const GerenteStack = createNativeStackNavigator<GerenteStackParamList>();
const RolStack = createNativeStackNavigator<{ Home: undefined }>();

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
      name="PreviewSupervisor"
      options={{ title: "Vista Supervisor" }}
      component={SupervisorPlaceholderScreen}
    />
    <GerenteStack.Screen
      name="PreviewOperador"
      options={{ title: "Vista Operador" }}
      component={OperadorPlaceholderScreen}
    />
  </GerenteStack.Navigator>
);

const SupervisorNavigator = () => (
  <RolStack.Navigator>
    <RolStack.Screen name="Home" options={{ title: "Supervisor" }} component={SupervisorPlaceholderScreen} />
  </RolStack.Navigator>
);

const OperadorNavigator = () => (
  <RolStack.Navigator>
    <RolStack.Screen name="Home" options={{ title: "Operador" }} component={OperadorPlaceholderScreen} />
  </RolStack.Navigator>
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
