const { Router } = require("express");
const { body } = require("express-validator");
const {
  listHarinas,
  createHarinaController,
  updateHarinaController,
  deleteHarinaController,
} = require("../controllers/harina.controller");
const { validateRequest } = require("../middlewares/validate.middleware");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = Router();

const harinaValidations = [
  body("nombre").trim().notEmpty().withMessage("El nombre es obligatorio"),
  body("tipo").trim().notEmpty().withMessage("El tipo es obligatorio"),
  body("cantidad")
    .isFloat({ min: 0 })
    .withMessage("La cantidad debe ser un número mayor o igual a 0"),
  body("unidad").trim().notEmpty().withMessage("La unidad es obligatoria"),
  body("fecha_registro")
    .isISO8601()
    .withMessage("fecha_registro debe ser una fecha válida"),
];

router.use(requireAuth);
router.get("/", listHarinas);
router.post("/", [...harinaValidations, validateRequest], createHarinaController);
router.put("/:id", [...harinaValidations, validateRequest], updateHarinaController);
router.delete("/:id", deleteHarinaController);

module.exports = router;
