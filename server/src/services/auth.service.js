const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const db = require("../config/db");
const usuarioModel = require("../models/usuario.model");
const HttpError = require("../utils/httpError");
const { validateRegistration } = require("../utils/validation");

function signToken(user) {
  return jwt.sign({ role: user.role }, env.jwtSecret, { subject: String(user.id), expiresIn: env.jwtExpiresIn });
}

async function register(data) {
  const { password, ...user } = validateRegistration(data);
  if (await usuarioModel.findCredentialsByEmail(user.email)) {
    throw new HttpError(409, "Este e-mail já está cadastrado.");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const id = await db.withTransaction((client) => usuarioModel.create(client, { ...user, passwordHash }));
  const created = await usuarioModel.findById(id);
  return { token: signToken(created), user: created };
}

async function login(data = {}) {
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const password = typeof data.password === "string" ? data.password : "";
  if (!email || !password) throw new HttpError(400, "Preencha e-mail e senha.");

  const credentials = await usuarioModel.findCredentialsByEmail(email);
  const matches = credentials && (await bcrypt.compare(password, credentials.senha_hash));
  if (!matches) throw new HttpError(401, "E-mail ou senha inválidos.");

  const user = await usuarioModel.findById(credentials.id);
  return { token: signToken(user), user };
}

async function getProfile(userId) {
  const user = await usuarioModel.findById(userId);
  if (!user) throw new HttpError(401, "Sessão expirada. Faça login novamente.");
  return user;
}

module.exports = { register, login, getProfile };
