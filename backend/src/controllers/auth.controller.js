const { loginUser, updatePushToken } = require("../services/auth.service");

const registerPushToken = async (req, res, next) => {
  try {
    const user = await updatePushToken(req.user.userId, req.body.expoPushToken || null);
    res.status(200).json({
      success: true,
      message: "Token de notificaciones actualizado",
      data: { id: user._id, email: user.email, pushRegistered: Boolean(user.expoPushToken) },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);

    res.status(200).json({
      success: true,
      message: "Login exitoso",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, registerPushToken };
