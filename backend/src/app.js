const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");
const authRoutes = require("./routes/auth.routes");
const harinaRoutes = require("./routes/harina.routes");
const userRoutes = require("./routes/user.routes");
const grupoRubroRoutes = require("./routes/grupoRubro.routes");
const humedadConfigRoutes = require("./routes/humedadConfig.routes");
const telemetryRoutes = require("./routes/telemetry.routes");
const processAlertRoutes = require("./routes/processAlert.routes");
const { apiRateLimiter } = require("./middlewares/rateLimit.middleware");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

const allowedOrigins = env.corsOrigins
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requests server-to-server / curl sin origin.
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origen no permitido por CORS"));
    },
  })
);
app.use(
  morgan("combined", {
    skip: (_req, res) => env.nodeEnv === "test" || res.statusCode < 400,
  })
);
app.use(apiRateLimiter);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API activa",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/harinas", harinaRoutes);
app.use("/api/users", userRoutes);
app.use("/api/grupos-rubro", grupoRubroRoutes);
app.use("/api/config/humedad", humedadConfigRoutes);
app.use("/api", telemetryRoutes);
app.use("/api/alerts", processAlertRoutes);

app.use((_req, _res, next) => {
  const err = new Error("Ruta no encontrada");
  err.status = 404;
  next(err);
});

app.use(errorHandler);

module.exports = app;
