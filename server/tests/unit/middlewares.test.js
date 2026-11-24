const jwt = require("jsonwebtoken");
const { TEST_JWT_SECRET } = require("../testDatabase");
const HttpError = require("../../src/utils/httpError");
const { requireAdmin, requireAuth } = require("../../src/middlewares/auth");
const { errorHandler, notFound } = require("../../src/middlewares/errorHandler");

const requestWith = (authorization) => ({ get: (name) => (name.toLowerCase() === "authorization" ? authorization : undefined) });
const tokenFor = (id, role, options) => jwt.sign({ role }, TEST_JWT_SECRET, { subject: String(id), ...options });

describe("requireAuth", () => {
  it("coloca id e perfil em req.user", () => {
    const req = requestWith(`Bearer ${tokenFor(7, "customer")}`);
    const next = jest.fn();
    requireAuth(req, {}, next);
    expect(req.user).toEqual({ id: 7, role: "customer" });
    expect(next).toHaveBeenCalled();
  });
  it.each([undefined, "", "Basic abc", "Bearer"])("recusa header %j", (header) => {
    expect(() => requireAuth(requestWith(header), {}, jest.fn())).toThrow(expect.objectContaining({ status: 401, message: "Faça login para continuar." }));
  });
  it("recusa token inválido ou expirado", () => {
    expect(() => requireAuth(requestWith("Bearer lixo"), {}, jest.fn())).toThrow(expect.objectContaining({ status: 401 }));
    expect(() => requireAuth(requestWith(`Bearer ${tokenFor(1, "admin", { expiresIn: -10 })}`), {}, jest.fn())).toThrow(expect.objectContaining({ status: 401 }));
  });
  it("recusa token assinado com outro segredo", () => {
    const forged = jwt.sign({ role: "admin" }, "outro-segredo", { subject: "1" });
    expect(() => requireAuth(requestWith(`Bearer ${forged}`), {}, jest.fn())).toThrow(expect.objectContaining({ status: 401 }));
  });
});

describe("requireAdmin", () => {
  it("deixa o admin passar", () => {
    const next = jest.fn();
    requireAdmin({ user: { role: "admin" } }, {}, next);
    expect(next).toHaveBeenCalled();
  });
  it("bloqueia cliente com 403", () => {
    expect(() => requireAdmin({ user: { role: "customer" } }, {}, jest.fn())).toThrow(expect.objectContaining({ status: 403 }));
  });
});

describe("errorHandler", () => {
  const response = () => {
    const res = { status: jest.fn(() => res), json: jest.fn(() => res) };
    return res;
  };

  it("converte HttpError no status e mensagem", () => {
    const res = response();
    errorHandler(new HttpError(418, "Sou um bule"), {}, res);
    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.json).toHaveBeenCalledWith({ error: "Sou um bule" });
  });
  it("converte JSON inválido em 400", () => {
    const res = response();
    errorHandler({ type: "entity.parse.failed" }, {}, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
  it.each([["23505", 409], ["23503", 400], ["22P02", 400], ["23514", 400]])("erro %s do PostgreSQL vira %i", (code, status) => {
    const res = response();
    errorHandler({ code }, {}, res);
    expect(res.status).toHaveBeenCalledWith(status);
  });
  it("erro desconhecido vira 500 sem vazar detalhes", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    const res = response();
    errorHandler(new Error("segredo interno"), {}, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erro interno do servidor." });
    console.error.mockRestore();
  });
  it("notFound responde 404 no formato padrão", () => {
    const res = response();
    notFound({}, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Rota não encontrada." });
  });
});
