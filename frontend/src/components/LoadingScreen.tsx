import { ActivityIndicator, Text } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { brand } from "../theme";

export const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>NATIVA</Text>
      <ActivityIndicator size="large" color={brand.skyAccent} />
      <Text style={styles.text}>Cargando sesion...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    backgroundColor: brand.navyDeep,
  },
  brand: {
    color: brand.textOnDark,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 3,
  },
  text: {
    color: brand.textMutedOnDark,
  },
});
