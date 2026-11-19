const HttpError = require("../utils/httpError");

// Códigos de erro do PostgreSQL que viram respostas 4xx.
const pgErrors = {
  23505: [409, "Registro duplicado."],
  23503: [400, "Referência inválida (registro relacionado não existe)."],
  "22P02": [400, "Valor em formato inválido."],
  23514: [400, "Valor fora do permitido."],
};

function notFound(req, res) {
  res.status(404).json({ error: "Rota não encontrada." });
}

// Todas as respostas de erro seguem o formato { error: "mensagem" }.
// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message });
  }
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "JSON inválido no corpo da requisição." });
  }
  if (pgErrors[error.code]) {
    const [status, message] = pgErrors[error.code];
    return res.status(status).json({ error: message });
  }
  console.error(error);
  return res.status(500).json({ error: "Erro interno do servidor." });
}

module.exports = { errorHandler, notFound };
