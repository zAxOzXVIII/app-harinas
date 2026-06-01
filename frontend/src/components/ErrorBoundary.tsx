import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

const ErrorFallback = ({
  error,
  onReset,
}: {
  error: Error;
  onReset: () => void;
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={[styles.title, { color: theme.colors.onSurface }]}>
          La app encontro un error
        </Text>
        <Text variant="bodyMedium" style={{ textAlign: "center", color: theme.colors.onSurfaceVariant }}>
          Reinicia la app o recarga. Si persiste, anota el mensaje y reportalo.
        </Text>
        <View style={[styles.box, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant="bodySmall" selectable style={{ color: theme.colors.onSurface }}>
            {error.message}
          </Text>
        </View>
        <Button mode="contained" style={styles.btn} onPress={onReset}>
          Reintentar
        </Button>
      </ScrollView>
    </View>
  );
};

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

    return <ErrorFallback error={this.state.error} onReset={this.reset} />;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, gap: 12 },
  title: { textAlign: "center" },
  box: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  btn: { marginTop: 16 },
});
