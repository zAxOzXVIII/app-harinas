let app;

const getApp = () => {
  if (!app) {
    app = require("../../src/app");
  }
  return app;
};

const loginAsGerente = async (request) => {
  const res = await request(getApp()).post("/api/auth/login").send({
    email: "admin@nativa.com",
    password: "admin123",
  });
  expect(res.status).toBe(200);
  return res.body.data.token;
};

const loginAsOperador = async (request) => {
  const res = await request(getApp()).post("/api/auth/login").send({
    email: "operador@nativa.com",
    password: "operador123",
  });
  expect(res.status).toBe(200);
  return res.body.data.token;
};

module.exports = { getApp, loginAsGerente, loginAsOperador };
