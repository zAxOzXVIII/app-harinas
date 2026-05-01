import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("App error:", error, info?.componentStack);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            La app encontro un error
          </Text>
          <Text variant="bodyMedium" style={styles.muted}>
            Reinicia la app o recarga. Si persiste, anota el mensaje y reportalo.
          </Text>
          <View style={styles.box}>
            <Text variant="bodySmall" selectable>
              {this.state.error.message}
            </Text>
          </View>
          <Button mode="contained" style={styles.btn} onPress={this.reset}>
            Reintentar
          </Button>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, gap: 12 },
  title: { textAlign: "center" },
  muted: { textAlign: "center", opacity: 0.7 },
  box: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(127,127,127,0.12)",
    marginTop: 8,
  },
  btn: { marginTop: 16 },
});
