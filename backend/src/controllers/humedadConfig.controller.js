const {
  getConfig,
  updateConfig,
} = require("../services/humedadConfig.service");

const getController = async (_req, res, next) => {
  try {
    const config = await getConfig();
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
};

const updateController = async (req, res, next) => {
  try {
    const config = await updateConfig(req.body, req.user?.userId);
    res.status(200).json({
      success: true,
      message: "Configuracion de humedad actualizada",
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getController, updateController };
