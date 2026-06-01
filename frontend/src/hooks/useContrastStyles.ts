import { useMemo } from "react";
import { useTheme } from "react-native-paper";
import { useMutedTextStyle } from "./useMutedTextStyle";

/** Estilos de texto con contraste seguro en claro/oscuro. */
export const useContrastStyles = () => {
  const theme = useTheme();
  const muted = useMutedTextStyle();

  return useMemo(
    () => ({
      muted,
      title: { color: theme.colors.primary },
      body: { color: theme.colors.onSurface },
      onPrimaryContainer: { color: theme.colors.onPrimaryContainer },
      section: { color: theme.colors.primary, marginTop: 8, marginBottom: 8 },
      chipLabel: { fontSize: 11, color: "#1A1A1A" },
    }),
    [theme, muted]
  );
};
