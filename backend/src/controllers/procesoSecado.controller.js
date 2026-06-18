const {
  listActivos,
  getActualByGrupo,
  iniciarSecado,
  completarManual,
  marcarEmpaquetado,
  reabrirLote,
} = require("../services/procesoSecado.service");

const listActivosController = async (_req, res, next) => {
  try {
    const data = await listActivos();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getActualController = async (req, res, next) => {
  try {
    const data = await getActualByGrupo(req.params.grupoRubroId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const iniciarController = async (req, res, next) => {
  try {
    const data = await iniciarSecado(req.params.grupoRubroId, req.user?.userId);
    res.status(201).json({ success: true, message: "Secado iniciado", data });
  } catch (error) {
    next(error);
  }
};

const completarController = async (req, res, next) => {
  try {
    const data = await completarManual(req.params.id, req.user?.userId);
    res.status(200).json({ success: true, message: "Secado completado", data });
  } catch (error) {
    next(error);
  }
};

const marcarEmpaquetadoController = async (req, res, next) => {
  try {
    const data = await marcarEmpaquetado(req.params.id);
    res.status(200).json({ success: true, message: "Lote marcado como empaquetado", data });
  } catch (error) {
    next(error);
  }
};

const reabrirLoteController = async (req, res, next) => {
  try {
    const data = await reabrirLote(req.params.grupoRubroId);
    res.status(200).json({ success: true, message: "Lote reabierto para nuevo ciclo", data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listActivosController,
  getActualController,
  iniciarController,
  completarController,
  marcarEmpaquetadoController,
  reabrirLoteController,
};
