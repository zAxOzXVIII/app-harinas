import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Divider, Text, TextInput, useTheme } from "react-native-paper";
import { KeyboardAwareScreen } from "../components/KeyboardAwareScreen";
import {
  emptySecuritySlots,
  SecurityQuestionsFields,
} from "../components/SecurityQuestionsFields";
import { authService } from "../services/auth.service";
import type { SecurityQuestion } from "../types/securityQuestions";
import { apiErrorMessage } from "../utils/apiError";
import { uiRolLabel } from "../utils/roles";
import { useAuthStore } from "../store/auth.store";

export const PreguntasSeguridadScreen = () => {
  const theme = useTheme();
  const rol = useAuthStore((s) => s.user?.rol) || "gerente";
  const [catalog, setCatalog] = useState<SecurityQuestion[]>([]);
  const [slots, setSlots] = useState(emptySecuritySlots());
  const [loading, setLoading] = useState(true);
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [questions, mine] = await Promise.all([
          authService.listSecurityQuestions(rol),
          authService.getMySecurityQuestions(),
        ]);
        if (cancelled) return;
        setCatalog(questions);
        const ids = mine.questions.map((q) => q.id);
        setSlots([
          { questionId: ids[0] || "", answer: "" },
          { questionId: ids[1] || "", answer: "" },
        ]);
      } catch (e) {
        Alert.alert("Error", apiErrorMessage(e, "No fue posible cargar las preguntas"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rol]);

  const saveQuestions = async () => {
    if (!slots[0].questionId || !slots[1].questionId) {
      Alert.alert("Validacion", "Elige 2 preguntas");
      return;
    }
    if (slots.some((s) => s.answer.trim().length < 3)) {
      Alert.alert("Validacion", "Escribe las 2 respuestas (minimo 3 caracteres)");
      return;
    }
    try {
      setSavingQuestions(true);
      await authService.updateMySecurityQuestions(
        slots.map((s) => ({ questionId: s.questionId, answer: s.answer.trim() }))
      );
      Alert.alert("Listo", "Preguntas de seguridad actualizadas");
    } catch (e) {
      Alert.alert("Error", apiErrorMessage(e, "No fue posible guardar"));
    } finally {
      setSavingQuestions(false);
    }
  };

  const savePassword = async () => {
    if (currentPassword.length < 6) {
      Alert.alert("Validacion", "Ingresa tu contraseña actual");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Validacion", "La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Validacion", "Las contraseñas nuevas no coinciden");
      return;
    }
    try {
      setSavingPassword(true);
      await authService.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Listo", "Contraseña actualizada. Usa la nueva al volver a entrar.");
    } catch (e) {
      Alert.alert("Error", apiErrorMessage(e, "No fue posible cambiar la contraseña"));
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAwareScreen backgroundColor={theme.colors.background}>
      <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
        Seguridad — {uiRolLabel(rol)}
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
        Cambia tu contraseña o actualiza las preguntas para recuperarla desde el login.
      </Text>

      <Text variant="titleMedium" style={[styles.section, { color: theme.colors.onSurface }]}>
        Cambiar contraseña
      </Text>
      <TextInput
        mode="outlined"
        label="Contraseña actual"
        secureTextEntry={!showPasswords}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        style={styles.input}
        right={
          <TextInput.Icon
            icon={showPasswords ? "eye-off" : "eye"}
            onPress={() => setShowPasswords((prev) => !prev)}
          />
        }
      />
      <TextInput
        mode="outlined"
        label="Nueva contraseña"
        secureTextEntry={!showPasswords}
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Confirmar nueva contraseña"
        secureTextEntry={!showPasswords}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />
      <Button mode="contained" loading={savingPassword} onPress={savePassword} style={styles.button}>
        Guardar contraseña
      </Button>

      <Divider style={styles.divider} />

      <Text variant="titleMedium" style={[styles.section, { color: theme.colors.onSurface }]}>
        Preguntas de recuperación
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
        Si olvidas la contraseña, estas respuestas te permiten recuperarla en el login.
      </Text>
      <SecurityQuestionsFields catalog={catalog} slots={slots} onChange={setSlots} />
      <Button
        mode="contained-tonal"
        loading={savingQuestions}
        onPress={saveQuestions}
        style={styles.button}
      >
        Guardar preguntas
      </Button>
    </KeyboardAwareScreen>
  );
};

const styles = StyleSheet.create({
  title: { marginBottom: 8 },
  section: { marginTop: 8, marginBottom: 8, fontWeight: "600" },
  input: { marginBottom: 8 },
  button: { marginTop: 8 },
  divider: { marginVertical: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
