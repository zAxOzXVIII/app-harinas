const { loginUser } = require("../services/auth.service");

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

module.exports = { login };
