import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { darkTheme, lightTheme } from "./src/theme";

export default function App() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <ErrorBoundary>
          <StatusBar style={isDark ? "light" : "dark"} />
          <RootNavigator />
        </ErrorBoundary>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
