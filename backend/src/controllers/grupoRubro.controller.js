const {
  listGrupos,
  getGrupoById,
  updateCalibracion,
  createGrupo,
} = require("../services/grupoRubro.service");

const list = async (req, res, next) => {
  try {
    const activos =
      req.query.activos === "1" ||
      req.query.activos === "true" ||
      req.query.activos === true;
    const soloHarinas =
      req.query.soloHarinas === "1" ||
      req.query.soloHarinas === "true" ||
      req.query.soloHarinas === true;
    const grupos = await listGrupos({ activos, soloHarinas });
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

const create = async (req, res, next) => {
  try {
    const { nombre, items, calibracion } = req.body;
    const grupo = await createGrupo({ nombre, items, calibracion }, req.user?.userId);
    res.status(201).json({ success: true, message: "Grupo creado", data: grupo });
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

module.exports = { list, getOne, create, updateCalibracionController };
