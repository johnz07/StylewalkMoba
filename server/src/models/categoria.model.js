const db = require("../config/db");

async function findAll() {
  const { rows } = await db.query("SELECT id, nome FROM categorias ORDER BY id");
  return rows.map((row) => ({ id: row.id, name: row.nome }));
}

async function exists(id) {
  const { rowCount } = await db.query("SELECT 1 FROM categorias WHERE id = $1", [id]);
  return rowCount > 0;
}

module.exports = { findAll, exists };
