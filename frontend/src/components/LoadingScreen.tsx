import { ActivityIndicator, Text } from "react-native-paper";
import { StyleSheet, View } from "react-native";

export const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>Cargando sesion...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  text: {
    opacity: 0.7,
  },
});
