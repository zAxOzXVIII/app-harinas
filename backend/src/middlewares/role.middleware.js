const requireRoles =
  (...allowedRoles) =>
  (req, _res, next) => {
    const rol = req.user?.rol;
    if (!rol || !allowedRoles.includes(rol)) {
      const err = new Error("No tienes permiso para esta accion");
      err.status = 403;
      return next(err);
    }
    return next();
  };

module.exports = { requireRoles };
