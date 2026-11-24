// Antes dos testes de integração: cria o banco de teste (se não existir) e recria schema + seed nele.
const path = require("path");
const { spawnSync } = require("child_process");
const { Client } = require("pg");
const { TEST_DATABASE_URL, TEST_JWT_SECRET } = require("../testDatabase");

module.exports = async function globalSetup() {
  const url = new URL(TEST_DATABASE_URL);
  const databaseName = url.pathname.slice(1);
  if (!/^[a-z0-9_]+$/i.test(databaseName)) throw new Error(`Nome de banco de teste inválido: ${databaseName}`);

  const adminUrl = new URL(TEST_DATABASE_URL);
  adminUrl.pathname = "/postgres";
  const admin = new Client({ connectionString: adminUrl.toString() });
  try {
    await admin.connect();
  } catch (error) {
    throw new Error(`Não foi possível conectar ao PostgreSQL (${error.message}). Suba o banco com "npm run db:up".`);
  }
  const { rowCount } = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [databaseName]);
  if (!rowCount) await admin.query(`CREATE DATABASE ${databaseName}`);
  await admin.end();

  const result = spawnSync(process.execPath, [path.join(__dirname, "..", "..", "db", "setup.js")], {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL, DATABASE_SSL: "false", JWT_SECRET: TEST_JWT_SECRET },
    encoding: "utf8",
  });
  if (result.status !== 0) throw new Error(`Falha ao preparar o banco de teste: ${result.stderr || result.stdout}`);
};
