const {
  listGrupos,
  getGrupoById,
  updateCalibracion,
} = require("../services/grupoRubro.service");

const list = async (_req, res, next) => {
  try {
    const grupos = await listGrupos();
    res.status(200).json({ success: true, data: grupos });
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const grupo = await getGrupoById(req.params.id);
    res.status(200).json({ success: true, data: grupo });
  } catch (error) {
    next(error);
  }
};

const updateCalibracionController = async (req, res, next) => {
  try {
    const grupo = await updateCalibracion(req.params.id, req.body, req.user?.userId);
    res
      .status(200)
      .json({ success: true, message: "Calibracion actualizada", data: grupo });
  } catch (error) {
    next(error);
  }
};

module.exports = { list, getOne, updateCalibracionController };
