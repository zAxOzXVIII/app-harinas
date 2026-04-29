const { Router } = require("express");
const { body } = require("express-validator");
const {
  getController,
  updateController,
} = require("../controllers/humedadConfig.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRoles } = require("../middlewares/role.middleware");
const { validateRequest } = require("../middlewares/validate.middleware");

const router = Router();

router.use(requireAuth);
router.get("/", getController);

const humedadValidations = [
  body("min").optional().isFloat({ min: 0, max: 100 }),
  body("max").optional().isFloat({ min: 0, max: 100 }),
  body("criticoMin").optional().isFloat({ min: 0, max: 100 }),
  body("criticoMax").optional().isFloat({ min: 0, max: 100 }),
];

router.put(
  "/",
  requireRoles("gerente", "supervisor"),
  [...humedadValidations, validateRequest],
  updateController
);

module.exports = router;
