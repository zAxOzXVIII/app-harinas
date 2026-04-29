const { Router } = require("express");
const { body } = require("express-validator");
const {
  list,
  getOne,
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
