const { Router } = require("express");
const {
  listActivosController,
  getActualController,
  iniciarController,
  completarController,
  marcarEmpaquetadoController,
  reabrirLoteController,
} = require("../controllers/procesoSecado.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRoles } = require("../middlewares/role.middleware");

const router = Router();

router.use(requireAuth);

router.get(
  "/activos",
  requireRoles("operador", "supervisor", "gerente"),
  listActivosController
);

router.get("/grupo/:grupoRubroId", getActualController);

router.post(
  "/grupo/:grupoRubroId/iniciar",
  requireRoles("operador"),
  iniciarController
);

router.post(
  "/:id/completar",
  requireRoles("operador", "gerente"),
  completarController
);

router.post(
  "/:id/marcar-empaquetado",
  requireRoles("operador", "supervisor", "gerente"),
  marcarEmpaquetadoController
);

router.post(
  "/grupo/:grupoRubroId/reabrir",
  requireRoles("gerente"),
  reabrirLoteController
);

module.exports = router;
