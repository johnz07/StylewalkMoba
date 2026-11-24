const pedidoModel = require("../models/pedido.model");

// GET /relatorios/export (admin): JSON consumido pelo dashboard em Python.
async function exportReport(req, res) {
  res.json({ gerado_em: new Date().toISOString(), ...(await pedidoModel.findReportData()) });
}

module.exports = { exportReport };
