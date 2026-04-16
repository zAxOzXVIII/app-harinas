import { useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";
import type { HarinaPayload } from "../types/harina";

interface FormFields {
  nombre: string;
  tipo: string;
  cantidad: string;
  unidad: string;
  fecha_registro: string;
}

interface Props {
  initialValues?: Partial<FormFields>;
  isLoading: boolean;
  submitLabel: string;
  onSubmit: (payload: HarinaPayload) => Promise<void>;
}

const EMPTY: FormFields = {
  nombre: "",
  tipo: "",
  cantidad: "",
  unidad: "",
  fecha_registro: "",
};

const toFormFields = (vals?: Partial<FormFields>): FormFields => ({
  ...EMPTY,
  ...vals,
});

export const HarinaForm = ({ initialValues, isLoading, submitLabel, onSubmit }: Props) => {
  const [fields, setFields] = useState<FormFields>(toFormFields(initialValues));
  const [touched, setTouched] = useState(false);

  const set = (key: keyof FormFields) => (val: string) =>
    setFields((prev) => ({ ...prev, [key]: val }));

  const errors = useMemo(() => {
    if (!touched) return {} as Record<keyof FormFields, string>;
    return {
      nombre: !fields.nombre.trim() ? "El nombre es obligatorio" : "",
      tipo: !fields.tipo.trim() ? "El tipo es obligatorio" : "",
      cantidad:
        !fields.cantidad.trim() || isNaN(Number(fields.cantidad)) || Number(fields.cantidad) < 0
          ? "Ingresa una cantidad valida (>= 0)"
          : "",
      unidad: !fields.unidad.trim() ? "La unidad es obligatoria" : "",
      fecha_registro: !fields.fecha_registro.trim()
        ? "La fecha es obligatoria"
        : !/^\d{4}-\d{2}-\d{2}$/.test(fields.fecha_registro)
        ? "Formato: AAAA-MM-DD"
        : "",
    };
  }, [fields, touched]);

  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = async () => {
    setTouched(true);
    if (hasErrors) return;

    await onSubmit({
      nombre: fields.nombre.trim(),
      tipo: fields.tipo.trim(),
      cantidad: Number(fields.cantidad),
      unidad: fields.unidad.trim(),
      fecha_registro: fields.fecha_registro.trim(),
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <TextInput
        mode="outlined"
        label="Nombre"
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
        label="Tipo"
        value={fields.tipo}
        onChangeText={set("tipo")}
        onBlur={() => setTouched(true)}
        style={styles.input}
      />
      <HelperText type="error" visible={Boolean(errors.tipo)}>
        {errors.tipo}
      </HelperText>

      <TextInput
        mode="outlined"
        label="Cantidad"
        keyboardType="decimal-pad"
        value={fields.cantidad}
        onChangeText={set("cantidad")}
        onBlur={() => setTouched(true)}
        style={styles.input}
      />
      <HelperText type="error" visible={Boolean(errors.cantidad)}>
        {errors.cantidad}
      </HelperText>

      <TextInput
        mode="outlined"
        label="Unidad (kg, gramos, etc)"
        value={fields.unidad}
        onChangeText={set("unidad")}
        onBlur={() => setTouched(true)}
        style={styles.input}
      />
      <HelperText type="error" visible={Boolean(errors.unidad)}>
        {errors.unidad}
      </HelperText>

      <TextInput
        mode="outlined"
        label="Fecha de registro (AAAA-MM-DD)"
        value={fields.fecha_registro}
        onChangeText={set("fecha_registro")}
        onBlur={() => setTouched(true)}
        placeholder="2026-04-14"
        style={styles.input}
      />
      <HelperText type="error" visible={Boolean(errors.fecha_registro)}>
        {errors.fecha_registro}
      </HelperText>

      <Button mode="contained" loading={isLoading} onPress={handleSubmit} style={styles.button}>
        {submitLabel}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginTop: 8,
  },
  button: {
    marginTop: 16,
  },
});
