const categoriaModel = require("../models/categoria.model");
const produtoModel = require("../models/produto.model");
const HttpError = require("../utils/httpError");
const { validateProduct } = require("../utils/validation");

const NOT_FOUND = "Produto não encontrado.";

function list(filters) {
  return produtoModel.findAll(filters);
}

async function getById(id) {
  const product = await produtoModel.findById(id);
  if (!product) throw new HttpError(404, NOT_FOUND);
  return product;
}

async function validate(data) {
  const product = validateProduct(data);
  if (product.categoryId !== null && !(await categoriaModel.exists(product.categoryId))) {
    throw new HttpError(400, "Categoria inválida.");
  }
  return product;
}

async function create(data) {
  return produtoModel.create(await validate(data));
}

async function update(id, data) {
  const product = await produtoModel.update(id, await validate(data));
  if (!product) throw new HttpError(404, NOT_FOUND);
  return product;
}

async function remove(id) {
  if (!(await produtoModel.deactivate(id))) throw new HttpError(404, NOT_FOUND);
}

module.exports = { NOT_FOUND, list, getById, create, update, remove };
