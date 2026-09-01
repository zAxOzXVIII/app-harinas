const request = require("supertest");
const { getApp } = require("./helpers/testApp");

describe("GET /api/health", () => {
  it("responde 200 y success true", async () => {
    const res = await request(getApp()).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/activa/i);
  });

  it("GET / responde 200 para el probe de Render", async () => {
    const res = await request(getApp()).get("/");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.health).toBe("/api/health");
  });
});
