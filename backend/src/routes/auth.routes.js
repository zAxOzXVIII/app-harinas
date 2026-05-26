const { Router } = require("express");
const { body } = require("express-validator");
const { login, registerPushToken } = require("../controllers/auth.controller");
const { authRateLimiter } = require("../middlewares/rateLimit.middleware");
const { requireAuth } = require("../middlewares/auth.middleware");
const { validateRequest } = require("../middlewares/validate.middleware");

const router = Router();

router.post(
  "/login",
  authRateLimiter,
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

router.put(
  "/push-token",
  requireAuth,
  [
    body("expoPushToken")
      .optional({ nullable: true })
      .isString()
      .trim()
      .withMessage("expoPushToken debe ser texto"),
    validateRequest,
  ],
  registerPushToken
);

module.exports = router;
