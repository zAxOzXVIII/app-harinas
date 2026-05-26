const request = require("supertest");
const { getApp, loginAsGerente } = require("./helpers/testApp");

describe("PUT /api/auth/push-token", () => {
  it("registra token Expo Push para usuario autenticado", async () => {
    const token = await loginAsGerente(request);
    const expoToken = "ExponentPushToken[test-gerente-token]";

    const res = await request(getApp())
      .put("/api/auth/push-token")
      .set("Authorization", `Bearer ${token}`)
      .send({ expoPushToken: expoToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pushRegistered).toBe(true);
  });

  it("permite borrar el token con null", async () => {
    const token = await loginAsGerente(request);

    await request(getApp())
      .put("/api/auth/push-token")
      .set("Authorization", `Bearer ${token}`)
      .send({ expoPushToken: "ExponentPushToken[clear-me]" });

    const res = await request(getApp())
      .put("/api/auth/push-token")
      .set("Authorization", `Bearer ${token}`)
      .send({ expoPushToken: null });

    expect(res.status).toBe(200);
    expect(res.body.data.pushRegistered).toBe(false);
  });

  it("rechaza peticiones sin autenticacion", async () => {
    const res = await request(getApp())
      .put("/api/auth/push-token")
      .send({ expoPushToken: "ExponentPushToken[anon]" });

    expect(res.status).toBe(401);
  });
});
