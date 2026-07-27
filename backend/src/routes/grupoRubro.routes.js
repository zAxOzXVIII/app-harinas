const { Router } = require("express");
const { body } = require("express-validator");
const {
  list,
  getOne,
  create,
  updateCalibracionController,
} = require("../controllers/grupoRubro.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRoles } = require("../middlewares/role.middleware");
const { validateRequest } = require("../middlewares/validate.middleware");

const router = Router();

// Lectura disponible para todos los roles autenticados.
router.use(requireAuth);
router.get("/", list);
router.get("/:id", getOne);

// Solo Gerente crea grupos (Admin > Supervisor > Operador).
const createValidations = [
  body("nombre").isString().trim().notEmpty().withMessage("nombre es requerido"),
  body("items").isArray({ min: 2, max: 2 }).withMessage("items debe tener exactamente 2 rubros"),
  body("items.*").isString().trim().notEmpty().withMessage("cada item debe ser texto no vacio"),
];

router.post(
  "/",
  requireRoles("gerente"),
  [...createValidations, validateRequest],
  create
);

// Solo Gerente y Supervisor pueden calibrar.
const calibracionValidations = [
  body("temperatura.min").optional().isFloat().withMessage("temperatura.min debe ser numero"),
  body("temperatura.max").optional().isFloat().withMessage("temperatura.max debe ser numero"),
  body("temperatura.criticoMin").optional().isFloat().withMessage("temperatura.criticoMin debe ser numero"),
  body("temperatura.criticoMax").optional().isFloat().withMessage("temperatura.criticoMax debe ser numero"),
  body("nivelSecado.min").optional().isFloat({ min: 0, max: 100 }),
  body("nivelSecado.max").optional().isFloat({ min: 0, max: 100 }),
  body("tiempoSecado.estimadoMin").optional().isFloat({ min: 0 }),
];

router.put(
  "/:id/calibracion",
  requireRoles("gerente", "supervisor"),
  [...calibracionValidations, validateRequest],
  updateCalibracionController
);

module.exports = router;
