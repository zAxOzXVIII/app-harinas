import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Card, HelperText, Text, TextInput, useTheme } from "react-native-paper";
import { useAuthStore } from "../store/auth.store";

export const LoginScreen = () => {
  const theme = useTheme();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);

  const emailError = useMemo(() => {
    if (!touched) return "";
    if (!email.trim()) return "El email es obligatorio";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Formato de email invalido";
    return "";
  }, [email, touched]);

  const passwordError = useMemo(() => {
    if (!touched) return "";
    if (!password.trim()) return "La contraseña es obligatoria";
    if (password.length < 6) return "Debe tener al menos 6 caracteres";
    return "";
  }, [password, touched]);

  const onSubmit = async () => {
    setTouched(true);
    clearError();

    if (emailError || passwordError) return;

    await login(email.trim().toLowerCase(), password);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.brandWrap}>
        <Text variant="displaySmall" style={[styles.brand, { color: theme.colors.primary }]}>
          Nativa
        </Text>
        <Text variant="bodyMedium" style={styles.muted}>
          Superalimentos C.A
        </Text>
      </View>

      <Card mode="elevated" style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Ingresar
          </Text>
          <Text variant="bodySmall" style={[styles.muted, { marginBottom: 16 }]}>
            Control de insumos y monitoreo de proceso
          </Text>

          <TextInput
            mode="outlined"
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            onBlur={() => setTouched(true)}
            style={styles.input}
            left={<TextInput.Icon icon="email-outline" />}
          />
          <HelperText type="error" visible={Boolean(emailError)}>
            {emailError}
          </HelperText>

          <TextInput
            mode="outlined"
            label="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onBlur={() => setTouched(true)}
            style={styles.input}
            left={<TextInput.Icon icon="lock-outline" />}
          />
          <HelperText type="error" visible={Boolean(passwordError)}>
            {passwordError}
          </HelperText>

          <HelperText type="error" visible={Boolean(authError)}>
            {authError}
          </HelperText>

          <View style={styles.buttonWrap}>
            <Button mode="contained" loading={isLoading} onPress={onSubmit} icon="login">
              Ingresar
            </Button>
          </View>
        </Card.Content>
      </Card>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  brandWrap: { alignItems: "center", marginBottom: 16 },
  brand: { fontWeight: "700", letterSpacing: 1 },
  muted: { opacity: 0.7 },
  card: { borderRadius: 16 },
  title: { marginBottom: 4 },
  input: { marginTop: 8 },
  buttonWrap: { marginTop: 10 },
});
