const request = require("supertest");
const { getApp, loginAsGerente } = require("./helpers/testApp");

describe("API /api/alerts", () => {
  let token;

  beforeAll(async () => {
    token = await loginAsGerente(request);

    await request(getApp())
      .post("/api/arduino/telemetry")
      .send({
        eventId: `alert-trigger-${Date.now()}`,
        deviceId: "test-alert-device",
        codigoGrupo: "garbanzo-lenteja",
        lecturas: {
          nivelSecado: 50,
          tiempoSecado: 40,
          temperatura: 99,
          humedad: 45,
        },
      });
  });

  it("lista alertas autenticado", async () => {
    const res = await request(getApp())
      .get("/api/alerts")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("cuenta alertas no leidas", async () => {
    const res = await request(getApp())
      .get("/api/alerts/count")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(typeof res.body.data.unread).toBe("number");
  });

  it("marca una alerta como leida", async () => {
    const listRes = await request(getApp())
      .get("/api/alerts?limit=5")
      .set("Authorization", `Bearer ${token}`);

    const alert = listRes.body.data.find((a) => !a.leida);
    if (!alert) {
      return;
    }

    const res = await request(getApp())
      .patch(`/api/alerts/${alert._id}/read`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.leida).toBe(true);
  });

  it("marca todas como leidas", async () => {
    const res = await request(getApp())
      .post("/api/alerts/mark-all-read")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    const countRes = await request(getApp())
      .get("/api/alerts/count")
      .set("Authorization", `Bearer ${token}`);

    expect(countRes.body.data.unread).toBe(0);
  });
});
