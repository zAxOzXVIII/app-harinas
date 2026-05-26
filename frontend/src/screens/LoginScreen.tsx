import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Card, HelperText, Text, TextInput } from "react-native-paper";
import { useAuthStore } from "../store/auth.store";
import { brand } from "../theme";

export const LoginScreen = () => {
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
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.cardInner}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>N</Text>
          </View>

          <Text style={styles.brandTitle}>NATIVA</Text>
          <Text style={styles.brandSub}>CONTROL DE PLANTA</Text>

          <Text variant="bodySmall" style={styles.hint}>
            Superalimentos C.A — acceso al sistema de monitoreo
          </Text>

          <TextInput
            mode="outlined"
            label="Usuario (email)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            onBlur={() => setTouched(true)}
            style={styles.input}
            outlineColor={brand.surfaceMuted}
            activeOutlineColor={brand.primaryBlue}
            left={<TextInput.Icon icon="email-outline" color={brand.primaryBlue} />}
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
            outlineColor={brand.surfaceMuted}
            activeOutlineColor={brand.primaryBlue}
            left={<TextInput.Icon icon="lock-outline" color={brand.primaryBlue} />}
          />
          <HelperText type="error" visible={Boolean(passwordError)}>
            {passwordError}
          </HelperText>

          <HelperText type="error" visible={Boolean(authError)}>
            {authError}
          </HelperText>

          <Button
            mode="contained"
            loading={isLoading}
            onPress={onSubmit}
            style={styles.submitBtn}
            labelStyle={styles.submitLabel}
            buttonColor={brand.primaryBlueDark}
            textColor="#FFFFFF"
          >
            INGRESAR
          </Button>

          {__DEV__ ? (
            <Text style={styles.devHint}>
              Demo gerente: admin@nativa.com / admin123
            </Text>
          ) : null}
        </Card.Content>
      </Card>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: brand.navyDeep,
  },
  card: {
    borderRadius: 24,
    backgroundColor: brand.surfaceCard,
  },
  cardInner: {
    alignItems: "center",
    paddingVertical: 8,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: brand.primaryBlue,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoIcon: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: brand.navyDeep,
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: 11,
    color: "#546E7A",
    letterSpacing: 3,
    marginTop: 4,
    marginBottom: 16,
  },
  hint: {
    color: "#78909C",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    marginTop: 4,
    backgroundColor: brand.surfaceMuted,
  },
  submitBtn: {
    width: "100%",
    marginTop: 12,
    borderRadius: 10,
  },
  submitLabel: {
    fontWeight: "700",
    letterSpacing: 1,
  },
  devHint: {
    marginTop: 16,
    fontSize: 10,
    color: "#90A4AE",
    textAlign: "center",
  },
});
