import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export const MuroGerenteScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Muro Gerente</Text>
      <Text style={styles.hint}>
        Lienzo en blanco: aqui ira el feed en tiempo real de actividades y lecturas (fase posterior).
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f4f6f8",
  },
  hint: {
    marginTop: 12,
    opacity: 0.75,
  },
});
