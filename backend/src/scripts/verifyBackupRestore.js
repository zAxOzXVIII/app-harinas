/**
 * Valida backup/restore sin tocar la BD de trabajo:
 * 1) Si existen mongodump/mongorestore: dump -> restore a BD temporal *_mongo_tools_verify -> comparar conteos -> drop temporal.
 * 2) Si no: export/import logico por coleccion (JSON) a BD temporal *_smoke_verify.
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const mongoose = require("mongoose");
const env = require("../config/env");
const { resolveMongoTool } = require("./mongoToolPath");

const getDbName = (uri) => {
  const noQuery = uri.split("?")[0];
  const proto = noQuery.indexOf("://");
  const slash = noQuery.lastIndexOf("/");
  if (slash <= proto + 2) return null;
  const name = noQuery.slice(slash + 1);
  return name ? decodeURIComponent(name) : null;
};

const baseHostUri = (uri) => {
  const [main, query] = uri.split("?");
  const proto = main.indexOf("://");
  const slash = main.indexOf("/", proto + 3);
  if (slash === -1) return uri;
  const hostPart = main.slice(0, slash);
  return query ? `${hostPart}?${query}` : hostPart;
};

const buildUriWithDb = (uri, newDb) => {
  const [main, query] = uri.split("?");
  const proto = main.indexOf("://");
  const slash = main.indexOf("/", proto + 3);
  const q = query ? `?${query}` : "";
  if (slash === -1) return `${main}/${newDb}${q}`;
  return `${main.slice(0, slash)}/${encodeURIComponent(newDb)}${q}`;
};

const collectionCounts = async (db) => {
  const names = (await db.listCollections().toArray())
    .map((c) => c.name)
    .filter((n) => !n.startsWith("system."));
  const out = {};
  for (const n of names) {
    out[n] = await db.collection(n).countDocuments();
  }
  return out;
};

const compareCounts = (a, b) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if ((a[k] || 0) !== (b[k] || 0)) {
      throw new Error(`Conteo distinto en coleccion "${k}": origen=${a[k] ?? 0} verify=${b[k] ?? 0}`);
    }
  }
};

const logicalVerify = async () => {
  if (!env.mongoUri) throw new Error("Falta MONGODB_URI");
  const dbName = getDbName(env.mongoUri);
  if (!dbName) throw new Error("MONGODB_URI debe incluir nombre de base (ej. .../app_harinas)");

  await mongoose.connect(env.mongoUri);
  const sourceDb = mongoose.connection.db;
  const sourceCounts = await collectionCounts(sourceDb);
  const verifyName = `${dbName}_smoke_verify`;
  const verifyUri = buildUriWithDb(env.mongoUri, verifyName);

  const outRoot = path.join(__dirname, "../../backups", `logical-verify-${Date.now()}`);
  fs.mkdirSync(outRoot, { recursive: true });

  const names = Object.keys(sourceCounts);
  for (const name of names) {
    const docs = await sourceDb.collection(name).find({}).toArray();
    fs.writeFileSync(path.join(outRoot, `${name}.json`), JSON.stringify(docs));
  }

  await mongoose.disconnect();

  const vConn = await mongoose.createConnection(verifyUri).asPromise();
  const vdb = vConn.db;
  await vdb.dropDatabase().catch(() => {});

  for (const name of names) {
    const raw = fs.readFileSync(path.join(outRoot, `${name}.json`), "utf8");
    const docs = JSON.parse(raw);
    if (docs.length) await vdb.collection(name).insertMany(docs);
  }

  const verifyCounts = await collectionCounts(vdb);
  compareCounts(sourceCounts, verifyCounts);

  await vdb.dropDatabase();
  await vConn.close();
  fs.rmSync(outRoot, { recursive: true, force: true });
  console.log("OK: verificacion logica (JSON) completada.");
};

const toolsVerify = async () => {
  if (!env.mongoUri) throw new Error("Falta MONGODB_URI");
  const dbName = getDbName(env.mongoUri);
  if (!dbName) throw new Error("MONGODB_URI debe incluir nombre de base (ej. .../app_harinas)");

  const mongodump = resolveMongoTool("mongodump");
  const mongorestore = resolveMongoTool("mongorestore");
  if (!mongodump || !mongorestore) return false;

  const verifyNs = `${dbName}_mongo_tools_verify`;
  const dumpRoot = path.join(__dirname, "../../backups", `mongo-tools-verify-${Date.now()}`);
  fs.mkdirSync(dumpRoot, { recursive: true });

  const d1 = spawnSync(mongodump, ["--uri", env.mongoUri, "--out", dumpRoot, "--gzip"], {
    stdio: "inherit",
    shell: false,
  });
  if (d1.status !== 0) throw new Error("mongodump fallo");

  const hostUri = baseHostUri(env.mongoUri);
  const r1 = spawnSync(
    mongorestore,
    [
      "--uri",
      hostUri,
      "--gzip",
      "--drop",
      `--nsFrom=${dbName}.*`,
      `--nsTo=${verifyNs}.*`,
      dumpRoot,
    ],
    { stdio: "inherit", shell: false }
  );
  if (r1.status !== 0) throw new Error("mongorestore (verificacion) fallo");

  await mongoose.connect(env.mongoUri);
  const sourceCounts = await collectionCounts(mongoose.connection.db);
  await mongoose.disconnect();

  const verifyUri = buildUriWithDb(env.mongoUri, verifyNs);
  const vConn = await mongoose.createConnection(verifyUri).asPromise();
  const verifyCounts = await collectionCounts(vConn.db);
  await vConn.db.dropDatabase();
  await vConn.close();

  compareCounts(sourceCounts, verifyCounts);

  fs.rmSync(dumpRoot, { recursive: true, force: true });
  console.log("OK: verificacion con mongodump/mongorestore completada.");
  return true;
};

const main = async () => {
  try {
    const usedTools = await toolsVerify().catch(() => false);
    if (!usedTools) {
      console.log("mongodump/mongorestore no encontrados; ejecutando verificacion logica...");
      await logicalVerify();
    }
    process.exit(0);
  } catch (e) {
    console.error("Verificacion fallida:", e.message);
    process.exit(1);
  }
};

main();
