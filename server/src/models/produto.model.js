// Acesso à tabela produtos. Só produtos ativos aparecem; excluir = desativar.
const db = require("../config/db");

const selectProduct = `
  SELECT p.*, c.nome AS categoria_nome
  FROM produtos p
  LEFT JOIN categorias c ON c.id = p.categoria_id`;

const orderings = {
  recentes: "p.criado_em DESC, p.id DESC",
  nome: "p.nome ASC",
  preco_asc: "p.preco ASC, p.nome ASC",
  preco_desc: "p.preco DESC, p.nome ASC",
};

function toProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.nome,
    description: row.descricao,
    price: row.preco,
    categoryId: row.categoria_id,
    category: row.categoria_nome || "",
    imageUrl: row.imagem_url,
    badge: row.selo,
    featured: row.destaque,
    sizes: row.tamanhos,
  };
}

// Filtros opcionais: categoria (nome), selo, busca (nome/descrição/categoria, sem acento) e ordem.
async function findAll({ category, badge, search, order } = {}) {
  const conditions = ["p.ativo"];
  const params = [];
  if (category) {
    params.push(category);
    conditions.push(`lower(c.nome) = lower($${params.length})`);
  }
  if (badge) {
    params.push(badge);
    conditions.push(`p.selo::text = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    const term = `unaccent($${params.length})`;
    conditions.push(`(unaccent(p.nome) ILIKE ${term} OR unaccent(p.descricao) ILIKE ${term} OR unaccent(c.nome) ILIKE ${term})`);
  }
  const orderBy = orderings[order] || orderings.recentes;
  const { rows } = await db.query(`${selectProduct} WHERE ${conditions.join(" AND ")} ORDER BY ${orderBy}`, params);
  return rows.map(toProduct);
}

async function findById(id) {
  const { rows } = await db.query(`${selectProduct} WHERE p.id = $1 AND p.ativo`, [id]);
  return toProduct(rows[0]);
}

async function create(product) {
  const { rows } = await db.query(
    `INSERT INTO produtos (nome, descricao, preco, categoria_id, imagem_url, selo, destaque, tamanhos)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [product.name, product.description, product.price, product.categoryId, product.imageUrl, product.badge, product.featured, product.sizes],
  );
  return findById(rows[0].id);
}

async function update(id, product) {
  const { rowCount } = await db.query(
    `UPDATE produtos
     SET nome = $2, descricao = $3, preco = $4, categoria_id = $5, imagem_url = $6, selo = $7,
         destaque = $8, tamanhos = $9, atualizado_em = now()
     WHERE id = $1 AND ativo`,
    [id, product.name, product.description, product.price, product.categoryId, product.imageUrl, product.badge, product.featured, product.sizes],
  );
  return rowCount ? findById(id) : null;
}

async function deactivate(id) {
  const { rowCount } = await db.query("UPDATE produtos SET ativo = false, atualizado_em = now() WHERE id = $1 AND ativo", [id]);
  return rowCount > 0;
}

module.exports = { orderings, findAll, findById, create, update, deactivate };
