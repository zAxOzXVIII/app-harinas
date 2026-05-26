const request = require("supertest");
const { getApp, loginAsGerente } = require("./helpers/testApp");

describe("API telemetria", () => {
  let token;

  beforeAll(async () => {
    token = await loginAsGerente(request);
  });

  it("ingesta lectura valida por codigoGrupo", async () => {
    const res = await request(getApp())
      .post("/api/arduino/telemetry")
      .send({
        eventId: `test-ingest-${Date.now()}`,
        deviceId: "test-device-01",
        codigoGrupo: "garbanzo-lenteja",
        lecturas: {
          nivelSecado: 55,
          tiempoSecado: 40,
          temperatura: 38,
          humedad: 45,
        },
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.lecturas.temperatura).toBe(38);
  });

  it("rechaza payload sin deviceId", async () => {
    const res = await request(getApp())
      .post("/api/arduino/telemetry")
      .send({
        codigoGrupo: "garbanzo-lenteja",
        lecturas: {
          nivelSecado: 50,
          tiempoSecado: 30,
          temperatura: 35,
          humedad: 50,
        },
      });

    expect(res.status).toBe(400);
  });

  it("deduplica por eventId", async () => {
    const eventId = `dedup-${Date.now()}`;
    const payload = {
      eventId,
      deviceId: "test-device-dedup",
      codigoGrupo: "platano-cambur",
      lecturas: {
        nivelSecado: 40,
        tiempoSecado: 30,
        temperatura: 30,
        humedad: 50,
      },
    };

    const first = await request(getApp()).post("/api/arduino/telemetry").send(payload);
    expect([200, 201]).toContain(first.status);

    const second = await request(getApp()).post("/api/arduino/telemetry").send(payload);
    expect(second.status).toBe(200);
    expect(second.body.deduplicated).toBe(true);
  });

  it("GET /api/telemetry/latest requiere auth y devuelve datos", async () => {
    await request(getApp())
      .post("/api/arduino/telemetry")
      .send({
        eventId: `latest-${Date.now()}`,
        deviceId: "test-device-latest",
        codigoGrupo: "yuca-batata",
        lecturas: {
          nivelSecado: 60,
          tiempoSecado: 50,
          temperatura: 42,
          humedad: 48,
        },
      });

    const unauth = await request(getApp()).get("/api/telemetry/latest");
    expect(unauth.status).toBe(401);

    const res = await request(getApp())
      .get("/api/telemetry/latest")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
