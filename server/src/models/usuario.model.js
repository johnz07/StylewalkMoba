// Acesso à tabela usuarios (+ endereço principal). Converte colunas em objetos da API.
const db = require("../config/db");

const selectUser = `
  SELECT u.*, e.cep, e.logradouro, e.numero, e.complemento, e.bairro, e.cidade, e.uf
  FROM usuarios u
  LEFT JOIN enderecos e ON e.usuario_id = u.id`;

function toUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.nome,
    lastName: row.sobrenome,
    email: row.email,
    cpf: row.cpf || "",
    phone: row.telefone || "",
    birthDate: row.data_nascimento || null,
    role: row.perfil,
    address: {
      zipCode: row.cep || "",
      street: row.logradouro || "",
      number: row.numero || "",
      complement: row.complemento || "",
      district: row.bairro || "",
      city: row.cidade || "",
      state: row.uf || "",
    },
  };
}

async function findById(id) {
  const { rows } = await db.query(`${selectUser} WHERE u.id = $1`, [id]);
  return toUser(rows[0]);
}

// Retorna também o hash da senha, usado só no login.
async function findCredentialsByEmail(email) {
  const { rows } = await db.query("SELECT id, senha_hash, perfil FROM usuarios WHERE email = $1", [email]);
  return rows[0] || null;
}

async function create(client, user) {
  const { rows } = await client.query(
    `INSERT INTO usuarios (nome, sobrenome, email, senha_hash, cpf, telefone, data_nascimento)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [user.firstName, user.lastName, user.email, user.passwordHash, user.cpf, user.phone, user.birthDate],
  );
  const id = rows[0].id;
  const a = user.address;
  await client.query(
    `INSERT INTO enderecos (usuario_id, cep, logradouro, numero, complemento, bairro, cidade, uf)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, a.zipCode, a.street, a.number, a.complement, a.district, a.city, a.state],
  );
  return id;
}

module.exports = { findById, findCredentialsByEmail, create };
