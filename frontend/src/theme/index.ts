import {
  MD3DarkTheme,
  MD3LightTheme,
  type MD3Theme,
} from "react-native-paper";
import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
  type Theme as NavigationTheme,
} from "@react-navigation/native";

const brand = {
  primary: "#2e7d32", // verde Nativa
  secondary: "#00796b",
  warning: "#ef6c00",
  critical: "#c62828",
  ok: "#2e7d32",
  surfaceLight: "#f4f6f8",
  surfaceDark: "#0f1419",
};

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 3,
  colors: {
    ...MD3LightTheme.colors,
    primary: brand.primary,
    secondary: brand.secondary,
    background: brand.surfaceLight,
    surface: "#ffffff",
    surfaceVariant: "#eef1f5",
    error: brand.critical,
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: 3,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#66bb6a",
    secondary: "#4db6ac",
    background: brand.surfaceDark,
    surface: "#161c22",
    surfaceVariant: "#1f262d",
    error: "#ef5350",
  },
};

export const navLight: NavigationTheme = {
  ...NavLightTheme,
  colors: {
    ...NavLightTheme.colors,
    background: lightTheme.colors.background,
    card: lightTheme.colors.surface,
    primary: lightTheme.colors.primary,
    text: lightTheme.colors.onSurface,
    border: "#e0e0e0",
  },
};

export const navDark: NavigationTheme = {
  ...NavDarkTheme,
  colors: {
    ...NavDarkTheme.colors,
    background: darkTheme.colors.background,
    card: darkTheme.colors.surface,
    primary: darkTheme.colors.primary,
    text: darkTheme.colors.onSurface,
    border: "#26313a",
  },
};

export const statusColors = {
  ok: brand.ok,
  warning: brand.warning,
  critical: brand.critical,
};
