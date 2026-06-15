import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  children: ReactNode;
  /** Centra el contenido verticalmente cuando hay espacio libre (p. ej. login). */
  centerContent?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  horizontalPadding?: number;
}

/**
 * Scroll + ajuste al teclado. En Android usa `softwareKeyboardLayoutMode: resize` (app.json).
 */
export const KeyboardAwareScreen = ({
  children,
  centerContent = false,
  style,
  contentContainerStyle,
  backgroundColor,
  horizontalPadding = 16,
}: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={[styles.flex, backgroundColor ? { backgroundColor } : null, style]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          centerContent && styles.centerContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: Math.max(insets.top, 12),
            paddingBottom: Math.max(insets.bottom, 16) + 24,
          },
          contentContainerStyle,
        ]}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
  },
  centerContent: {
    justifyContent: "center",
  },
});
