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
    validateRequest,
  ],
  update
);

router.delete("/:id", remove);

module.exports = router;
