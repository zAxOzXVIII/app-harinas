const { validationResult } = require("express-validator");

const validateRequest = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = new Error("Datos de entrada inválidos");
    err.status = 400;
    err.details = errors.array();
    return next(err);
  }

  return next();
};

module.exports = { validateRequest };
