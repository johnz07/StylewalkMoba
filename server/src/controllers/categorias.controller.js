const categoriaModel = require("../models/categoria.model");

async function list(req, res) {
  res.json(await categoriaModel.findAll());
}

module.exports = { list };
