import { useMemo } from "react";
import { useTheme, type MD3Theme } from "react-native-paper";

/** Color de texto secundario legible según tema claro/oscuro. */
export const getMutedTextColor = (theme: MD3Theme) => theme.colors.onSurfaceVariant;

/** Estilo para labels, hints y metadatos (sin opacity). */
export const useMutedTextStyle = () => {
  const theme = useTheme();
  return useMemo(() => ({ color: getMutedTextColor(theme) }), [theme]);
};
