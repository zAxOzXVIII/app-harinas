const request = require("supertest");
const { getApp } = require("./helpers/testApp");

describe("POST /api/auth/login", () => {
  it("login exitoso con credenciales de prueba", async () => {
    const res = await request(getApp()).post("/api/auth/login").send({
      email: "admin@nativa.com",
      password: "admin123",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.rol).toBe("gerente");
  });

  it("rechaza contraseña incorrecta", async () => {
    const res = await request(getApp()).post("/api/auth/login").send({
      email: "admin@nativa.com",
      password: "wrong-password",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("valida email invalido", async () => {
    const res = await request(getApp()).post("/api/auth/login").send({
      email: "no-es-email",
      password: "admin123",
    });

    expect(res.status).toBe(400);
  });
});
