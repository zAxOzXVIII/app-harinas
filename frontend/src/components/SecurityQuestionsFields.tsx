import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Menu, Text, TextInput, useTheme } from "react-native-paper";
import type { SecurityQuestion } from "../types/securityQuestions";

type Slot = { questionId: string; answer: string };

interface Props {
  catalog: SecurityQuestion[];
  slots: [Slot, Slot];
  onChange: (slots: [Slot, Slot]) => void;
  answersOptional?: boolean;
}

export const emptySecuritySlots = (): [Slot, Slot] => [
  { questionId: "", answer: "" },
  { questionId: "", answer: "" },
];

export const SecurityQuestionsFields = ({ catalog, slots, onChange, answersOptional }: Props) => {
  const theme = useTheme();
  const [openMenu, setOpenMenu] = useState<0 | 1 | null>(null);

  const updateSlot = (index: 0 | 1, patch: Partial<Slot>) => {
    const next: [Slot, Slot] = [{ ...slots[0] }, { ...slots[1] }];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  return (
    <View style={styles.wrap}>
      <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
        Preguntas de seguridad
      </Text>
      <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
        Elige 2 preguntas distintas. Sirven para recuperar el acceso en el login.
        {answersOptional ? " Si no cambias las respuestas, déjalas vacías." : ""}
      </Text>
      {([0, 1] as const).map((index) => {
        const slot = slots[index];
        const selected = catalog.find((q) => q.id === slot.questionId);
        const usedOther = slots[1 - index].questionId;
        return (
          <View key={index} style={styles.slot}>
            <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
              Pregunta {index + 1}
            </Text>
            <Menu
              visible={openMenu === index}
              onDismiss={() => setOpenMenu(null)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setOpenMenu(index)}
                  style={styles.picker}
                  contentStyle={styles.pickerContent}
                >
                  {selected?.text || "Seleccionar pregunta"}
                </Button>
              }
            >
              {catalog
                .filter((q) => q.id !== usedOther)
                .map((q) => (
                  <Menu.Item
                    key={q.id}
                    title={q.text}
                    onPress={() => {
                      updateSlot(index, { questionId: q.id });
                      setOpenMenu(null);
                    }}
                  />
                ))}
            </Menu>
            <TextInput
              mode="outlined"
              label={answersOptional ? "Respuesta (opcional)" : "Respuesta"}
              value={slot.answer}
              onChangeText={(answer) => updateSlot(index, { answer })}
              style={styles.input}
            />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginTop: 16 },
  hint: { marginTop: 4, marginBottom: 12 },
  slot: { marginBottom: 8 },
  picker: { marginTop: 8, marginBottom: 8, justifyContent: "flex-start" },
  pickerContent: { justifyContent: "flex-start" },
  input: { marginBottom: 4 },
});
