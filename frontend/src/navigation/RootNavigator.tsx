import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../screens/LoginScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { HarinasListScreen } from "../screens/HarinasListScreen";
import { HarinaFormScreen } from "../screens/HarinaFormScreen";
import { useAuthStore } from "../store/auth.store";
import { LoadingScreen } from "../components/LoadingScreen";
import { useBootstrapSession } from "../hooks/useBootstrapSession";
import type { Harina } from "../types/harina";

type AuthStackParamList = {
  Login: undefined;
};

type AppStackParamList = {
  Dashboard: undefined;
  HarinasList: undefined;
  HarinaCreate: undefined;
  HarinaEdit: { harina: Harina };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
  </AuthStack.Navigator>
);

const AppNavigator = () => (
  <AppStack.Navigator>
    <AppStack.Screen
      name="Dashboard"
      options={{ title: "Dashboard" }}
      children={({ navigation }) => (
        <DashboardScreen onGoToGestion={() => navigation.navigate("HarinasList")} />
      )}
    />
    <AppStack.Screen
      name="HarinasList"
      options={{ title: "Gestion de Harinas" }}
      children={({ navigation }) => (
        <HarinasListScreen
          onCreateNew={() => navigation.navigate("HarinaCreate")}
          onEdit={(harina) => navigation.navigate("HarinaEdit", { harina })}
        />
      )}
    />
    <AppStack.Screen
      name="HarinaCreate"
      options={{ title: "Nueva Harina" }}
      children={({ navigation }) => (
        <HarinaFormScreen onSuccess={() => navigation.goBack()} />
      )}
    />
    <AppStack.Screen
      name="HarinaEdit"
      options={{ title: "Editar Harina" }}
      children={({ route, navigation }) => (
        <HarinaFormScreen
          harinaToEdit={route.params.harina}
          onSuccess={() => navigation.goBack()}
        />
      )}
    />
  </AppStack.Navigator>
);

export const RootNavigator = () => {
  const token = useAuthStore((state) => state.token);
  const { isHydrated } = useBootstrapSession();

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  return <NavigationContainer>{token ? <AppNavigator /> : <AuthNavigator />}</NavigationContainer>;
};
