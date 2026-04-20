const {
  listTeamUsers,
  createTeamUser,
  updateTeamUser,
  deleteTeamUser,
} = require("../services/user.service");

const toPublicUser = (doc) => ({
  id: doc._id.toString(),
  email: doc.email,
  nombre: doc.nombre,
  rol: doc.rol,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

const list = async (_req, res, next) => {
  try {
    const users = await listTeamUsers();
    res.status(200).json({ success: true, data: users.map(toPublicUser) });
  } catch (e) {
    next(e);
  }
};

const create = async (req, res, next) => {
  try {
    const user = await createTeamUser(req.body);
    res.status(201).json({ success: true, message: "Usuario creado", data: toPublicUser(user) });
  } catch (e) {
    next(e);
  }
};

const update = async (req, res, next) => {
  try {
    const user = await updateTeamUser(req.params.id, req.body);
    res.status(200).json({ success: true, message: "Usuario actualizado", data: toPublicUser(user) });
  } catch (e) {
    next(e);
  }
};

const remove = async (req, res, next) => {
  try {
    await deleteTeamUser(req.params.id);
    res.status(200).json({ success: true, message: "Usuario eliminado" });
  } catch (e) {
    next(e);
  }
};

module.exports = { list, create, update, remove };
