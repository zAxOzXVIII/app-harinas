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

  it("ingesta solo temperatura y humedad (AHT10 / fase climatica)", async () => {
    const res = await request(getApp())
      .post("/api/arduino/telemetry")
      .send({
        eventId: `test-clima-${Date.now()}`,
        deviceId: "esp32-aht10-01",
        codigoGrupo: "garbanzo-lenteja",
        timestamp: new Date().toISOString(),
        lecturas: {
          temperatura: 28.5,
          humedad: 62.3,
        },
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.lecturas.temperatura).toBe(28.5);
    expect(res.body.data.lecturas.humedad).toBe(62.3);
    expect(res.body.data.lecturas.nivelSecado).toBeUndefined();
    expect(res.body.data.lecturas.tiempoSecado).toBeUndefined();
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

  it("GET /api/telemetry/fluctuaciones/humedad agrupa por dia", async () => {
    const today = new Date();
    const todayIso = today.toISOString();

    await request(getApp())
      .post("/api/arduino/telemetry")
      .send({
        eventId: `fluct-${Date.now()}-a`,
        deviceId: "test-fluct",
        codigoGrupo: "garbanzo-lenteja",
        timestamp: todayIso,
        lecturas: { temperatura: 30, humedad: 50 },
      });

    await request(getApp())
      .post("/api/arduino/telemetry")
      .send({
        eventId: `fluct-${Date.now()}-b`,
        deviceId: "test-fluct",
        codigoGrupo: "garbanzo-lenteja",
        timestamp: todayIso,
        lecturas: { temperatura: 31, humedad: 90 },
      });

    const operadorRes = await request(getApp()).post("/api/auth/login").send({
      email: "operador@nativa.com",
      password: "operador123",
    });
    const operadorToken = operadorRes.body.data.token;

    const forbidden = await request(getApp())
      .get("/api/telemetry/fluctuaciones/humedad")
      .set("Authorization", `Bearer ${operadorToken}`);
    expect(forbidden.status).toBe(403);

    const res = await request(getApp())
      .get("/api/telemetry/fluctuaciones/humedad")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    const bucket = res.body.data.find((row) => row.codigoGrupo === "garbanzo-lenteja");
    expect(bucket).toBeDefined();
    expect(bucket.lecturas).toBeGreaterThanOrEqual(2);
    expect(bucket.humedadMin).toBeLessThanOrEqual(bucket.humedadMax);
    expect(bucket.umbrales.min).toBeDefined();
    expect(bucket.fueraRango).toBeGreaterThanOrEqual(1);
  });

  it("asocia lecturas USB (codigo semilla) al lote de harina", async () => {
    const createRes = await request(getApp())
      .post("/api/harinas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Cambir",
        tipo: "Calidad",
        cantidad: 20,
        unidad: "kg",
        fecha_registro: new Date().toISOString(),
      });

    expect(createRes.status).toBe(201);
    const grupoRef = createRes.body.data.grupoRubroId;
    const grupoId = typeof grupoRef === "string" ? grupoRef : grupoRef._id;
    expect(grupoId).toBeTruthy();

    const ingestRes = await request(getApp())
      .post("/api/arduino/telemetry")
      .send({
        eventId: `remap-${Date.now()}`,
        deviceId: "uno-usb-01",
        codigoGrupo: "garbanzo-lenteja",
        lecturas: { temperatura: 33.1, humedad: 41.2 },
      });

    expect([200, 201]).toContain(ingestRes.status);
    expect(String(ingestRes.body.data.grupoRubroId)).toBe(String(grupoId));

    await request(getApp())
      .delete(`/api/harinas/${createRes.body.data._id}`)
      .set("Authorization", `Bearer ${token}`);
  });
});
