const { Router } = require("express");
const { body } = require("express-validator");
const { list, create, update, remove } = require("../controllers/user.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRoles } = require("../middlewares/role.middleware");
const { validateRequest } = require("../middlewares/validate.middleware");

const router = Router();

router.use(requireAuth, requireRoles("gerente"));

router.get("/", list);

router.post(
  "/",
  [
    body("email").isEmail().withMessage("Email invalido"),
    body("password")
      .isString()
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("nombre").trim().notEmpty().withMessage("El nombre es obligatorio"),
    body("rol").isIn(["supervisor", "operador"]).withMessage("Rol debe ser supervisor u operador"),
    body("securityQuestions")
      .isArray({ min: 2, max: 2 })
      .withMessage("Debes configurar 2 preguntas de seguridad"),
    body("securityQuestions.*.questionId")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Falta el identificador de la pregunta"),
    body("securityQuestions.*.answer")
      .isString()
      .isLength({ min: 3 })
      .withMessage("Cada respuesta debe tener al menos 3 caracteres"),
    validateRequest,
  ],
  create
);

router.put(
  "/:id",
  [
    body("email").optional().isEmail().withMessage("Email invalido"),
    body("password")
      .optional()
      .isString()
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("nombre").optional().trim().notEmpty().withMessage("El nombre no puede estar vacio"),
    body("rol").optional().isIn(["supervisor", "operador"]).withMessage("Rol invalido"),
    body("securityQuestions")
      .optional()
      .isArray({ min: 2, max: 2 })
      .withMessage("Debes configurar 2 preguntas de seguridad"),
    body("securityQuestions.*.questionId")
      .if(body("securityQuestions").exists())
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Falta el identificador de la pregunta"),
    body("securityQuestions.*.answer")
      .if(body("securityQuestions").exists())
      .isString()
      .isLength({ min: 3 })
      .withMessage("Cada respuesta debe tener al menos 3 caracteres"),
    validateRequest,
  ],
  update
);

router.delete("/:id", remove);

module.exports = router;
