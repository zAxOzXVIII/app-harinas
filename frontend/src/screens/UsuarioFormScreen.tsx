import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, SegmentedButtons, Text, TextInput } from "react-native-paper";
import { usersService } from "../services/users.service";
import type { TeamUser } from "../types/auth";

interface Props {
  userId?: string;
  onSuccess: () => void;
}

export const UsuarioFormScreen = ({ userId, onSuccess }: Props) => {
  const isEdit = Boolean(userId);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"supervisor" | "operador">("operador");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

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
      } catch {
        Alert.alert("Error", "No fue posible cargar el usuario");
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const submit = async () => {
    if (!nombre.trim() || !email.trim()) {
      Alert.alert("Validacion", "Nombre y email son obligatorios");
      return;
    }
    if (!isEdit && password.length < 6) {
      Alert.alert("Validacion", "La contraseña debe tener al menos 6 caracteres");
      return;
    }
    try {
      setLoading(true);
      if (isEdit && userId) {
        const payload: Partial<{ nombre: string; email: string; password: string; rol: TeamUser["rol"] }> = {
          nombre: nombre.trim(),
          email: email.trim().toLowerCase(),
          rol,
        };
        if (password.length >= 6) payload.password = password;
        await usersService.update(userId, payload);
        Alert.alert("Listo", "Usuario actualizado");
      } else {
        await usersService.create({
          nombre: nombre.trim(),
          email: email.trim().toLowerCase(),
          password,
          rol,
        });
        Alert.alert("Listo", "Usuario creado");
      }
      onSuccess();
    } catch {
      Alert.alert("Error", "No fue posible guardar");
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
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        {isEdit ? "Editar miembro del equipo" : "Nuevo supervisor u operador"}
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
      <Text style={styles.label}>Rol</Text>
      <SegmentedButtons
        value={rol}
        onValueChange={(v) => setRol(v as "supervisor" | "operador")}
        buttons={[
          { value: "supervisor", label: "Supervisor" },
          { value: "operador", label: "Operador" },
        ]}
      />
      <Button mode="contained" loading={loading} onPress={submit} style={styles.button}>
        {isEdit ? "Guardar" : "Registrar"}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f4f6f8" },
  title: { marginBottom: 16 },
  input: { marginBottom: 8 },
  label: { marginTop: 12, marginBottom: 8 },
  button: { marginTop: 24 },
  hint: { opacity: 0.7, marginBottom: 8 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
