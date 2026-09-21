import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, HelperText, Text, TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { KeyboardAwareScreen } from "../components/KeyboardAwareScreen";
import { authService } from "../services/auth.service";
import type { SecurityQuestion } from "../types/securityQuestions";
import { apiErrorMessage } from "../utils/apiError";
import { uiRolLabel } from "../utils/roles";
import { brand } from "../theme";

type AuthNav = NativeStackNavigationProp<{ Login: undefined; RecuperarAcceso: undefined }>;

type Step = "email" | "answers" | "done";

export const RecuperarAccesoScreen = () => {
  const navigation = useNavigation<AuthNav>();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [questions, setQuestions] = useState<SecurityQuestion[]>([]);
  const [rolLabel, setRolLabel] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const answersReady = useMemo(
    () => questions.length === 2 && questions.every((q) => (answers[q.id] || "").trim().length >= 3),
    [answers, questions]
  );

  const loadQuestions = async () => {
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Ingresa un correo valido");
      return;
    }
    try {
      setLoading(true);
      const data = await authService.recoveryQuestions(email.trim().toLowerCase());
      setQuestions(data.questions);
      setRolLabel(uiRolLabel(data.rol));
      setAnswers({});
      setStep("answers");
    } catch (e) {
      setError(apiErrorMessage(e, "No fue posible cargar las preguntas"));
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async () => {
    setError("");
    if (password.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    try {
      setLoading(true);
      await authService.recoveryReset(
        email.trim().toLowerCase(),
        questions.map((q) => ({ questionId: q.id, answer: answers[q.id] || "" })),
        password
      );
      setStep("done");
    } catch (e) {
      setError(apiErrorMessage(e, "No fue posible restablecer la contraseña"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScreen centerContent backgroundColor={brand.navyDeep} horizontalPadding={20}>
      <Card mode="elevated" style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Recuperar acceso
          </Text>
          <Text variant="bodySmall" style={styles.hint}>
            Responde las preguntas de seguridad de tu rol para crear una nueva contraseña.
          </Text>

          {step === "email" ? (
            <>
              <TextInput
                mode="outlined"
                label="Correo electrónico"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                outlineColor={brand.surfaceMuted}
                activeOutlineColor={brand.primaryBlue}
                left={<TextInput.Icon icon="email-outline" color={brand.primaryBlue} />}
              />
              <Button mode="contained" loading={loading} onPress={loadQuestions} style={styles.btn}>
                Continuar
              </Button>
            </>
          ) : null}

          {step === "answers" ? (
            <>
              <Text variant="labelLarge" style={styles.rol}>
                Rol: {rolLabel}
              </Text>
              {questions.map((q, index) => (
                <View key={q.id}>
                  <Text variant="bodyMedium" style={styles.q}>
                    {index + 1}. {q.text}
                  </Text>
                  <TextInput
                    mode="outlined"
                    label="Respuesta"
                    value={answers[q.id] || ""}
                    onChangeText={(value) => setAnswers((prev) => ({ ...prev, [q.id]: value }))}
                    style={styles.input}
                  />
                </View>
              ))}
              <TextInput
                mode="outlined"
                label="Nueva contraseña"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword((prev) => !prev)}
                  />
                }
              />
              <TextInput
                mode="outlined"
                label="Confirmar contraseña"
                secureTextEntry={!showPassword}
                value={confirm}
                onChangeText={setConfirm}
                style={styles.input}
              />
              <Button
                mode="contained"
                loading={loading}
                disabled={!answersReady}
                onPress={submitReset}
                style={styles.btn}
              >
                Guardar contraseña
              </Button>
            </>
          ) : null}

          {step === "done" ? (
            <>
              <Text variant="bodyMedium" style={styles.success}>
                Contraseña actualizada. Ya puedes iniciar sesión.
              </Text>
              <Button mode="contained" onPress={() => navigation.navigate("Login")} style={styles.btn}>
                Ir al login
              </Button>
            </>
          ) : null}

          <HelperText type="error" visible={Boolean(error)}>
            {error}
          </HelperText>

          {step !== "done" ? (
            <Button mode="text" onPress={() => navigation.navigate("Login")}>
              Volver al login
            </Button>
          ) : null}
        </Card.Content>
      </Card>
    </KeyboardAwareScreen>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 24, backgroundColor: brand.surfaceCard },
  title: { textAlign: "center", marginBottom: 8, fontWeight: "700" },
  hint: { textAlign: "center", color: brand.textMutedOnLight, marginBottom: 16 },
  input: { width: "100%", marginTop: 4, backgroundColor: brand.surfaceMuted },
  btn: { marginTop: 12, borderRadius: 10 },
  rol: { marginBottom: 8, color: brand.primaryBlueDark },
  q: { marginTop: 8, marginBottom: 4 },
  success: { textAlign: "center", marginVertical: 12 },
});
