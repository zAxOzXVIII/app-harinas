const request = require("supertest");
const { getApp, loginAsGerente } = require("./helpers/testApp");

describe("API /api/grupos-rubro", () => {
  let token;
  let grupoId;

  beforeAll(async () => {
    token = await loginAsGerente(request);
    const listRes = await request(getApp())
      .get("/api/grupos-rubro")
      .set("Authorization", `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(3);
    const garbanzo = listRes.body.data.find((g) => g.codigo === "garbanzo-lenteja");
    grupoId = garbanzo._id;
  });

  it("lista grupos ordenados con calibracion", async () => {
    const res = await request(getApp())
      .get("/api/grupos-rubro")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const codigos = res.body.data.map((g) => g.codigo);
    expect(codigos).toContain("garbanzo-lenteja");
    expect(res.body.data[0].calibracion.temperatura).toBeDefined();
  });

  it("obtiene un grupo por id", async () => {
    const res = await request(getApp())
      .get(`/api/grupos-rubro/${grupoId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.codigo).toBe("garbanzo-lenteja");
  });

  it("actualiza calibracion como gerente", async () => {
    const res = await request(getApp())
      .put(`/api/grupos-rubro/${grupoId}/calibracion`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        temperatura: { min: 28, max: 52 },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.calibracion.temperatura.min).toBe(28);
    expect(res.body.data.actualizadoEn).toBeDefined();
  });

  it("rechaza calibracion sin autenticacion", async () => {
    const res = await request(getApp())
      .put(`/api/grupos-rubro/${grupoId}/calibracion`)
      .send({ temperatura: { min: 20, max: 40 } });

    expect(res.status).toBe(401);
  });
});
