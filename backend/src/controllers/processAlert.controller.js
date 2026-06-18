const {
  listAlerts,
  countUnread,
  markRead,
  markAllRead,
  softDeleteAlert,
  softDeleteAllAlerts,
} = require("../services/processAlert.service");

const list = async (req, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const unreadOnly = req.query.unreadOnly === "1" || req.query.unreadOnly === "true";
    const grupoRubroId = req.query.grupoRubroId || null;
    const procesoSecadoId = req.query.procesoSecadoId || null;
    const data = await listAlerts({ limit, unreadOnly, grupoRubroId, procesoSecadoId });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const count = async (_req, res, next) => {
  try {
    const unread = await countUnread();
    res.status(200).json({ success: true, data: { unread } });
  } catch (error) {
    next(error);
  }
};

const markOneRead = async (req, res, next) => {
  try {
    const doc = await markRead(req.params.id);
    res.status(200).json({ success: true, message: "Alerta marcada como leida", data: doc });
  } catch (error) {
    next(error);
  }
};

const markAll = async (_req, res, next) => {
  try {
    await markAllRead();
    res.status(200).json({ success: true, message: "Todas las alertas marcadas como leidas" });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const doc = await softDeleteAlert(req.params.id);
    res.status(200).json({ success: true, message: "Alerta eliminada", data: doc });
  } catch (error) {
    next(error);
  }
};

const removeAll = async (_req, res, next) => {
  try {
    const result = await softDeleteAllAlerts();
    res.status(200).json({
      success: true,
      message: "Alertas eliminadas (borrado logico)",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { list, count, markOneRead, markAll, remove, removeAll };
