import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { authService } from "../services/auth.service";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function resolveExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Alertas de proceso",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    console.warn("EAS projectId no configurado; notificaciones push deshabilitadas");
    return null;
  }

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}

/** Registra el token Expo Push en el backend cuando hay sesión activa. */
export function useRegisterPushToken(enabled: boolean) {
  const lastSentRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!enabled) {
      if (lastSentRef.current) {
        authService.registerPushToken(null).catch(() => {});
        lastSentRef.current = undefined;
      }
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const token = await resolveExpoPushToken();
        if (cancelled || token === lastSentRef.current) {
          return;
        }
        await authService.registerPushToken(token);
        lastSentRef.current = token;
      } catch (err) {
        console.warn("useRegisterPushToken:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);
}
