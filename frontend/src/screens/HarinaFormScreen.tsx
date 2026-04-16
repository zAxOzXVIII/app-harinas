import { Alert, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { HarinaForm } from "../components/HarinaForm";
import { useHarinasStore } from "../store/harinas.store";
import type { Harina, HarinaPayload } from "../types/harina";

interface Props {
  harinaToEdit?: Harina;
  onSuccess: () => void;
}

export const HarinaFormScreen = ({ harinaToEdit, onSuccess }: Props) => {
  const isMutating = useHarinasStore((state) => state.isMutating);
  const createHarina = useHarinasStore((state) => state.createHarina);
  const updateHarina = useHarinasStore((state) => state.updateHarina);

  const isEditing = Boolean(harinaToEdit);

  const handleSubmit = async (payload: HarinaPayload) => {
    try {
      if (isEditing && harinaToEdit) {
        await updateHarina(harinaToEdit._id, payload);
        Alert.alert("Listo", "Harina actualizada correctamente");
      } else {
        await createHarina(payload);
        Alert.alert("Listo", "Harina creada correctamente");
      }
      onSuccess();
    } catch {
      Alert.alert("Error", isEditing ? "No fue posible actualizar la harina" : "No fue posible crear la harina");
    }
  };

  const initialValues = harinaToEdit
    ? {
        nombre: harinaToEdit.nombre,
        tipo: harinaToEdit.tipo,
        cantidad: String(harinaToEdit.cantidad),
        unidad: harinaToEdit.unidad,
        fecha_registro: harinaToEdit.fecha_registro.slice(0, 10),
      }
    : undefined;

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        {isEditing ? "Editar harina" : "Nueva harina"}
      </Text>
      <HarinaForm
        initialValues={initialValues}
        isLoading={isMutating}
        submitLabel={isEditing ? "Guardar cambios" : "Crear harina"}
        onSubmit={handleSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  title: {
    padding: 16,
    paddingBottom: 0,
  },
});
