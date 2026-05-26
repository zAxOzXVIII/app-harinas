const request = require("supertest");
const { getApp, loginAsGerente } = require("./helpers/testApp");

describe("API /api/harinas", () => {
  let token;

  beforeAll(async () => {
    token = await loginAsGerente(request);
  });

  it("rechaza listado sin token", async () => {
    const res = await request(getApp()).get("/api/harinas");
    expect(res.status).toBe(401);
  });

  it("crea, lista, actualiza y elimina harina", async () => {
    const app = getApp();

    const createRes = await request(app)
      .post("/api/harinas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Harina de prueba",
        tipo: "Integral",
        cantidad: 10,
        unidad: "kg",
        fecha_registro: new Date().toISOString(),
      });

    expect(createRes.status).toBe(201);
    const createdId = createRes.body.data._id;

    const listRes = await request(app)
      .get("/api/harinas")
      .set("Authorization", `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((h) => h._id === createdId)).toBe(true);

    const updateRes = await request(app)
      .put(`/api/harinas/${createdId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nombre: "Harina actualizada",
        tipo: "Integral",
        cantidad: 12,
        unidad: "kg",
        fecha_registro: new Date().toISOString(),
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.nombre).toBe("Harina actualizada");

    const deleteRes = await request(app)
      .delete(`/api/harinas/${createdId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteRes.status).toBe(200);
  });
});
