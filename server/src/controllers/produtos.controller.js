const produtosService = require("../services/produtos.service");
const { withPublicImages } = require("../utils/publicUrl");
const { parseId } = require("../utils/validation");

const idParam = (req) => parseId(req.params.id, produtosService.NOT_FOUND);
const text = (value) => (typeof value === "string" ? value.trim() : "");

// GET /produtos?categoria=Feminino&busca=air&ordem=preco_asc
async function list(req, res) {
  const products = await produtosService.list({
    category: text(req.query.categoria),
    search: text(req.query.busca),
    order: text(req.query.ordem),
  });
  res.json(products.map((product) => withPublicImages(req, product)));
}

async function getById(req, res) {
  res.json(withPublicImages(req, await produtosService.getById(idParam(req))));
}

async function create(req, res) {
  const product = await produtosService.create(req.body);
  res.status(201).location(`/produtos/${product.id}`).json(withPublicImages(req, product));
}

async function update(req, res) {
  res.json(withPublicImages(req, await produtosService.update(idParam(req), req.body)));
}

async function remove(req, res) {
  await produtosService.remove(idParam(req));
  res.status(204).end();
}

module.exports = { list, getById, create, update, remove };
