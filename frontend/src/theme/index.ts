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

/** Paleta corporativa verde Nativa — Control de planta */
export const brand = {
  /** Fondo oscuro principal (verde muy profundo). */
  navyDeep: "#0D1F0D",
  /** Verde primario (botones, bordes activos, íconos). */
  primaryBlue: "#2E7D32",
  /** Verde oscuro para fondos de botón. */
  primaryBlueDark: "#1B5E20",
  /** Verde claro de acento (chips, indicadores). */
  skyAccent: "#66BB6A",
  /** Ámbar dorado del logo (subtítulo SUPERALIMENTOS). */
  amberBrand: "#F9A825",
  surfaceCard: "#FFFFFF",
  /** Superficie tenue con tono verde claro. */
  surfaceMuted: "#E8F5E9",
  textOnDark: "#E8F5E9",
  /** Texto secundario legible sobre fondos claros (≈ AA). */
  textMutedOnLight: "#475569",
  /** Texto secundario legible sobre fondos oscuros. */
  textMutedOnDark: "#C8E6C9",
  warning: "#EF6C00",
  critical: "#C62828",
  ok: "#2E7D32",
  /** Fondo de pantalla en modo claro. */
  surfaceLight: "#F1F8E9",
  /** Fondo de pantalla en modo oscuro. */
  surfaceDark: "#0A170A",
};

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 12,
  colors: {
    ...MD3LightTheme.colors,
    primary: brand.primaryBlue,
    onPrimary: "#FFFFFF",
    primaryContainer: "#C8E6C9",
    onPrimaryContainer: "#1B5E20",
    secondary: brand.skyAccent,
    onSecondary: "#FFFFFF",
    secondaryContainer: "#DCEDC8",
    onSecondaryContainer: "#1B5E20",
    background: brand.surfaceLight,
    surface: brand.surfaceCard,
    surfaceVariant: brand.surfaceMuted,
    onSurface: "#0F172A",
    onSurfaceVariant: brand.textMutedOnLight,
    onBackground: "#0F172A",
    outline: "#4CAF50",
    error: brand.critical,
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: 12,
  colors: {
    ...MD3DarkTheme.colors,
    primary: brand.skyAccent,
    onPrimary: "#0D1F0D",
    primaryContainer: "#1B5E20",
    onPrimaryContainer: "#E8F5E9",
    secondary: "#A5D6A7",
    onSecondary: "#0D1F0D",
    secondaryContainer: "#2E4A2E",
    onSecondaryContainer: "#C8E6C9",
    background: brand.surfaceDark,
    surface: "#101E10",
    surfaceVariant: "#1A2E1A",
    onSurface: "#F1F8E9",
    onSurfaceVariant: "#C8E6C9",
    onBackground: "#F1F8E9",
    outline: "#81C784",
    outlineVariant: "#4CAF50",
    error: "#F87171",
    onError: "#0D1F0D",
    errorContainer: "#5C1A1A",
    onErrorContainer: "#FECACA",
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: "#142014",
      level2: "#182818",
      level3: "#1A2E1A",
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
    text: "#1B5E20",
    border: "#C8E6C9",
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
    border: "#1A2E1A",
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
