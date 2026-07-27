import { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput, useTheme } from "react-native-paper";
import { KeyboardAwareScreen } from "../components/KeyboardAwareScreen";
import { useGruposStore } from "../store/grupos.store";

interface Props {
  onSuccess: () => void;
}

interface Fields {
  nombre: string;
  item1: string;
  item2: string;
}

const EMPTY: Fields = { nombre: "", item1: "", item2: "" };

/**
 * Crear grupo (Admin). Entra al final de la cola FIFO; Supervisor lo calibra
 * y Operador lo trabaja en orden de creacion (feedback LeanHerz 22/7/2026).
 */
export const GrupoFormScreen = ({ onSuccess }: Props) => {
  const theme = useTheme();
  const isMutating = useGruposStore((s) => s.isMutating);
  const createGrupo = useGruposStore((s) => s.createGrupo);

  const [fields, setFields] = useState<Fields>(EMPTY);
  const [touched, setTouched] = useState(false);

  const set = (key: keyof Fields) => (val: string) =>
    setFields((prev) => ({ ...prev, [key]: val }));

  const errors = useMemo(() => {
    if (!touched) return {} as Record<keyof Fields, string>;
    return {
      nombre: !fields.nombre.trim() ? "El nombre es obligatorio" : "",
      item1: !fields.item1.trim() ? "El primer rubro es obligatorio" : "",
      item2: !fields.item2.trim() ? "El segundo rubro es obligatorio" : "",
    };
  }, [fields, touched]);

  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = async () => {
    setTouched(true);
    if (
      !fields.nombre.trim() ||
      !fields.item1.trim() ||
      !fields.item2.trim()
    ) {
      return;
    }
    try {
      await createGrupo({
        nombre: fields.nombre.trim(),
        items: [fields.item1.trim(), fields.item2.trim()],
      });
      Alert.alert("Grupo creado", "Se agrego al final de la cola de trabajo.");
      onSuccess();
    } catch {
      Alert.alert("Error", "No fue posible crear el grupo.");
    }
  };

  return (
    <KeyboardAwareScreen backgroundColor={theme.colors.background} horizontalPadding={0}>
      <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
        Nuevo grupo
      </Text>
      <Text variant="bodySmall" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        Se agrega al final de la cola: Supervisor calibra, Operador lo trabaja en orden de
        creación.
      </Text>

      <View style={styles.form}>
        <TextInput
          mode="outlined"
          label="Nombre del grupo"
          placeholder="Ej. Maiz y Sorgo"
          value={fields.nombre}
          onChangeText={set("nombre")}
          onBlur={() => setTouched(true)}
          style={styles.input}
        />
        <HelperText type="error" visible={Boolean(errors.nombre)}>
          {errors.nombre}
        </HelperText>

        <TextInput
          mode="outlined"
          label="Rubro 1"
          placeholder="Ej. Maiz"
          value={fields.item1}
          onChangeText={set("item1")}
          onBlur={() => setTouched(true)}
          style={styles.input}
        />
        <HelperText type="error" visible={Boolean(errors.item1)}>
          {errors.item1}
        </HelperText>

        <TextInput
          mode="outlined"
          label="Rubro 2"
          placeholder="Ej. Sorgo"
          value={fields.item2}
          onChangeText={set("item2")}
          onBlur={() => setTouched(true)}
          style={styles.input}
        />
        <HelperText type="error" visible={Boolean(errors.item2)}>
          {errors.item2}
        </HelperText>

        <Button
          mode="contained"
          icon="plus-circle"
          loading={isMutating}
          disabled={touched && hasErrors}
          onPress={handleSubmit}
          style={styles.button}
        >
          Crear grupo
        </Button>
      </View>
    </KeyboardAwareScreen>
  );
};

const styles = StyleSheet.create({
  title: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 0 },
  subtitle: { paddingHorizontal: 16, paddingTop: 6 },
  form: { padding: 16 },
  input: { marginTop: 8 },
  button: { marginTop: 16 },
});
