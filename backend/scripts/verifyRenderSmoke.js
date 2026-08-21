/**
 * Smoke contra Render (no destruye el demo: crea y borra un lote temporal).
 * Uso: node src/scripts/verifyRenderSmoke.js
 */
const BASE = process.env.RENDER_URL || "https://app-harinas.onrender.com";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const request = async (method, path, { token, body } = {}) => {
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: res.status, json };
};

const login = async (email, password) => {
  const res = await request("POST", "/api/auth/login", { body: { email, password } });
  if (res.status !== 200 || !res.json?.data?.token) {
    throw new Error(`Login ${email} → ${res.status} ${JSON.stringify(res.json)}`);
  }
  return res.json.data.token;
};

const waitHealth = async () => {
  const deadline = Date.now() + 8 * 60 * 1000;
  let attempt = 0;
  while (Date.now() < deadline) {
    attempt += 1;
    try {
      const res = await request("GET", "/api/health");
      if (res.status === 200 && res.json?.success === true) {
        console.log(`health OK (intento ${attempt})`);
        return;
      }
      console.log(`health ${res.status} (intento ${attempt})`);
    } catch (err) {
      console.log(`health error (intento ${attempt}): ${err.message}`);
    }
    await sleep(15000);
  }
  throw new Error("Render no respondió /api/health a tiempo (deploy o cold start)");
};

const waitNewDeploy = async (token) => {
  const deadline = Date.now() + 10 * 60 * 1000;
  let lastHarinaId = null;
  while (Date.now() < deadline) {
    const stamp = `VerifyRender-${Date.now()}`;
    const created = await request("POST", "/api/harinas", {
      token,
      body: {
        nombre: stamp,
        tipo: "Calidad",
        cantidad: 1,
        unidad: "kg",
        fecha_registro: new Date().toISOString(),
      },
    });
    if (created.status === 201 && created.json?.data?._id) {
      lastHarinaId = created.json.data._id;
      const gid = created.json.data.grupoRubroId;
      if (gid) {
        console.log("deploy nuevo detectado: harina trae grupoRubroId");
        return { harinaId: lastHarinaId, grupoId: typeof gid === "string" ? gid : gid._id };
      }
      await request("DELETE", `/api/harinas/${lastHarinaId}`, { token });
      console.log("deploy viejo (sin grupoRubroId). Esperando rebuild…");
    } else {
      console.log(`POST /api/harinas → ${created.status}`);
    }
    await sleep(20000);
  }
  throw new Error("Render no tiene aún el commit de lotes/harina");
};

const main = async () => {
  const results = [];
  const check = (name, ok, extra = "") => {
    results.push({ name, ok, extra });
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? ` — ${extra}` : ""}`);
    if (!ok) throw new Error(name);
  };

  console.log(`Smoke Render → ${BASE}`);
  await waitHealth();
  check("GET /api/health", true);

  const admin = await login("admin@nativa.com", "admin123");
  check("login Admin", true, "admin@nativa.com");
  const gerente = await login("supervisor@nativa.com", "supervisor123");
  check("login Gerente", true, "supervisor@nativa.com");
  const usuario = await login("operador@nativa.com", "operador123");
  check("login Usuario", true, "operador@nativa.com");

  const { harinaId, grupoId } = await waitNewDeploy(admin);
  check("POST harina crea lote interno", Boolean(grupoId), grupoId);

  try {
    const listH = await request("GET", "/api/harinas", { token: admin });
    check("GET /api/harinas", listH.status === 200 && Array.isArray(listH.json?.data));

    const seedList = await request("GET", "/api/grupos-rubro", { token: gerente });
    check(
      "GET /api/grupos-rubro (gerente)",
      seedList.status === 200 && Array.isArray(seedList.json?.data)
    );

    const lotes = await request("GET", "/api/grupos-rubro?soloHarinas=true", { token: usuario });
    const loteRows = lotes.json?.data ?? [];
    const hasSeed = loteRows.some((g) =>
      ["garbanzo-lenteja", "platano-cambur", "yuca-batata"].includes(g.codigo)
    );
    const hasOurs = loteRows.some((g) => String(g._id) === String(grupoId));
    check("GET lotes soloHarinas sin grupos semilla", lotes.status === 200 && !hasSeed, `${loteRows.length} lotes`);
    check("lote de la harina visible para Usuario", hasOurs);

    const activos = await request("GET", "/api/grupos-rubro?activos=true&soloHarinas=true", {
      token: usuario,
    });
    check(
      "GET activos+soloHarinas",
      activos.status === 200 && Array.isArray(activos.json?.data)
    );

    const cal = await request("PUT", `/api/grupos-rubro/${grupoId}/calibracion`, {
      token: gerente,
      body: { temperatura: { min: 26, max: 46 } },
    });
    check("Gerente calibra el lote", cal.status === 200 && cal.json?.data?.calibracion?.temperatura?.min === 26);

    const iniciar = await request("POST", `/api/procesos-secado/grupo/${grupoId}/iniciar`, {
      token: usuario,
    });
    check("Usuario inicia secado", iniciar.status === 201 && iniciar.json?.data?.estado === "en_secado");
    const procesoId = iniciar.json.data._id;

    // Con secado activo, lecturas USB (codigo semilla) se pegan a ese lote.
    const ingest = await request("POST", "/api/arduino/telemetry", {
      body: {
        eventId: `verify-render-${Date.now()}`,
        deviceId: "verify-render-smoke",
        codigoGrupo: "garbanzo-lenteja",
        lecturas: { temperatura: 34.2, humedad: 48.1 },
      },
    });
    const attached = String(ingest.json?.data?.grupoRubroId) === String(grupoId);
    check(
      "POST telemetry USB se pega al lote de harina",
      [200, 201].includes(ingest.status) && attached,
      `status=${ingest.status} gid=${ingest.json?.data?.grupoRubroId}`
    );

    const hist = await request("GET", `/api/telemetry/group/${grupoId}?limit=5`, { token: usuario });
    check("GET telemetry/group del lote", hist.status === 200 && Array.isArray(hist.json?.data));

    const latest = await request("GET", "/api/telemetry/latest", { token: admin });
    check("GET telemetry/latest", latest.status === 200 && Array.isArray(latest.json?.data));

    const fluct = await request("GET", "/api/telemetry/fluctuaciones/humedad", { token: gerente });
    check("GET fluctuaciones (Gerente)", fluct.status === 200 && Array.isArray(fluct.json?.data));

    const forbiddenFluct = await request("GET", "/api/telemetry/fluctuaciones/humedad", {
      token: usuario,
    });
    check("Usuario no ve fluctuaciones", forbiddenFluct.status === 403);

    const completar = await request("POST", `/api/procesos-secado/${procesoId}/completar`, {
      token: usuario,
    });
    check(
      "Usuario finaliza secado",
      completar.status === 200 && completar.json?.data?.estado === "revisado_empaquetado"
    );

    const listo = await request("POST", `/api/procesos-secado/${procesoId}/marcar-listo`, {
      token: usuario,
    });
    check("Usuario marca listo", listo.status === 200 && listo.json?.data?.confirmadoListoPorOperador === true);

    const pendientes = await request("GET", "/api/procesos-secado/pendientes-archivo", { token: admin });
    const enPapelera = (pendientes.json?.data ?? []).some((p) => String(p._id) === String(procesoId));
    check("Admin ve lote en papelera", pendientes.status === 200 && enPapelera);

    const archivar = await request("POST", `/api/procesos-secado/${procesoId}/archivar`, { token: admin });
    check("Admin archiva lote", archivar.status === 200 && archivar.json?.data?.estado === "archivado");
  } finally {
    const del = await request("DELETE", `/api/harinas/${harinaId}`, { token: admin });
    check("limpia harina temporal", del.status === 200);
  }

  console.log(`\nOK ${results.length} checks contra ${BASE}`);
};

main().catch((err) => {
  console.error(`\nSMOKE FAIL: ${err.message}`);
  process.exit(1);
});
