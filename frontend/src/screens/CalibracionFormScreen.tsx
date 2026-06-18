import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { ActivityIndicator, Banner, Button, Card, HelperText, Text, TextInput } from "react-native-paper";
import { KeyboardAwareScreen } from "../components/KeyboardAwareScreen";
import { useContrastStyles } from "../hooks/useContrastStyles";
import { useGruposStore } from "../store/grupos.store";
import { useAuthStore } from "../store/auth.store";
import { procesoSecadoService } from "../services/procesoSecado.service";
import type { CalibracionPayload } from "../types/grupoRubro";
import type { ProcesoSecado } from "../types/procesoSecado";

interface Props {
  grupoId: string;
  onSuccess: () => void;
}

interface FormFields {
  tempMin: string;
  tempMax: string;
  tempCriticoMin: string;
  tempCriticoMax: string;
  nivelMin: string;
  nivelMax: string;
  tiempoEstimado: string;
}

const toStr = (n: number | undefined): string => (n === undefined || n === null ? "" : String(n));

export const CalibracionFormScreen = ({ grupoId, onSuccess }: Props) => {
  const { muted: mutedText, title: titleStyle, body: bodyStyle } = useContrastStyles();
  const grupos = useGruposStore((s) => s.grupos);
  const isMutating = useGruposStore((s) => s.isMutating);
  const updateCalibracion = useGruposStore((s) => s.updateCalibracion);
  const user = useAuthStore((s) => s.user);
  const isGerente = user?.rol === "gerente" || !user?.rol;

  const grupo = useMemo(() => grupos.find((g) => g._id === grupoId), [grupos, grupoId]);

  const [fields, setFields] = useState<FormFields | null>(null);
  const [touched, setTouched] = useState(false);
  const [procesoActual, setProcesoActual] = useState<ProcesoSecado | null>(null);
  const [reabriendo, setReabriendo] = useState(false);

  const loteCerrado = procesoActual?.estado === "revisado_empaquetado";

  useEffect(() => {
    if (!grupoId) return;
    procesoSecadoService.getByGrupo(grupoId).then(setProcesoActual).catch(() => setProcesoActual(null));
  }, [grupoId]);

  useEffect(() => {
    if (!grupo) return;
    setFields({
      tempMin: toStr(grupo.calibracion.temperatura.min),
      tempMax: toStr(grupo.calibracion.temperatura.max),
      tempCriticoMin: toStr(grupo.calibracion.temperatura.criticoMin),
      tempCriticoMax: toStr(grupo.calibracion.temperatura.criticoMax),
      nivelMin: toStr(grupo.calibracion.nivelSecado.min),
      nivelMax: toStr(grupo.calibracion.nivelSecado.max),
      tiempoEstimado: toStr(grupo.calibracion.tiempoSecado.estimadoMin),
    });
  }, [grupo]);

  if (!grupo || !fields) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const set = (key: keyof FormFields) => (val: string) =>
    setFields((prev) => (prev ? { ...prev, [key]: val } : prev));

  const numErr = (val: string, allowEmpty = false): string => {
    if (!val.trim()) return allowEmpty ? "" : "Obligatorio";
    if (isNaN(Number(val))) return "Debe ser numero";
    return "";
  };

  const errors = touched
    ? {
        tempMin: numErr(fields.tempMin),
        tempMax: numErr(fields.tempMax),
        tempCriticoMin: numErr(fields.tempCriticoMin, true),
        tempCriticoMax: numErr(fields.tempCriticoMax, true),
        nivelMin: numErr(fields.nivelMin),
        nivelMax: numErr(fields.nivelMax),
        tiempoEstimado: numErr(fields.tiempoEstimado),
      }
    : ({} as Record<keyof FormFields, string>);

  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = async () => {
    setTouched(true);
    if (hasErrors) return;

    const payload: CalibracionPayload = {
      temperatura: {
        min: Number(fields.tempMin),
        max: Number(fields.tempMax),
        ...(fields.tempCriticoMin.trim() ? { criticoMin: Number(fields.tempCriticoMin) } : {}),
        ...(fields.tempCriticoMax.trim() ? { criticoMax: Number(fields.tempCriticoMax) } : {}),
      },
      nivelSecado: {
        min: Number(fields.nivelMin),
        max: Number(fields.nivelMax),
      },
      tiempoSecado: {
        estimadoMin: Number(fields.tiempoEstimado),
      },
    };

    try {
      await updateCalibracion(grupoId, payload);
      Alert.alert("Listo", "Calibracion actualizada");
      onSuccess();
    } catch {
      Alert.alert("Error", "No fue posible guardar la calibracion. El lote puede estar cerrado.");
    }
  };

  const handleReabrirLote = async () => {
    setReabriendo(true);
    try {
      await procesoSecadoService.reabrirLote(grupoId);
      setProcesoActual(null);
      Alert.alert("Lote reabierto", "El operador puede iniciar un nuevo ciclo de secado.");
    } catch {
      Alert.alert("Error", "No fue posible reabrir el lote.");
    } finally {
      setReabriendo(false);
    }
  };

  return (
    <KeyboardAwareScreen>
      {loteCerrado ? (
        <Banner
          visible
          icon="lock-alert"
          style={styles.banner}
          actions={
            isGerente
              ? [
                  {
                    label: "Reabrir lote",
                    loading: reabriendo,
                    onPress: handleReabrirLote,
                  },
                ]
              : undefined
          }
        >
          Lote cerrado (revisado/empaquetado). El gerente puede reabrir para un nuevo ciclo.
        </Banner>
      ) : null}
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text variant="titleLarge" style={bodyStyle}>{grupo.nombre}</Text>
          <Text variant="bodyMedium" style={mutedText}>
            {grupo.items.join(" + ")}
          </Text>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={[styles.section, titleStyle]}>
        Temperatura ({grupo.calibracion.temperatura.unidad ?? "C"})
      </Text>
      <View style={styles.row}>
        <View style={styles.col}>
          <TextInput
            mode="outlined"
            label="Min operativo"
            keyboardType="decimal-pad"
            value={fields.tempMin}
            onChangeText={set("tempMin")}
          />
          <HelperText type="error" visible={Boolean(errors.tempMin)}>
            {errors.tempMin}
          </HelperText>
        </View>
        <View style={styles.col}>
          <TextInput
            mode="outlined"
            label="Max operativo"
            keyboardType="decimal-pad"
            value={fields.tempMax}
            onChangeText={set("tempMax")}
          />
          <HelperText type="error" visible={Boolean(errors.tempMax)}>
            {errors.tempMax}
          </HelperText>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.col}>
          <TextInput
            mode="outlined"
            label="Min critico (opcional)"
            keyboardType="decimal-pad"
            value={fields.tempCriticoMin}
            onChangeText={set("tempCriticoMin")}
          />
          <HelperText type="error" visible={Boolean(errors.tempCriticoMin)}>
            {errors.tempCriticoMin}
          </HelperText>
        </View>
        <View style={styles.col}>
          <TextInput
            mode="outlined"
            label="Max critico (opcional)"
            keyboardType="decimal-pad"
            value={fields.tempCriticoMax}
            onChangeText={set("tempCriticoMax")}
          />
          <HelperText type="error" visible={Boolean(errors.tempCriticoMax)}>
            {errors.tempCriticoMax}
          </HelperText>
        </View>
      </View>

      <Text variant="titleMedium" style={[styles.section, titleStyle]}>
        Nivel de secado (% ventilador)
      </Text>
      <View style={styles.row}>
        <View style={styles.col}>
          <TextInput
            mode="outlined"
            label="Min %"
            keyboardType="decimal-pad"
            value={fields.nivelMin}
            onChangeText={set("nivelMin")}
          />
          <HelperText type="error" visible={Boolean(errors.nivelMin)}>
            {errors.nivelMin}
          </HelperText>
        </View>
        <View style={styles.col}>
          <TextInput
            mode="outlined"
            label="Max %"
            keyboardType="decimal-pad"
            value={fields.nivelMax}
            onChangeText={set("nivelMax")}
          />
          <HelperText type="error" visible={Boolean(errors.nivelMax)}>
            {errors.nivelMax}
          </HelperText>
        </View>
      </View>

      <Text variant="titleMedium" style={[styles.section, titleStyle]}>
        Tiempo de secado estimado (min)
      </Text>
      <TextInput
        mode="outlined"
        label="Minutos"
        keyboardType="decimal-pad"
        value={fields.tiempoEstimado}
        onChangeText={set("tiempoEstimado")}
      />
      <HelperText type="error" visible={Boolean(errors.tiempoEstimado)}>
        {errors.tiempoEstimado}
      </HelperText>

      <Button
        mode="contained"
        loading={isMutating}
        onPress={handleSubmit}
        style={styles.submit}
        disabled={loteCerrado}
      >
        Guardar calibracion
      </Button>
    </KeyboardAwareScreen>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  banner: { marginBottom: 12, borderRadius: 8 },
  headerCard: { borderRadius: 12, marginBottom: 12 },
  section: { marginTop: 12, marginBottom: 4 },
  row: { flexDirection: "row", gap: 8 },
  col: { flex: 1 },
  submit: { marginTop: 16 },
});
