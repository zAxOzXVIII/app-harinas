import { StyleSheet, View } from "react-native";
import { brand } from "../theme";

/** Cubo verde de marca (referencia POC web Nativa). */
export const NativaGreenCube = () => (
  <View style={styles.shadow}>
    <View style={styles.outer}>
      <View style={styles.inner} />
    </View>
  </View>
);

const CUBE = 56;
const INNER = 28;

const styles = StyleSheet.create({
  shadow: {
    shadowColor: brand.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
  },
  outer: {
    width: CUBE,
    height: CUBE,
    borderRadius: 14,
    backgroundColor: brand.primaryBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    width: INNER,
    height: INNER,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.28)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
});
