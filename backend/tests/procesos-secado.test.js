const request = require("supertest");
const { getApp, loginAsGerente, loginAsOperador } = require("./helpers/testApp");

describe("API /api/procesos-secado", () => {
  let gerenteToken;
  let operadorToken;
  let grupoGarbanzo;
  let grupoPlatano;
  let grupoYuca;

  beforeAll(async () => {
    gerenteToken = await loginAsGerente(request);
    operadorToken = await loginAsOperador(request);

    const listRes = await request(getApp())
      .get("/api/grupos-rubro")
      .set("Authorization", `Bearer ${gerenteToken}`);
    grupoGarbanzo = listRes.body.data.find((g) => g.codigo === "garbanzo-lenteja");
    grupoPlatano = listRes.body.data.find((g) => g.codigo === "platano-cambur");
    grupoYuca = listRes.body.data.find((g) => g.codigo === "yuca-batata");
  });

  it("operador inicia secado correctamente", async () => {
    const res = await request(getApp())
      .post(`/api/procesos-secado/grupo/${grupoGarbanzo._id}/iniciar`)
      .set("Authorization", `Bearer ${operadorToken}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.estado).toBe("en_secado");
    expect(res.body.data.duracionMin).toBeGreaterThan(0);
    expect(res.body.data.finalizaEn).toBeDefined();
  });

  it("rechaza doble inicio en el mismo grupo", async () => {
    const res = await request(getApp())
      .post(`/api/procesos-secado/grupo/${grupoGarbanzo._id}/iniciar`)
      .set("Authorization", `Bearer ${operadorToken}`);

    expect(res.status).toBe(409);
  });

  it("lista procesos activos", async () => {
    const res = await request(getApp())
      .get("/api/procesos-secado/activos")
      .set("Authorization", `Bearer ${operadorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].restanteMs).toBeDefined();
  });

  it("completar secado crea alerta secado_completado", async () => {
    const actualRes = await request(getApp())
      .get(`/api/procesos-secado/grupo/${grupoGarbanzo._id}`)
      .set("Authorization", `Bearer ${operadorToken}`);
    const procesoId = actualRes.body.data._id;

    const completeRes = await request(getApp())
      .post(`/api/procesos-secado/${procesoId}/completar`)
      .set("Authorization", `Bearer ${operadorToken}`);

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.estado).toBe("revisado_empaquetado");
    expect(completeRes.body.data.resultado).toBe("listo");

    const alertsRes = await request(getApp())
      .get("/api/alerts?limit=20")
      .set("Authorization", `Bearer ${gerenteToken}`);

    const found = alertsRes.body.data.find((a) => a.tipo === "secado_completado");
    expect(found).toBeDefined();
    expect(found.severidad).toBe("info");
  });

  it("rechaza iniciar en lote empaquetado", async () => {
    const res = await request(getApp())
      .post(`/api/procesos-secado/grupo/${grupoGarbanzo._id}/iniciar`)
      .set("Authorization", `Bearer ${operadorToken}`);

    expect(res.status).toBe(409);
  });

  it("filtro activos excluye grupos empaquetados", async () => {
    const res = await request(getApp())
      .get("/api/grupos-rubro?activos=true")
      .set("Authorization", `Bearer ${operadorToken}`);

    expect(res.status).toBe(200);
    const ids = res.body.data.map((g) => g._id);
    expect(ids).not.toContain(grupoGarbanzo._id);
    expect(ids).toContain(grupoPlatano._id);
  });

  it("bloquea recalibracion en lote cerrado", async () => {
    const res = await request(getApp())
      .put(`/api/grupos-rubro/${grupoGarbanzo._id}/calibracion`)
      .set("Authorization", `Bearer ${gerenteToken}`)
      .send({ temperatura: { min: 29, max: 51 } });

    expect(res.status).toBe(409);
  });

  it("inicia secado en otro grupo libre", async () => {
    const res = await request(getApp())
      .post(`/api/procesos-secado/grupo/${grupoPlatano._id}/iniciar`)
      .set("Authorization", `Bearer ${operadorToken}`);

    expect(res.status).toBe(201);
    expect(res.body.data.estado).toBe("en_secado");
  });

  it("cierra como poco optimo si hay alertas sin atender", async () => {
    const ProcessAlert = require("../src/models/ProcessAlert");
    const actualRes = await request(getApp())
      .get(`/api/procesos-secado/grupo/${grupoPlatano._id}`)
      .set("Authorization", `Bearer ${operadorToken}`);
    const procesoId = actualRes.body.data._id;

    await ProcessAlert.create({
      tipo: "temp_critico",
      severidad: "critical",
      grupoRubroId: grupoPlatano._id,
      procesoSecadoId: procesoId,
      mensaje: "Temperatura critica durante secado",
      leida: false,
    });

    const completeRes = await request(getApp())
      .post(`/api/procesos-secado/${procesoId}/completar`)
      .set("Authorization", `Bearer ${operadorToken}`);

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.resultado).toBe("poco_optimo");
    expect(completeRes.body.data.calificacion).toBe("quemado");
    expect(completeRes.body.data.alertasPendientesAlCierre).toBe(1);
  });

  it("rechaza iniciar secado como gerente", async () => {
    const res = await request(getApp())
      .post(`/api/procesos-secado/grupo/${grupoYuca._id}/iniciar`)
      .set("Authorization", `Bearer ${gerenteToken}`);

    expect(res.status).toBe(403);
  });

  it("gerente reabre lote cerrado y operador puede iniciar de nuevo", async () => {
    const reopenRes = await request(getApp())
      .post(`/api/procesos-secado/grupo/${grupoGarbanzo._id}/reabrir`)
      .set("Authorization", `Bearer ${gerenteToken}`);

    expect(reopenRes.status).toBe(200);
    expect(reopenRes.body.data.reabierto).toBe(true);

    const activosRes = await request(getApp())
      .get("/api/grupos-rubro?activos=true")
      .set("Authorization", `Bearer ${operadorToken}`);

    expect(activosRes.body.data.map((g) => g._id)).toContain(grupoGarbanzo._id);

    const startRes = await request(getApp())
      .post(`/api/procesos-secado/grupo/${grupoGarbanzo._id}/iniciar`)
      .set("Authorization", `Bearer ${operadorToken}`);

    expect(startRes.status).toBe(201);
  });
});
