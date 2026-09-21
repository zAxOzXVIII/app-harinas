const { loginUser, updatePushToken } = require("../services/auth.service");
const {
  listSecurityQuestionCatalog,
  startRecovery,
  resetPasswordWithAnswers,
  getMySecurityQuestions,
  updateMySecurityQuestions,
} = require("../services/recovery.service");

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

const listSecurityQuestions = (req, res, next) => {
  try {
    const data = listSecurityQuestionCatalog(req.query.rol);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const recoveryQuestions = async (req, res, next) => {
  try {
    const data = await startRecovery(req.body.email);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const recoveryReset = async (req, res, next) => {
  try {
    const data = await resetPasswordWithAnswers(req.body);
    res.status(200).json({
      success: true,
      message: "Contraseña actualizada. Ya puedes iniciar sesion.",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const meSecurityQuestions = async (req, res, next) => {
  try {
    const data = await getMySecurityQuestions(req.user.userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const updateMeSecurityQuestions = async (req, res, next) => {
  try {
    const data = await updateMySecurityQuestions(req.user.userId, req.body.securityQuestions);
    res.status(200).json({
      success: true,
      message: "Preguntas de seguridad actualizadas",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  registerPushToken,
  listSecurityQuestions,
  recoveryQuestions,
  recoveryReset,
  meSecurityQuestions,
  updateMeSecurityQuestions,
};
