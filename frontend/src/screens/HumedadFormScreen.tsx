import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, HelperText, Text, TextInput } from "react-native-paper";
import { useGruposStore } from "../store/grupos.store";
import type { HumedadPayload } from "../types/grupoRubro";

interface Props {
  onSuccess: () => void;
}

interface FormFields {
  min: string;
  max: string;
  criticoMin: string;
  criticoMax: string;
}

const toStr = (n: number | undefined): string => (n === undefined || n === null ? "" : String(n));

export const HumedadFormScreen = ({ onSuccess }: Props) => {
  const humedad = useGruposStore((s) => s.humedad);
  const isMutating = useGruposStore((s) => s.isMutating);
  const updateHumedad = useGruposStore((s) => s.updateHumedad);

  const [fields, setFields] = useState<FormFields | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!humedad) return;
    setFields({
      min: toStr(humedad.min),
      max: toStr(humedad.max),
      criticoMin: toStr(humedad.criticoMin),
      criticoMax: toStr(humedad.criticoMax),
    });
  }, [humedad]);

  const errors = useMemo(() => {
    if (!touched || !fields) return {} as Record<keyof FormFields, string>;
    const numErr = (val: string, allowEmpty = false): string => {
      if (!val.trim()) return allowEmpty ? "" : "Obligatorio";
      const n = Number(val);
      if (isNaN(n)) return "Debe ser numero";
      if (n < 0 || n > 100) return "Debe estar entre 0 y 100";
      return "";
    };
    return {
      min: numErr(fields.min),
      max: numErr(fields.max),
      criticoMin: numErr(fields.criticoMin, true),
      criticoMax: numErr(fields.criticoMax, true),
    };
  }, [fields, touched]);

  if (!humedad || !fields) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const set = (key: keyof FormFields) => (val: string) =>
    setFields((prev) => (prev ? { ...prev, [key]: val } : prev));

  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = async () => {
    setTouched(true);
    if (hasErrors) return;
    const payload: HumedadPayload = {
      min: Number(fields.min),
      max: Number(fields.max),
      ...(fields.criticoMin.trim() ? { criticoMin: Number(fields.criticoMin) } : {}),
      ...(fields.criticoMax.trim() ? { criticoMax: Number(fields.criticoMax) } : {}),
    };

    try {
      await updateHumedad(payload);
      Alert.alert("Listo", "Humedad global actualizada");
      onSuccess();
    } catch {
      Alert.alert("Error", "No fue posible guardar la humedad");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Humedad global ({humedad.unidad ?? "%RH"})</Text>
          <Text variant="bodyMedium" style={styles.muted}>
            Aplica para todos los grupos de rubro.
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.row}>
        <View style={styles.col}>
          <TextInput
            mode="outlined"
            label="Min operativo"
            keyboardType="decimal-pad"
            value={fields.min}
            onChangeText={set("min")}
          />
          <HelperText type="error" visible={Boolean(errors.min)}>
            {errors.min}
          </HelperText>
        </View>
        <View style={styles.col}>
          <TextInput
            mode="outlined"
            label="Max operativo"
            keyboardType="decimal-pad"
            value={fields.max}
            onChangeText={set("max")}
          />
          <HelperText type="error" visible={Boolean(errors.max)}>
            {errors.max}
          </HelperText>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.col}>
          <TextInput
            mode="outlined"
            label="Min critico (opcional)"
            keyboardType="decimal-pad"
            value={fields.criticoMin}
            onChangeText={set("criticoMin")}
          />
          <HelperText type="error" visible={Boolean(errors.criticoMin)}>
            {errors.criticoMin}
          </HelperText>
        </View>
        <View style={styles.col}>
          <TextInput
            mode="outlined"
            label="Max critico (opcional)"
            keyboardType="decimal-pad"
            value={fields.criticoMax}
            onChangeText={set("criticoMax")}
          />
          <HelperText type="error" visible={Boolean(errors.criticoMax)}>
            {errors.criticoMax}
          </HelperText>
        </View>
      </View>

      <Button mode="contained" loading={isMutating} onPress={handleSubmit} style={styles.submit}>
        Guardar humedad global
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { borderRadius: 12, marginBottom: 12, backgroundColor: "#e8f5e9" },
  muted: { opacity: 0.7 },
  row: { flexDirection: "row", gap: 8 },
  col: { flex: 1 },
  submit: { marginTop: 16 },
});
