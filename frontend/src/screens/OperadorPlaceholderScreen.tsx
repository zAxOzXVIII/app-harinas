import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { useAuthStore } from "../store/auth.store";

export const OperadorPlaceholderScreen = () => {
  const logout = useAuthStore((s) => s.logout);
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Operador</Text>
      <Text style={styles.hint}>
        Lienzo en blanco: alarmas, informes y registro de fluctuaciones (siguiente fase).
      </Text>
      <Button mode="outlined" onPress={logout} style={styles.btn}>
        Cerrar sesion
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#f4f6f8",
  },
  hint: {
    marginTop: 12,
    opacity: 0.75,
  },
  btn: {
    marginTop: 24,
  },
});
