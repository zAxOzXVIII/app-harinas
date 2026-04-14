const {
  getAllHarinas,
  createHarina,
  updateHarina,
  deleteHarina,
} = require("../services/harina.service");

const listHarinas = async (_req, res, next) => {
  try {
    const harinas = await getAllHarinas();
    res.status(200).json({
      success: true,
      data: harinas,
    });
  } catch (error) {
    next(error);
  }
};

const createHarinaController = async (req, res, next) => {
  try {
    const harina = await createHarina(req.body);
    res.status(201).json({
      success: true,
      message: "Harina creada correctamente",
      data: harina,
    });
  } catch (error) {
    next(error);
  }
};

const updateHarinaController = async (req, res, next) => {
  try {
    const harina = await updateHarina(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Harina actualizada correctamente",
      data: harina,
    });
  } catch (error) {
    next(error);
  }
};

const deleteHarinaController = async (req, res, next) => {
  try {
    await deleteHarina(req.params.id);
    res.status(200).json({
      success: true,
      message: "Harina eliminada correctamente",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listHarinas,
  createHarinaController,
  updateHarinaController,
  deleteHarinaController,
};
