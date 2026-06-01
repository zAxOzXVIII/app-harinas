import { StyleSheet, View, type ViewStyle } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { brand } from "../theme";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useMutedTextStyle } from "../hooks/useMutedTextStyle";

interface Props {
  roleLabel: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const ScreenHero = ({ roleLabel, title, subtitle, children, style }: Props) => {
  const theme = useTheme();
  const bp = useBreakpoint();
  const mutedText = useMutedTextStyle();

  return (
    <Surface
      elevation={1}
      style={[styles.hero, { backgroundColor: theme.colors.surface }, style]}
    >
      <Text variant="labelLarge" style={[styles.role, { color: theme.colors.primary }]}>
        {roleLabel}
      </Text>
      <Text
        variant={bp.isSmallPhone ? "titleLarge" : "headlineSmall"}
        style={[
          styles.title,
          { color: theme.colors.onSurface },
          bp.isSmallPhone ? styles.titleSmall : null,
        ]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text variant="bodySmall" style={[styles.subtitle, mutedText]}>
          {subtitle}
        </Text>
      ) : null}
      {children}
    </Surface>
  );
};

const styles = StyleSheet.create({
  hero: {
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: brand.primaryBlue,
  },
  role: {
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontSize: 11,
  },
  title: {
    marginTop: 4,
    fontWeight: "700",
  },
  titleSmall: {
    lineHeight: 28,
  },
  subtitle: {
    marginTop: 6,
    lineHeight: 20,
  },
});
