import { useMemo } from "react";
import { useTheme } from "react-native-paper";
import { useMutedTextStyle } from "./useMutedTextStyle";

/** Estilos de texto con contraste seguro en claro/oscuro. */
export const useContrastStyles = () => {
  const theme = useTheme();
  const muted = useMutedTextStyle();
  const isDark = theme.dark;

  return useMemo(
    () => ({
      muted,
      title: { color: theme.colors.primary },
      body: { color: theme.colors.onSurface },
      onPrimaryContainer: { color: theme.colors.onPrimaryContainer },
      section: { color: theme.colors.primary, marginTop: 8, marginBottom: 8 },
      chipLabel: {
        fontSize: 11,
        color: isDark ? theme.colors.onErrorContainer : "#1A1A1A",
      },
      chipWarnLabel: {
        fontSize: 11,
        color: isDark ? "#FEF3C7" : "#1A1A1A",
      },
      chipWarnBg: isDark ? "rgba(251, 191, 36, 0.22)" : "#ffe0b2",
      chipCritBg: isDark ? theme.colors.errorContainer : "#ffcdd2",
    }),
    [theme, muted, isDark]
  );
};
