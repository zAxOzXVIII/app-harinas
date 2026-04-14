const errorHandler = (err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || "Error interno del servidor";

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
    errors: err.details || undefined,
  });
};

module.exports = { errorHandler };
