const request = require("supertest");
const { getApp, loginAsGerente, loginAsOperador, loginAsSupervisor } = require("./helpers/testApp");

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

  describe("cola de grupos: crear (Admin) + orden de creacion (FIFO)", () => {
    it("gerente crea un grupo nuevo", async () => {
      const res = await request(getApp())
        .post("/api/grupos-rubro")
        .set("Authorization", `Bearer ${token}`)
        .send({ nombre: "Maiz y Sorgo", items: ["Maiz", "Sorgo"] });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nombre).toBe("Maiz y Sorgo");
      expect(res.body.data.codigo).toBeTruthy();
      expect(res.body.data.calibracion.temperatura).toBeDefined();
    });

    it("rechaza crear sin nombre o con items distinto de 2", async () => {
      const sinNombre = await request(getApp())
        .post("/api/grupos-rubro")
        .set("Authorization", `Bearer ${token}`)
        .send({ items: ["A", "B"] });
      expect(sinNombre.status).toBe(400);

      const unItem = await request(getApp())
        .post("/api/grupos-rubro")
        .set("Authorization", `Bearer ${token}`)
        .send({ nombre: "Grupo Invalido", items: ["Solo uno"] });
      expect(unItem.status).toBe(400);
    });

    it("operador no puede crear grupos", async () => {
      const opToken = await loginAsOperador(request);
      const res = await request(getApp())
        .post("/api/grupos-rubro")
        .set("Authorization", `Bearer ${opToken}`)
        .send({ nombre: "Grupo Operador", items: ["X", "Y"] });

      expect(res.status).toBe(403);
    });

    it("supervisor no puede crear grupos", async () => {
      const supToken = await loginAsSupervisor(request);
      const res = await request(getApp())
        .post("/api/grupos-rubro")
        .set("Authorization", `Bearer ${supToken}`)
        .send({ nombre: "Grupo Supervisor", items: ["X", "Y"] });

      expect(res.status).toBe(403);
    });

    it("la lista queda ordenada por fecha de creacion (mas viejo primero)", async () => {
      const creado1 = await request(getApp())
        .post("/api/grupos-rubro")
        .set("Authorization", `Bearer ${token}`)
        .send({ nombre: "Cola Uno", items: ["A1", "A2"] });
      const creado2 = await request(getApp())
        .post("/api/grupos-rubro")
        .set("Authorization", `Bearer ${token}`)
        .send({ nombre: "Cola Dos", items: ["B1", "B2"] });

      expect(creado1.status).toBe(201);
      expect(creado2.status).toBe(201);

      const res = await request(getApp())
        .get("/api/grupos-rubro")
        .set("Authorization", `Bearer ${token}`);

      const ids = res.body.data.map((g) => g._id);
      const idxUno = ids.indexOf(creado1.body.data._id);
      const idxDos = ids.indexOf(creado2.body.data._id);

      expect(idxUno).toBeGreaterThanOrEqual(0);
      expect(idxDos).toBeGreaterThan(idxUno);
    });
  });
});
