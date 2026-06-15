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
  /** Texto secundario legible sobre fondos claros (≈ AA). */
  textMutedOnLight: "#475569",
  /** Texto secundario legible sobre fondos oscuros. */
  textMutedOnDark: "#E2E8F0",
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
    primaryContainer: "#D6E8F7",
    onPrimaryContainer: "#0D3B66",
    secondary: brand.skyAccent,
    onSecondary: "#FFFFFF",
    secondaryContainer: "#E1F5FE",
    onSecondaryContainer: "#0D3B66",
    background: brand.surfaceLight,
    surface: brand.surfaceCard,
    surfaceVariant: brand.surfaceMuted,
    onSurface: "#0F172A",
    onSurfaceVariant: brand.textMutedOnLight,
    onBackground: "#0F172A",
    outline: "#64748B",
    error: brand.critical,
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: 12,
  colors: {
    ...MD3DarkTheme.colors,
    primary: brand.skyAccent,
    onPrimary: "#0B1320",
    primaryContainer: "#1E3A5F",
    onPrimaryContainer: "#F1F5F9",
    secondary: "#64B5F6",
    onSecondary: "#0B1320",
    secondaryContainer: "#243B55",
    onSecondaryContainer: "#E3F2FD",
    background: brand.surfaceDark,
    surface: "#161C22",
    surfaceVariant: "#24303D",
    onSurface: "#F8FAFC",
    onSurfaceVariant: "#E2E8F0",
    onBackground: "#F8FAFC",
    outline: "#94A3B8",
    outlineVariant: "#64748B",
    error: "#F87171",
    onError: "#0B1320",
    errorContainer: "#5C1A1A",
    onErrorContainer: "#FECACA",
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: "#1A2229",
      level2: "#1E2730",
      level3: "#24303D",
    },
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

/** Colores de estado legibles sobre fondos oscuros. */
export const statusColorsDark = {
  ok: "#4ADE80",
  warning: "#FBBF24",
  critical: "#F87171",
};
