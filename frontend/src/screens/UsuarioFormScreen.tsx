import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, SegmentedButtons, Text, TextInput, useTheme } from "react-native-paper";
import { KeyboardAwareScreen } from "../components/KeyboardAwareScreen";
import {
  emptySecuritySlots,
  SecurityQuestionsFields,
} from "../components/SecurityQuestionsFields";
import { authService } from "../services/auth.service";
import { usersService } from "../services/users.service";
import type { TeamUser } from "../types/auth";
import type { SecurityQuestion } from "../types/securityQuestions";
import { apiErrorMessage } from "../utils/apiError";

interface Props {
  userId?: string;
  onSuccess: () => void;
}

export const UsuarioFormScreen = ({ userId, onSuccess }: Props) => {
  const theme = useTheme();
  const isEdit = Boolean(userId);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"supervisor" | "operador">("operador");
  const [catalog, setCatalog] = useState<SecurityQuestion[]>([]);
  const [slots, setSlots] = useState(emptySecuritySlots());
  const [hasQuestions, setHasQuestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const questions = await authService.listSecurityQuestions(rol);
        if (!cancelled) setCatalog(questions);
      } catch {
        if (!cancelled) setCatalog([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rol]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await usersService.list();
        const found = list.find((u) => u.id === userId);
        if (cancelled || !found) return;
        setNombre(found.nombre);
        setEmail(found.email);
        setRol(found.rol);
        const ids = found.securityQuestionIds || [];
        setHasQuestions(Boolean(found.hasSecurityQuestions));
        setSlots([
          { questionId: ids[0] || "", answer: "" },
          { questionId: ids[1] || "", answer: "" },
        ]);
      } catch {
        Alert.alert("Error", "No fue posible cargar el operador o gerente");
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const filledQuestions = () =>
    slots
      .filter((s) => s.questionId && s.answer.trim().length >= 3)
      .map((s) => ({ questionId: s.questionId, answer: s.answer.trim() }));

  const submit = async () => {
    if (!nombre.trim() || !email.trim()) {
      Alert.alert("Validacion", "Nombre y email son obligatorios");
      return;
    }
    if (!isEdit && password.length < 6) {
      Alert.alert("Validacion", "La contraseña debe tener al menos 6 caracteres");
      return;
    }
    const questions = filledQuestions();
    if (!isEdit && questions.length !== 2) {
      Alert.alert("Validacion", "Configura 2 preguntas de seguridad con su respuesta");
      return;
    }
    if (isEdit && !hasQuestions && questions.length !== 2) {
      Alert.alert("Validacion", "Este miembro no tiene preguntas. Configura 2 para poder recuperar el acceso.");
      return;
    }
    if (questions.length === 1 || (questions.length === 2 && slots[0].questionId === slots[1].questionId)) {
      Alert.alert("Validacion", "Elige 2 preguntas distintas y completa ambas respuestas");
      return;
    }
    try {
      setLoading(true);
      if (isEdit && userId) {
        const payload: Partial<{
          nombre: string;
          email: string;
          password: string;
          rol: TeamUser["rol"];
          securityQuestions: { questionId: string; answer: string }[];
        }> = {
          nombre: nombre.trim(),
          email: email.trim().toLowerCase(),
          rol,
        };
        if (password.length >= 6) payload.password = password;
        if (questions.length === 2) payload.securityQuestions = questions;
        await usersService.update(userId, payload);
        Alert.alert("Listo", "Miembro actualizado");
      } else {
        await usersService.create({
          nombre: nombre.trim(),
          email: email.trim().toLowerCase(),
          password,
          rol,
          securityQuestions: questions,
        });
        Alert.alert("Listo", "Miembro creado");
      }
      onSuccess();
    } catch (e) {
      Alert.alert("Error", apiErrorMessage(e, "No fue posible guardar"));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.centered}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAwareScreen backgroundColor={theme.colors.background}>
      <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
        {isEdit ? "Editar miembro del equipo" : "Nuevo gerente o operador"}
      </Text>
      <TextInput mode="outlined" label="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
      <TextInput
        mode="outlined"
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label={isEdit ? "Nueva contraseña (opcional)" : "Contraseña"}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>Rol</Text>
      <SegmentedButtons
        value={rol}
        onValueChange={(v) => {
          setRol(v as "supervisor" | "operador");
          setSlots(emptySecuritySlots());
        }}
        buttons={[
          { value: "supervisor", label: "Gerente" },
          { value: "operador", label: "Operador" },
        ]}
      />
      <SecurityQuestionsFields
        catalog={catalog}
        slots={slots}
        onChange={setSlots}
        answersOptional={isEdit && hasQuestions}
      />
      <Button mode="contained" loading={loading} onPress={submit} style={styles.button}>
        {isEdit ? "Guardar" : "Registrar"}
      </Button>
    </KeyboardAwareScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { marginBottom: 16 },
  input: { marginBottom: 8 },
  label: { marginTop: 12, marginBottom: 8 },
  button: { marginTop: 24 },
  hint: { marginBottom: 8 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
