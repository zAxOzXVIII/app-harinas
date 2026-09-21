const { Router } = require("express");
const { body, query } = require("express-validator");
const {
  login,
  registerPushToken,
  listSecurityQuestions,
  recoveryQuestions,
  recoveryReset,
  meSecurityQuestions,
  updateMeSecurityQuestions,
  changePassword,
} = require("../controllers/auth.controller");
const { authRateLimiter } = require("../middlewares/rateLimit.middleware");
const { requireAuth } = require("../middlewares/auth.middleware");
const { validateRequest } = require("../middlewares/validate.middleware");

const router = Router();

const securityQuestionsRules = (field, optional = false) => {
  const root = optional ? body(field).optional() : body(field);
  return [
    root.isArray({ min: 2, max: 2 }).withMessage("Debes configurar 2 preguntas de seguridad"),
    body(`${field}.*.questionId`)
      .if(body(field).exists())
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Falta el identificador de la pregunta"),
    body(`${field}.*.answer`)
      .if(body(field).exists())
      .isString()
      .isLength({ min: 3 })
      .withMessage("Cada respuesta debe tener al menos 3 caracteres"),
  ];
};

router.get(
  "/security-questions",
  [
    query("rol")
      .optional()
      .isIn(["gerente", "supervisor", "operador"])
      .withMessage("Rol invalido"),
    validateRequest,
  ],
  listSecurityQuestions
);

router.post(
  "/recovery/questions",
  authRateLimiter,
  [body("email").isEmail().withMessage("Email invalido"), validateRequest],
  recoveryQuestions
);

router.post(
  "/recovery/reset",
  authRateLimiter,
  [
    body("email").isEmail().withMessage("Email invalido"),
    body("newPassword")
      .isString()
      .isLength({ min: 6 })
      .withMessage("La nueva contraseña debe tener al menos 6 caracteres"),
    ...securityQuestionsRules("answers", false),
    validateRequest,
  ],
  recoveryReset
);

router.get("/me/security-questions", requireAuth, meSecurityQuestions);

router.put(
  "/me/security-questions",
  requireAuth,
  [...securityQuestionsRules("securityQuestions", false), validateRequest],
  updateMeSecurityQuestions
);

router.put(
  "/me/password",
  requireAuth,
  [
    body("currentPassword")
      .isString()
      .isLength({ min: 6 })
      .withMessage("La contraseña actual es obligatoria"),
    body("newPassword")
      .isString()
      .isLength({ min: 6 })
      .withMessage("La nueva contraseña debe tener al menos 6 caracteres"),
    validateRequest,
  ],
  changePassword
);

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
