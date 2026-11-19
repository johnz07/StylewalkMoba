const produtosService = require("../services/produtos.service");
const { toStoredImagePath, withPublicImages } = require("../utils/publicUrl");
const { parseId } = require("../utils/validation");

const idParam = (req) => parseId(req.params.id, produtosService.NOT_FOUND);
const text = (value) => (typeof value === "string" ? value.trim() : "");

// GET /produtos?categoria=Feminino&selo=novo&busca=air&ordem=preco_asc
async function list(req, res) {
  const products = await produtosService.list({
    category: text(req.query.categoria),
    badge: text(req.query.selo),
    search: text(req.query.busca),
    order: text(req.query.ordem),
  });
  res.json(products.map((product) => withPublicImages(req, product)));
}

async function getById(req, res) {
  res.json(withPublicImages(req, await produtosService.getById(idParam(req))));
}

// Corpo do produto com a URL da imagem normalizada (ver toStoredImagePath).
const productBody = (req) => ({ ...req.body, imageUrl: toStoredImagePath(req, req.body?.imageUrl) });

async function create(req, res) {
  const product = await produtosService.create(productBody(req));
  res.status(201).location(`/produtos/${product.id}`).json(withPublicImages(req, product));
}

async function update(req, res) {
  res.json(withPublicImages(req, await produtosService.update(idParam(req), productBody(req))));
}

async function remove(req, res) {
  await produtosService.remove(idParam(req));
  res.status(204).end();
}

module.exports = { list, getById, create, update, remove };
