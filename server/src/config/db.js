const { Pool, types } = require("pg");
const env = require("./env");

// NUMERIC chega como string no pg (para não perder precisão); os preços cabem com folga em Number.
types.setTypeParser(types.builtins.NUMERIC, (value) => (value === null ? null : Number(value)));
// DATE fica como texto "AAAA-MM-DD" (evita o deslocamento de fuso ao virar Date).
types.setTypeParser(types.builtins.DATE, (value) => value);

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseSsl ? { rejectUnauthorized: false } : false,
});

// Executa uma função dentro de uma transação (BEGIN/COMMIT, ROLLBACK em caso de erro).
async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { pool, query: (text, params) => pool.query(text, params), withTransaction };
