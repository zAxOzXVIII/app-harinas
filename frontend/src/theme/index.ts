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

/** Paleta corporativa azul Nativa — Control de planta */
export const brand = {
  navyDeep: "#0B1320",
  primaryBlue: "#1565C0",
  primaryBlueDark: "#0D47A1",
  skyAccent: "#42A5F5",
  surfaceCard: "#FFFFFF",
  surfaceMuted: "#E8EEF4",
  textOnDark: "#E3F2FD",
  warning: "#EF6C00",
  critical: "#C62828",
  ok: "#2E7D32",
  surfaceLight: "#F5F9FC",
  surfaceDark: "#0F1419",
};

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 12,
  colors: {
    ...MD3LightTheme.colors,
    primary: brand.primaryBlue,
    onPrimary: "#FFFFFF",
    primaryContainer: "#E3F2FD",
    onPrimaryContainer: brand.primaryBlueDark,
    secondary: brand.skyAccent,
    onSecondary: "#FFFFFF",
    secondaryContainer: "#E1F5FE",
    background: brand.surfaceLight,
    surface: brand.surfaceCard,
    surfaceVariant: brand.surfaceMuted,
    error: brand.critical,
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: 12,
  colors: {
    ...MD3DarkTheme.colors,
    primary: brand.skyAccent,
    onPrimary: brand.navyDeep,
    primaryContainer: "#1E3A5F",
    onPrimaryContainer: brand.textOnDark,
    secondary: "#64B5F6",
    background: brand.surfaceDark,
    surface: "#161C22",
    surfaceVariant: "#1F262D",
    error: "#EF5350",
  },
};

export const navLight: NavigationTheme = {
  ...NavLightTheme,
  colors: {
    ...NavLightTheme.colors,
    background: lightTheme.colors.background,
    card: lightTheme.colors.surface,
    primary: brand.primaryBlue,
    text: "#1A237E",
    border: "#E0E7EF",
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
    border: "#26313A",
  },
};

export const statusColors = {
  ok: brand.ok,
  warning: brand.warning,
  critical: brand.critical,
};
