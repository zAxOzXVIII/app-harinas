const { Router } = require("express");
const { body, query } = require("express-validator");
const {
  ingest,
  latest,
  recentByGroup,
} = require("../controllers/telemetry.controller");
const { validateRequest } = require("../middlewares/validate.middleware");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = Router();

const ingestValidations = [
  body("eventId").optional().isString().trim().notEmpty(),
  body("deviceId").isString().trim().notEmpty().withMessage("deviceId es obligatorio"),
  body("grupoRubroId").optional().isMongoId().withMessage("grupoRubroId invalido"),
  body("codigoGrupo").optional().isString().trim().notEmpty(),
  body("timestamp").optional().isISO8601().withMessage("timestamp invalido"),
  body("lecturas.nivelSecado").isFloat({ min: 0, max: 100 }),
  body("lecturas.tiempoSecado").isFloat({ min: 0 }),
  body("lecturas.temperatura").isFloat(),
  body("lecturas.humedad").isFloat({ min: 0, max: 100 }),
  validateRequest,
];

// Ingestion: pensado para Arduino / simulador.
router.post("/arduino/telemetry", ingestValidations, ingest);

// Consultas para app.
router.get("/telemetry/latest", requireAuth, latest);
router.get(
  "/telemetry/group/:grupoRubroId",
  requireAuth,
  [query("limit").optional().isInt({ min: 1, max: 200 }), validateRequest],
  recentByGroup
);

module.exports = router;
