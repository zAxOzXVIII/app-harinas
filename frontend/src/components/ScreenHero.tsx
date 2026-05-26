import { StyleSheet, View, type ViewStyle } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";
import { brand } from "../theme";

interface Props {
  roleLabel: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const ScreenHero = ({ roleLabel, title, subtitle, children, style }: Props) => {
  const theme = useTheme();

  return (
    <Surface
      elevation={1}
      style={[styles.hero, { backgroundColor: theme.colors.surface }, style]}
    >
      <Text variant="labelLarge" style={[styles.role, { color: brand.primaryBlue }]}>
        {roleLabel}
      </Text>
      <Text variant="headlineSmall" style={styles.title}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="bodySmall" style={styles.subtitle}>
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
  subtitle: {
    marginTop: 6,
    opacity: 0.75,
    lineHeight: 18,
  },
});
