const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authRoutes = require("./routes/auth.routes");
const harinaRoutes = require("./routes/harina.routes");
const userRoutes = require("./routes/user.routes");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
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

app.use((_req, _res, next) => {
  const err = new Error("Ruta no encontrada");
  err.status = 404;
  next(err);
});

app.use(errorHandler);

module.exports = app;
