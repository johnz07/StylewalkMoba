// Acesso à tabela cupons.
const db = require("../config/db");

// Busca pelo código sem diferenciar maiúsculas/minúsculas; devolve null se não existir.
async function findByCode(code) {
  const { rows } = await db.query("SELECT codigo, percentual, ativo FROM cupons WHERE UPPER(codigo) = UPPER($1)", [code]);
  return rows[0] || null;
}

module.exports = { findByCode };
