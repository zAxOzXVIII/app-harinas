const request = require("supertest");
const { getApp, loginAsGerente } = require("./helpers/testApp");

describe("preguntas de seguridad y recuperacion", () => {
  it("devuelve el catalogo por rol", async () => {
    const res = await request(getApp()).get("/api/auth/security-questions").query({ rol: "operador" });
    expect(res.status).toBe(200);
    expect(res.body.data.required).toBe(2);
    expect(res.body.data.questions.length).toBeGreaterThanOrEqual(2);
    expect(res.body.data.questions[0]).toEqual(
      expect.objectContaining({ id: expect.any(String), text: expect.any(String) })
    );
  });

  it("admin crea operador con preguntas y recupera la contraseña", async () => {
    const token = await loginAsGerente(request);
    const email = `recupera-${Date.now()}@nativa.com`;

    const created = await request(getApp())
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        email,
        password: "antigua123",
        nombre: "Operador Recupera",
        rol: "operador",
        securityQuestions: [
          { questionId: "operador_turno", answer: "noche" },
          { questionId: "operador_color", answer: "rojo" },
        ],
      });

    expect(created.status).toBe(201);
    expect(created.body.data.hasSecurityQuestions).toBe(true);
    expect(created.body.data.securityQuestionIds).toHaveLength(2);

    const questions = await request(getApp()).post("/api/auth/recovery/questions").send({ email });
    expect(questions.status).toBe(200);
    expect(questions.body.data.questions).toHaveLength(2);
    expect(questions.body.data.rol).toBe("operador");

    const reset = await request(getApp()).post("/api/auth/recovery/reset").send({
      email,
      newPassword: "nueva1234",
      answers: [
        { questionId: "operador_turno", answer: "Noche" },
        { questionId: "operador_color", answer: "ROJO" },
      ],
    });
    expect(reset.status).toBe(200);

    const oldLogin = await request(getApp()).post("/api/auth/login").send({
      email,
      password: "antigua123",
    });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(getApp()).post("/api/auth/login").send({
      email,
      password: "nueva1234",
    });
    expect(newLogin.status).toBe(200);
    expect(newLogin.body.data.user.rol).toBe("operador");
  });

  it("rechaza respuestas incorrectas", async () => {
    const res = await request(getApp()).post("/api/auth/recovery/reset").send({
      email: "admin@nativa.com",
      newPassword: "otra1234",
      answers: [
        { questionId: "gerente_planta", answer: "incorrecta" },
        { questionId: "gerente_ciudad", answer: "incorrecta" },
      ],
    });
    expect(res.status).toBe(401);
  });

  it("permite al admin actualizar sus propias preguntas", async () => {
    const token = await loginAsGerente(request);
    const res = await request(getApp())
      .put("/api/auth/me/security-questions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        securityQuestions: [
          { questionId: "gerente_mascota", answer: "luna" },
          { questionId: "gerente_color", answer: "verde" },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.data.questions).toHaveLength(2);

    const restore = await request(getApp())
      .put("/api/auth/me/security-questions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        securityQuestions: [
          { questionId: "gerente_planta", answer: "nativa" },
          { questionId: "gerente_ciudad", answer: "caracas" },
        ],
      });
    expect(restore.status).toBe(200);
  });

  it("permite cambiar la propia contraseña con la clave actual", async () => {
    const token = await loginAsGerente(request);
    const email = `clave-${Date.now()}@nativa.com`;

    await request(getApp())
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        email,
        password: "vieja123",
        nombre: "Cambia Clave",
        rol: "operador",
        securityQuestions: [
          { questionId: "operador_turno", answer: "tarde" },
          { questionId: "operador_color", answer: "azul" },
        ],
      });

    const loginOp = await request(getApp()).post("/api/auth/login").send({
      email,
      password: "vieja123",
    });
    expect(loginOp.status).toBe(200);
    const opToken = loginOp.body.data.token;

    const bad = await request(getApp())
      .put("/api/auth/me/password")
      .set("Authorization", `Bearer ${opToken}`)
      .send({ currentPassword: "mala123", newPassword: "nueva123" });
    expect(bad.status).toBe(401);

    const ok = await request(getApp())
      .put("/api/auth/me/password")
      .set("Authorization", `Bearer ${opToken}`)
      .send({ currentPassword: "vieja123", newPassword: "nueva123" });
    expect(ok.status).toBe(200);

    const oldLogin = await request(getApp()).post("/api/auth/login").send({
      email,
      password: "vieja123",
    });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(getApp()).post("/api/auth/login").send({
      email,
      password: "nueva123",
    });
    expect(newLogin.status).toBe(200);
  });

  it("exige preguntas al crear un miembro del equipo", async () => {
    const token = await loginAsGerente(request);
    const res = await request(getApp())
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: "sinpreguntas@nativa.com",
        password: "clave123",
        nombre: "Sin Preguntas",
        rol: "supervisor",
      });
    expect(res.status).toBe(400);
  });
});
