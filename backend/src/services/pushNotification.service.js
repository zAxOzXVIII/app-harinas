const User = require("../models/User");
const env = require("../config/env");

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const isPushEnabled = () =>
  env.nodeEnv !== "test" && process.env.PUSH_NOTIFICATIONS_ENABLED !== "false";

/**
 * Envía notificaciones Expo Push a operadores y gerentes con token registrado.
 */
const notifyNewProcessAlert = async (alert, grupoNombre = "Grupo") => {
  if (!isPushEnabled() || !alert) return { sent: 0 };

  const users = await User.find({
    rol: { $in: ["operador", "gerente"] },
    expoPushToken: { $exists: true, $nin: [null, ""] },
  }).select("expoPushToken rol");

  if (!users.length) return { sent: 0 };

  const title =
    alert.severidad === "critical"
      ? "Alerta crítica de proceso"
      : alert.severidad === "info"
        ? "Tarea completada"
        : "Alerta de proceso";

  const messages = users.map((u) => ({
    to: u.expoPushToken,
    sound: "default",
    title,
    body: alert.mensaje || `${grupoNombre}: nueva alerta`,
    data: {
      alertId: alert._id?.toString(),
      tipo: alert.tipo,
      grupoNombre,
    },
  }));

  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Expo push falló: ${response.status} ${text}`);
  }

  return { sent: messages.length };
};

module.exports = { notifyNewProcessAlert, isPushEnabled };
