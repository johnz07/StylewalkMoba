const cupomModel = require("../models/cupom.model");
const HttpError = require("../utils/httpError");

// GET /cupons/:codigo -> { codigo, percentual, ativo }
async function getByCode(req, res) {
  const coupon = await cupomModel.findByCode(String(req.params.codigo || "").trim());
  if (!coupon) throw new HttpError(404, "Cupom não encontrado");
  res.json(coupon);
}

module.exports = { getByCode };
