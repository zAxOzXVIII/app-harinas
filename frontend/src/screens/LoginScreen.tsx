import { useMemo, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Button, Card, HelperText, Text, TextInput } from "react-native-paper";
import { KeyboardAwareScreen } from "../components/KeyboardAwareScreen";
import { NativaGreenCube } from "../components/NativaGreenCube";
import { useAuthStore } from "../store/auth.store";
import { brand } from "../theme";

export const LoginScreen = () => {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <KeyboardAwareScreen
      centerContent
      backgroundColor={brand.navyDeep}
      horizontalPadding={20}
    >
      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.cardInner}>
          <NativaGreenCube />

          <View style={styles.logoWrap}>
            <Image
              source={require("../../assets/logo-nativa.png")}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.brandSub}>GESTIÓN DE PLANTA</Text>

          <Text variant="bodySmall" style={styles.hint}>
            Acceso al sistema de monitoreo
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
            theme={{ colors: { primary: brand.primaryBlue } }}
          />
          <HelperText type="error" visible={Boolean(emailError)}>
            {emailError}
          </HelperText>

          <TextInput
            mode="outlined"
            label="Contraseña"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            onBlur={() => setTouched(true)}
            style={styles.input}
            outlineColor={brand.surfaceMuted}
            activeOutlineColor={brand.primaryBlue}
            left={<TextInput.Icon icon="lock-outline" color={brand.primaryBlue} />}
            theme={{ colors: { primary: brand.primaryBlue } }}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                color={brand.primaryBlue}
                onPress={() => setShowPassword((prev) => !prev)}
                accessibilityLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              />
            }
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
    </KeyboardAwareScreen>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    backgroundColor: brand.surfaceCard,
  },
  cardInner: {
    alignItems: "center",
    paddingVertical: 8,
  },
  logoWrap: {
    width: "100%",
    alignItems: "center",
    marginBottom: 6,
  },
  logoImg: {
    width: 240,
    height: 72,
  },
  brandSub: {
    fontSize: 11,
    color: brand.textMutedOnLight,
    letterSpacing: 3,
    fontWeight: "600",
    marginBottom: 16,
  },
  hint: {
    color: brand.textMutedOnLight,
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
    color: brand.textMutedOnLight,
    textAlign: "center",
  },
});
