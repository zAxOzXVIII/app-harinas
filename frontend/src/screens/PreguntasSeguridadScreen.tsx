import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
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
  const [saving, setSaving] = useState(false);

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

  const save = async () => {
    if (!slots[0].questionId || !slots[1].questionId) {
      Alert.alert("Validacion", "Elige 2 preguntas");
      return;
    }
    if (slots.some((s) => s.answer.trim().length < 3)) {
      Alert.alert("Validacion", "Escribe las 2 respuestas (minimo 3 caracteres)");
      return;
    }
    try {
      setSaving(true);
      await authService.updateMySecurityQuestions(
        slots.map((s) => ({ questionId: s.questionId, answer: s.answer.trim() }))
      );
      Alert.alert("Listo", "Preguntas de seguridad actualizadas");
    } catch (e) {
      Alert.alert("Error", apiErrorMessage(e, "No fue posible guardar"));
    } finally {
      setSaving(false);
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
        Preguntas de {uiRolLabel(rol)}
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
        Si olvidas la contraseña, estas respuestas te permiten recuperarla en el login.
      </Text>
      <SecurityQuestionsFields catalog={catalog} slots={slots} onChange={setSlots} />
      <Button mode="contained" loading={saving} onPress={save} style={styles.button}>
        Guardar preguntas
      </Button>
    </KeyboardAwareScreen>
  );
};

const styles = StyleSheet.create({
  title: { marginBottom: 8 },
  button: { marginTop: 24 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
