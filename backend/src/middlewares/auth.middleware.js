const jwt = require("jsonwebtoken");
const env = require("../config/env");

const requireAuth = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    const err = new Error("No autorizado");
    err.status = 401;
    return next(err);
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload;
    return next();
  } catch (_error) {
    const err = new Error("Token inválido o expirado");
    err.status = 401;
    return next(err);
  }
};

module.exports = { requireAuth };
