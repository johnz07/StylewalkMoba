const jwt = require("jsonwebtoken");
const env = require("../config/env");
const HttpError = require("../utils/httpError");

// Exige o header "Authorization: Bearer <token>" e coloca { id, role } em req.user.
function requireAuth(req, res, next) {
  const [scheme, token] = (req.get("authorization") || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new HttpError(401, "Faça login para continuar.");
  }
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: Number(payload.sub), role: payload.role };
  } catch {
    throw new HttpError(401, "Sessão expirada. Faça login novamente.");
  }
  next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    throw new HttpError(403, "Acesso restrito ao administrador.");
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
