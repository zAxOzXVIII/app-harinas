import { useMemo } from "react";
import { useTheme } from "react-native-paper";
import { useBreakpoint } from "./useBreakpoint";

/** Padding y fondo consistentes para ScrollView / FlatList. */
export const useScreenLayout = () => {
  const theme = useTheme();
  const bp = useBreakpoint();

  return useMemo(
    () => ({
      ...bp,
      backgroundColor: theme.colors.background,
      scrollContent: {
        padding: bp.contentPadding,
        paddingBottom: 32,
        gap: 12,
      } as const,
      listContent: {
        padding: bp.contentPadding,
        paddingBottom: 90,
      } as const,
      toolbarPadding: {
        paddingHorizontal: bp.contentPadding,
        paddingTop: 12,
        paddingBottom: 4,
      } as const,
    }),
    [bp, theme.colors.background]
  );
};
