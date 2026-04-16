import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { RootNavigator } from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <PaperProvider>
      <StatusBar style="auto" />
      <RootNavigator />
    </PaperProvider>
  );
}
