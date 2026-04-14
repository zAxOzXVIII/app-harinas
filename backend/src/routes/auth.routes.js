const { Router } = require("express");
const { body } = require("express-validator");
const { login } = require("../controllers/auth.controller");
const { validateRequest } = require("../middlewares/validate.middleware");

const router = Router();

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("password")
      .isString()
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
    validateRequest,
  ],
  login
);

module.exports = router;
